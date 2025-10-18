"""Materialized View Manager for automated view lifecycle management."""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import json
import structlog
from google.cloud import bigquery
from google.api_core import exceptions

from src.db.bigquery import BigQueryClient
from src.utils.query_logger import QueryLogger
from src.core.cache_manager import CacheManager

logger = structlog.get_logger()


@dataclass
class MaterializedViewConfig:
    """Configuration for a materialized view."""
    name: str
    query: str
    dataset: str
    project: str
    partition_by: Optional[str] = None
    cluster_by: Optional[List[str]] = None
    auto_refresh: bool = True
    refresh_interval_hours: int = 24
    description: Optional[str] = None
    labels: Dict[str, str] = field(default_factory=dict)
    enable_refresh: bool = True
    max_staleness_hours: int = 24


@dataclass
class MaterializedViewStats:
    """Statistics for a materialized view."""
    view_name: str
    created_at: datetime
    last_refreshed: datetime
    size_bytes: int
    row_count: int
    query_count: int
    avg_query_time_saved_ms: float
    estimated_monthly_cost: float
    staleness_hours: float


class MaterializedViewManager:
    """Manages the lifecycle of materialized views."""
    
    def __init__(self, bq_client: BigQueryClient, query_logger: QueryLogger, cache_manager: Optional[CacheManager] = None):
        self.bq_client = bq_client
        self.query_logger = query_logger
        self.client = bq_client.client
        self.cache_manager = cache_manager
        
    def create_materialized_view(self, config: MaterializedViewConfig) -> Dict:
        """Create a new materialized view with tracking."""
        try:
            # Generate CREATE MATERIALIZED VIEW SQL
            sql = self._generate_create_mv_sql(config)
            
            logger.info(f"Creating materialized view: {config.name}", sql=sql)
            
            # Execute in BigQuery
            job = self.client.query(sql)
            job.result()  # Wait for completion
            
            # Add metadata labels
            table_ref = self.client.dataset(config.dataset).table(config.name)
            table = self.client.get_table(table_ref)
            table.labels = {
                **config.labels,
                "created_by": "nlp_to_sql",
                "auto_refresh": str(config.auto_refresh).lower(),
                "refresh_interval": str(config.refresh_interval_hours)
            }
            self.client.update_table(table, ["labels"])
            
            # Log the creation
            self.query_logger.log_query(
                natural_language=f"Created materialized view {config.name}",
                generated_sql=sql,
                execution_time=job.ended - job.started if job.ended and job.started else timedelta(0),
                result={"status": "created", "view_name": config.name}
            )
            
            # Invalidate cache after creating new MV
            if self.cache_manager:
                self.cache_manager.invalidate_mv_cache(config.project, config.dataset)
            
            return {
                "status": "created",
                "view_name": config.name,
                "full_name": f"{config.project}.{config.dataset}.{config.name}",
                "estimated_monthly_cost": self._estimate_cost(config)
            }
            
        except Exception as e:
            logger.error(f"Failed to create MV: {e}", view_name=config.name)
            raise
    
    def drop_materialized_view(self, project: str, dataset: str, view_name: str) -> Dict:
        """Drop a materialized view."""
        try:
            sql = f"DROP MATERIALIZED VIEW IF EXISTS `{project}.{dataset}.{view_name}`"
            
            job = self.client.query(sql)
            job.result()
            
            logger.info(f"Dropped materialized view: {view_name}")
            
            # Invalidate cache after dropping MV
            if self.cache_manager:
                self.cache_manager.invalidate_mv_cache(project, dataset, view_name)
            
            return {
                "status": "dropped",
                "view_name": view_name
            }
            
        except Exception as e:
            logger.error(f"Failed to drop MV: {e}", view_name=view_name)
            raise
    
    def refresh_materialized_view(self, project: str, dataset: str, view_name: str) -> Dict:
        """Manually refresh a materialized view."""
        try:
            # BigQuery automatically refreshes MVs, but we can force a refresh
            # by recreating the view or using ALTER MATERIALIZED VIEW
            sql = f"REFRESH MATERIALIZED VIEW `{project}.{dataset}.{view_name}`"
            
            job = self.client.query(sql)
            job.result()
            
            logger.info(f"Refreshed materialized view: {view_name}")
            
            # Invalidate stats cache after refresh
            if self.cache_manager:
                self.cache_manager.invalidate_mv_cache(project, dataset, view_name)
            
            return {
                "status": "refreshed",
                "view_name": view_name,
                "refreshed_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to refresh MV: {e}", view_name=view_name)
            raise
    
    def get_materialized_view_stats(self, project: str, dataset: str, view_name: str) -> MaterializedViewStats:
        """Get usage statistics for a materialized view."""
        # Check cache first
        if self.cache_manager:
            cached_stats = self.cache_manager.get_mv_stats(project, dataset, view_name)
            if cached_stats:
                logger.info(f"Retrieved MV stats from cache for {view_name}")
                # Convert cached dict back to MaterializedViewStats object
                return MaterializedViewStats(
                    view_name=cached_stats["view_name"],
                    created_at=datetime.fromisoformat(cached_stats["created_at"]),
                    last_refreshed=datetime.fromisoformat(cached_stats["last_refreshed"]),
                    size_bytes=cached_stats["size_bytes"],
                    row_count=cached_stats["row_count"],
                    query_count=cached_stats["query_count"],
                    avg_query_time_saved_ms=cached_stats["avg_query_time_saved_ms"],
                    estimated_monthly_cost=cached_stats["estimated_monthly_cost"],
                    staleness_hours=cached_stats["staleness_hours"]
                )
        
        try:
            # Get table metadata
            table_ref = self.client.dataset(dataset, project=project).table(view_name)
            table = self.client.get_table(table_ref)
            
            # Calculate staleness
            last_modified = table.modified if table.modified else table.created
            staleness_hours = (datetime.now(timezone.utc) - last_modified).total_seconds() / 3600
            
            # Get usage statistics from logs
            usage_stats = self._get_usage_stats(project, dataset, view_name)
            
            # Estimate costs
            storage_cost = (table.num_bytes / (1024**3)) * 0.02  # $0.02 per GB per month
            
            stats = MaterializedViewStats(
                view_name=view_name,
                created_at=table.created,
                last_refreshed=last_modified,
                size_bytes=table.num_bytes,
                row_count=table.num_rows,
                query_count=usage_stats.get("query_count", 0),
                avg_query_time_saved_ms=usage_stats.get("avg_time_saved_ms", 0),
                estimated_monthly_cost=storage_cost,
                staleness_hours=staleness_hours
            )
            
            # Cache the stats
            if self.cache_manager:
                stats_dict = {
                    "view_name": stats.view_name,
                    "created_at": stats.created_at.isoformat(),
                    "last_refreshed": stats.last_refreshed.isoformat(),
                    "size_bytes": stats.size_bytes,
                    "row_count": stats.row_count,
                    "query_count": stats.query_count,
                    "avg_query_time_saved_ms": stats.avg_query_time_saved_ms,
                    "estimated_monthly_cost": stats.estimated_monthly_cost,
                    "staleness_hours": stats.staleness_hours
                }
                self.cache_manager.cache_mv_stats(project, dataset, view_name, stats_dict)
            
            return stats
            
        except exceptions.NotFound:
            raise ValueError(f"Materialized view not found: {view_name}")
        except Exception as e:
            logger.error(f"Failed to get MV stats: {e}", view_name=view_name)
            raise
    
    def list_materialized_views(self, project: str, dataset: str) -> List[Dict]:
        """List all materialized views in a dataset."""
        # Check cache first
        if self.cache_manager:
            cached_list = self.cache_manager.get_mv_list(project, dataset)
            if cached_list is not None:
                logger.info(f"Retrieved MV list from cache for {project}.{dataset}")
                return cached_list
        
        try:
            dataset_ref = self.client.dataset(dataset, project=project)
            tables = self.client.list_tables(dataset_ref)
            
            mv_list = []
            for table in tables:
                if table.table_type == "MATERIALIZED_VIEW":
                    try:
                        stats = self.get_materialized_view_stats(project, dataset, table.table_id)
                        mv_list.append({
                            "name": table.table_id,
                            "created_at": stats.created_at.isoformat(),
                            "last_refreshed": stats.last_refreshed.isoformat(),
                            "size_mb": stats.size_bytes / (1024**2),
                            "row_count": stats.row_count,
                            "staleness_hours": stats.staleness_hours,
                            "estimated_monthly_cost": stats.estimated_monthly_cost
                        })
                    except Exception as e:
                        logger.warning(f"Could not get stats for MV {table.table_id}: {e}")
                        mv_list.append({
                            "name": table.table_id,
                            "error": str(e)
                        })
            
            # Cache the results
            if self.cache_manager:
                self.cache_manager.cache_mv_list(project, dataset, mv_list)
            
            return mv_list
            
        except Exception as e:
            logger.error(f"Failed to list MVs: {e}")
            raise
    
    def analyze_query_for_mv_candidate(self, query: str, execution_stats: Dict) -> Optional[MaterializedViewConfig]:
        """Analyze if a query should have a materialized view."""
        # Check execution frequency (from query logs)
        frequency = self._get_query_frequency(query)
        
        # Check execution time
        avg_execution_time = execution_stats.get('avg_execution_time_ms', 0)
        
        # Check data volume
        bytes_processed = execution_stats.get('bytes_processed', 0)
        
        # Decision logic
        if (frequency > 10  # Run more than 10 times per day
            and avg_execution_time > 5000  # Takes more than 5 seconds
            and bytes_processed > 1_000_000_000):  # Processes > 1GB
            
            return self._generate_mv_config(query, execution_stats)
        
        return None
    
    def get_mv_recommendations(self) -> List[Dict]:
        """Get recommendations for new materialized views based on usage."""
        # Check cache first
        if self.cache_manager:
            cached_recommendations = self.cache_manager.get_mv_recommendations()
            if cached_recommendations is not None:
                logger.info("Retrieved MV recommendations from cache")
                return cached_recommendations
        
        # Analyze query logs
        frequent_queries = self._analyze_query_logs()
        
        recommendations = []
        for query_pattern in frequent_queries:
            if self._should_create_mv(query_pattern):
                recommendations.append({
                    "query_pattern": query_pattern['pattern'],
                    "frequency": query_pattern['daily_frequency'],
                    "avg_bytes_processed": query_pattern['avg_bytes_processed'],
                    "avg_execution_time_ms": query_pattern['avg_execution_time_ms'],
                    "potential_savings": self._calculate_savings(query_pattern),
                    "suggested_mv": self._suggest_mv_structure(query_pattern)
                })
        
        # Cache the recommendations
        if self.cache_manager:
            self.cache_manager.cache_mv_recommendations(recommendations)
        
        return recommendations
    
    def _generate_create_mv_sql(self, config: MaterializedViewConfig) -> str:
        """Generate CREATE MATERIALIZED VIEW SQL statement."""
        sql_parts = [f"CREATE MATERIALIZED VIEW `{config.project}.{config.dataset}.{config.name}`"]
        
        # Add description
        if config.description:
            sql_parts.append(f"OPTIONS(description='{config.description}'")
            if config.enable_refresh:
                sql_parts.append(f"  enable_refresh=true")
                sql_parts.append(f"  refresh_interval_minutes={config.refresh_interval_hours * 60}")
            if config.max_staleness_hours:
                sql_parts.append(f"  max_staleness=INTERVAL {config.max_staleness_hours} HOUR")
            sql_parts.append(")")
        
        # Add partitioning
        if config.partition_by:
            sql_parts.append(f"PARTITION BY {config.partition_by}")
        
        # Add clustering
        if config.cluster_by:
            sql_parts.append(f"CLUSTER BY {', '.join(config.cluster_by)}")
        
        # Add query
        sql_parts.append(f"AS {config.query}")
        
        return '\n'.join(sql_parts)
    
    def _estimate_cost(self, config: MaterializedViewConfig) -> float:
        """Estimate monthly cost for a materialized view."""
        # This is a simplified estimation
        # Real cost depends on data size and refresh frequency
        
        # Base storage cost: $0.02 per GB per month
        # Assume average MV size of 10GB
        storage_cost = 10 * 0.02
        
        # Refresh cost: $5 per TB scanned
        # Assume each refresh scans 0.1TB
        refresh_cost = (30 * 24 / config.refresh_interval_hours) * 0.1 * 5
        
        return storage_cost + refresh_cost
    
    def _get_usage_stats(self, project: str, dataset: str, view_name: str) -> Dict:
        """Get usage statistics from query logs."""
        # Query the BigQuery information schema for usage stats
        query = f"""
        SELECT
            COUNT(*) as query_count,
            AVG(total_slot_ms) as avg_slot_ms,
            AVG(total_bytes_processed) as avg_bytes_processed
        FROM `{project}.region-us.INFORMATION_SCHEMA.JOBS_BY_PROJECT`
        WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        AND referenced_tables LIKE '%{dataset}.{view_name}%'
        AND state = 'DONE'
        """
        
        try:
            result = list(self.client.query(query))
            if result:
                return {
                    "query_count": result[0].query_count,
                    "avg_time_saved_ms": result[0].avg_slot_ms / 1000 if result[0].avg_slot_ms else 0,
                    "avg_bytes_processed": result[0].avg_bytes_processed
                }
        except Exception as e:
            logger.warning(f"Could not get usage stats: {e}")
        
        return {"query_count": 0, "avg_time_saved_ms": 0, "avg_bytes_processed": 0}
    
    def _get_query_frequency(self, query: str) -> int:
        """Get daily frequency of a query pattern."""
        # This would analyze query logs to find similar queries
        # For now, return a placeholder
        return 5
    
    def _generate_mv_config(self, query: str, execution_stats: Dict) -> MaterializedViewConfig:
        """Generate MV configuration from a query."""
        import hashlib
        
        # Generate a name based on query hash
        query_hash = hashlib.md5(query.encode()).hexdigest()[:8]
        mv_name = f"mv_auto_{query_hash}"
        
        # Extract partition and cluster columns from query
        partition_col = self._extract_partition_column(query)
        cluster_cols = self._extract_cluster_columns(query)
        
        return MaterializedViewConfig(
            name=mv_name,
            query=query,
            dataset=self.bq_client.dataset,
            project=self.bq_client.project,
            partition_by=partition_col,
            cluster_by=cluster_cols,
            auto_refresh=True,
            refresh_interval_hours=24,
            description=f"Auto-generated MV for frequently executed query"
        )
    
    def _analyze_query_logs(self) -> List[Dict]:
        """Analyze query logs to find frequent query patterns."""
        # This would analyze stored query logs
        # For now, return empty list
        return []
    
    def _should_create_mv(self, query_pattern: Dict) -> bool:
        """Determine if an MV should be created for a query pattern."""
        return (
            query_pattern.get('daily_frequency', 0) > 10
            and query_pattern.get('avg_bytes_processed', 0) > 1_000_000_000
            and query_pattern.get('avg_execution_time_ms', 0) > 5000
        )
    
    def _calculate_savings(self, query_pattern: Dict) -> Dict:
        """Calculate potential cost savings from creating an MV."""
        # Cost per TB scanned: $5
        daily_tb_scanned = (query_pattern['avg_bytes_processed'] * query_pattern['daily_frequency']) / (1024**4)
        daily_cost = daily_tb_scanned * 5
        
        # MV reduces scanning by ~90%
        daily_savings = daily_cost * 0.9
        
        return {
            "daily_usd": daily_savings,
            "monthly_usd": daily_savings * 30
        }
    
    def _suggest_mv_structure(self, query_pattern: Dict) -> Dict:
        """Suggest MV structure based on query pattern."""
        return {
            "query": query_pattern.get('pattern', ''),
            "partition_by": "DATE(timestamp_column)",  # Placeholder
            "cluster_by": ["customer_id", "product_id"],  # Placeholder
            "estimated_cost_usd": 10.0  # Placeholder
        }
    
    def _extract_partition_column(self, query: str) -> Optional[str]:
        """Extract suitable partition column from query."""
        import re
        
        # Look for date comparisons in WHERE clause
        date_pattern = r'WHERE.*?(\w+)\s*(?:=|>|<|>=|<=)\s*(?:DATE|TIMESTAMP|CURRENT_DATE)'
        match = re.search(date_pattern, query, re.IGNORECASE)
        
        if match:
            column = match.group(1)
            return f"DATE({column})"
        
        return None
    
    def _extract_cluster_columns(self, query: str) -> Optional[List[str]]:
        """Extract suitable clustering columns from query."""
        import re
        
        # Look for columns in WHERE and GROUP BY clauses
        columns = []
        
        # WHERE clause columns
        where_pattern = r'WHERE.*?(\w+)\s*='
        where_matches = re.findall(where_pattern, query, re.IGNORECASE)
        columns.extend(where_matches)
        
        # GROUP BY columns
        group_pattern = r'GROUP\s+BY\s+([\w\s,]+)'
        group_match = re.search(group_pattern, query, re.IGNORECASE)
        if group_match:
            group_cols = [col.strip() for col in group_match.group(1).split(',')]
            columns.extend(group_cols)
        
        # Return unique columns (max 4 for BigQuery)
        unique_cols = list(dict.fromkeys(columns))
        return unique_cols[:4] if unique_cols else None