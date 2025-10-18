"""
User Profile API Routes

Provides endpoints for managing user profiles and role templates.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models.user_profile import (
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    UserRole,
    RoleTemplate
)
from ..core.user_profile_manager import user_profile_manager

router = APIRouter(prefix="/api/v1/user-profiles", tags=["user-profiles"])


@router.get("/templates", response_model=List[RoleTemplate])
async def get_role_templates():
    """Get all available role templates."""
    return user_profile_manager.list_role_templates()


@router.get("/templates/{role}", response_model=RoleTemplate)
async def get_role_template(role: UserRole):
    """Get a specific role template."""
    template = user_profile_manager.get_role_template(role)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role template not found for role: {role}"
        )
    return template


@router.get("", response_model=List[UserProfile])
async def list_profiles():
    """List all user profiles."""
    return user_profile_manager.list_profiles()


@router.get("/{user_id}", response_model=UserProfile)
async def get_profile(user_id: str):
    """Get a specific user profile."""
    profile = user_profile_manager.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {user_id}"
        )
    return profile


@router.post("", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def create_profile(profile_data: UserProfileCreate):
    """Create a new user profile."""
    # Check if profile already exists
    existing_profile = user_profile_manager.get_profile(profile_data.user_id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Profile already exists for user: {profile_data.user_id}"
        )

    profile = user_profile_manager.create_profile(profile_data)
    return profile


@router.put("/{user_id}", response_model=UserProfile)
async def update_profile(user_id: str, update_data: UserProfileUpdate):
    """Update an existing user profile."""
    profile = user_profile_manager.update_profile(user_id, update_data)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {user_id}"
        )
    return profile


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(user_id: str):
    """Delete a user profile."""
    success = user_profile_manager.delete_profile(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {user_id}"
        )


@router.get("/{user_id}/context")
async def get_personalization_context(user_id: str):
    """Get personalization context for a user."""
    context = user_profile_manager.get_personalization_context(user_id)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user: {user_id}"
        )
    return context
