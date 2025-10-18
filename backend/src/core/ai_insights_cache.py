"""
AI Insights Cache Service for MongoDB
Caches performance insights, recommendations, and cohort insights
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import hashlib
import json
import structlog
from motor.motor_asyncio import AsyncIOMotorClient
from src.db.mongodb_client import get_mongodb_client
from src.config import settings

logger = structlog.get_logger()


class AIInsightsCache:
    """Service for caching AI-generated insights in MongoDB"""
    
    def __init__(self):
        self.db = None
        self.performance_insights_collection = None
        self.recommendations_collection = None
        self.cohort_insights_collection = None
        self.cache_ttl_hours = 24  # Default cache TTL in hours
        
    async def initialize(self):
        """Initialize MongoDB collections for caching"""
        try:
            # Get MongoDB client
            client = await get_mongodb_client()
            self.db = client.db
            
            # Create collections for each type of insights
            self.performance_insights_collection = self.db["ai_performance_insights"]
            self.recommendations_collection = self.db["ai_recommendations"]
            self.cohort_insights_collection = self.db["ai_cohort_insights"]
            
            # Create indexes for efficient querying
            await self._create_indexes()
            
            logger.info("AI Insights Cache initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI Insights Cache: {e}")
            raise
    
    async def _create_indexes(self):
        """Create indexes for cache collections"""
        try:
            # Performance insights indexes
            await self.performance_insights_collection.create_index("cache_key", unique=True)
            await self.performance_insights_collection.create_index("created_at")
            await self.performance_insights_collection.create_index("expires_at")
            
            # Recommendations indexes
            await self.recommendations_collection.create_index("cache_key", unique=True)
            await self.recommendations_collection.create_index("created_at")
            await self.recommendations_collection.create_index("expires_at")
            
            # Cohort insights indexes
            await self.cohort_insights_collection.create_index("cache_key", unique=True)
            await self.cohort_insights_collection.create_index("created_at")
            await self.cohort_insights_collection.create_index("expires_at")
            
            logger.info("Cache indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Error creating cache indexes: {e}")
    
    def _generate_cache_key(self, key_data: Dict[str, Any]) -> str:
        """Generate a unique cache key from input parameters"""
        # Sort keys for consistent hashing
        sorted_data = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(sorted_data.encode()).hexdigest()
    
    async def get_performance_insights(self, context: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get cached performance insights"""
        try:
            cache_key = self._generate_cache_key({"type": "performance", "context": context})
            
            # Find non-expired cache entry
            cached = await self.performance_insights_collection.find_one({
                "cache_key": cache_key,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })
            
            if cached:
                logger.info(f"Cache hit for performance insights (key: {cache_key})")
                return cached["data"]
            
            logger.info(f"Cache miss for performance insights (key: {cache_key})")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached performance insights: {e}")
            return None
    
    async def set_performance_insights(self, data: Dict[str, Any], context: Optional[str] = None, ttl_hours: Optional[int] = None):
        """Cache performance insights"""
        try:
            cache_key = self._generate_cache_key({"type": "performance", "context": context})
            ttl = ttl_hours or self.cache_ttl_hours
            
            cache_entry = {
                "cache_key": cache_key,
                "data": data,
                "context": context,
                "created_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=ttl),
                "ttl_hours": ttl
            }
            
            # Upsert the cache entry
            await self.performance_insights_collection.replace_one(
                {"cache_key": cache_key},
                cache_entry,
                upsert=True
            )
            
            logger.info(f"Cached performance insights (key: {cache_key}, TTL: {ttl}h)")
            
        except Exception as e:
            logger.error(f"Error caching performance insights: {e}")
    
    async def get_recommendations(self, focus_area: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get cached recommendations"""
        try:
            cache_key = self._generate_cache_key({"type": "recommendations", "focus_area": focus_area})
            
            # Find non-expired cache entry
            cached = await self.recommendations_collection.find_one({
                "cache_key": cache_key,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })
            
            if cached:
                logger.info(f"Cache hit for recommendations (key: {cache_key})")
                return cached["data"]
            
            logger.info(f"Cache miss for recommendations (key: {cache_key})")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached recommendations: {e}")
            return None
    
    async def set_recommendations(self, data: Dict[str, Any], focus_area: Optional[str] = None, ttl_hours: Optional[int] = None):
        """Cache recommendations"""
        try:
            cache_key = self._generate_cache_key({"type": "recommendations", "focus_area": focus_area})
            ttl = ttl_hours or self.cache_ttl_hours
            
            cache_entry = {
                "cache_key": cache_key,
                "data": data,
                "focus_area": focus_area,
                "created_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=ttl),
                "ttl_hours": ttl
            }
            
            # Upsert the cache entry
            await self.recommendations_collection.replace_one(
                {"cache_key": cache_key},
                cache_entry,
                upsert=True
            )
            
            logger.info(f"Cached recommendations (key: {cache_key}, TTL: {ttl}h)")
            
        except Exception as e:
            logger.error(f"Error caching recommendations: {e}")
    
    async def get_cohort_insights(self) -> Optional[Dict[str, Any]]:
        """Get cached cohort insights"""
        try:
            cache_key = self._generate_cache_key({"type": "cohort_insights"})
            
            # Find non-expired cache entry
            cached = await self.cohort_insights_collection.find_one({
                "cache_key": cache_key,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })
            
            if cached:
                logger.info(f"Cache hit for cohort insights (key: {cache_key})")
                return cached["data"]
            
            logger.info(f"Cache miss for cohort insights (key: {cache_key})")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached cohort insights: {e}")
            return None
    
    async def set_cohort_insights(self, data: Dict[str, Any], ttl_hours: Optional[int] = None):
        """Cache cohort insights"""
        try:
            cache_key = self._generate_cache_key({"type": "cohort_insights"})
            ttl = ttl_hours or self.cache_ttl_hours
            
            cache_entry = {
                "cache_key": cache_key,
                "data": data,
                "created_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=ttl),
                "ttl_hours": ttl
            }
            
            # Upsert the cache entry
            await self.cohort_insights_collection.replace_one(
                {"cache_key": cache_key},
                cache_entry,
                upsert=True
            )
            
            logger.info(f"Cached cohort insights (key: {cache_key}, TTL: {ttl}h)")
            
        except Exception as e:
            logger.error(f"Error caching cohort insights: {e}")
    
    async def clear_cache(self, cache_type: Optional[str] = None):
        """Clear cached insights"""
        try:
            if cache_type == "performance" or cache_type is None:
                await self.performance_insights_collection.delete_many({})
                logger.info("Cleared performance insights cache")
                
            if cache_type == "recommendations" or cache_type is None:
                await self.recommendations_collection.delete_many({})
                logger.info("Cleared recommendations cache")
                
            if cache_type == "cohort" or cache_type is None:
                await self.cohort_insights_collection.delete_many({})
                logger.info("Cleared cohort insights cache")
                
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            now = datetime.now(timezone.utc)
            
            # Count entries in each collection
            performance_total = await self.performance_insights_collection.count_documents({})
            performance_valid = await self.performance_insights_collection.count_documents({
                "expires_at": {"$gt": now}
            })
            
            recommendations_total = await self.recommendations_collection.count_documents({})
            recommendations_valid = await self.recommendations_collection.count_documents({
                "expires_at": {"$gt": now}
            })
            
            cohort_total = await self.cohort_insights_collection.count_documents({})
            cohort_valid = await self.cohort_insights_collection.count_documents({
                "expires_at": {"$gt": now}
            })
            
            return {
                "performance_insights": {
                    "total": performance_total,
                    "valid": performance_valid,
                    "expired": performance_total - performance_valid
                },
                "recommendations": {
                    "total": recommendations_total,
                    "valid": recommendations_valid,
                    "expired": recommendations_total - recommendations_valid
                },
                "cohort_insights": {
                    "total": cohort_total,
                    "valid": cohort_valid,
                    "expired": cohort_total - cohort_valid
                },
                "total_entries": performance_total + recommendations_total + cohort_total,
                "total_valid": performance_valid + recommendations_valid + cohort_valid
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}


# Global instance
ai_insights_cache = AIInsightsCache()


async def get_ai_insights_cache() -> AIInsightsCache:
    """Get AI insights cache instance"""
    if ai_insights_cache.db is None:
        await ai_insights_cache.initialize()
    return ai_insights_cache