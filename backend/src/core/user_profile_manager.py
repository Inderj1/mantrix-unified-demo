"""
User Profile Manager

Manages user profiles and applies role-based context to AI insights.
"""

from typing import Optional, Dict, Any
from datetime import datetime
import json
from ..models.user_profile import (
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    UserRole,
    ROLE_TEMPLATES,
    RoleTemplate
)


class UserProfileManager:
    """Manages user profiles for personalized insights."""

    def __init__(self):
        # In-memory storage for now (can be replaced with database)
        self._profiles: Dict[str, UserProfile] = {}
        self._load_default_profiles()

    def _load_default_profiles(self):
        """Load some default demo profiles."""
        # Demo CFO profile
        self._profiles["demo_cfo"] = UserProfile(
            user_id="demo_cfo",
            email="cfo@demo.com",
            name="Demo CFO",
            role=UserRole.CFO,
            insight_focuses=ROLE_TEMPLATES[UserRole.CFO].insight_focuses,
            key_metrics=ROLE_TEMPLATES[UserRole.CFO].key_metrics,
            preferred_visualizations=ROLE_TEMPLATES[UserRole.CFO].preferred_visualizations,
            department="Finance",
            reporting_frequency="weekly"
        )

        # Demo COO profile
        self._profiles["demo_coo"] = UserProfile(
            user_id="demo_coo",
            email="coo@demo.com",
            name="Demo COO",
            role=UserRole.COO,
            insight_focuses=ROLE_TEMPLATES[UserRole.COO].insight_focuses,
            key_metrics=ROLE_TEMPLATES[UserRole.COO].key_metrics,
            preferred_visualizations=ROLE_TEMPLATES[UserRole.COO].preferred_visualizations,
            department="Operations",
            reporting_frequency="daily"
        )

    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID."""
        return self._profiles.get(user_id)

    def create_profile(self, profile_data: UserProfileCreate) -> UserProfile:
        """Create a new user profile."""
        # Apply role template if role is not CUSTOM
        if profile_data.role != UserRole.CUSTOM and profile_data.role in ROLE_TEMPLATES:
            template = ROLE_TEMPLATES[profile_data.role]

            # Use template defaults if not specified
            if not profile_data.insight_focuses:
                profile_data.insight_focuses = template.insight_focuses
            if not profile_data.key_metrics:
                profile_data.key_metrics = template.key_metrics
            if not profile_data.preferred_visualizations:
                profile_data.preferred_visualizations = template.preferred_visualizations

        profile = UserProfile(**profile_data.model_dump())
        self._profiles[profile.user_id] = profile
        return profile

    def update_profile(self, user_id: str, update_data: UserProfileUpdate) -> Optional[UserProfile]:
        """Update an existing user profile."""
        profile = self._profiles.get(user_id)
        if not profile:
            return None

        # Update only provided fields
        update_dict = update_data.model_dump(exclude_unset=True)

        # If role changed, apply new template defaults
        if "role" in update_dict and update_dict["role"] in ROLE_TEMPLATES:
            template = ROLE_TEMPLATES[update_dict["role"]]
            if "insight_focuses" not in update_dict:
                update_dict["insight_focuses"] = template.insight_focuses
            if "key_metrics" not in update_dict:
                update_dict["key_metrics"] = template.key_metrics
            if "preferred_visualizations" not in update_dict:
                update_dict["preferred_visualizations"] = template.preferred_visualizations

        # Apply updates
        for key, value in update_dict.items():
            setattr(profile, key, value)

        profile.updated_at = datetime.utcnow()
        self._profiles[user_id] = profile
        return profile

    def delete_profile(self, user_id: str) -> bool:
        """Delete a user profile."""
        if user_id in self._profiles:
            del self._profiles[user_id]
            return True
        return False

    def list_profiles(self) -> list[UserProfile]:
        """List all user profiles."""
        return list(self._profiles.values())

    def get_role_template(self, role: UserRole) -> Optional[RoleTemplate]:
        """Get role template by role."""
        return ROLE_TEMPLATES.get(role)

    def list_role_templates(self) -> list[RoleTemplate]:
        """List all available role templates."""
        return list(ROLE_TEMPLATES.values())

    def get_personalization_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get personalization context for a user to enhance AI insights.

        Returns:
            Dictionary with user context for the AI formatter
        """
        profile = self.get_profile(user_id)
        if not profile:
            return {}

        context = {
            "user_role": profile.role.value,
            "role_display_name": profile.role.value.replace("_", " ").title(),
            "insight_focuses": [focus.value for focus in profile.insight_focuses],
            "key_metrics": profile.key_metrics,
            "preferred_visualizations": profile.preferred_visualizations,
            "custom_context": profile.custom_context or ""
        }

        # Add role template system prompt if available
        if profile.role in ROLE_TEMPLATES:
            template = ROLE_TEMPLATES[profile.role]
            context["system_prompt_additions"] = template.system_prompt_additions
            context["role_description"] = template.description

        return context

    def enhance_formatter_prompt(self, user_id: str, base_prompt: str) -> str:
        """
        Enhance formatter prompt with user-specific context.

        Args:
            user_id: User ID
            base_prompt: Base prompt for the formatter

        Returns:
            Enhanced prompt with personalization
        """
        context = self.get_personalization_context(user_id)
        if not context:
            return base_prompt

        enhancement = f"""

USER PROFILE CONTEXT:
Role: {context.get('role_display_name', 'General User')}
Focus Areas: {', '.join(context.get('insight_focuses', []))}
Key Metrics of Interest: {', '.join(context.get('key_metrics', []))}
Preferred Visualizations: {', '.join(context.get('preferred_visualizations', []))}

{context.get('system_prompt_additions', '')}

{context.get('custom_context', '')}

IMPORTANT: Tailor your insights, recommendations, and visualizations to match this user's role and preferences.
"""

        return base_prompt + enhancement


# Global instance
user_profile_manager = UserProfileManager()
