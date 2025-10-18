"""Query pattern analyzer for identifying optimization opportunities."""

from typing import Dict, List, Optional, Set, Tuple, Any
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import re
import json
import hashlib
import structlog
from pydantic import BaseModel, Field
from enum import Enum

from src.db.bigquery import BigQueryClient
from src.utils.query_logger import QueryLogger
from src.core.optimization import MaterializedViewManager, MaterializedViewConfig
from src.core.cache_manager import CacheManager

logger = structlog.get_logger()


class PatternType(Enum):
    """Types of query patterns."""
    AGGREGATION = "aggregation"
    TIME_SERIES = "time_series"
    JOIN = "join"
    FILTER = "filter"
    DIMENSION_BREAKDOWN = "dimension_breakdown"
    

class QueryPattern(BaseModel):
    """Represents a query pattern."""
    pattern_id: str
    pattern_type: PatternType
    tables: List[str]
    columns: List[str]
    aggregations: List[str] = Field(default_factory=list)
    filters: List[str] = Field(default_factory=list)
    group_by: List[str] = Field(default_factory=list)
    frequency: int = 0
    avg_execution_time_ms: float = 0
    total_bytes_processed: int = 0
    sample_queries: List[str] = Field(default_factory=list)
    

class MVRecommendation(BaseModel):
    """Materialized view recommendation."""
    recommendation_id: str
    pattern: QueryPattern
    suggested_query: str
    estimated_cost_reduction_pct: float
    estimated_monthly_cost_usd: float
    affected_queries_count: int
    confidence_score: float
    reasoning: str
    

class QueryPatternAnalyzer:
    """Analyzes query patterns to identify optimization opportunities."""
    
    def __init__(
        self,
        query_logger: QueryLogger,
        bq_client: BigQueryClient,
        mv_manager: Optional[MaterializedViewManager] = None,
        cache_manager: Optional[CacheManager] = None
    ):
        self.query_logger = query_logger
        self.bq_client = bq_client
        self.mv_manager = mv_manager
        self.cache_manager = cache_manager
        self.patterns: Dict[str, QueryPattern] = {}
        
    def analyze_query_logs(
        self,
        lookback_days: int = 30,
        min_frequency: int = 5
    ) -> List[QueryPattern]:
        """Analyze query logs to identify patterns."""
        logger.info(f"Analyzing query logs for last {lookback_days} days")
        
        # Get query logs
        since = datetime.now() - timedelta(days=lookback_days)
        logs = self.query_logger.get_query_history(
            since=since,
            limit=10000  # Analyze up to 10k queries
        )
        
        # Group queries by pattern
        pattern_groups = defaultdict(list)
        
        for log in logs:
            if not log.get("sql"):
                continue
                
            # Extract pattern from query
            pattern_key = self._extract_pattern_key(log["sql"])
            if pattern_key:
                pattern_groups[pattern_key].append(log)
        
        # Analyze each pattern group
        patterns = []
        for pattern_key, queries in pattern_groups.items():
            if len(queries) >= min_frequency:
                pattern = self._analyze_pattern_group(pattern_key, queries)
                if pattern:
                    patterns.append(pattern)
                    self.patterns[pattern.pattern_id] = pattern
        
        logger.info(f"Identified {len(patterns)} query patterns")
        return patterns
    
    def _extract_pattern_key(self, sql: str) -> Optional[str]:
        """Extract a pattern key from SQL query."""
        try:
            # Normalize SQL for pattern matching
            normalized = sql.upper().strip()
            
            # Remove specific values to focus on structure
            # Remove string literals
            normalized = re.sub(r"'[^']*'", "'?'", normalized)
            # Remove numeric literals
            normalized = re.sub(r"\b\d+\.?\d*\b", "?", normalized)
            # Remove date literals
            normalized = re.sub(r"DATE\s*\([^)]+\)", "DATE(?)", normalized)
            # Remove whitespace variations
            normalized = re.sub(r"\s+", " ", normalized)
            
            # Extract key components
            tables = self._extract_tables(normalized)
            columns = self._extract_columns(normalized)
            aggregations = self._extract_aggregations(normalized)
            
            if tables:
                # Create pattern key
                key_components = [
                    "tables:" + ",".join(sorted(tables)),
                    "aggs:" + ",".join(sorted(aggregations)),
                    "cols:" + ",".join(sorted(columns[:5]))  # Limit columns
                ]
                return "|".join(key_components)
                
        except Exception as e:
            logger.debug(f"Failed to extract pattern from query: {e}")
        
        return None
    
    def _extract_tables(self, sql: str) -> List[str]:
        """Extract table names from SQL."""
        tables = []
        
        # Match FROM clause tables
        from_pattern = r"FROM\s+`?([^`\s,]+(?:\.[^`\s,]+)*)`?"
        matches = re.findall(from_pattern, sql)
        tables.extend(matches)
        
        # Match JOIN clause tables
        join_pattern = r"JOIN\s+`?([^`\s,]+(?:\.[^`\s,]+)*)`?"
        matches = re.findall(join_pattern, sql)
        tables.extend(matches)
        
        # Extract just table name from full path
        clean_tables = []
        for table in tables:
            parts = table.split(".")
            if len(parts) >= 3:
                clean_tables.append(parts[-1])
            else:
                clean_tables.append(table)
        
        return list(set(clean_tables))
    
    def _extract_columns(self, sql: str) -> List[str]:
        """Extract column names from SQL."""
        columns = []
        
        # Extract from SELECT clause
        select_match = re.search(r"SELECT\s+(.*?)\s+FROM", sql, re.IGNORECASE | re.DOTALL)
        if select_match:
            select_clause = select_match.group(1)
            # Simple column extraction (not perfect but good enough for patterns)
            col_pattern = r"([A-Z_][A-Z0-9_]*)"
            matches = re.findall(col_pattern, select_clause)
            columns.extend(matches)
        
        # Extract from WHERE clause
        where_match = re.search(r"WHERE\s+(.*?)(?:GROUP|ORDER|LIMIT|$)", sql, re.IGNORECASE | re.DOTALL)
        if where_match:
            where_clause = where_match.group(1)
            col_pattern = r"([A-Z_][A-Z0-9_]*)\s*[=<>]"
            matches = re.findall(col_pattern, where_clause)
            columns.extend(matches)
        
        # Extract from GROUP BY
        group_match = re.search(r"GROUP\s+BY\s+(.*?)(?:ORDER|LIMIT|$)", sql, re.IGNORECASE | re.DOTALL)
        if group_match:
            group_clause = group_match.group(1)
            col_pattern = r"([A-Z_][A-Z0-9_]*)"
            matches = re.findall(col_pattern, group_clause)
            columns.extend(matches)
        
        # Filter out SQL keywords
        keywords = {"SELECT", "FROM", "WHERE", "AND", "OR", "AS", "BY", "GROUP", "ORDER", "LIMIT", "COUNT", "SUM", "AVG", "MAX", "MIN", "CAST", "CASE", "WHEN", "THEN", "ELSE", "END"}
        columns = [col for col in columns if col not in keywords]
        
        return list(set(columns))
    
    def _extract_aggregations(self, sql: str) -> List[str]:
        """Extract aggregation functions from SQL."""
        agg_pattern = r"(COUNT|SUM|AVG|MAX|MIN|STDDEV|VARIANCE)\s*\("
        matches = re.findall(agg_pattern, sql, re.IGNORECASE)
        return list(set(matches))
    
    def _analyze_pattern_group(
        self,
        pattern_key: str,
        queries: List[Dict[str, Any]]
    ) -> Optional[QueryPattern]:
        """Analyze a group of similar queries."""
        try:
            # Parse pattern key
            key_parts = pattern_key.split("|")
            tables = []
            aggregations = []
            columns = []
            
            for part in key_parts:
                if part.startswith("tables:"):
                    tables = part[7:].split(",")
                elif part.startswith("aggs:"):
                    aggregations = part[5:].split(",")
                elif part.startswith("cols:"):
                    columns = part[5:].split(",")
            
            # Determine pattern type
            pattern_type = self._determine_pattern_type(queries[0]["sql"], aggregations)
            
            # Calculate statistics
            total_time = sum(q.get("execution_time_ms", 0) for q in queries)
            avg_time = total_time / len(queries) if queries else 0
            total_bytes = sum(q.get("bytes_processed", 0) for q in queries)
            
            # Extract common filters and group by
            filters = self._extract_common_filters(queries)
            group_by = self._extract_common_group_by(queries)
            
            # Create pattern
            pattern = QueryPattern(
                pattern_id=hashlib.md5(pattern_key.encode()).hexdigest()[:12],
                pattern_type=pattern_type,
                tables=tables,
                columns=columns,
                aggregations=aggregations,
                filters=filters,
                group_by=group_by,
                frequency=len(queries),
                avg_execution_time_ms=avg_time,
                total_bytes_processed=total_bytes,
                sample_queries=[q["sql"] for q in queries[:3]]  # Keep 3 samples
            )
            
            return pattern
            
        except Exception as e:
            logger.error(f"Failed to analyze pattern group: {e}")
            return None
    
    def _determine_pattern_type(self, sql: str, aggregations: List[str]) -> PatternType:
        """Determine the type of query pattern."""
        sql_upper = sql.upper()
        
        # Check for time series pattern
        if any(term in sql_upper for term in ["DATE_TRUNC", "EXTRACT", "DATE_DIFF"]):
            return PatternType.TIME_SERIES
        
        # Check for joins
        if "JOIN" in sql_upper:
            return PatternType.JOIN
        
        # Check for aggregations
        if aggregations:
            if "GROUP BY" in sql_upper:
                return PatternType.DIMENSION_BREAKDOWN
            return PatternType.AGGREGATION
        
        # Default to filter
        return PatternType.FILTER
    
    def _extract_common_filters(self, queries: List[Dict[str, Any]]) -> List[str]:
        """Extract common filter patterns from queries."""
        filter_counter = Counter()
        
        for query in queries:
            sql = query.get("sql", "").upper()
            where_match = re.search(r"WHERE\s+(.*?)(?:GROUP|ORDER|LIMIT|$)", sql, re.DOTALL)
            if where_match:
                where_clause = where_match.group(1)
                # Extract column comparisons
                filters = re.findall(r"([A-Z_][A-Z0-9_]*)\s*[=<>]", where_clause)
                filter_counter.update(filters)
        
        # Return filters that appear in >50% of queries
        threshold = len(queries) * 0.5
        common_filters = [f for f, count in filter_counter.items() if count >= threshold]
        return common_filters
    
    def _extract_common_group_by(self, queries: List[Dict[str, Any]]) -> List[str]:
        """Extract common GROUP BY columns from queries."""
        group_counter = Counter()
        
        for query in queries:
            sql = query.get("sql", "").upper()
            group_match = re.search(r"GROUP\s+BY\s+(.*?)(?:ORDER|LIMIT|$)", sql, re.DOTALL)
            if group_match:
                group_clause = group_match.group(1)
                columns = re.findall(r"([A-Z_][A-Z0-9_]*)", group_clause)
                group_counter.update(columns)
        
        # Return columns that appear in >50% of queries
        threshold = len(queries) * 0.5
        common_groups = [g for g, count in group_counter.items() if count >= threshold]
        return common_groups
    
    def generate_mv_recommendations(
        self,
        patterns: Optional[List[QueryPattern]] = None,
        min_frequency: int = 10,
        min_bytes_processed_gb: float = 1.0
    ) -> List[MVRecommendation]:
        """Generate materialized view recommendations from patterns."""
        if patterns is None:
            patterns = list(self.patterns.values())
        
        recommendations = []
        
        for pattern in patterns:
            # Filter patterns worth optimizing
            if pattern.frequency < min_frequency:
                continue
            
            bytes_processed_gb = pattern.total_bytes_processed / (1024**3)
            if bytes_processed_gb < min_bytes_processed_gb:
                continue
            
            # Generate MV recommendation
            recommendation = self._generate_mv_for_pattern(pattern)
            if recommendation:
                recommendations.append(recommendation)
        
        # Sort by potential impact
        recommendations.sort(
            key=lambda x: x.estimated_cost_reduction_pct * x.affected_queries_count,
            reverse=True
        )
        
        logger.info(f"Generated {len(recommendations)} MV recommendations")
        return recommendations
    
    def _generate_mv_for_pattern(self, pattern: QueryPattern) -> Optional[MVRecommendation]:
        """Generate a materialized view recommendation for a pattern."""
        try:
            # Build MV query based on pattern type
            if pattern.pattern_type == PatternType.TIME_SERIES:
                mv_query = self._build_time_series_mv(pattern)
            elif pattern.pattern_type == PatternType.DIMENSION_BREAKDOWN:
                mv_query = self._build_dimension_mv(pattern)
            elif pattern.pattern_type == PatternType.AGGREGATION:
                mv_query = self._build_aggregation_mv(pattern)
            else:
                return None  # Skip other pattern types for now
            
            if not mv_query:
                return None
            
            # Estimate cost savings
            # Rough estimate: MV reduces scanning by 80-95% for matching queries
            scan_reduction = 0.9 if pattern.pattern_type == PatternType.AGGREGATION else 0.8
            
            # Calculate monthly cost
            # BigQuery: $5 per TB scanned
            monthly_tb_scanned = (pattern.total_bytes_processed * 30) / (1024**4)
            current_monthly_cost = monthly_tb_scanned * 5
            mv_monthly_cost = current_monthly_cost * (1 - scan_reduction)
            
            # MV storage cost (rough estimate)
            # Assume MV is 1% of original data size
            mv_storage_cost = monthly_tb_scanned * 0.01 * 0.02  # $0.02 per GB/month
            
            total_mv_cost = mv_monthly_cost + mv_storage_cost
            cost_reduction_pct = ((current_monthly_cost - total_mv_cost) / current_monthly_cost) * 100
            
            # Generate recommendation
            recommendation = MVRecommendation(
                recommendation_id=f"mv_{pattern.pattern_id}",
                pattern=pattern,
                suggested_query=mv_query,
                estimated_cost_reduction_pct=cost_reduction_pct,
                estimated_monthly_cost_usd=total_mv_cost,
                affected_queries_count=pattern.frequency,
                confidence_score=self._calculate_confidence_score(pattern),
                reasoning=self._generate_reasoning(pattern, cost_reduction_pct)
            )
            
            return recommendation
            
        except Exception as e:
            logger.error(f"Failed to generate MV for pattern: {e}")
            return None
    
    def _build_time_series_mv(self, pattern: QueryPattern) -> Optional[str]:
        """Build materialized view for time series pattern."""
        if not pattern.tables:
            return None
        
        # Assume first table is the main table
        main_table = pattern.tables[0]
        
        # Build SELECT clause
        select_parts = []
        
        # Add time truncation
        select_parts.append("DATE_TRUNC(Posting_Date, DAY) as date")
        
        # Add dimensions
        for col in pattern.group_by[:5]:  # Limit to 5 dimensions
            if col != "POSTING_DATE":
                select_parts.append(col)
        
        # Add aggregations
        for agg in pattern.aggregations:
            if agg == "COUNT":
                select_parts.append("COUNT(*) as row_count")
            elif agg == "SUM":
                # Add common numeric columns
                for col in ["amount", "quantity", "revenue", "cost"]:
                    if col.upper() in [c.upper() for c in pattern.columns]:
                        select_parts.append(f"SUM({col}) as sum_{col}")
        
        # Build query
        query = f"""
        SELECT 
            {', '.join(select_parts)}
        FROM `{self.bq_client.project_id}.{self.bq_client.dataset_id}.{main_table}`
        WHERE Posting_Date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
        GROUP BY {', '.join(range(1, len(pattern.group_by) + 2))}
        """
        
        return query.strip()
    
    def _build_dimension_mv(self, pattern: QueryPattern) -> Optional[str]:
        """Build materialized view for dimension breakdown pattern."""
        if not pattern.tables or not pattern.group_by:
            return None
        
        main_table = pattern.tables[0]
        
        # Build SELECT clause
        select_parts = []
        
        # Add dimensions
        for col in pattern.group_by[:7]:  # Limit to 7 dimensions
            select_parts.append(col)
        
        # Add aggregations
        for agg in pattern.aggregations:
            if agg == "COUNT":
                select_parts.append("COUNT(*) as row_count")
            elif agg == "SUM":
                # Add numeric columns that appear in pattern
                for col in pattern.columns:
                    if col.upper() in ["AMOUNT", "QUANTITY", "REVENUE", "COST", "GROSS_REVENUE", "TOTAL_COGS"]:
                        select_parts.append(f"SUM(CAST({col} AS FLOAT64)) as sum_{col}")
                        break  # Add just one for now
        
        # Build query
        group_by_positions = ', '.join(str(i) for i in range(1, len(pattern.group_by) + 1))
        
        query = f"""
        SELECT 
            {', '.join(select_parts)}
        FROM `{self.bq_client.project_id}.{self.bq_client.dataset_id}.{main_table}`
        GROUP BY {group_by_positions}
        """
        
        return query.strip()
    
    def _build_aggregation_mv(self, pattern: QueryPattern) -> Optional[str]:
        """Build materialized view for simple aggregation pattern."""
        if not pattern.tables:
            return None
        
        main_table = pattern.tables[0]
        
        # Build simple aggregation MV
        select_parts = []
        
        # Add date dimension if time-related
        if any("DATE" in col.upper() for col in pattern.columns):
            select_parts.append("DATE_TRUNC(Posting_Date, MONTH) as month")
        
        # Add key aggregations
        select_parts.append("COUNT(*) as row_count")
        
        # Add sum for numeric columns
        numeric_cols = ["amount", "revenue", "cost", "quantity", "Gross_Revenue", "Total_COGS"]
        for col in numeric_cols:
            if col.upper() in [c.upper() for c in pattern.columns]:
                select_parts.append(f"SUM(CAST({col} AS FLOAT64)) as sum_{col}")
        
        query = f"""
        SELECT 
            {', '.join(select_parts)}
        FROM `{self.bq_client.project_id}.{self.bq_client.dataset_id}.{main_table}`
        {"GROUP BY 1" if "month" in select_parts[0] else ""}
        """
        
        return query.strip()
    
    def _calculate_confidence_score(self, pattern: QueryPattern) -> float:
        """Calculate confidence score for a recommendation."""
        score = 0.5  # Base score
        
        # Frequency factor
        if pattern.frequency >= 100:
            score += 0.2
        elif pattern.frequency >= 50:
            score += 0.15
        elif pattern.frequency >= 20:
            score += 0.1
        
        # Data volume factor
        gb_processed = pattern.total_bytes_processed / (1024**3)
        if gb_processed >= 100:
            score += 0.2
        elif gb_processed >= 10:
            score += 0.15
        elif gb_processed >= 1:
            score += 0.1
        
        # Pattern type factor
        if pattern.pattern_type in [PatternType.AGGREGATION, PatternType.TIME_SERIES]:
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_reasoning(self, pattern: QueryPattern, cost_reduction_pct: float) -> str:
        """Generate human-readable reasoning for recommendation."""
        reasons = []
        
        # Frequency reason
        reasons.append(f"This query pattern appears {pattern.frequency} times in the last 30 days")
        
        # Data volume reason
        gb_processed = pattern.total_bytes_processed / (1024**3)
        reasons.append(f"It processes {gb_processed:.2f} GB of data in total")
        
        # Performance reason
        if pattern.avg_execution_time_ms > 5000:
            reasons.append(f"Average execution time is {pattern.avg_execution_time_ms/1000:.1f} seconds")
        
        # Cost reason
        reasons.append(f"Creating this MV could reduce costs by {cost_reduction_pct:.1f}%")
        
        # Pattern type reason
        if pattern.pattern_type == PatternType.TIME_SERIES:
            reasons.append("Time series aggregations are ideal for materialized views")
        elif pattern.pattern_type == PatternType.DIMENSION_BREAKDOWN:
            reasons.append("Dimension breakdowns benefit significantly from pre-aggregation")
        
        return ". ".join(reasons) + "."
    
    async def auto_create_recommended_mvs(
        self,
        max_mvs: int = 5,
        min_confidence: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Automatically create the top recommended materialized views."""
        if not self.mv_manager:
            raise ValueError("MaterializedViewManager not configured")
        
        # Get recommendations
        patterns = self.analyze_query_logs()
        recommendations = self.generate_mv_recommendations(patterns)
        
        # Filter by confidence
        high_confidence = [r for r in recommendations if r.confidence_score >= min_confidence]
        
        # Create top MVs
        created_mvs = []
        for rec in high_confidence[:max_mvs]:
            try:
                # Generate MV name
                mv_name = f"auto_mv_{rec.pattern.pattern_type.value}_{rec.recommendation_id}"
                
                # Create MV config
                config = MaterializedViewConfig(
                    name=mv_name,
                    query=rec.suggested_query,
                    dataset=self.bq_client.dataset_id,
                    project=self.bq_client.project_id,
                    description=f"Auto-generated MV: {rec.reasoning}",
                    auto_refresh=True,
                    refresh_interval_hours=24
                )
                
                # Create the MV
                result = self.mv_manager.create_materialized_view(config)
                
                created_mvs.append({
                    "mv_name": mv_name,
                    "pattern_id": rec.pattern.pattern_id,
                    "estimated_savings_pct": rec.estimated_cost_reduction_pct,
                    "affected_queries": rec.affected_queries_count,
                    "status": "created",
                    "result": result
                })
                
                logger.info(f"Created MV: {mv_name}")
                
            except Exception as e:
                logger.error(f"Failed to create MV for pattern {rec.pattern.pattern_id}: {e}")
                created_mvs.append({
                    "pattern_id": rec.pattern.pattern_id,
                    "status": "failed",
                    "error": str(e)
                })
        
        return created_mvs
    
    def get_pattern_insights(self) -> Dict[str, Any]:
        """Get insights about query patterns."""
        if not self.patterns:
            self.analyze_query_logs()
        
        # Aggregate insights
        total_queries = sum(p.frequency for p in self.patterns.values())
        total_bytes = sum(p.total_bytes_processed for p in self.patterns.values())
        
        # Pattern type distribution
        type_dist = defaultdict(int)
        for pattern in self.patterns.values():
            type_dist[pattern.pattern_type.value] += pattern.frequency
        
        # Most expensive patterns
        expensive_patterns = sorted(
            self.patterns.values(),
            key=lambda p: p.total_bytes_processed,
            reverse=True
        )[:10]
        
        # Most frequent patterns
        frequent_patterns = sorted(
            self.patterns.values(),
            key=lambda p: p.frequency,
            reverse=True
        )[:10]
        
        return {
            "summary": {
                "total_patterns": len(self.patterns),
                "total_queries_analyzed": total_queries,
                "total_data_processed_gb": total_bytes / (1024**3),
                "pattern_type_distribution": dict(type_dist)
            },
            "expensive_patterns": [
                {
                    "pattern_id": p.pattern_id,
                    "type": p.pattern_type.value,
                    "frequency": p.frequency,
                    "data_processed_gb": p.total_bytes_processed / (1024**3),
                    "tables": p.tables
                }
                for p in expensive_patterns
            ],
            "frequent_patterns": [
                {
                    "pattern_id": p.pattern_id,
                    "type": p.pattern_type.value,
                    "frequency": p.frequency,
                    "avg_execution_ms": p.avg_execution_time_ms,
                    "tables": p.tables
                }
                for p in frequent_patterns
            ]
        }