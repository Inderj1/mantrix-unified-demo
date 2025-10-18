"""BigQuery-specific optimization strategy implementation."""

from typing import Dict, List, Optional
import re
from .base import OptimizationStrategy, OptimizationConfig


class BigQueryOptimization(OptimizationStrategy):
    """BigQuery-specific optimization implementation."""
    
    def create_materialized_structure(self, config: OptimizationConfig) -> str:
        """Create a BigQuery materialized view."""
        sql_parts = [f"CREATE MATERIALIZED VIEW `{config.name}`"]
        
        # Add OPTIONS if we have description or refresh settings
        options = []
        if config.description:
            options.append(f"description='{config.description}'")
        if config.refresh_schedule:
            options.append(f"enable_refresh=true")
            options.append(f"refresh_interval_minutes={self._parse_refresh_interval(config.refresh_schedule)}")
        
        if options:
            sql_parts.append(f"OPTIONS({', '.join(options)})")
        
        # Add partitioning
        if config.partition_columns and len(config.partition_columns) > 0:
            sql_parts.append(f"PARTITION BY {config.partition_columns[0]}")
        
        # Add clustering
        if config.cluster_columns:
            sql_parts.append(f"CLUSTER BY {', '.join(config.cluster_columns)}")
        
        # Add the query
        sql_parts.append(f"AS {config.source_query}")
        
        return '\n'.join(sql_parts)
    
    def drop_materialized_structure(self, name: str) -> str:
        """Drop a BigQuery materialized view."""
        return f"DROP MATERIALIZED VIEW IF EXISTS `{name}`"
    
    def refresh_materialized_structure(self, name: str) -> str:
        """Refresh a BigQuery materialized view."""
        # BigQuery automatically refreshes MVs, but we can force it
        return f"REFRESH MATERIALIZED VIEW `{name}`"
    
    def optimize_table_layout(self, table: str, columns: List[str]) -> str:
        """Optimize table layout using clustering."""
        return f"""
        CREATE OR REPLACE TABLE `{table}`
        CLUSTER BY {', '.join(columns)}
        AS SELECT * FROM `{table}`
        """
    
    def suggest_partitioning(self, table: str, query_patterns: List[str]) -> Dict:
        """Suggest partitioning strategy for BigQuery."""
        # Analyze query patterns for partition column suggestions
        date_columns = self._extract_date_filters(query_patterns)
        
        if date_columns:
            # Prefer timestamp/date columns for partitioning
            partition_col = date_columns[0]
            
            # Determine if it's already a DATE or needs conversion
            if self._is_date_column(partition_col, query_patterns):
                partition_expr = partition_col
            else:
                partition_expr = f"DATE({partition_col})"
            
            return {
                "type": "time_based",
                "column": partition_col,
                "expression": partition_expr,
                "granularity": "day",
                "sql": f"PARTITION BY {partition_expr}",
                "benefits": [
                    "Partition pruning reduces data scanned",
                    "Lower query costs for time-filtered queries",
                    "Faster query execution"
                ]
            }
        
        # Check for integer range partitioning candidates
        int_columns = self._extract_integer_filters(query_patterns)
        if int_columns:
            return {
                "type": "integer_range",
                "column": int_columns[0],
                "sql": f"PARTITION BY RANGE_BUCKET({int_columns[0]}, GENERATE_ARRAY(0, 1000000, 1000))",
                "benefits": [
                    "Effective for ID-based filtering",
                    "Reduces data scanned for range queries"
                ]
            }
        
        return {
            "type": "none",
            "reason": "No suitable partition column found",
            "recommendation": "Consider clustering instead for better performance"
        }
    
    def estimate_optimization_cost(self, config: OptimizationConfig) -> Dict:
        """Estimate BigQuery-specific costs."""
        # Base estimates (these would be refined based on actual data)
        storage_gb = 10  # Default estimate
        
        # Adjust based on optimization type
        if config.optimization_type == "materialized_view":
            # MV storage cost: $0.02 per GB per month
            storage_cost = storage_gb * 0.02
            
            # Refresh cost: depends on query complexity and data size
            # Assume 0.1 TB scanned per refresh, daily refresh
            refresh_tb = 0.1
            refresh_frequency = 30  # monthly
            if config.refresh_schedule:
                if "hour" in config.refresh_schedule:
                    refresh_frequency = 30 * 24  # hourly refreshes
                elif "day" in config.refresh_schedule:
                    refresh_frequency = 30  # daily refreshes
            
            refresh_cost = refresh_tb * 5 * refresh_frequency  # $5 per TB
            
            total_cost = storage_cost + refresh_cost
            
            return {
                "storage_cost_usd": round(storage_cost, 2),
                "refresh_cost_usd": round(refresh_cost, 2),
                "total_monthly_cost_usd": round(total_cost, 2),
                "cost_breakdown": {
                    "storage_gb": storage_gb,
                    "storage_rate": "$0.02/GB/month",
                    "refresh_tb_per_run": refresh_tb,
                    "refresh_frequency_monthly": refresh_frequency,
                    "query_rate": "$5.00/TB"
                }
            }
        
        elif config.optimization_type == "clustering":
            # One-time cost to recreate table with clustering
            # Assume 1TB table size
            rewrite_cost = 1 * 5  # $5 per TB
            
            return {
                "one_time_cost_usd": round(rewrite_cost, 2),
                "ongoing_cost_usd": 0,
                "total_monthly_cost_usd": 0,
                "cost_breakdown": {
                    "rewrite_tb": 1,
                    "query_rate": "$5.00/TB"
                }
            }
        
        return {"total_monthly_cost_usd": 0, "error": "Unknown optimization type"}
    
    def get_platform_capabilities(self) -> Dict:
        """Return BigQuery platform capabilities."""
        return {
            "supports_materialized_views": True,
            "supports_clustering": True,
            "supports_partitioning": True,
            "supports_auto_refresh": True,
            "supports_incremental_refresh": False,
            "supports_query_rewrite": True,
            "index_types": ["clustering"],
            "partition_types": ["time", "ingestion_time", "integer_range"],
            "clustering_limits": {
                "max_columns": 4,
                "column_order_matters": True
            },
            "mv_features": {
                "auto_refresh": True,
                "max_staleness": True,
                "enable_refresh_control": True,
                "supports_joins": True,
                "supports_aggregations": True
            },
            "cost_model": {
                "storage_per_gb_month": 0.02,
                "query_per_tb": 5.00,
                "streaming_per_gb": 0.01
            },
            "optimization_features": [
                "partition_pruning",
                "cluster_pruning", 
                "query_cache",
                "result_cache",
                "bi_engine",
                "smart_tuning"
            ]
        }
    
    def _parse_refresh_interval(self, schedule: str) -> int:
        """Parse refresh schedule string to minutes."""
        schedule = schedule.lower()
        if "hour" in schedule:
            # Extract number of hours
            match = re.search(r'(\d+)', schedule)
            hours = int(match.group(1)) if match else 1
            return hours * 60
        elif "day" in schedule:
            # Extract number of days
            match = re.search(r'(\d+)', schedule)
            days = int(match.group(1)) if match else 1
            return days * 24 * 60
        else:
            # Default to 24 hours
            return 24 * 60
    
    def _is_date_column(self, column: str, query_patterns: List[str]) -> bool:
        """Check if a column is already a DATE type based on usage."""
        for query in query_patterns:
            # Look for DATE casting or date functions
            if f"DATE({column})" in query or f"CAST({column} AS DATE)" in query:
                return False
            # If used directly with date comparisons, likely already a date
            if re.search(f"{column}\\s*[><=]+\\s*DATE", query, re.IGNORECASE):
                return True
        return False
    
    def _extract_integer_filters(self, query_patterns: List[str]) -> List[str]:
        """Extract integer columns used in range filters."""
        int_columns = set()
        
        for query in query_patterns:
            # Look for numeric comparisons
            numeric_pattern = r'(\w+)\s*(?:>|<|>=|<=|BETWEEN)\s*\d+'
            matches = re.findall(numeric_pattern, query, re.IGNORECASE)
            
            # Filter out obvious date columns
            for col in matches:
                if not any(date_word in col.upper() for date_word in ['DATE', 'TIME', 'YEAR', 'MONTH', 'DAY']):
                    int_columns.add(col)
        
        return list(int_columns)