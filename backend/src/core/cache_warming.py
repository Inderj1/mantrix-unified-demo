"""Smart cache warming system for optimizing query performance."""

from typing import Dict, List, Optional, Set, Any
from datetime import datetime, timedelta, time
from collections import defaultdict
import asyncio
import structlog
from pydantic import BaseModel, Field
from enum import Enum
import json

from src.core.sql_generator import SQLGenerator
from src.utils.query_logger import QueryLogger
from src.core.cache_manager import CacheManager
from src.core.financial_hierarchy import financial_hierarchy
from src.config import settings

logger = structlog.get_logger()


class WarmingStrategy(Enum):
    """Cache warming strategies."""
    POPULARITY = "popularity"  # Based on query frequency
    RECENCY = "recency"  # Based on recent usage
    SCHEDULED = "scheduled"  # Based on time patterns
    PREDICTIVE = "predictive"  # Based on ML predictions
    FINANCIAL = "financial"  # Financial metrics focus
    

class WarmingSchedule(BaseModel):
    """Schedule for cache warming."""
    name: str
    strategy: WarmingStrategy
    schedule_time: Optional[time] = None  # For scheduled warming
    queries: List[str] = Field(default_factory=list)
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    

class CacheWarmingConfig(BaseModel):
    """Configuration for cache warming."""
    enabled: bool = True
    max_queries_per_run: int = 100
    warming_interval_hours: int = 6
    popularity_threshold: int = 5  # Min frequency for popularity-based warming
    recency_window_days: int = 7
    enable_predictive: bool = False
    financial_metrics_enabled: bool = True
    schedules: List[WarmingSchedule] = Field(default_factory=list)
    

class SmartCacheWarmer:
    """Intelligent cache warming system."""
    
    def __init__(
        self,
        sql_generator: SQLGenerator,
        query_logger: QueryLogger,
        cache_manager: CacheManager,
        config: Optional[CacheWarmingConfig] = None
    ):
        self.sql_generator = sql_generator
        self.query_logger = query_logger
        self.cache_manager = cache_manager
        self.config = config or CacheWarmingConfig()
        self._running = False
        self._init_default_schedules()
        
    def _init_default_schedules(self):
        """Initialize default warming schedules."""
        # Morning financial reports schedule
        self.config.schedules.append(
            WarmingSchedule(
                name="morning_financial_reports",
                strategy=WarmingStrategy.FINANCIAL,
                schedule_time=time(6, 0),  # 6 AM
                queries=[
                    "Show gross margin for current month",
                    "Calculate YTD revenue",
                    "What's our EBITDA this quarter?",
                    "Show net income trend last 12 months",
                    "Break down operating expenses by category"
                ]
            )
        )
        
        # End of day summaries
        self.config.schedules.append(
            WarmingSchedule(
                name="eod_summaries",
                strategy=WarmingStrategy.FINANCIAL,
                schedule_time=time(17, 0),  # 5 PM
                queries=[
                    "Today's revenue by region",
                    "Daily gross margin",
                    "Top 10 customers by revenue today",
                    "Current month performance vs last month"
                ]
            )
        )
        
        # Month-end reports (run on last 3 days of month)
        self.config.schedules.append(
            WarmingSchedule(
                name="month_end_reports",
                strategy=WarmingStrategy.SCHEDULED,
                schedule_time=time(7, 0),  # 7 AM
                queries=[
                    "Monthly P&L summary",
                    "Gross margin by product category this month",
                    "OPEX breakdown for current month",
                    "Month over month revenue comparison",
                    "Top performing regions this month"
                ],
                enabled=self._is_month_end_period()
            )
        )
    
    def _is_month_end_period(self) -> bool:
        """Check if we're in the month-end period (last 3 days)."""
        today = datetime.now().date()
        # Get last day of current month
        if today.month == 12:
            last_day = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last_day = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        
        days_until_end = (last_day - today).days
        return days_until_end <= 3
    
    async def warm_cache(self, strategy: WarmingStrategy = WarmingStrategy.POPULARITY) -> Dict[str, Any]:
        """Warm the cache based on specified strategy."""
        logger.info(f"Starting cache warming with strategy: {strategy.value}")
        
        queries_to_warm = []
        
        if strategy == WarmingStrategy.POPULARITY:
            queries_to_warm = await self._get_popular_queries()
        elif strategy == WarmingStrategy.RECENCY:
            queries_to_warm = await self._get_recent_queries()
        elif strategy == WarmingStrategy.FINANCIAL:
            queries_to_warm = self._get_financial_queries()
        elif strategy == WarmingStrategy.PREDICTIVE:
            queries_to_warm = await self._get_predictive_queries()
        
        # Limit queries
        queries_to_warm = queries_to_warm[:self.config.max_queries_per_run]
        
        # Warm the cache
        results = await self._execute_warming(queries_to_warm)
        
        logger.info(f"Cache warming completed: {results['success']}/{results['total']} queries warmed")
        return results
    
    async def _get_popular_queries(self) -> List[str]:
        """Get popular queries for warming."""
        # Get query history
        since = datetime.now() - timedelta(days=30)
        logs = self.query_logger.get_query_history(since=since, limit=1000)
        
        # Count query frequency
        query_counts = defaultdict(int)
        for log in logs:
            if log.get("question") and not log.get("error"):
                query_counts[log["question"]] += 1
        
        # Filter by threshold and sort by frequency
        popular = [
            query for query, count in query_counts.items()
            if count >= self.config.popularity_threshold
        ]
        popular.sort(key=lambda q: query_counts[q], reverse=True)
        
        return popular
    
    async def _get_recent_queries(self) -> List[str]:
        """Get recently used queries for warming."""
        since = datetime.now() - timedelta(days=self.config.recency_window_days)
        logs = self.query_logger.get_query_history(since=since, limit=500)
        
        # Extract unique queries
        seen = set()
        recent = []
        for log in logs:
            query = log.get("question")
            if query and query not in seen and not log.get("error"):
                seen.add(query)
                recent.append(query)
        
        return recent
    
    def _get_financial_queries(self) -> List[str]:
        """Get standard financial queries for warming."""
        queries = []
        
        # Add queries for each L1 metric
        for metric_code, metric in financial_hierarchy.l1_metrics.items():
            queries.extend([
                f"Show {metric.metric_name.lower()} for current month",
                f"Calculate {metric.metric_name.lower()} by region",
                f"What's our {metric.metric_name.lower()} trend?",
                f"{metric.metric_name} YTD"
            ])
        
        # Add common time-based queries
        time_periods = ["today", "this week", "this month", "this quarter", "YTD"]
        for period in time_periods:
            queries.append(f"Revenue {period}")
            queries.append(f"Gross margin {period}")
        
        # Add breakdown queries
        dimensions = ["region", "product", "customer segment", "sales channel"]
        for dim in dimensions:
            queries.append(f"Revenue by {dim}")
            queries.append(f"COGS breakdown by {dim}")
        
        return queries
    
    async def _get_predictive_queries(self) -> List[str]:
        """Get queries predicted to be used soon."""
        # This would use ML models in production
        # For now, use time-based patterns
        
        queries = []
        now = datetime.now()
        
        # Day of week patterns
        if now.weekday() == 0:  # Monday
            queries.extend([
                "Weekend sales summary",
                "Week over week revenue comparison",
                "Weekly targets vs actuals"
            ])
        elif now.weekday() == 4:  # Friday
            queries.extend([
                "Weekly performance summary",
                "Top performers this week",
                "Week to date metrics"
            ])
        
        # Time of day patterns
        if 8 <= now.hour <= 10:  # Morning
            queries.extend([
                "Yesterday's performance",
                "Daily dashboard metrics",
                "Overnight transactions summary"
            ])
        elif 16 <= now.hour <= 18:  # End of day
            queries.extend([
                "Today's closing numbers",
                "Daily target achievement",
                "Tomorrow's forecast"
            ])
        
        # Month patterns
        if now.day <= 5:  # Early month
            queries.extend([
                "Last month's final numbers",
                "Month over month comparison",
                "Monthly trend analysis"
            ])
        elif now.day >= 25:  # Late month
            queries.extend([
                "Month to date performance",
                "Monthly forecast accuracy",
                "Next month projections"
            ])
        
        return queries
    
    async def _execute_warming(self, queries: List[str]) -> Dict[str, Any]:
        """Execute cache warming for given queries."""
        results = {
            "total": len(queries),
            "success": 0,
            "failed": 0,
            "already_cached": 0,
            "queries_warmed": [],
            "errors": []
        }
        
        for query in queries:
            try:
                # Check if already cached
                cache_key = self.cache_manager._generate_cache_key(
                    self.cache_manager.PREFIX_SQL,
                    query,
                    {"use_vector_search": True, "max_tables": 5}
                )
                
                if self.cache_manager.redis.exists(cache_key):
                    results["already_cached"] += 1
                    continue
                
                # Generate SQL (will be cached)
                result = self.sql_generator.generate_sql(
                    query,
                    use_vector_search=True,
                    force_refresh=True
                )
                
                if not result.get("error"):
                    results["success"] += 1
                    results["queries_warmed"].append(query)
                else:
                    results["failed"] += 1
                    results["errors"].append({
                        "query": query,
                        "error": result.get("error")
                    })
                
                # Small delay to avoid overwhelming the system
                await asyncio.sleep(0.5)
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "query": query,
                    "error": str(e)
                })
                logger.error(f"Failed to warm cache for query '{query}': {e}")
        
        return results
    
    async def run_scheduled_warming(self):
        """Run scheduled cache warming tasks."""
        while self._running:
            try:
                now = datetime.now()
                
                for schedule in self.config.schedules:
                    if not schedule.enabled:
                        continue
                    
                    # Check if it's time to run
                    if schedule.schedule_time:
                        scheduled_datetime = now.replace(
                            hour=schedule.schedule_time.hour,
                            minute=schedule.schedule_time.minute,
                            second=0,
                            microsecond=0
                        )
                        
                        # Run if we're within 5 minutes of scheduled time and haven't run today
                        if (abs((now - scheduled_datetime).total_seconds()) < 300 and
                            (not schedule.last_run or schedule.last_run.date() < now.date())):
                            
                            logger.info(f"Running scheduled warming: {schedule.name}")
                            
                            # Execute warming
                            if schedule.queries:
                                results = await self._execute_warming(schedule.queries)
                                logger.info(
                                    f"Scheduled warming {schedule.name} completed: "
                                    f"{results['success']}/{results['total']} queries"
                                )
                            else:
                                # Use strategy-based warming
                                results = await self.warm_cache(schedule.strategy)
                            
                            # Update schedule
                            schedule.last_run = now
                            schedule.next_run = scheduled_datetime + timedelta(days=1)
                
                # Wait before next check
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in scheduled warming: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    async def run_continuous(self):
        """Run continuous cache warming based on interval."""
        self._running = True
        logger.info("Starting continuous cache warming service")
        
        # Start scheduled warming in background
        asyncio.create_task(self.run_scheduled_warming())
        
        while self._running:
            try:
                # Run warming cycle
                start_time = datetime.now()
                
                # Warm based on different strategies
                strategies = [
                    WarmingStrategy.POPULARITY,
                    WarmingStrategy.RECENCY,
                    WarmingStrategy.FINANCIAL
                ]
                
                total_warmed = 0
                for strategy in strategies:
                    results = await self.warm_cache(strategy)
                    total_warmed += results["success"]
                
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(
                    f"Cache warming cycle completed: "
                    f"{total_warmed} queries warmed in {duration:.2f}s"
                )
                
                # Wait for next cycle
                await asyncio.sleep(self.config.warming_interval_hours * 3600)
                
            except Exception as e:
                logger.error(f"Error in cache warming cycle: {e}")
                await asyncio.sleep(600)  # Wait 10 minutes on error
    
    def stop(self):
        """Stop the cache warming service."""
        self._running = False
        logger.info("Stopping cache warming service")
    
    def get_warming_stats(self) -> Dict[str, Any]:
        """Get statistics about cache warming."""
        stats = {
            "config": {
                "enabled": self.config.enabled,
                "max_queries_per_run": self.config.max_queries_per_run,
                "warming_interval_hours": self.config.warming_interval_hours
            },
            "schedules": []
        }
        
        for schedule in self.config.schedules:
            stats["schedules"].append({
                "name": schedule.name,
                "strategy": schedule.strategy.value,
                "enabled": schedule.enabled,
                "schedule_time": schedule.schedule_time.isoformat() if schedule.schedule_time else None,
                "last_run": schedule.last_run.isoformat() if schedule.last_run else None,
                "next_run": schedule.next_run.isoformat() if schedule.next_run else None,
                "query_count": len(schedule.queries)
            })
        
        # Add cache hit rates if available
        if self.cache_manager:
            cache_stats = self.cache_manager.get_stats()
            stats["cache_performance"] = cache_stats.get("performance", {})
        
        return stats
    
    async def warm_financial_metrics(self) -> Dict[str, Any]:
        """Specifically warm financial metric queries."""
        logger.info("Warming financial metric caches")
        
        queries = []
        
        # Current period metrics
        for metric in financial_hierarchy.l1_metrics.values():
            queries.extend([
                f"What's our {metric.metric_name.lower()}?",
                f"Show {metric.metric_name.lower()} for this month",
                f"Calculate {metric.metric_name.lower()} YTD",
                f"{metric.metric_name} by region",
                f"{metric.metric_name} trend last 12 months"
            ])
        
        # Common breakdowns
        queries.extend([
            "Break down COGS by component",
            "Operating expenses by category",
            "Revenue by product line",
            "Gross margin by customer segment",
            "EBITDA by quarter"
        ])
        
        # Execute warming
        results = await self._execute_warming(queries)
        
        return results