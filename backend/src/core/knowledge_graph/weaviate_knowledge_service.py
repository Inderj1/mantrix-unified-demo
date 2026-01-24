"""
Weaviate-based Knowledge Service.

Provides semantic search over knowledge graph data stored in Weaviate.
This replaces SPARQL queries with fast vector similarity search.

Usage:
    service = WeaviateKnowledgeService()

    # Find metric by natural language
    metric = service.find_metric("What is ROIC?")
    # Returns: {metric_code: "ROIC", formula: "NOPAT / Invested Capital", ...}

    # Resolve synonyms
    canonical = service.resolve_term("ytd")
    # Returns: "year_to_date"

    # Get column display type
    col_type = service.get_column_type("total_revenue")
    # Returns: {display_type: "currency", format_template: "$#,##0.00"}
"""

from typing import Dict, List, Any, Optional, Tuple
import structlog
import weaviate
import weaviate.classes as wvc
from dataclasses import dataclass
import re

from src.config import settings

logger = structlog.get_logger()


@dataclass
class MetricMatch:
    """Result of metric search."""
    metric_code: str
    metric_name: str
    description: str
    formula: str
    formula_sql: str
    synonyms: List[str]
    components: List[str]
    is_percentage: bool
    is_currency: bool
    category: str
    confidence: float  # 1 - distance


@dataclass
class TermMatch:
    """Result of term/synonym search."""
    term: str
    canonical_term: str
    category: str
    related_metrics: List[str]
    description: str
    confidence: float


@dataclass
class ColumnTypeMatch:
    """Result of column type search."""
    column_pattern: str
    display_type: str
    format_template: str
    confidence: float


class WeaviateKnowledgeService:
    """Knowledge service using Weaviate for semantic search."""

    def __init__(self, embedding_service=None):
        """Initialize Weaviate knowledge service.

        Args:
            embedding_service: Optional EmbeddingService instance.
                              If not provided, one will be created.
        """
        self.client = self._init_client()
        self._embedding_service = embedding_service
        self._collections_verified = False

    def _init_client(self) -> Optional[weaviate.WeaviateClient]:
        """Initialize Weaviate client."""
        try:
            url = settings.weaviate_url.replace("http://", "").replace("https://", "")
            if ":" in url:
                host, port_str = url.split(":", 1)
                port = int(port_str)
            else:
                host = url
                port = 8080

            client = weaviate.connect_to_local(
                host=host,
                port=port,
                grpc_port=50051,
                skip_init_checks=True
            )
            logger.info("WeaviateKnowledgeService connected")
            return client
        except Exception as e:
            logger.warning(f"Could not connect to Weaviate: {e}")
            return None

    @property
    def embedding_service(self):
        """Lazy-load embedding service."""
        if self._embedding_service is None:
            from src.core.embeddings import EmbeddingService
            self._embedding_service = EmbeddingService()
        return self._embedding_service

    def _verify_collections(self) -> bool:
        """Verify required collections exist."""
        if self._collections_verified:
            return True

        if not self.client:
            return False

        required = ["FinancialMetrics", "BusinessTerms", "ColumnTypes"]
        try:
            for name in required:
                if not self.client.collections.exists(name):
                    logger.warning(f"Collection {name} not found. Run load_knowledge_graph_to_weaviate.py first.")
                    return False
            self._collections_verified = True
            return True
        except Exception as e:
            logger.error(f"Error verifying collections: {e}")
            return False

    def find_metric(self, query: str, limit: int = 3) -> Optional[MetricMatch]:
        """Find the best matching metric for a natural language query.

        Args:
            query: Natural language query like "What is ROIC?" or "gross margin"
            limit: Number of candidates to consider

        Returns:
            Best matching MetricMatch or None if no good match found
        """
        if not self._verify_collections():
            return self._fallback_metric_lookup(query)

        try:
            embedding = self.embedding_service.generate_embedding(query)
            collection = self.client.collections.get("FinancialMetrics")

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=limit,
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            if not response.objects:
                return None

            # Get best match
            best = response.objects[0]
            props = best.properties
            distance = best.metadata.distance if best.metadata else 0.5

            # Only return if confidence is reasonable (distance < 0.5)
            if distance > 0.5:
                return None

            return MetricMatch(
                metric_code=props["metric_code"],
                metric_name=props["metric_name"],
                description=props["description"],
                formula=props["formula"],
                formula_sql=props["formula_sql"],
                synonyms=props.get("synonyms", []),
                components=props.get("components", []),
                is_percentage=props.get("is_percentage", False),
                is_currency=props.get("is_currency", True),
                category=props.get("category", "financial"),
                confidence=1 - distance
            )

        except Exception as e:
            logger.error(f"Error finding metric: {e}")
            return self._fallback_metric_lookup(query)

    def find_metrics(self, query: str, limit: int = 5) -> List[MetricMatch]:
        """Find multiple matching metrics for a query.

        Useful when query might relate to multiple metrics.
        """
        if not self._verify_collections():
            return []

        try:
            embedding = self.embedding_service.generate_embedding(query)
            collection = self.client.collections.get("FinancialMetrics")

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=limit,
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            results = []
            for item in response.objects:
                props = item.properties
                distance = item.metadata.distance if item.metadata else 0.5

                if distance < 0.6:  # Only include reasonable matches
                    results.append(MetricMatch(
                        metric_code=props["metric_code"],
                        metric_name=props["metric_name"],
                        description=props["description"],
                        formula=props["formula"],
                        formula_sql=props["formula_sql"],
                        synonyms=props.get("synonyms", []),
                        components=props.get("components", []),
                        is_percentage=props.get("is_percentage", False),
                        is_currency=props.get("is_currency", True),
                        category=props.get("category", "financial"),
                        confidence=1 - distance
                    ))

            return results

        except Exception as e:
            logger.error(f"Error finding metrics: {e}")
            return []

    def resolve_term(self, term: str) -> Optional[str]:
        """Resolve a term to its canonical form.

        Args:
            term: Term like "ytd", "client", "vs last year"

        Returns:
            Canonical term like "year_to_date", "customer", "year_over_year"
        """
        if not self._verify_collections():
            return self._fallback_term_lookup(term)

        try:
            embedding = self.embedding_service.generate_embedding(term)
            collection = self.client.collections.get("BusinessTerms")

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=1,
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            if not response.objects:
                return None

            best = response.objects[0]
            distance = best.metadata.distance if best.metadata else 0.5

            if distance < 0.3:  # High confidence threshold for term resolution
                return best.properties["canonical_term"]

            return None

        except Exception as e:
            logger.error(f"Error resolving term: {e}")
            return self._fallback_term_lookup(term)

    def get_related_metrics(self, term: str) -> List[str]:
        """Get metrics related to a business term."""
        if not self._verify_collections():
            return []

        try:
            embedding = self.embedding_service.generate_embedding(term)
            collection = self.client.collections.get("BusinessTerms")

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=1,
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            if response.objects:
                return response.objects[0].properties.get("related_metrics", [])

            return []

        except Exception as e:
            logger.error(f"Error getting related metrics: {e}")
            return []

    def get_column_type(self, column_name: str) -> Optional[ColumnTypeMatch]:
        """Determine display type for a column based on its name.

        Args:
            column_name: Column name like "total_revenue", "margin_pct"

        Returns:
            ColumnTypeMatch with display_type and format_template
        """
        # First try pattern matching (fast)
        col_lower = column_name.lower()

        # Direct pattern checks
        if any(p in col_lower for p in ['pct', 'percent', '%', 'ratio', 'rate', 'roi', 'roa', 'roe', 'roic']):
            return ColumnTypeMatch(
                column_pattern="percentage",
                display_type="percentage",
                format_template="#.##%",
                confidence=1.0
            )

        if any(p in col_lower for p in ['revenue', 'sales', 'amount', 'total', 'cost', 'margin', 'profit', 'price', 'fee', 'income', 'expense']):
            return ColumnTypeMatch(
                column_pattern="currency",
                display_type="currency",
                format_template="$#,##0.00",
                confidence=1.0
            )

        if any(p in col_lower for p in ['quantity', 'qty', 'count', 'units', 'volume']):
            return ColumnTypeMatch(
                column_pattern="integer",
                display_type="integer",
                format_template="#,##0",
                confidence=1.0
            )

        if any(p in col_lower for p in ['date', 'time', 'created', 'updated', 'period']):
            return ColumnTypeMatch(
                column_pattern="date",
                display_type="date",
                format_template="YYYY-MM-DD",
                confidence=1.0
            )

        # Fall back to Weaviate semantic search
        if self._verify_collections():
            try:
                embedding = self.embedding_service.generate_embedding(column_name)
                collection = self.client.collections.get("ColumnTypes")

                response = collection.query.near_vector(
                    near_vector=embedding,
                    limit=1,
                    return_metadata=wvc.query.MetadataQuery(distance=True)
                )

                if response.objects:
                    best = response.objects[0]
                    distance = best.metadata.distance if best.metadata else 0.5

                    if distance < 0.4:
                        return ColumnTypeMatch(
                            column_pattern=best.properties["column_pattern"],
                            display_type=best.properties["display_type"],
                            format_template=best.properties["format_template"],
                            confidence=1 - distance
                        )

            except Exception as e:
                logger.error(f"Error getting column type: {e}")

        return None

    def get_column_types_batch(self, column_names: List[str]) -> Dict[str, ColumnTypeMatch]:
        """Get display types for multiple columns."""
        return {col: match for col in column_names if (match := self.get_column_type(col)) is not None}

    def get_similar_sql_examples(self, query: str, limit: int = 3, dialect: str = "bigquery") -> List[Dict[str, Any]]:
        """Find SQL examples similar to the user query for few-shot prompting.

        Args:
            query: Natural language query from user
            limit: Number of examples to return
            dialect: SQL dialect filter (bigquery, postgresql)

        Returns:
            List of similar SQL examples with question, sql, explanation
        """
        if not self.client:
            return self._fallback_sql_examples(query)

        try:
            # Check if SQLExamples collection exists
            if not self.client.collections.exists("SQLExamples"):
                logger.warning("SQLExamples collection not found. Run load_knowledge_graph_to_weaviate.py")
                return self._fallback_sql_examples(query)

            embedding = self.embedding_service.generate_embedding(query)
            collection = self.client.collections.get("SQLExamples")

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=limit * 2,  # Get more, then filter by dialect
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            results = []
            for item in response.objects:
                props = item.properties
                distance = item.metadata.distance if item.metadata else 0.5

                # Filter by dialect and confidence
                if props.get("dialect", "bigquery") == dialect and distance < 0.6:
                    results.append({
                        "question": props["question"],
                        "sql": props["sql"],
                        "explanation": props.get("explanation", ""),
                        "category": props.get("category", ""),
                        "complexity": props.get("complexity", "medium"),
                        "confidence": 1 - distance
                    })

                    if len(results) >= limit:
                        break

            logger.info(f"Found {len(results)} similar SQL examples for query")
            return results

        except Exception as e:
            logger.error(f"Error getting SQL examples: {e}")
            return self._fallback_sql_examples(query)

    def _fallback_sql_examples(self, query: str) -> List[Dict[str, Any]]:
        """Fallback SQL examples when Weaviate is not available."""
        query_lower = query.lower()

        # Basic examples based on query keywords
        examples = []

        if any(kw in query_lower for kw in ["top", "best", "highest", "ranking"]):
            examples.append({
                "question": "What are the top 10 customers by revenue?",
                "sql": """SELECT customer_name, SUM(revenue) as total_revenue
FROM sales
GROUP BY customer_name
ORDER BY total_revenue DESC
LIMIT 10""",
                "explanation": "Aggregate and rank by total",
                "category": "ranking",
                "complexity": "low",
                "confidence": 0.7
            })

        if any(kw in query_lower for kw in ["month", "year", "quarter", "trend", "time"]):
            examples.append({
                "question": "Show me total sales by month",
                "sql": """SELECT FORMAT_DATE('%Y-%m', order_date) as month, SUM(amount) as total
FROM sales
GROUP BY month
ORDER BY month""",
                "explanation": "Aggregate by time period",
                "category": "time_series",
                "complexity": "medium",
                "confidence": 0.7
            })

        if any(kw in query_lower for kw in ["margin", "profit", "gross"]):
            examples.append({
                "question": "What is gross margin by region?",
                "sql": """SELECT region,
  SUM(revenue) - SUM(cogs) as gross_margin,
  SAFE_DIVIDE(SUM(revenue) - SUM(cogs), SUM(revenue)) * 100 as margin_pct
FROM sales
GROUP BY region""",
                "explanation": "Calculate margin as revenue minus cost",
                "category": "financial",
                "complexity": "medium",
                "confidence": 0.7
            })

        if any(kw in query_lower for kw in ["compare", "vs", "versus", "growth"]):
            examples.append({
                "question": "Compare this year vs last year",
                "sql": """WITH current AS (SELECT SUM(revenue) as rev FROM sales WHERE YEAR(date) = YEAR(CURRENT_DATE())),
     previous AS (SELECT SUM(revenue) as rev FROM sales WHERE YEAR(date) = YEAR(CURRENT_DATE()) - 1)
SELECT current.rev, previous.rev, (current.rev - previous.rev) / previous.rev * 100 as growth
FROM current, previous""",
                "explanation": "Compare two periods using CTEs",
                "category": "comparison",
                "complexity": "high",
                "confidence": 0.7
            })

        # If no specific match, return a general example
        if not examples:
            examples.append({
                "question": "Show me total sales",
                "sql": "SELECT SUM(revenue) as total_revenue FROM sales",
                "explanation": "Simple aggregation",
                "category": "aggregation",
                "complexity": "low",
                "confidence": 0.5
            })

        return examples[:3]

    def _fallback_metric_lookup(self, query: str) -> Optional[MetricMatch]:
        """Fallback metric lookup using keyword matching."""
        query_lower = query.lower()

        # Comprehensive metric mapping with SQL formulas
        # Format: keyword -> (code, name, formula_text, formula_sql, is_available, components)
        keyword_metrics = {
            # === AVAILABLE METRICS (can be calculated from dataset_25m_table) ===
            "gross margin": (
                "GROSS_MARGIN",
                "Gross Margin",
                "(Gross_Revenue - Cogs) / Gross_Revenue * 100",
                "ROUND((SUM(Gross_Revenue) - SUM(Cogs)) / NULLIF(SUM(Gross_Revenue), 0) * 100, 2) AS gross_margin_pct",
                True,
                ["Gross_Revenue", "Cogs"]
            ),
            "gross margin %": (
                "GROSS_MARGIN_PCT",
                "Gross Margin %",
                "(Gross_Revenue - Cogs) / Gross_Revenue * 100",
                "ROUND((SUM(Gross_Revenue) - SUM(Cogs)) / NULLIF(SUM(Gross_Revenue), 0) * 100, 2) AS gross_margin_pct",
                True,
                ["Gross_Revenue", "Cogs"]
            ),
            "gross profit": (
                "GROSS_PROFIT",
                "Gross Profit",
                "Gross_Revenue - Cogs",
                "SUM(Gross_Revenue) - SUM(Cogs) AS gross_profit",
                True,
                ["Gross_Revenue", "Cogs"]
            ),
            "revenue": (
                "REVENUE",
                "Revenue",
                "Sum of Gross_Revenue",
                "SUM(Gross_Revenue) AS total_revenue",
                True,
                ["Gross_Revenue"]
            ),
            "total revenue": (
                "TOTAL_REVENUE",
                "Total Revenue",
                "Sum of Gross_Revenue",
                "SUM(Gross_Revenue) AS total_revenue",
                True,
                ["Gross_Revenue"]
            ),
            "net sales": (
                "NET_SALES",
                "Net Sales",
                "Sum of Net_Sales",
                "SUM(Net_Sales) AS net_sales",
                True,
                ["Net_Sales"]
            ),
            "cogs": (
                "COGS",
                "Cost of Goods Sold",
                "Sum of Cogs or Total_COGS",
                "SUM(Cogs) AS total_cogs",
                True,
                ["Cogs", "Total_COGS"]
            ),
            "cost of goods sold": (
                "COGS",
                "Cost of Goods Sold",
                "Sum of Cogs",
                "SUM(Cogs) AS total_cogs",
                True,
                ["Cogs"]
            ),
            "operating income": (
                "OPERATING_INCOME",
                "Operating Income / EBIT",
                "Net_Sales - Total_COGS",
                "SUM(Net_Sales) - SUM(Total_COGS) AS operating_income",
                True,
                ["Net_Sales", "Total_COGS"]
            ),
            "ebit": (
                "EBIT",
                "Earnings Before Interest & Tax",
                "Net_Sales - Total_COGS",
                "SUM(Net_Sales) - SUM(Total_COGS) AS ebit",
                True,
                ["Net_Sales", "Total_COGS"]
            ),
            "net margin": (
                "NET_MARGIN",
                "Net Margin %",
                "Sales_Margin_of_Net_Sales / Net_Sales * 100",
                "ROUND(SUM(Sales_Margin_of_Net_Sales) / NULLIF(SUM(Net_Sales), 0) * 100, 2) AS net_margin_pct",
                True,
                ["Sales_Margin_of_Net_Sales", "Net_Sales"]
            ),
            "net margin %": (
                "NET_MARGIN_PCT",
                "Net Margin %",
                "Sales_Margin_of_Net_Sales / Net_Sales * 100",
                "ROUND(SUM(Sales_Margin_of_Net_Sales) / NULLIF(SUM(Net_Sales), 0) * 100, 2) AS net_margin_pct",
                True,
                ["Sales_Margin_of_Net_Sales", "Net_Sales"]
            ),
            "contribution margin": (
                "CONTRIBUTION_MARGIN",
                "Contribution Margin",
                "Net_Sales - Variable Costs (Ingredients + Packaging + Incoming_Freight)",
                "SUM(Net_Sales) - SUM(Ingredients) - SUM(Packaging) - SUM(Incoming_Freight) AS contribution_margin",
                True,
                ["Net_Sales", "Ingredients", "Packaging", "Incoming_Freight"]
            ),
            "profit per unit": (
                "PROFIT_PER_UNIT",
                "Profit per Unit",
                "Sales_Margin_of_Net_Sales / Inv_Quantity",
                "ROUND(SUM(Sales_Margin_of_Net_Sales) / NULLIF(SUM(Inv_Quantity), 0), 2) AS profit_per_unit",
                True,
                ["Sales_Margin_of_Net_Sales", "Inv_Quantity"]
            ),
            "revenue per customer": (
                "REVENUE_PER_CUSTOMER",
                "Revenue per Customer",
                "SUM(Gross_Revenue) / COUNT(DISTINCT Customer)",
                "ROUND(SUM(Gross_Revenue) / NULLIF(COUNT(DISTINCT Sold_to_Name), 0), 2) AS revenue_per_customer",
                True,
                ["Gross_Revenue", "Sold_to_Name"]
            ),
            "average order value": (
                "AVG_ORDER_VALUE",
                "Average Order Value",
                "SUM(Net_Sales) / COUNT(DISTINCT Order_ID)",
                "ROUND(SUM(Net_Sales) / NULLIF(COUNT(DISTINCT Sales_Order), 0), 2) AS avg_order_value",
                True,
                ["Net_Sales", "Sales_Order"]
            ),
            "quantity": (
                "QUANTITY",
                "Total Quantity",
                "Sum of Inv_Quantity",
                "SUM(Inv_Quantity) AS total_quantity",
                True,
                ["Inv_Quantity"]
            ),
            "units sold": (
                "UNITS_SOLD",
                "Units Sold",
                "Sum of Inv_Quantity",
                "SUM(Inv_Quantity) AS units_sold",
                True,
                ["Inv_Quantity"]
            ),
            "average price": (
                "AVG_PRICE",
                "Average Price",
                "Net_Sales / Inv_Quantity",
                "ROUND(SUM(Net_Sales) / NULLIF(SUM(Inv_Quantity), 0), 2) AS avg_price",
                True,
                ["Net_Sales", "Inv_Quantity"]
            ),

            # === UNAVAILABLE METRICS (require balance sheet data not in dataset) ===
            "roi": (
                "ROI",
                "Return on Investment",
                "Net Profit / Investment - REQUIRES BALANCE SHEET DATA",
                "-- ROI cannot be calculated: requires Net Profit and Investment/Capital data from balance sheet. Alternative: Use Gross Margin % which shows (Revenue - COGS) / Revenue",
                False,
                ["Net_Profit", "Investment", "Capital"]
            ),
            "return on investment": (
                "ROI",
                "Return on Investment",
                "Net Profit / Investment - REQUIRES BALANCE SHEET DATA",
                "-- ROI cannot be calculated: requires balance sheet data. Alternative: Use Gross Margin % or Contribution Margin %",
                False,
                ["Net_Profit", "Investment", "Capital"]
            ),
            "roic": (
                "ROIC",
                "Return on Invested Capital",
                "NOPAT / Invested Capital - REQUIRES BALANCE SHEET DATA",
                "-- ROIC cannot be calculated: requires Net Operating Profit After Tax (NOPAT) and Invested Capital from balance sheet",
                False,
                ["NOPAT", "Invested_Capital"]
            ),
            "return on invested capital": (
                "ROIC",
                "Return on Invested Capital",
                "NOPAT / Invested Capital - REQUIRES BALANCE SHEET DATA",
                "-- ROIC cannot be calculated: requires balance sheet data. Alternative: Use Gross Margin % or Net Margin %",
                False,
                ["NOPAT", "Invested_Capital"]
            ),
            "roce": (
                "ROCE",
                "Return on Capital Employed",
                "Operating Income / Capital Employed - REQUIRES BALANCE SHEET DATA",
                "-- ROCE cannot be calculated: requires Total Assets and Current Liabilities from balance sheet. Alternative: Use Operating Margin %",
                False,
                ["Operating_Income", "Total_Assets", "Current_Liabilities"]
            ),
            "roa": (
                "ROA",
                "Return on Assets",
                "Net Income / Total Assets - REQUIRES BALANCE SHEET DATA",
                "-- ROA cannot be calculated: requires Net Income and Total Assets from balance sheet",
                False,
                ["Net_Income", "Total_Assets"]
            ),
            "return on assets": (
                "ROA",
                "Return on Assets",
                "Net Income / Total Assets - REQUIRES BALANCE SHEET DATA",
                "-- ROA cannot be calculated: requires balance sheet data. Alternative: Use Operating Income or Gross Profit",
                False,
                ["Net_Income", "Total_Assets"]
            ),
            "roe": (
                "ROE",
                "Return on Equity",
                "Net Income / Shareholders Equity - REQUIRES BALANCE SHEET DATA",
                "-- ROE cannot be calculated: requires Net Income and Shareholders Equity from balance sheet",
                False,
                ["Net_Income", "Shareholders_Equity"]
            ),
            "return on equity": (
                "ROE",
                "Return on Equity",
                "Net Income / Shareholders Equity - REQUIRES BALANCE SHEET DATA",
                "-- ROE cannot be calculated: requires balance sheet data. Alternative: Use Net Margin %",
                False,
                ["Net_Income", "Shareholders_Equity"]
            ),
            "ebitda": (
                "EBITDA",
                "EBITDA",
                "Operating Income + Depreciation & Amortization - REQUIRES D&A DATA",
                "-- EBITDA cannot be calculated: requires Depreciation & Amortization data. Alternative: Use Operating Income (EBIT)",
                False,
                ["Operating_Income", "Depreciation", "Amortization"]
            ),
            "net income": (
                "NET_INCOME",
                "Net Income",
                "Revenue - All Expenses (including taxes, interest) - REQUIRES FULL P&L",
                "-- Net Income requires full P&L including taxes and interest. Alternative: Use Sales_Margin_of_Net_Sales",
                False,
                ["All_Revenue", "All_Expenses", "Taxes", "Interest"]
            ),
        }

        for keyword, metric_data in keyword_metrics.items():
            if keyword in query_lower:
                code, name, formula, formula_sql, is_available, components = metric_data

                description = f"{name} metric"
                if not is_available:
                    description = f"{name} - NOT AVAILABLE in current dataset (requires balance sheet/P&L data)"

                return MetricMatch(
                    metric_code=code,
                    metric_name=name,
                    description=description,
                    formula=formula,
                    formula_sql=formula_sql if is_available else "",
                    synonyms=[],
                    components=components,
                    is_percentage="%" in name or "margin" in name.lower() or "return" in name.lower(),
                    is_currency=not ("%" in name or "margin" in name.lower() or "return" in name.lower() or "quantity" in name.lower() or "units" in name.lower()),
                    category="financial",
                    confidence=0.9 if is_available else 0.5
                )

        return None

    def _fallback_term_lookup(self, term: str) -> Optional[str]:
        """Fallback term resolution using keyword matching."""
        term_lower = term.lower()

        term_map = {
            "ytd": "year_to_date",
            "year to date": "year_to_date",
            "mtd": "month_to_date",
            "month to date": "month_to_date",
            "yoy": "year_over_year",
            "year over year": "year_over_year",
            "vs last year": "year_over_year",
            "mom": "month_over_month",
            "month over month": "month_over_month",
            "client": "customer",
            "buyer": "customer",
            "territory": "region",
            "sku": "product",
            "item": "product",
        }

        return term_map.get(term_lower)

    def close(self):
        """Close Weaviate connection."""
        if self.client:
            self.client.close()


# Singleton instance
_service_instance: Optional[WeaviateKnowledgeService] = None


def get_knowledge_service() -> WeaviateKnowledgeService:
    """Get singleton instance of WeaviateKnowledgeService."""
    global _service_instance
    if _service_instance is None:
        _service_instance = WeaviateKnowledgeService()
    return _service_instance
