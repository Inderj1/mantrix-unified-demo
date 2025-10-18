"""Financial semantic parser for classifying and parsing financial queries."""

from typing import Dict, List, Optional, Tuple, Set, Union
from enum import Enum
import re
from datetime import datetime, date
import structlog
from pydantic import BaseModel

from src.core.financial_hierarchy import (
    HierarchyLevel, 
    financial_hierarchy,
    L1Metric,
    L2Bucket,
    GLAccount
)
from src.core.dynamic_financial_hierarchy import get_dynamic_hierarchy

logger = structlog.get_logger()


class QueryType(Enum):
    """Types of queries the system can handle."""
    FINANCIAL = "financial"  # Pure financial/GL queries
    SALES_ORDER = "sales_order"  # Sales order/operational queries
    COMBINED = "combined"  # Queries needing both financial and sales data
    GENERAL = "general"  # Other queries


class FinancialMetric(BaseModel):
    """Parsed financial metric from query."""
    metric_name: str
    metric_code: Optional[str] = None
    hierarchy_level: Optional[HierarchyLevel] = None  # Optional for non-financial queries
    time_period: Optional[Union[str, Dict[str, str]]] = None  # Can be string or dict with period info
    dimensions: List[str] = []  # e.g., ["region", "product"]
    filters: Dict[str, str] = {}  # e.g., {"region": "EMEA"}
    comparison_type: Optional[str] = None  # e.g., "vs_last_year", "mom"


class QueryIntent(Enum):
    """Types of financial query intents."""
    METRIC_CALCULATION = "metric_calculation"  # Calculate a metric
    BREAKDOWN = "breakdown"  # Break down into components
    COMPARISON = "comparison"  # Compare periods or entities
    TREND = "trend"  # Show trend over time
    DETAIL = "detail"  # Show detailed GL transactions


class FinancialSemanticParser:
    """Parse and classify financial queries."""
    
    # Keywords for each hierarchy level
    L1_KEYWORDS = {
        "margin": ["margin", "gross margin", "net margin", "profit margin", "operating margin"],
        "profit": ["profit", "income", "earnings", "bottom line"],
        "ebitda": ["ebitda", "ebit"],
        "revenue": ["revenue", "sales", "top line", "turnover"],
        "costs": ["costs", "expenses", "spending"]
    }
    
    L2_KEYWORDS = {
        "breakdown": ["breakdown", "break down", "components", "composition", "split", "by type"],
        "detail": ["detail", "detailed", "drill down", "show me all"],
        "categories": ["categories", "types", "buckets", "groups"]
    }
    
    L3_KEYWORDS = {
        "gl": ["gl", "general ledger", "account", "ledger"],
        "specific": ["specific", "exact", "particular", "individual"],
        "transactions": ["transactions", "entries", "line items", "journal"]
    }
    
    # Sales order specific keywords
    SALES_ORDER_KEYWORDS = [
        "sales order", "order status", "cockpit", "delivery", "shipment",
        "billing", "customer order", "order value", "order detail",
        "order list", "pending orders", "delivered", "shipped",
        "fulfillment", "backorder", "order pipeline", "order management",
        "delivery status", "shipping", "dispatch", "order number"
    ]
    
    # Keywords that indicate cross-domain queries
    COMBINED_QUERY_INDICATORS = [
        "delivered orders", "shipped revenue", "order margin",
        "fulfillment costs", "delivery performance", "order profitability",
        "sales order revenue", "billing amount", "order gross margin"
    ]
    
    # Time period patterns
    TIME_PATTERNS = {
        "current_month": r"(this|current)\s+month",
        "last_month": r"(last|previous|prior)\s+month",
        "current_quarter": r"(this|current)\s+quarter|Q\d\s+\d{4}",
        "last_quarter": r"(last|previous|prior)\s+quarter",
        "current_year": r"(this|current)\s+year|YTD|year[\s-]to[\s-]date",
        "last_year": r"(last|previous|prior)\s+year",
        "specific_month": r"(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}",
        "specific_quarter": r"Q[1-4]\s+\d{4}",
        "specific_year": r"(?:^|\s)20\d{2}(?:\s|$)",
        "date_range": r"(from|between)\s+.*\s+(to|and)\s+.*"
    }
    
    # Dimension keywords
    DIMENSION_KEYWORDS = {
        "region": ["region", "geography", "country", "location", "area"],
        "product": ["product", "item", "sku", "merchandise"],
        "customer": ["customer", "client", "account"],
        "department": ["department", "division", "unit", "team"],
        "project": ["project", "initiative", "program"],
        "vendor": ["vendor", "supplier", "partner"]
    }
    
    # Comparison keywords
    COMPARISON_KEYWORDS = {
        "vs_last_year": ["vs last year", "compared to last year", "yoy", "year over year"],
        "vs_last_month": ["vs last month", "compared to last month", "mom", "month over month"],
        "vs_budget": ["vs budget", "compared to budget", "actual vs budget", "variance"],
        "vs_forecast": ["vs forecast", "compared to forecast", "actual vs forecast"]
    }
    
    def __init__(self, client_id: str = "arizona_beverages"):
        self.client_id = client_id
        # Try to use dynamic hierarchy, fall back to static if not available
        try:
            self.hierarchy = get_dynamic_hierarchy(client_id)
        except Exception:
            self.hierarchy = financial_hierarchy
    
    def classify_query_type(self, query: str) -> QueryType:
        """Classify the type of query (financial, sales_order, combined, or general)."""
        query_lower = query.lower()
        
        # Check for combined query indicators first (most specific)
        if any(indicator in query_lower for indicator in self.COMBINED_QUERY_INDICATORS):
            return QueryType.COMBINED
        
        # Check for sales order keywords
        has_sales_order = any(keyword in query_lower for keyword in self.SALES_ORDER_KEYWORDS)
        
        # Check for financial keywords
        has_financial = False
        for keyword_list in (list(self.L1_KEYWORDS.values()) + 
                            list(self.L2_KEYWORDS.values()) + 
                            list(self.L3_KEYWORDS.values())):
            if any(keyword in query_lower for keyword in keyword_list):
                has_financial = True
                break
        
        # Determine query type
        if has_sales_order and has_financial:
            return QueryType.COMBINED
        elif has_sales_order:
            return QueryType.SALES_ORDER
        elif has_financial:
            return QueryType.FINANCIAL
        else:
            return QueryType.GENERAL
    
    def is_sales_order_query(self, query: str) -> bool:
        """Check if query is about sales orders rather than financial metrics."""
        query_type = self.classify_query_type(query)
        return query_type in [QueryType.SALES_ORDER, QueryType.COMBINED]
    
    def is_combined_query(self, query: str) -> bool:
        """Check if query requires both financial and sales order data."""
        return self.classify_query_type(query) == QueryType.COMBINED
    
    def identify_query_domains(self, query: str) -> List[str]:
        """Identify all business domains relevant to the query."""
        query_lower = query.lower()
        domains = []
        
        # Check for financial domain
        if self.classify_query_type(query) in [QueryType.FINANCIAL, QueryType.COMBINED]:
            domains.append("financial")
        
        # Check for sales order domain
        if self.is_sales_order_query(query):
            domains.append("sales_operations")
        
        # Check for other domain indicators
        if any(term in query_lower for term in ["inventory", "stock", "warehouse"]):
            domains.append("inventory")
        
        if any(term in query_lower for term in ["customer", "client", "account"]):
            domains.append("customer")
        
        if any(term in query_lower for term in ["product", "item", "sku", "material"]):
            domains.append("product")
        
        # Default to general if no specific domains identified
        if not domains:
            domains.append("general")
        
        return domains
    
    def parse_query(self, query: str) -> Dict[str, any]:
        """Parse a financial query and extract all components."""
        query_lower = query.lower()
        
        # Classify query type
        query_type = self.classify_query_type(query)
        
        # Identify business domains
        domains = self.identify_query_domains(query)
        
        # Classify hierarchy level (may be None for non-financial queries)
        hierarchy_level = self.classify_query_depth(query)
        
        # Extract financial metrics
        metrics = self.extract_financial_metrics(query)
        
        # Determine query intent
        intent = self.determine_query_intent(query)
        
        # Extract time period
        time_period = self.extract_time_period(query)
        
        # Extract dimensions
        dimensions = self.extract_dimensions(query)
        
        # Extract comparisons
        comparison = self.extract_comparison(query)
        
        # Extract filters
        filters = self.extract_filters(query)
        
        return {
            "original_query": query,
            "query_type": query_type,
            "domains": domains,
            "hierarchy_level": hierarchy_level,
            "metrics": metrics,
            "intent": intent,
            "time_period": time_period,
            "dimensions": dimensions,
            "comparison": comparison,
            "filters": filters,
            "gl_search_terms": self._extract_gl_search_terms(query) if hierarchy_level == HierarchyLevel.L3_ACCOUNT else None
        }
    
    def classify_query_depth(self, query: str) -> Optional[HierarchyLevel]:
        """Determine if query is L1 (metric), L2 (bucket), or L3 (GL account) level.
        Returns None for non-financial queries (e.g., sales orders)."""
        query_lower = query.lower()
        
        # First check query type - if not financial, return None
        query_type = self.classify_query_type(query)
        if query_type == QueryType.SALES_ORDER:
            # Pure sales order queries don't have financial hierarchy
            return None
        
        # For combined queries or financial queries, proceed with hierarchy classification
        # Check for L3 keywords or GL account patterns
        for keyword in self.L3_KEYWORDS["gl"]:
            if keyword in query_lower:
                return HierarchyLevel.L3_ACCOUNT
        
        # Check for specific GL account numbers (4-6 digit patterns)
        if re.search(r'\b\d{4,6}\b', query):
            return HierarchyLevel.L3_ACCOUNT
        
        # Check for very specific expense descriptions that suggest L3
        specific_terms = ["freight", "rent", "utilities", "salaries", "insurance", "supplies"]
        if any(term in query_lower for term in specific_terms) and "breakdown" not in query_lower:
            return HierarchyLevel.L3_ACCOUNT
        
        # Check for L2 breakdown keywords
        for keyword_list in self.L2_KEYWORDS.values():
            if any(keyword in query_lower for keyword in keyword_list):
                return HierarchyLevel.L2_BUCKET
        
        # Check for L1 metric keywords
        for keyword_list in self.L1_KEYWORDS.values():
            if any(keyword in query_lower for keyword in keyword_list):
                return HierarchyLevel.L1_METRIC
        
        # Default to L1 if discussing financial performance
        financial_terms = ["profit", "loss", "performance", "results", "financial"]
        if any(term in query_lower for term in financial_terms):
            return HierarchyLevel.L1_METRIC
        
        # Default to L3 for unclassified queries
        return HierarchyLevel.L3_ACCOUNT
    
    def extract_financial_metrics(self, query: str) -> List[FinancialMetric]:
        """Extract financial metrics mentioned in the query."""
        query_lower = query.lower()
        metrics = []
        
        # Check for L1 metrics
        for metric_code, metric in self.hierarchy.l1_metrics.items():
            metric_name_lower = metric.metric_name.lower()
            
            # Check exact match or keyword match
            if (metric_name_lower in query_lower or 
                metric_code.lower() in query_lower or
                any(word in query_lower for word in metric_name_lower.split())):
                
                hierarchy_level = HierarchyLevel.L1_METRIC
                
                # Check if this is a breakdown request
                if any(kw in query_lower for kw in ["breakdown", "components", "split"]):
                    hierarchy_level = HierarchyLevel.L2_BUCKET
                
                metrics.append(FinancialMetric(
                    metric_name=metric.metric_name,
                    metric_code=metric_code,
                    hierarchy_level=hierarchy_level
                ))
        
        # Check for L2 buckets if explicitly mentioned
        for bucket_code, bucket in self.hierarchy.l2_buckets.items():
            bucket_name_lower = bucket.bucket_name.lower()
            
            if (bucket_name_lower in query_lower or 
                bucket_code.lower() in query_lower):
                
                # Avoid duplicates if parent metric already added
                if not any(m.metric_code == bucket.parent_metric for m in metrics):
                    metrics.append(FinancialMetric(
                        metric_name=bucket.bucket_name,
                        metric_code=bucket_code,
                        hierarchy_level=HierarchyLevel.L2_BUCKET
                    ))
        
        # If no specific metrics found but general financial terms used
        if not metrics:
            if "revenue" in query_lower or "sales" in query_lower:
                metrics.append(FinancialMetric(
                    metric_name="Revenue",
                    hierarchy_level=HierarchyLevel.L1_METRIC
                ))
            elif "cost" in query_lower or "expense" in query_lower:
                metrics.append(FinancialMetric(
                    metric_name="Costs",
                    hierarchy_level=HierarchyLevel.L2_BUCKET
                ))
        
        return metrics
    
    def determine_query_intent(self, query: str) -> QueryIntent:
        """Determine the primary intent of the query."""
        query_lower = query.lower()
        
        # Check for comparison keywords
        for comp_type in self.COMPARISON_KEYWORDS.values():
            if any(kw in query_lower for kw in comp_type):
                return QueryIntent.COMPARISON
        
        # Check for trend keywords
        trend_keywords = ["trend", "over time", "by month", "by quarter", "monthly", "quarterly", "historical"]
        if any(kw in query_lower for kw in trend_keywords):
            return QueryIntent.TREND
        
        # Check for breakdown keywords
        if any(kw in query_lower for kw in self.L2_KEYWORDS["breakdown"]):
            return QueryIntent.BREAKDOWN
        
        # Check for detail keywords
        if any(kw in query_lower for kw in self.L2_KEYWORDS["detail"]) or self.classify_query_depth(query) == HierarchyLevel.L3_ACCOUNT:
            return QueryIntent.DETAIL
        
        # Default to metric calculation
        return QueryIntent.METRIC_CALCULATION
    
    def extract_time_period(self, query: str) -> Optional[Dict[str, str]]:
        """Extract time period from query."""
        query_lower = query.lower()
        
        for period_name, pattern in self.TIME_PATTERNS.items():
            match = re.search(pattern, query_lower, re.IGNORECASE)
            if match:
                return {
                    "period_type": period_name,
                    "period_text": match.group(0),
                    "sql_filter": self._convert_time_to_sql(period_name, match.group(0))
                }
        
        # No time period specified - return None to avoid filtering
        return None
    
    def extract_dimensions(self, query: str) -> List[str]:
        """Extract grouping dimensions from query."""
        query_lower = query.lower()
        dimensions = []
        
        # Check for "by" keyword followed by dimension
        by_pattern = r"by\s+(\w+)"
        by_matches = re.findall(by_pattern, query_lower)
        
        for match in by_matches:
            for dim_name, keywords in self.DIMENSION_KEYWORDS.items():
                if match in keywords or any(kw in match for kw in keywords):
                    dimensions.append(dim_name)
        
        # Check for dimension keywords directly
        for dim_name, keywords in self.DIMENSION_KEYWORDS.items():
            if any(kw in query_lower for kw in keywords) and dim_name not in dimensions:
                dimensions.append(dim_name)
        
        return dimensions
    
    def extract_comparison(self, query: str) -> Optional[str]:
        """Extract comparison type from query."""
        query_lower = query.lower()
        
        for comp_type, keywords in self.COMPARISON_KEYWORDS.items():
            if any(kw in query_lower for kw in keywords):
                return comp_type
        
        return None
    
    def extract_filters(self, query: str) -> Dict[str, str]:
        """Extract specific filters from query."""
        filters = {}
        query_lower = query.lower()
        
        # Extract region filters
        regions = ["north america", "emea", "apac", "europe", "asia", "americas"]
        for region in regions:
            if region in query_lower:
                filters["region"] = region.upper()
                break
        
        # Extract specific values in quotes
        quoted_values = re.findall(r'"([^"]+)"', query)
        for i, value in enumerate(quoted_values):
            # Try to determine what the quoted value represents
            preceding_text = query[:query.find(f'"{value}"')].lower()
            if "region" in preceding_text[-20:]:
                filters["region"] = value
            elif "product" in preceding_text[-20:]:
                filters["product"] = value
            elif "customer" in preceding_text[-20:]:
                filters["customer"] = value
        
        return filters
    
    def _extract_gl_search_terms(self, query: str) -> List[str]:
        """Extract GL account search terms for L3 queries."""
        query_lower = query.lower()
        search_terms = []
        
        # Extract GL account numbers
        gl_numbers = re.findall(r'\b\d{4,6}\b', query)
        search_terms.extend(gl_numbers)
        
        # Extract descriptive terms
        # Remove common words and extract meaningful terms
        stop_words = {"show", "me", "the", "all", "for", "in", "with", "and", "or", "of", "to", "from"}
        words = query_lower.split()
        
        meaningful_words = [w for w in words if w not in stop_words and len(w) > 3]
        search_terms.extend(meaningful_words[:3])  # Limit to 3 terms
        
        return search_terms
    
    def _convert_time_to_sql(self, period_type: str, period_text: str) -> str:
        """Convert time period to SQL filter."""
        current_date = datetime.now()
        
        if period_type == "current_month":
            return f"DATE_TRUNC(date, MONTH) = DATE_TRUNC(CURRENT_DATE(), MONTH)"
        elif period_type == "last_month":
            return f"DATE_TRUNC(date, MONTH) = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)"
        elif period_type == "current_quarter":
            return f"DATE_TRUNC(date, QUARTER) = DATE_TRUNC(CURRENT_DATE(), QUARTER)"
        elif period_type == "last_quarter":
            return f"DATE_TRUNC(date, QUARTER) = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 QUARTER), QUARTER)"
        elif period_type == "current_year":
            return f"EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE())"
        elif period_type == "last_year":
            return f"EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE()) - 1"
        elif period_type == "specific_year":
            year = re.search(r'20\d{2}', period_text)
            if year:
                return f"EXTRACT(YEAR FROM date) = {year.group(0)}"
        elif period_type == "specific_quarter":
            match = re.search(r'Q(\d)\s+(\d{4})', period_text)
            if match:
                quarter = match.group(1)
                year = match.group(2)
                return f"EXTRACT(QUARTER FROM date) = {quarter} AND EXTRACT(YEAR FROM date) = {year}"
        
        # Default to current month
        return f"DATE_TRUNC(date, MONTH) = DATE_TRUNC(CURRENT_DATE(), MONTH)"
    
    def generate_context_for_llm(self, parsed_query: Dict) -> Dict[str, any]:
        """Generate context for LLM based on parsed query."""
        context = {
            "query_type": parsed_query.get("query_type", QueryType.GENERAL).value if hasattr(parsed_query.get("query_type", QueryType.GENERAL), 'value') else str(parsed_query.get("query_type", "general")),
            "domains": parsed_query.get("domains", []),
            "hierarchy_level": parsed_query["hierarchy_level"].value if parsed_query.get("hierarchy_level") else None,
            "intent": parsed_query["intent"].value if parsed_query.get("intent") else None,
            "metrics": [],
            "buckets": [],
            "gl_accounts": [],
            "formulas": {},
            "time_filter": parsed_query.get("time_period", {}).get("sql_filter") if parsed_query.get("time_period") else None,
            "dimensions": parsed_query.get("dimensions", []),
            "filters": parsed_query.get("filters", {})
        }
        
        # Add relevant information based on hierarchy level (if applicable)
        if parsed_query.get("hierarchy_level") == HierarchyLevel.L1_METRIC:
            for metric in parsed_query.get("metrics", []):
                if metric.metric_code:
                    l1_metric = self.hierarchy.l1_metrics.get(metric.metric_code)
                    if l1_metric:
                        context["metrics"].append({
                            "name": l1_metric.metric_name,
                            "code": l1_metric.metric_code,
                            "formula": l1_metric.formula,
                            "sql_components": l1_metric.formula_components
                        })
                        context["formulas"][l1_metric.metric_code] = l1_metric.formula_components
        
        elif parsed_query.get("hierarchy_level") == HierarchyLevel.L2_BUCKET:
            # Get buckets for the requested metrics
            for metric in parsed_query.get("metrics", []):
                if metric.metric_code in self.hierarchy.l1_metrics:
                    l1_metric = self.hierarchy.l1_metrics[metric.metric_code]
                    for bucket_code in l1_metric.sub_buckets:
                        bucket = self.hierarchy.l2_buckets.get(bucket_code)
                        if bucket:
                            context["buckets"].append({
                                "name": bucket.bucket_name,
                                "code": bucket.bucket_code,
                                "gl_accounts": bucket.gl_accounts,
                                "gl_ranges": bucket.gl_account_ranges
                            })
        
        elif parsed_query.get("hierarchy_level") == HierarchyLevel.L3_ACCOUNT:
            # Search for GL accounts based on search terms
            if parsed_query.get("gl_search_terms"):
                for term in parsed_query["gl_search_terms"]:
                    accounts = self.hierarchy.search_gl_accounts(term)
                    for account in accounts:
                        context["gl_accounts"].append({
                            "number": account.account_number,
                            "description": account.description,
                            "type": account.account_type,
                            "parent_bucket": account.parent_bucket
                        })
        
        return context


# Create singleton instance
financial_parser = FinancialSemanticParser()