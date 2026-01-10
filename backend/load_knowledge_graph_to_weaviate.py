#!/usr/bin/env python3
"""
Load RDF Knowledge Graph (TTL files) into Weaviate Vector Database.

This flattens the RDF graph into Weaviate collections for fast semantic search,
eliminating the need for SPARQL queries at runtime.

Collections created:
- FinancialMetrics: Metric definitions with formulas
- BusinessTerms: Synonyms and business terminology
- ColumnTypes: Column name to data type mappings (currency, percentage, etc.)
- SQLExamples: Few-shot examples for SQL generation (dynamic retrieval)
"""

import os
import sys
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import structlog

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, OWL, XSD

import weaviate
import weaviate.classes as wvc
from weaviate.classes.config import Property, DataType

from src.core.embeddings import EmbeddingService
from src.config import settings

logger = structlog.get_logger()

# Namespaces
FIN = Namespace("http://example.com/finance#")
CSG = Namespace("http://mantrix.ai/ontology/csg#")


@dataclass
class FinancialMetric:
    """Financial metric definition for Weaviate."""
    metric_code: str
    metric_name: str
    description: str
    formula: str
    formula_sql: str  # SQL template
    synonyms: List[str]
    components: List[str]  # Component metric codes
    gl_accounts: List[str]
    is_percentage: bool = False
    is_currency: bool = True
    category: str = "financial"  # financial, operational, efficiency


@dataclass
class BusinessTerm:
    """Business term/synonym for Weaviate."""
    term: str
    canonical_term: str  # The primary/normalized term
    category: str  # metric, dimension, time_period, column_type
    related_metrics: List[str]
    description: str = ""


@dataclass
class ColumnTypeMapping:
    """Column name to display type mapping."""
    column_pattern: str  # regex or keyword pattern
    display_type: str  # currency, percentage, integer, date, text
    format_template: str  # e.g., "$#,##0.00" or "#.##%"
    synonyms: List[str]  # alternative names that mean the same


@dataclass
class SQLExample:
    """Few-shot SQL example for dynamic retrieval."""
    example_id: str
    question: str  # Natural language question
    sql: str  # The SQL query
    explanation: str  # Why this SQL answers the question
    category: str  # aggregation, time_series, joins, filtering, ranking, etc.
    tables_used: List[str]
    complexity: str  # low, medium, high
    dialect: str = "bigquery"  # bigquery, postgresql
    tags: List[str] = None  # Additional tags for filtering


class KnowledgeGraphWeaviateLoader:
    """Load RDF knowledge graph into Weaviate for semantic search."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.weaviate_client = self._init_weaviate()
        self.rdf_graph = Graph()

        # Bind namespaces
        self.rdf_graph.bind("fin", FIN)
        self.rdf_graph.bind("csg", CSG)

        # Statistics
        self.stats = {
            "metrics_loaded": 0,
            "terms_loaded": 0,
            "column_types_loaded": 0,
            "sql_examples_loaded": 0
        }

    def _init_weaviate(self) -> weaviate.WeaviateClient:
        """Initialize Weaviate client."""
        url = settings.weaviate_url.replace("http://", "").replace("https://", "")
        if ":" in url:
            host, port_str = url.split(":", 1)
            port = int(port_str)
        else:
            host = url
            port = 8080

        logger.info(f"Connecting to Weaviate at {host}:{port}")

        client = weaviate.connect_to_local(
            host=host,
            port=port,
            grpc_port=50051,
            skip_init_checks=True
        )
        return client

    def create_collections(self):
        """Create Weaviate collections for knowledge graph entities."""

        collections = {
            "FinancialMetrics": [
                Property(name="metric_code", data_type=DataType.TEXT),
                Property(name="metric_name", data_type=DataType.TEXT),
                Property(name="description", data_type=DataType.TEXT),
                Property(name="formula", data_type=DataType.TEXT),
                Property(name="formula_sql", data_type=DataType.TEXT),
                Property(name="synonyms", data_type=DataType.TEXT_ARRAY),
                Property(name="components", data_type=DataType.TEXT_ARRAY),
                Property(name="gl_accounts", data_type=DataType.TEXT_ARRAY),
                Property(name="is_percentage", data_type=DataType.BOOL),
                Property(name="is_currency", data_type=DataType.BOOL),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="combined_text", data_type=DataType.TEXT),
            ],
            "BusinessTerms": [
                Property(name="term", data_type=DataType.TEXT),
                Property(name="canonical_term", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="related_metrics", data_type=DataType.TEXT_ARRAY),
                Property(name="description", data_type=DataType.TEXT),
                Property(name="combined_text", data_type=DataType.TEXT),
            ],
            "ColumnTypes": [
                Property(name="column_pattern", data_type=DataType.TEXT),
                Property(name="display_type", data_type=DataType.TEXT),
                Property(name="format_template", data_type=DataType.TEXT),
                Property(name="synonyms", data_type=DataType.TEXT_ARRAY),
                Property(name="combined_text", data_type=DataType.TEXT),
            ],
            "SQLExamples": [
                Property(name="example_id", data_type=DataType.TEXT),
                Property(name="question", data_type=DataType.TEXT),
                Property(name="sql", data_type=DataType.TEXT),
                Property(name="explanation", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="tables_used", data_type=DataType.TEXT_ARRAY),
                Property(name="complexity", data_type=DataType.TEXT),
                Property(name="dialect", data_type=DataType.TEXT),
                Property(name="tags", data_type=DataType.TEXT_ARRAY),
                Property(name="combined_text", data_type=DataType.TEXT),
            ],
        }

        for name, properties in collections.items():
            try:
                if self.weaviate_client.collections.exists(name):
                    logger.info(f"Deleting existing collection: {name}")
                    self.weaviate_client.collections.delete(name)

                self.weaviate_client.collections.create(
                    name=name,
                    properties=properties,
                    vectorizer_config=wvc.config.Configure.Vectorizer.none(),
                    vector_index_config=wvc.config.Configure.VectorIndex.hnsw(
                        distance_metric=wvc.config.VectorDistances.COSINE
                    )
                )
                logger.info(f"Created collection: {name}")
            except Exception as e:
                logger.error(f"Failed to create collection {name}: {e}")
                raise

    def load_ttl_files(self, ttl_dir: str = None):
        """Load all TTL files from directory."""
        if ttl_dir is None:
            ttl_dir = os.path.join(os.path.dirname(__file__), "src", "ontology")

        if not os.path.exists(ttl_dir):
            logger.warning(f"TTL directory not found: {ttl_dir}")
            return

        for filename in os.listdir(ttl_dir):
            if filename.endswith(".ttl"):
                filepath = os.path.join(ttl_dir, filename)
                logger.info(f"Loading TTL file: {filename}")
                self.rdf_graph.parse(filepath, format="turtle")

        logger.info(f"Loaded {len(self.rdf_graph)} triples from TTL files")

    def _get_financial_metrics(self) -> List[FinancialMetric]:
        """Extract financial metrics from RDF or define comprehensive set."""

        # Define comprehensive financial metrics
        metrics = [
            # Income Statement Metrics
            FinancialMetric(
                metric_code="REVENUE",
                metric_name="Revenue",
                description="Total revenue from sales and services",
                formula="Sum of all revenue accounts",
                formula_sql="SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END)",
                synonyms=["sales", "top line", "turnover", "gross sales", "net sales", "total sales"],
                components=[],
                gl_accounts=["4000", "4100", "4200", "4300"],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="COGS",
                metric_name="Cost of Goods Sold",
                description="Direct costs attributable to goods sold",
                formula="Sum of all COGS accounts",
                formula_sql="SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END)",
                synonyms=["cost of sales", "cos", "direct costs", "cost of revenue"],
                components=[],
                gl_accounts=["5000", "5100", "5200"],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="GROSS_MARGIN",
                metric_name="Gross Margin",
                description="Revenue minus Cost of Goods Sold",
                formula="Revenue - COGS",
                formula_sql="SUM(revenue) - SUM(cogs)",
                synonyms=["gross profit", "gross income", "gm"],
                components=["REVENUE", "COGS"],
                gl_accounts=[],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="GROSS_MARGIN_PCT",
                metric_name="Gross Margin Percentage",
                description="Gross Margin as percentage of Revenue",
                formula="(Revenue - COGS) / Revenue * 100",
                formula_sql="SAFE_DIVIDE(SUM(revenue) - SUM(cogs), SUM(revenue)) * 100",
                synonyms=["gross margin %", "gm%", "gross profit margin", "gpm"],
                components=["GROSS_MARGIN", "REVENUE"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False
            ),
            FinancialMetric(
                metric_code="OPERATING_INCOME",
                metric_name="Operating Income",
                description="Gross Margin minus Operating Expenses",
                formula="Gross Margin - Operating Expenses",
                formula_sql="SUM(gross_margin) - SUM(operating_expenses)",
                synonyms=["operating profit", "EBIT", "operating earnings"],
                components=["GROSS_MARGIN", "OPEX"],
                gl_accounts=[],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="EBITDA",
                metric_name="EBITDA",
                description="Earnings Before Interest, Taxes, Depreciation, and Amortization",
                formula="Operating Income + Depreciation + Amortization",
                formula_sql="SUM(operating_income) + SUM(depreciation) + SUM(amortization)",
                synonyms=["earnings before interest taxes depreciation amortization"],
                components=["OPERATING_INCOME"],
                gl_accounts=[],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="NET_INCOME",
                metric_name="Net Income",
                description="Final profit after all expenses and taxes",
                formula="Revenue - All Expenses - Taxes",
                formula_sql="SUM(revenue) - SUM(all_expenses) - SUM(taxes)",
                synonyms=["net profit", "net earnings", "bottom line", "profit after tax", "pat"],
                components=["REVENUE", "COGS", "OPEX"],
                gl_accounts=[],
                is_currency=True
            ),
            FinancialMetric(
                metric_code="NET_MARGIN_PCT",
                metric_name="Net Margin Percentage",
                description="Net Income as percentage of Revenue",
                formula="Net Income / Revenue * 100",
                formula_sql="SAFE_DIVIDE(SUM(net_income), SUM(revenue)) * 100",
                synonyms=["net margin %", "profit margin", "npm", "net profit margin"],
                components=["NET_INCOME", "REVENUE"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False
            ),

            # Return Metrics (Balance Sheet based)
            FinancialMetric(
                metric_code="ROIC",
                metric_name="Return on Invested Capital",
                description="NOPAT divided by Invested Capital (Debt + Equity)",
                formula="NOPAT / (Total Debt + Shareholders Equity)",
                formula_sql="SAFE_DIVIDE(SUM(nopat), SUM(total_debt) + SUM(shareholders_equity)) * 100",
                synonyms=["return on invested capital", "roic ratio", "return on capital"],
                components=["NOPAT", "INVESTED_CAPITAL"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False,
                category="efficiency"
            ),
            FinancialMetric(
                metric_code="ROA",
                metric_name="Return on Assets",
                description="Net Income divided by Total Assets",
                formula="Net Income / Total Assets * 100",
                formula_sql="SAFE_DIVIDE(SUM(net_income), SUM(total_assets)) * 100",
                synonyms=["return on assets", "roa ratio", "asset return"],
                components=["NET_INCOME", "TOTAL_ASSETS"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False,
                category="efficiency"
            ),
            FinancialMetric(
                metric_code="ROE",
                metric_name="Return on Equity",
                description="Net Income divided by Shareholders Equity",
                formula="Net Income / Shareholders Equity * 100",
                formula_sql="SAFE_DIVIDE(SUM(net_income), SUM(shareholders_equity)) * 100",
                synonyms=["return on equity", "roe ratio", "equity return"],
                components=["NET_INCOME", "SHAREHOLDERS_EQUITY"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False,
                category="efficiency"
            ),
            FinancialMetric(
                metric_code="ROCE",
                metric_name="Return on Capital Employed",
                description="EBIT divided by Capital Employed",
                formula="EBIT / (Total Assets - Current Liabilities) * 100",
                formula_sql="SAFE_DIVIDE(SUM(ebit), SUM(total_assets) - SUM(current_liabilities)) * 100",
                synonyms=["return on capital employed", "roce ratio"],
                components=["EBIT", "CAPITAL_EMPLOYED"],
                gl_accounts=[],
                is_percentage=True,
                is_currency=False,
                category="efficiency"
            ),

            # Working Capital Metrics
            FinancialMetric(
                metric_code="WORKING_CAPITAL",
                metric_name="Working Capital",
                description="Current Assets minus Current Liabilities",
                formula="Current Assets - Current Liabilities",
                formula_sql="SUM(current_assets) - SUM(current_liabilities)",
                synonyms=["net working capital", "nwc"],
                components=["CURRENT_ASSETS", "CURRENT_LIABILITIES"],
                gl_accounts=[],
                is_currency=True,
                category="financial"
            ),
            FinancialMetric(
                metric_code="CURRENT_RATIO",
                metric_name="Current Ratio",
                description="Current Assets divided by Current Liabilities",
                formula="Current Assets / Current Liabilities",
                formula_sql="SAFE_DIVIDE(SUM(current_assets), SUM(current_liabilities))",
                synonyms=["liquidity ratio", "working capital ratio"],
                components=["CURRENT_ASSETS", "CURRENT_LIABILITIES"],
                gl_accounts=[],
                is_percentage=False,
                is_currency=False,
                category="efficiency"
            ),

            # Operational Metrics
            FinancialMetric(
                metric_code="INVENTORY_TURNOVER",
                metric_name="Inventory Turnover",
                description="COGS divided by Average Inventory",
                formula="COGS / Average Inventory",
                formula_sql="SAFE_DIVIDE(SUM(cogs), AVG(inventory))",
                synonyms=["inventory turns", "stock turnover"],
                components=["COGS", "INVENTORY"],
                gl_accounts=[],
                is_percentage=False,
                is_currency=False,
                category="operational"
            ),
            FinancialMetric(
                metric_code="DSO",
                metric_name="Days Sales Outstanding",
                description="Average collection period for receivables",
                formula="(Accounts Receivable / Revenue) * 365",
                formula_sql="SAFE_DIVIDE(SUM(accounts_receivable), SUM(revenue)) * 365",
                synonyms=["days sales outstanding", "collection period", "receivable days"],
                components=["ACCOUNTS_RECEIVABLE", "REVENUE"],
                gl_accounts=[],
                is_percentage=False,
                is_currency=False,
                category="operational"
            ),
            FinancialMetric(
                metric_code="DPO",
                metric_name="Days Payable Outstanding",
                description="Average payment period for payables",
                formula="(Accounts Payable / COGS) * 365",
                formula_sql="SAFE_DIVIDE(SUM(accounts_payable), SUM(cogs)) * 365",
                synonyms=["days payable outstanding", "payment period", "payable days"],
                components=["ACCOUNTS_PAYABLE", "COGS"],
                gl_accounts=[],
                is_percentage=False,
                is_currency=False,
                category="operational"
            ),
        ]

        return metrics

    def _get_column_type_mappings(self) -> List[ColumnTypeMapping]:
        """Define column name to display type mappings."""

        mappings = [
            # Currency columns
            ColumnTypeMapping(
                column_pattern="revenue|sales|amount|total|cost|cogs|margin|profit|price|value|fee|discount|freight|allowance|variance|budget|spend|payment|clv|monetary|gm|gross|net|earnings|income|expense|balance|credit|debit|tax|surcharge|commission|rebate|nopat|ebitda|ebit",
                display_type="currency",
                format_template="$#,##0.00",
                synonyms=["dollar", "money", "financial", "monetary value"]
            ),
            # Percentage columns
            ColumnTypeMapping(
                column_pattern="percent|pct|%|ratio|rate|margin_pct|gm_pct|growth|change|roi|roa|roe|roic|roce|yield",
                display_type="percentage",
                format_template="#.##%",
                synonyms=["percent", "ratio", "rate"]
            ),
            # Quantity/Count columns
            ColumnTypeMapping(
                column_pattern="quantity|qty|count|units|volume|cases|pieces|items|number|num",
                display_type="integer",
                format_template="#,##0",
                synonyms=["quantity", "count", "units", "volume"]
            ),
            # Date columns
            ColumnTypeMapping(
                column_pattern="date|time|timestamp|created|updated|modified|period|month|year|quarter",
                display_type="date",
                format_template="YYYY-MM-DD",
                synonyms=["date", "time", "period"]
            ),
            # ID/Code columns
            ColumnTypeMapping(
                column_pattern="id|code|key|number|no|sku|upc|ean",
                display_type="text",
                format_template="",
                synonyms=["identifier", "code", "key"]
            ),
        ]

        return mappings

    def _get_business_terms(self) -> List[BusinessTerm]:
        """Define business terms and synonyms."""

        terms = [
            # Time period terms
            BusinessTerm(
                term="ytd",
                canonical_term="year_to_date",
                category="time_period",
                related_metrics=[],
                description="Year to date - from January 1st to current date"
            ),
            BusinessTerm(
                term="year to date",
                canonical_term="year_to_date",
                category="time_period",
                related_metrics=[],
                description="Year to date - from January 1st to current date"
            ),
            BusinessTerm(
                term="mtd",
                canonical_term="month_to_date",
                category="time_period",
                related_metrics=[],
                description="Month to date - from 1st of month to current date"
            ),
            BusinessTerm(
                term="yoy",
                canonical_term="year_over_year",
                category="time_period",
                related_metrics=[],
                description="Year over year comparison"
            ),
            BusinessTerm(
                term="vs last year",
                canonical_term="year_over_year",
                category="time_period",
                related_metrics=[],
                description="Comparison with same period last year"
            ),
            BusinessTerm(
                term="mom",
                canonical_term="month_over_month",
                category="time_period",
                related_metrics=[],
                description="Month over month comparison"
            ),

            # Dimension terms
            BusinessTerm(
                term="customer",
                canonical_term="customer",
                category="dimension",
                related_metrics=["REVENUE", "CLV"],
                description="Customer or client entity"
            ),
            BusinessTerm(
                term="client",
                canonical_term="customer",
                category="dimension",
                related_metrics=["REVENUE", "CLV"],
                description="Client - synonym for customer"
            ),
            BusinessTerm(
                term="distributor",
                canonical_term="distributor",
                category="dimension",
                related_metrics=["REVENUE", "GROSS_MARGIN"],
                description="Distribution partner or sales channel"
            ),
            BusinessTerm(
                term="rep",
                canonical_term="sales_rep",
                category="dimension",
                related_metrics=["REVENUE", "COMMISSION"],
                description="Sales representative"
            ),
            BusinessTerm(
                term="region",
                canonical_term="region",
                category="dimension",
                related_metrics=["REVENUE", "GROSS_MARGIN"],
                description="Geographic region or territory"
            ),
            BusinessTerm(
                term="territory",
                canonical_term="region",
                category="dimension",
                related_metrics=["REVENUE", "GROSS_MARGIN"],
                description="Sales territory - synonym for region"
            ),
            BusinessTerm(
                term="product",
                canonical_term="product",
                category="dimension",
                related_metrics=["REVENUE", "COGS", "GROSS_MARGIN"],
                description="Product or SKU"
            ),
            BusinessTerm(
                term="sku",
                canonical_term="product",
                category="dimension",
                related_metrics=["REVENUE", "COGS"],
                description="Stock Keeping Unit - product identifier"
            ),
            BusinessTerm(
                term="item",
                canonical_term="product",
                category="dimension",
                related_metrics=["REVENUE", "COGS"],
                description="Item - synonym for product"
            ),
        ]

        return terms

    def _get_sql_examples(self) -> List[SQLExample]:
        """Define few-shot SQL examples for dynamic retrieval."""

        examples = [
            # Aggregation examples
            SQLExample(
                example_id="agg_001",
                question="Show me total sales by month for last year",
                sql="""SELECT
  FORMAT_DATE('%Y-%m', order_date) as month,
  SUM(total_amount) as total_sales
FROM `{project}.{dataset}.sales`
WHERE DATE(order_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
GROUP BY month
ORDER BY month""",
                explanation="Aggregate sales by month using FORMAT_DATE for grouping",
                category="time_series",
                tables_used=["sales"],
                complexity="medium",
                dialect="bigquery",
                tags=["aggregation", "time", "sum"]
            ),
            SQLExample(
                example_id="agg_002",
                question="What are the top 10 customers by revenue?",
                sql="""SELECT
  customer_id,
  customer_name,
  SUM(revenue) as total_revenue
FROM `{project}.{dataset}.customers`
GROUP BY customer_id, customer_name
ORDER BY total_revenue DESC
LIMIT 10""",
                explanation="Aggregate revenue by customer and rank by total",
                category="ranking",
                tables_used=["customers"],
                complexity="low",
                dialect="bigquery",
                tags=["aggregation", "ranking", "top_n"]
            ),
            SQLExample(
                example_id="agg_003",
                question="Show me top 5 distributors by gross margin",
                sql="""SELECT
  distributor_name,
  SUM(revenue) as total_revenue,
  SUM(cogs) as total_cogs,
  SUM(revenue) - SUM(cogs) as gross_margin
FROM `{project}.{dataset}.sales_data`
WHERE distributor_name IS NOT NULL
GROUP BY distributor_name
ORDER BY gross_margin DESC
LIMIT 5""",
                explanation="Calculate gross margin per distributor and rank",
                category="ranking",
                tables_used=["sales_data"],
                complexity="medium",
                dialect="bigquery",
                tags=["aggregation", "ranking", "gross_margin", "distributor"]
            ),

            # Financial metrics examples
            SQLExample(
                example_id="fin_001",
                question="What is the gross margin percentage by region?",
                sql="""SELECT
  region,
  SUM(revenue) as total_revenue,
  SUM(cogs) as total_cogs,
  SAFE_DIVIDE(SUM(revenue) - SUM(cogs), SUM(revenue)) * 100 as gross_margin_pct
FROM `{project}.{dataset}.sales`
GROUP BY region
ORDER BY gross_margin_pct DESC""",
                explanation="Calculate gross margin percentage using SAFE_DIVIDE",
                category="financial",
                tables_used=["sales"],
                complexity="medium",
                dialect="bigquery",
                tags=["margin", "percentage", "region"]
            ),
            SQLExample(
                example_id="fin_002",
                question="Show EBITDA by quarter",
                sql="""SELECT
  FORMAT_DATE('%Y-Q%Q', transaction_date) as quarter,
  SUM(operating_income) + SUM(depreciation) + SUM(amortization) as ebitda
FROM `{project}.{dataset}.financials`
GROUP BY quarter
ORDER BY quarter""",
                explanation="Calculate EBITDA from components by quarter",
                category="financial",
                tables_used=["financials"],
                complexity="medium",
                dialect="bigquery",
                tags=["ebitda", "quarterly", "financial"]
            ),
            SQLExample(
                example_id="fin_003",
                question="Calculate ROIC for each business unit",
                sql="""SELECT
  business_unit,
  SUM(nopat) as total_nopat,
  SUM(invested_capital) as total_invested_capital,
  SAFE_DIVIDE(SUM(nopat), SUM(invested_capital)) * 100 as roic_pct
FROM `{project}.{dataset}.business_metrics`
WHERE invested_capital > 0
GROUP BY business_unit
ORDER BY roic_pct DESC""",
                explanation="Calculate Return on Invested Capital using NOPAT and invested capital",
                category="financial",
                tables_used=["business_metrics"],
                complexity="high",
                dialect="bigquery",
                tags=["roic", "return", "investment", "capital"]
            ),

            # Join examples
            SQLExample(
                example_id="join_001",
                question="Show me sales by customer with customer details",
                sql="""SELECT
  c.customer_name,
  c.customer_segment,
  c.region,
  SUM(s.amount) as total_sales
FROM `{project}.{dataset}.sales` s
JOIN `{project}.{dataset}.customers` c ON s.customer_id = c.customer_id
GROUP BY c.customer_name, c.customer_segment, c.region
ORDER BY total_sales DESC""",
                explanation="Join sales with customers table to get customer details",
                category="joins",
                tables_used=["sales", "customers"],
                complexity="medium",
                dialect="bigquery",
                tags=["join", "customer", "sales"]
            ),
            SQLExample(
                example_id="join_002",
                question="Show product sales with category information",
                sql="""SELECT
  p.category,
  p.subcategory,
  p.product_name,
  SUM(s.quantity) as units_sold,
  SUM(s.revenue) as total_revenue
FROM `{project}.{dataset}.sales` s
JOIN `{project}.{dataset}.products` p ON s.product_id = p.product_id
GROUP BY p.category, p.subcategory, p.product_name
ORDER BY total_revenue DESC""",
                explanation="Join sales with products to include category hierarchy",
                category="joins",
                tables_used=["sales", "products"],
                complexity="medium",
                dialect="bigquery",
                tags=["join", "product", "category"]
            ),

            # Comparison examples
            SQLExample(
                example_id="comp_001",
                question="Compare this year vs last year revenue",
                sql="""WITH current_year AS (
  SELECT SUM(revenue) as revenue
  FROM `{project}.{dataset}.sales`
  WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE())
),
last_year AS (
  SELECT SUM(revenue) as revenue
  FROM `{project}.{dataset}.sales`
  WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
)
SELECT
  cy.revenue as current_year_revenue,
  ly.revenue as last_year_revenue,
  cy.revenue - ly.revenue as difference,
  SAFE_DIVIDE(cy.revenue - ly.revenue, ly.revenue) * 100 as yoy_growth_pct
FROM current_year cy, last_year ly""",
                explanation="Compare revenue between current and previous year using CTEs",
                category="comparison",
                tables_used=["sales"],
                complexity="high",
                dialect="bigquery",
                tags=["yoy", "comparison", "growth"]
            ),
            SQLExample(
                example_id="comp_002",
                question="Show month over month sales growth",
                sql="""WITH monthly_sales AS (
  SELECT
    FORMAT_DATE('%Y-%m', order_date) as month,
    SUM(revenue) as revenue
  FROM `{project}.{dataset}.sales`
  GROUP BY month
)
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) as prev_month_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) as mom_change,
  SAFE_DIVIDE(revenue - LAG(revenue) OVER (ORDER BY month), LAG(revenue) OVER (ORDER BY month)) * 100 as mom_growth_pct
FROM monthly_sales
ORDER BY month""",
                explanation="Calculate month over month growth using LAG window function",
                category="comparison",
                tables_used=["sales"],
                complexity="high",
                dialect="bigquery",
                tags=["mom", "comparison", "growth", "window_function"]
            ),

            # Filtering examples
            SQLExample(
                example_id="filter_001",
                question="Show sales for California only",
                sql="""SELECT
  customer_name,
  product_name,
  SUM(revenue) as total_revenue
FROM `{project}.{dataset}.sales`
WHERE LOWER(state) = 'california' OR LOWER(state) = 'ca'
GROUP BY customer_name, product_name
ORDER BY total_revenue DESC""",
                explanation="Filter by state with case-insensitive matching",
                category="filtering",
                tables_used=["sales"],
                complexity="low",
                dialect="bigquery",
                tags=["filter", "state", "region"]
            ),
            SQLExample(
                example_id="filter_002",
                question="Show all customers named John",
                sql="""SELECT DISTINCT
  customer_id,
  customer_name,
  email,
  region
FROM `{project}.{dataset}.customers`
WHERE LOWER(customer_name) LIKE '%john%'
ORDER BY customer_name""",
                explanation="Case-insensitive name search using LIKE",
                category="filtering",
                tables_used=["customers"],
                complexity="low",
                dialect="bigquery",
                tags=["filter", "name", "search"]
            ),

            # Date range examples
            SQLExample(
                example_id="date_001",
                question="Show sales for last 30 days",
                sql="""SELECT
  DATE(order_date) as sale_date,
  COUNT(*) as order_count,
  SUM(revenue) as daily_revenue
FROM `{project}.{dataset}.sales`
WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY sale_date
ORDER BY sale_date DESC""",
                explanation="Filter by relative date using DATE_SUB",
                category="time_series",
                tables_used=["sales"],
                complexity="low",
                dialect="bigquery",
                tags=["date", "recent", "time_filter"]
            ),
            SQLExample(
                example_id="date_002",
                question="Show Q1 2024 performance",
                sql="""SELECT
  product_category,
  SUM(revenue) as total_revenue,
  SUM(quantity) as total_units
FROM `{project}.{dataset}.sales`
WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'
GROUP BY product_category
ORDER BY total_revenue DESC""",
                explanation="Filter by specific date range for Q1",
                category="time_series",
                tables_used=["sales"],
                complexity="low",
                dialect="bigquery",
                tags=["date", "quarter", "time_filter"]
            ),

            # Complex analytics
            SQLExample(
                example_id="analytics_001",
                question="Show customer purchase frequency segments",
                sql="""WITH customer_orders AS (
  SELECT
    customer_id,
    COUNT(*) as order_count,
    SUM(revenue) as total_spend
  FROM `{project}.{dataset}.sales`
  GROUP BY customer_id
)
SELECT
  CASE
    WHEN order_count >= 10 THEN 'Frequent'
    WHEN order_count >= 5 THEN 'Regular'
    WHEN order_count >= 2 THEN 'Occasional'
    ELSE 'One-time'
  END as customer_segment,
  COUNT(*) as customer_count,
  AVG(total_spend) as avg_spend
FROM customer_orders
GROUP BY customer_segment
ORDER BY customer_count DESC""",
                explanation="Segment customers by purchase frequency using CASE statement",
                category="analytics",
                tables_used=["sales"],
                complexity="high",
                dialect="bigquery",
                tags=["segmentation", "customer", "rfm"]
            ),
            SQLExample(
                example_id="analytics_002",
                question="Show running total of sales by month",
                sql="""SELECT
  FORMAT_DATE('%Y-%m', order_date) as month,
  SUM(revenue) as monthly_revenue,
  SUM(SUM(revenue)) OVER (ORDER BY FORMAT_DATE('%Y-%m', order_date)) as running_total
FROM `{project}.{dataset}.sales`
GROUP BY month
ORDER BY month""",
                explanation="Calculate running total using SUM window function",
                category="analytics",
                tables_used=["sales"],
                complexity="high",
                dialect="bigquery",
                tags=["running_total", "cumulative", "window_function"]
            ),
        ]

        return examples

    def load_sql_examples_to_weaviate(self):
        """Load SQL few-shot examples into Weaviate."""
        examples = self._get_sql_examples()
        collection = self.weaviate_client.collections.get("SQLExamples")

        for example in examples:
            # Create combined text for embedding - focus on question and category
            combined_text = f"""
            Question: {example.question}
            Category: {example.category}
            Complexity: {example.complexity}
            Tables: {', '.join(example.tables_used)}
            Tags: {', '.join(example.tags or [])}
            Explanation: {example.explanation}
            """

            embedding = self.embedding_service.generate_embedding(combined_text)

            collection.data.insert(
                properties={
                    "example_id": example.example_id,
                    "question": example.question,
                    "sql": example.sql,
                    "explanation": example.explanation,
                    "category": example.category,
                    "tables_used": example.tables_used,
                    "complexity": example.complexity,
                    "dialect": example.dialect,
                    "tags": example.tags or [],
                    "combined_text": combined_text.strip(),
                },
                vector=embedding
            )

            self.stats["sql_examples_loaded"] += 1

        logger.info(f"Loaded {self.stats['sql_examples_loaded']} SQL examples")

    def load_metrics_to_weaviate(self):
        """Load financial metrics into Weaviate."""
        metrics = self._get_financial_metrics()
        collection = self.weaviate_client.collections.get("FinancialMetrics")

        for metric in metrics:
            # Create combined text for embedding
            combined_text = f"""
            Metric: {metric.metric_name} ({metric.metric_code})
            Description: {metric.description}
            Formula: {metric.formula}
            Synonyms: {', '.join(metric.synonyms)}
            Category: {metric.category}
            Type: {'Percentage' if metric.is_percentage else 'Currency' if metric.is_currency else 'Number'}
            """

            # Generate embedding
            embedding = self.embedding_service.generate_embedding(combined_text)

            # Insert into Weaviate
            collection.data.insert(
                properties={
                    "metric_code": metric.metric_code,
                    "metric_name": metric.metric_name,
                    "description": metric.description,
                    "formula": metric.formula,
                    "formula_sql": metric.formula_sql,
                    "synonyms": metric.synonyms,
                    "components": metric.components,
                    "gl_accounts": metric.gl_accounts,
                    "is_percentage": metric.is_percentage,
                    "is_currency": metric.is_currency,
                    "category": metric.category,
                    "combined_text": combined_text.strip(),
                },
                vector=embedding
            )

            self.stats["metrics_loaded"] += 1
            logger.info(f"Loaded metric: {metric.metric_code}")

    def load_terms_to_weaviate(self):
        """Load business terms into Weaviate."""
        terms = self._get_business_terms()
        collection = self.weaviate_client.collections.get("BusinessTerms")

        for term in terms:
            combined_text = f"""
            Term: {term.term}
            Canonical: {term.canonical_term}
            Category: {term.category}
            Description: {term.description}
            Related Metrics: {', '.join(term.related_metrics)}
            """

            embedding = self.embedding_service.generate_embedding(combined_text)

            collection.data.insert(
                properties={
                    "term": term.term,
                    "canonical_term": term.canonical_term,
                    "category": term.category,
                    "related_metrics": term.related_metrics,
                    "description": term.description,
                    "combined_text": combined_text.strip(),
                },
                vector=embedding
            )

            self.stats["terms_loaded"] += 1

        logger.info(f"Loaded {self.stats['terms_loaded']} business terms")

    def load_column_types_to_weaviate(self):
        """Load column type mappings into Weaviate."""
        mappings = self._get_column_type_mappings()
        collection = self.weaviate_client.collections.get("ColumnTypes")

        for mapping in mappings:
            combined_text = f"""
            Column Pattern: {mapping.column_pattern}
            Display Type: {mapping.display_type}
            Format: {mapping.format_template}
            Synonyms: {', '.join(mapping.synonyms)}
            """

            embedding = self.embedding_service.generate_embedding(combined_text)

            collection.data.insert(
                properties={
                    "column_pattern": mapping.column_pattern,
                    "display_type": mapping.display_type,
                    "format_template": mapping.format_template,
                    "synonyms": mapping.synonyms,
                    "combined_text": combined_text.strip(),
                },
                vector=embedding
            )

            self.stats["column_types_loaded"] += 1

        logger.info(f"Loaded {self.stats['column_types_loaded']} column type mappings")

    def load_all(self):
        """Load all knowledge graph data into Weaviate."""
        logger.info("=" * 80)
        logger.info("LOADING KNOWLEDGE GRAPH TO WEAVIATE")
        logger.info("=" * 80)

        # Create collections
        logger.info("\n1. Creating Weaviate collections...")
        self.create_collections()

        # Load TTL files (optional - for custom ontologies)
        logger.info("\n2. Loading TTL files...")
        self.load_ttl_files()

        # Load metrics
        logger.info("\n3. Loading financial metrics...")
        self.load_metrics_to_weaviate()

        # Load business terms
        logger.info("\n4. Loading business terms...")
        self.load_terms_to_weaviate()

        # Load column type mappings
        logger.info("\n5. Loading column type mappings...")
        self.load_column_types_to_weaviate()

        # Load SQL examples
        logger.info("\n6. Loading SQL few-shot examples...")
        self.load_sql_examples_to_weaviate()

        # Summary
        logger.info("\n" + "=" * 80)
        logger.info("KNOWLEDGE GRAPH LOAD COMPLETE")
        logger.info("=" * 80)
        logger.info(f"Metrics loaded: {self.stats['metrics_loaded']}")
        logger.info(f"Business terms loaded: {self.stats['terms_loaded']}")
        logger.info(f"SQL examples loaded: {self.stats['sql_examples_loaded']}")
        logger.info(f"Column types loaded: {self.stats['column_types_loaded']}")

        # Test search
        self._test_search()

    def _test_search(self):
        """Test semantic search capabilities."""
        logger.info("\n" + "=" * 80)
        logger.info("TESTING SEMANTIC SEARCH")
        logger.info("=" * 80)

        test_queries = [
            ("What is ROIC?", "FinancialMetrics"),
            ("return on capital", "FinancialMetrics"),
            ("gross profit margin", "FinancialMetrics"),
            ("year over year", "BusinessTerms"),
            ("customer vs client", "BusinessTerms"),
        ]

        for query, collection_name in test_queries:
            logger.info(f"\nQuery: '{query}' in {collection_name}")

            embedding = self.embedding_service.generate_embedding(query)
            collection = self.weaviate_client.collections.get(collection_name)

            response = collection.query.near_vector(
                near_vector=embedding,
                limit=3,
                return_metadata=wvc.query.MetadataQuery(distance=True)
            )

            for i, item in enumerate(response.objects, 1):
                if collection_name == "FinancialMetrics":
                    logger.info(f"  {i}. {item.properties['metric_code']} - {item.properties['metric_name']}")
                    logger.info(f"     Formula: {item.properties['formula']}")
                else:
                    logger.info(f"  {i}. {item.properties['term']} → {item.properties['canonical_term']}")

                if item.metadata:
                    logger.info(f"     Distance: {item.metadata.distance:.4f}")

    def close(self):
        """Close connections."""
        if self.weaviate_client:
            self.weaviate_client.close()


if __name__ == "__main__":
    loader = KnowledgeGraphWeaviateLoader()
    try:
        loader.load_all()
    finally:
        loader.close()
