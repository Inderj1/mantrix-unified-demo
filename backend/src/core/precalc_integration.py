"""Integration layer for using pre-calculated metrics in SQL generation."""

from typing import Dict, List, Optional, Tuple, Any, Set
from datetime import datetime, timedelta
from enum import Enum
import re
import json
import structlog
from pydantic import BaseModel, Field

from src.core.financial_hierarchy import financial_hierarchy, HierarchyLevel
from src.core.metrics_precalculation import (
    FinancialMetricsPreCalculator, TimeGranularity, MetricCalculation
)
from src.core.financial_semantic_parser import FinancialSemanticParser, FinancialMetric as QueryContext

logger = structlog.get_logger()


class MatchType(Enum):
    """Types of pre-calculation matches."""
    EXACT = "exact"  # Exact match - can return directly
    AGGREGATABLE = "aggregatable"  # Can aggregate multiple values
    PARTIAL = "partial"  # Can use some pre-calc with additional SQL
    NONE = "none"  # No match


class PreCalcMatch(BaseModel):
    """Represents a match with pre-calculated data."""
    match_type: MatchType
    metric_code: str
    metric_name: str
    available_calculations: List[Dict[str, Any]]
    suggested_aggregation: Optional[str] = None
    confidence: float = 0.0
    reason: str = ""


class PreCalcRegistry:
    """Registry of available pre-calculated metrics."""
    
    def __init__(self, precalculator: FinancialMetricsPreCalculator):
        self.precalculator = precalculator
        self.available_metrics: Dict[str, List[Dict[str, Any]]] = {}
        self._refresh_registry()
    
    def _refresh_registry(self):
        """Refresh the registry of available calculations."""
        self.available_metrics.clear()
        
        # Get all available calculations
        available = self.precalculator.get_available_calculations()
        
        # Group by metric code
        for calc in available:
            metric_code = calc.get("metric_code", "")
            if metric_code not in self.available_metrics:
                self.available_metrics[metric_code] = []
            self.available_metrics[metric_code].append(calc)
        
        logger.info(f"Registry refreshed with {len(available)} calculations")
    
    def find_matches(
        self,
        metric_code: str,
        time_period: Optional[str] = None,
        granularity: Optional[TimeGranularity] = None,
        dimensions: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """Find matching pre-calculated values."""
        matches = []
        
        metric_calcs = self.available_metrics.get(metric_code, [])
        
        for calc in metric_calcs:
            # Check time period match
            if time_period and calc.get("time_period") != time_period:
                continue
            
            # Check granularity match
            if granularity and calc.get("granularity") != granularity.value:
                continue
            
            # Check dimensions match
            calc_dims = calc.get("dimensions", {})
            if dimensions:
                if dimensions != calc_dims:
                    continue
            elif calc_dims:  # Query wants overall but calc has dimensions
                continue
            
            matches.append(calc)
        
        return matches
    
    def find_aggregatable_matches(
        self,
        metric_code: str,
        target_period: str,
        target_granularity: TimeGranularity
    ) -> List[Dict[str, Any]]:
        """Find matches that can be aggregated to target granularity."""
        matches = []
        
        # Define aggregation rules
        aggregation_rules = {
            TimeGranularity.MONTHLY: [TimeGranularity.DAILY],
            TimeGranularity.QUARTERLY: [TimeGranularity.MONTHLY, TimeGranularity.DAILY],
            TimeGranularity.YEARLY: [TimeGranularity.QUARTERLY, TimeGranularity.MONTHLY],
            TimeGranularity.YTD: [TimeGranularity.MONTHLY, TimeGranularity.DAILY],
        }
        
        source_granularities = aggregation_rules.get(target_granularity, [])
        
        for source_gran in source_granularities:
            # Find all calculations with source granularity
            source_matches = self.find_matches(
                metric_code,
                granularity=source_gran
            )
            
            # Filter by time period coverage
            for match in source_matches:
                if self._covers_period(match, target_period, target_granularity):
                    matches.append(match)
        
        return matches
    
    def _covers_period(
        self,
        calc: Dict[str, Any],
        target_period: str,
        target_granularity: TimeGranularity
    ) -> bool:
        """Check if calculation covers the target period."""
        # Simplified logic - in production would need full date parsing
        calc_period = calc.get("time_period", "")
        
        # For monthly to quarterly aggregation
        if target_granularity == TimeGranularity.QUARTERLY:
            # Extract quarter from target (e.g., "2024-Q1")
            if "Q" in target_period:
                year, quarter = target_period.split("-Q")
                quarter_months = {
                    "1": ["01", "02", "03"],
                    "2": ["04", "05", "06"],
                    "3": ["07", "08", "09"],
                    "4": ["10", "11", "12"]
                }
                months = quarter_months.get(quarter, [])
                # Check if calc period is in quarter months
                for month in months:
                    if f"{year}-{month}" in calc_period:
                        return True
        
        # For daily to monthly aggregation
        if target_granularity == TimeGranularity.MONTHLY:
            # Check if calc date is in target month
            if target_period[:7] in calc_period:
                return True
        
        return False


class QueryDecomposer:
    """Decomposes queries to identify pre-calculable parts."""
    
    def __init__(
        self,
        registry: PreCalcRegistry,
        semantic_parser: FinancialSemanticParser
    ):
        self.registry = registry
        self.semantic_parser = semantic_parser
    
    def analyze_query(self, query: str) -> Tuple[PreCalcMatch, QueryContext]:
        """Analyze query for pre-calculation opportunities."""
        # Parse query context
        parsed_data = self.semantic_parser.parse_query(query)
        
        # Ensure parsed_data is a dict
        if not isinstance(parsed_data, dict):
            logger.warning(f"Semantic parser returned invalid result: {type(parsed_data)}")
            parsed_data = {}
        
        # Create QueryContext from parsed data
        metrics = parsed_data.get("metrics", [])
        primary_metric = metrics[0] if metrics else None
        
        context = QueryContext(
            metric_name=primary_metric.metric_name if primary_metric else "",
            metric_code=primary_metric.metric_code if primary_metric else "",
            hierarchy_level=parsed_data.get("hierarchy_level", HierarchyLevel.L3_ACCOUNT),
            time_period=parsed_data.get("time_period"),
            dimensions=parsed_data.get("dimensions", []),
            filters=parsed_data.get("filters", {}),
            comparison_type=parsed_data.get("comparison")
        )
        
        # No pre-calc for non-L1 queries
        if context.hierarchy_level != HierarchyLevel.L1_METRIC:
            return PreCalcMatch(
                match_type=MatchType.NONE,
                metric_code="",
                metric_name="",
                available_calculations=[],
                reason="Only L1 metrics support pre-calculation"
            ), context
        
        # Extract time period and granularity from query
        time_info = self._extract_time_info(query, context)
        
        # Convert dimensions list to dict for registry
        dimensions_dict = {}
        if context.dimensions:
            # For now, assume first dimension is the key
            for dim in context.dimensions:
                dimensions_dict[dim] = context.filters.get(dim, "all")
        
        # Find matches
        exact_matches = self.registry.find_matches(
            context.metric_code or "",
            time_info.get("period"),
            time_info.get("granularity"),
            dimensions_dict if dimensions_dict else None
        )
        
        if exact_matches:
            return PreCalcMatch(
                match_type=MatchType.EXACT,
                metric_code=context.metric_code or "",
                metric_name=context.metric_name,
                available_calculations=exact_matches,
                confidence=1.0,
                reason="Exact pre-calculated value available"
            ), context
        
        # Check for aggregatable matches
        if time_info.get("granularity") and time_info.get("period"):
            aggregatable = self.registry.find_aggregatable_matches(
                context.metric_code or "",
                time_info["period"],
                time_info["granularity"]
            )
            
            if aggregatable:
                return PreCalcMatch(
                    match_type=MatchType.AGGREGATABLE,
                    metric_code=context.metric_code or "",
                    metric_name=context.metric_name,
                    available_calculations=aggregatable,
                    suggested_aggregation=self._suggest_aggregation(
                        aggregatable,
                        time_info["granularity"]
                    ),
                    confidence=0.9,
                    reason=f"Can aggregate {len(aggregatable)} pre-calculated values"
                ), context
        
        # Check for partial matches (e.g., have overall, need by dimension)
        partial_matches = self._find_partial_matches(context, time_info)
        if partial_matches:
            return PreCalcMatch(
                match_type=MatchType.PARTIAL,
                metric_code=context.metric_code or "",
                metric_name=context.metric_name,
                available_calculations=partial_matches,
                confidence=0.7,
                reason="Partial pre-calculated data available"
            ), context
        
        return PreCalcMatch(
            match_type=MatchType.NONE,
            metric_code=context.metric_code or "",
            metric_name=context.metric_name,
            available_calculations=[],
            reason="No matching pre-calculated data"
        ), context
    
    def _extract_time_info(
        self,
        query: str,
        context: QueryContext
    ) -> Dict[str, Any]:
        """Extract time period and granularity from query."""
        query_lower = query.lower()
        time_info = {}
        
        # Current period patterns
        current_patterns = {
            "this month": (TimeGranularity.MONTHLY, datetime.now().strftime("%Y-%m")),
            "current month": (TimeGranularity.MONTHLY, datetime.now().strftime("%Y-%m")),
            "this quarter": (TimeGranularity.QUARTERLY, self._current_quarter()),
            "current quarter": (TimeGranularity.QUARTERLY, self._current_quarter()),
            "this year": (TimeGranularity.YEARLY, str(datetime.now().year)),
            "ytd": (TimeGranularity.YTD, "YTD"),
            "year to date": (TimeGranularity.YTD, "YTD"),
            "mtd": (TimeGranularity.MTD, "MTD"),
            "month to date": (TimeGranularity.MTD, "MTD"),
        }
        
        for pattern, (gran, period) in current_patterns.items():
            if pattern in query_lower:
                time_info["granularity"] = gran
                time_info["period"] = period
                return time_info
        
        # Specific month patterns (e.g., "January 2024", "Jan 2024")
        month_pattern = r"(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})"
        month_match = re.search(month_pattern, query_lower)
        if month_match:
            month_map = {
                "january": "01", "jan": "01",
                "february": "02", "feb": "02",
                "march": "03", "mar": "03",
                "april": "04", "apr": "04",
                "may": "05",
                "june": "06", "jun": "06",
                "july": "07", "jul": "07",
                "august": "08", "aug": "08",
                "september": "09", "sep": "09",
                "october": "10", "oct": "10",
                "november": "11", "nov": "11",
                "december": "12", "dec": "12"
            }
            month = month_map.get(month_match.group(1))
            year = month_match.group(2)
            time_info["granularity"] = TimeGranularity.MONTHLY
            time_info["period"] = f"{year}-{month}"
            return time_info
        
        # Quarter patterns (e.g., "Q1 2024")
        quarter_pattern = r"q(\d)\s+(\d{4})"
        quarter_match = re.search(quarter_pattern, query_lower)
        if quarter_match:
            time_info["granularity"] = TimeGranularity.QUARTERLY
            time_info["period"] = f"{quarter_match.group(2)}-Q{quarter_match.group(1)}"
            return time_info
        
        # Default to monthly for current period if time context suggests it
        if context.time_period:
            time_info["granularity"] = TimeGranularity.MONTHLY
            time_info["period"] = datetime.now().strftime("%Y-%m")
        
        return time_info
    
    def _current_quarter(self) -> str:
        """Get current quarter string."""
        now = datetime.now()
        quarter = (now.month - 1) // 3 + 1
        return f"{now.year}-Q{quarter}"
    
    def _suggest_aggregation(
        self,
        calculations: List[Dict[str, Any]],
        target_granularity: TimeGranularity
    ) -> str:
        """Suggest aggregation method."""
        # For financial metrics, usually SUM
        return "SUM"
    
    def _find_partial_matches(
        self,
        context: QueryContext,
        time_info: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Find partial matches that could be used with additional filtering."""
        matches = []
        
        # If query wants dimension breakdown but we have overall
        if context.dimensions:
            overall_matches = self.registry.find_matches(
                context.metric_code or "",
                time_info.get("period"),
                time_info.get("granularity"),
                {}  # No dimensions
            )
            matches.extend(overall_matches)
        
        # If query wants specific time but we have broader period
        if time_info.get("granularity") == TimeGranularity.DAILY:
            monthly_matches = self.registry.find_matches(
                context.metric_code or "",
                time_info.get("period", "")[:7],  # Year-month
                TimeGranularity.MONTHLY
            )
            matches.extend(monthly_matches)
        
        return matches


class PreCalcIntegrator:
    """Integrates pre-calculated values into SQL generation."""
    
    def __init__(
        self,
        decomposer: QueryDecomposer,
        precalculator: FinancialMetricsPreCalculator
    ):
        self.decomposer = decomposer
        self.precalculator = precalculator
    
    def check_and_use_precalc(
        self,
        query: str
    ) -> Optional[Dict[str, Any]]:
        """Check if query can use pre-calculated values and return result."""
        match, context = self.decomposer.analyze_query(query)
        
        if match.match_type == MatchType.EXACT:
            # Return pre-calculated value directly
            return self._handle_exact_match(match, context)
        
        elif match.match_type == MatchType.AGGREGATABLE:
            # Generate SQL to aggregate pre-calculated values
            return self._handle_aggregatable_match(match, context)
        
        elif match.match_type == MatchType.PARTIAL:
            # Generate hybrid SQL
            return self._handle_partial_match(match, context, query)
        
        return None
    
    def _handle_exact_match(
        self,
        match: PreCalcMatch,
        context: QueryContext
    ) -> Dict[str, Any]:
        """Handle exact match - return pre-calculated value."""
        calc = match.available_calculations[0]
        
        # Get full cached data
        cached_data = self.precalculator.get_precalculated_metric(
            match.metric_code,
            TimeGranularity(calc["granularity"]),
            calc["time_period"],
            calc.get("dimensions", {})
        )
        
        if cached_data:
            return {
                "sql": f"-- Pre-calculated value for {match.metric_name}",
                "execution": {
                    "results": [{
                        match.metric_name.lower().replace(" ", "_"): cached_data["value"],
                        "time_period": cached_data["time_period"],
                        "calculated_at": cached_data["calculated_at"]
                    }],
                    "row_count": 1,
                    "execution_time_ms": 0,
                    "bytes_processed": 0,
                    "from_precalc": True
                },
                "explanation": f"Retrieved pre-calculated {match.metric_name} value",
                "from_cache": True,
                "pre_calc_used": True,
                "confidence_score": 1.0
            }
        
        return None
    
    def _handle_aggregatable_match(
        self,
        match: PreCalcMatch,
        context: QueryContext
    ) -> Dict[str, Any]:
        """Handle aggregatable match - generate SQL with CTEs."""
        # Collect all values
        values = []
        for calc in match.available_calculations:
            cached_data = self.precalculator.get_precalculated_metric(
                match.metric_code,
                TimeGranularity(calc["granularity"]),
                calc["time_period"],
                calc.get("dimensions", {})
            )
            if cached_data:
                values.append({
                    "period": calc["time_period"],
                    "value": cached_data["value"]
                })
        
        if not values:
            return None
        
        # Generate SQL with pre-calculated values
        cte_values = []
        for val in values:
            cte_values.append(f"SELECT '{val['period']}' as period, {val['value']} as value")
        
        sql = f"""
WITH precalculated_data AS (
    {' UNION ALL '.join(cte_values)}
)
SELECT 
    {match.suggested_aggregation or 'SUM'}(value) as {match.metric_name.lower().replace(' ', '_')},
    COUNT(*) as periods_aggregated
FROM precalculated_data
        """.strip()
        
        return {
            "sql": sql,
            "explanation": f"Aggregating {len(values)} pre-calculated {match.metric_name} values",
            "tables_used": ["pre_calculated_metrics"],
            "from_cache": True,
            "pre_calc_used": True,
            "pre_calc_details": {
                "match_type": match.match_type.value,
                "values_used": len(values),
                "confidence": match.confidence
            }
        }
    
    def _handle_partial_match(
        self,
        match: PreCalcMatch,
        context: QueryContext,
        original_query: str
    ) -> Dict[str, Any]:
        """Handle partial match - generate hybrid SQL."""
        # This would generate SQL that uses pre-calculated values
        # where possible and calculates the rest
        
        # For now, return None to fall back to regular SQL generation
        # In a full implementation, this would create sophisticated hybrid queries
        return None
    
    def generate_hybrid_sql(
        self,
        base_sql: str,
        pre_calc_data: List[Dict[str, Any]]
    ) -> str:
        """Generate SQL that combines pre-calculated and real-time data."""
        # This would modify the base SQL to incorporate pre-calculated CTEs
        # Implementation would depend on specific use cases
        return base_sql