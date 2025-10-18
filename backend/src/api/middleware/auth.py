"""
Authentication middleware for Clerk integration
"""
import json
import os
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
from functools import lru_cache
import structlog

logger = structlog.get_logger()

# Load auth configuration
AUTH_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../../frontend/src/auth_config.json")
try:
    with open(AUTH_CONFIG_PATH, 'r') as f:
        AUTH_CONFIG = json.load(f)
except FileNotFoundError:
    # Fallback to root directory
    AUTH_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../../auth_config.json")
    with open(AUTH_CONFIG_PATH, 'r') as f:
        AUTH_CONFIG = json.load(f)

security = HTTPBearer(auto_error=False)


class ClerkAuth:
    def __init__(self):
        self.clerk_secret_key = os.getenv("CLERK_SECRET_KEY")
        self.clerk_api_url = "https://api.clerk.com/v1"
        self._jwks_cache = None
        
    @lru_cache(maxsize=1)
    def get_jwks(self) -> Dict[str, Any]:
        """Fetch and cache Clerk's JWKS"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.clerk_api_url}/.well-known/jwks.json",
                    headers={"Authorization": f"Bearer {self.clerk_secret_key}"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch JWKS")
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token from Clerk"""
        try:
            # Get JWKS
            jwks = self.get_jwks()
            
            # Decode token header to get kid
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            # Find the correct key
            key = None
            for jwk in jwks.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break
                    
            if not key:
                raise HTTPException(status_code=401, detail="Invalid token key")
            
            # Verify token
            decoded = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                options={"verify_aud": False}  # Clerk doesn't use audience
            )
            
            return decoded
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    def check_email_authorization(self, email: str) -> bool:
        """Check if email is authorized based on whitelist"""
        if not AUTH_CONFIG["authentication"]["enabled"]:
            return True
            
        access_control = AUTH_CONFIG["authentication"]["access_control"]
        
        # Check exact email match
        if email in access_control["authorized_emails"]:
            return True
            
        # Check domain match
        domain = email.split("@")[1] if "@" in email else ""
        if domain in access_control["authorized_domains"]:
            return True
            
        return False
    
    def get_user_role(self, email: str) -> str:
        """Get user role based on email"""
        roles = AUTH_CONFIG["authentication"]["access_control"]["roles"]
        
        if email in roles.get("admin", []):
            return "admin"
        elif email in roles.get("user", []):
            return "user"
        else:
            # Default role for authorized users
            return "user" if self.check_email_authorization(email) else None


clerk_auth = ClerkAuth()


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """Get current authenticated user"""
    
    # Check if authentication is enabled
    if not AUTH_CONFIG["authentication"]["enabled"]:
        return {"email": "anonymous@example.com", "role": "admin"}
    
    # Check if route requires authentication
    path = request.url.path
    protected_routes = AUTH_CONFIG["authentication"]["protected_routes"]
    
    # Find matching route
    is_protected = False
    for route, protected in protected_routes.items():
        if path.startswith(route):
            is_protected = protected
            break
    
    if not is_protected:
        return {"email": "anonymous@example.com", "role": "user"}
    
    # Verify authentication
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Verify token
    user_data = clerk_auth.verify_token(credentials.credentials)
    email = user_data.get("email")
    
    if not email:
        raise HTTPException(status_code=401, detail="Invalid user data")
    
    # Check authorization
    if not clerk_auth.check_email_authorization(email):
        raise HTTPException(
            status_code=403, 
            detail=f"Access denied for {email}. Please contact administrator."
        )
    
    # Get user role
    role = clerk_auth.get_user_role(email)
    
    return {
        "id": user_data.get("sub"),
        "email": email,
        "name": user_data.get("name"),
        "role": role,
        "metadata": user_data
    }


async def require_auth(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Require authentication for endpoint"""
    if not user or user.get("email") == "anonymous@example.com":
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Require admin role for endpoint"""
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user