"""Base classes for cross-platform optimization support."""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class OptimizationConfig:
    """Platform-agnostic optimization configuration."""
    name: str
    source_query: str
    optimization_type: str  # 'materialized_view', 'aggregate_table', 'index'
    partition_columns: Optional[List[str]] = None
    cluster_columns: Optional[List[str]] = None
    refresh_schedule: Optional[str] = None
    description: Optional[str] = None


class OptimizationStrategy(ABC):
    """Base class for platform-specific optimization strategies."""
    
    @abstractmethod
    def create_materialized_structure(self, config: OptimizationConfig) -> str:
        """Create optimized structure (MV, table, etc)."""
        pass
    
    @abstractmethod
    def drop_materialized_structure(self, name: str) -> str:
        """Drop the optimized structure."""
        pass
    
    @abstractmethod
    def refresh_materialized_structure(self, name: str) -> str:
        """Refresh the optimized structure."""
        pass
    
    @abstractmethod
    def optimize_table_layout(self, table: str, columns: List[str]) -> str:
        """Optimize table layout (clustering, z-ordering, etc)."""
        pass
    
    @abstractmethod
    def suggest_partitioning(self, table: str, query_patterns: List[str]) -> Dict:
        """Suggest partitioning strategy based on query patterns."""
        pass
    
    @abstractmethod
    def estimate_optimization_cost(self, config: OptimizationConfig) -> Dict:
        """Estimate cost of maintaining the optimization."""
        pass
    
    @abstractmethod
    def get_platform_capabilities(self) -> Dict:
        """Return platform-specific capabilities."""
        pass
    
    def _extract_date_filters(self, query_patterns: List[str]) -> List[str]:
        """Extract date column filters from query patterns."""
        import re
        date_columns = set()
        
        for query in query_patterns:
            # Look for date comparisons
            date_pattern = r'(\w+)\s*(?:=|>|<|>=|<=)\s*(?:DATE|TIMESTAMP|CURRENT_DATE)'
            matches = re.findall(date_pattern, query, re.IGNORECASE)
            date_columns.update(matches)
            
            # Look for date functions
            func_pattern = r'(?:DATE|EXTRACT|DATE_TRUNC)\s*\([^)]*(\w+)[^)]*\)'
            matches = re.findall(func_pattern, query, re.IGNORECASE)
            date_columns.update(matches)
        
        return list(date_columns)
    
    def _analyze_filter_patterns(self, query_patterns: List[str]) -> List[str]:
        """Analyze query patterns to find frequently filtered columns."""
        import re
        from collections import Counter
        
        filter_columns = []
        
        for query in query_patterns:
            # Extract WHERE clause conditions
            where_pattern = r'WHERE\s+(.*?)(?:GROUP BY|ORDER BY|LIMIT|$)'
            where_match = re.search(where_pattern, query, re.IGNORECASE | re.DOTALL)
            
            if where_match:
                where_clause = where_match.group(1)
                # Extract column names from conditions
                col_pattern = r'(\w+)\s*(?:=|>|<|>=|<=|IN|LIKE|BETWEEN)'
                columns = re.findall(col_pattern, where_clause, re.IGNORECASE)
                filter_columns.extend(columns)
        
        # Return most frequent columns
        column_counts = Counter(filter_columns)
        return [col for col, _ in column_counts.most_common(5)]