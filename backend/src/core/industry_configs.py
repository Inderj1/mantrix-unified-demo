"""Industry-specific configurations for NLP to SQL system."""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from abc import ABC, abstractmethod
import re


class TableMapping(BaseModel):
    """Mapping of business concepts to technical tables."""
    business_name: str
    technical_name: str
    description: str
    key_columns: List[str] = []
    common_filters: List[str] = []
    relationships: Dict[str, str] = {}


class QueryTemplate(BaseModel):
    """Pre-defined query templates for common business questions."""
    name: str
    description: str
    pattern: str  # Regex pattern to match
    sql_template: str
    required_tables: List[str]
    parameters: List[str] = []


class DomainConfig(BaseModel):
    """Configuration for a specific business domain."""
    name: str
    description: str
    table_mappings: List[TableMapping]
    query_templates: List[QueryTemplate]
    common_metrics: Dict[str, str]  # metric_name -> SQL expression
    dimension_hierarchies: Dict[str, List[str]]  # dimension -> [levels]
    
    
class IndustryConfig(BaseModel):
    """Base configuration for an industry."""
    industry_name: str
    description: str
    domains: List[DomainConfig]
    glossary: Dict[str, str]  # business_term -> technical_term
    common_time_periods: Dict[str, str]  # period_name -> SQL expression
    
    def get_all_tables(self) -> List[str]:
        """Get all tables across all domains."""
        tables = []
        for domain in self.domains:
            for mapping in domain.table_mappings:
                tables.append(mapping.technical_name)
        return list(set(tables))
    
    def get_business_to_technical_mapping(self) -> Dict[str, str]:
        """Get complete business to technical term mapping."""
        mapping = self.glossary.copy()
        for domain in self.domains:
            for table_map in domain.table_mappings:
                mapping[table_map.business_name.lower()] = table_map.technical_name
        return mapping


# SAP COPA Configuration
SAP_COPA_CONFIG = IndustryConfig(
    industry_name="SAP COPA",
    description="Configuration for SAP Controlling Profitability Analysis",
    glossary={
        # Business terms to technical terms
        "revenue": "VV001",
        "cost": "VV002", 
        "profit": "contribution_margin",
        "customer": "KUNNR",
        "product": "MATNR",
        "company": "BUKRS",
        "sales org": "VKORG",
        "distribution channel": "VTWEG",
        "division": "SPART",
        "profit center": "PRCTR",
        "cost center": "KOSTL",
        "material group": "MATKL",
        "customer group": "KDGRP",
        "region": "REGIO",
        "country": "LAND1",
        "fiscal year": "GJAHR",
        "fiscal period": "PERIO",
        "posting date": "BUDAT",
        "billing date": "FKDAT",
        "quantity": "ABSMG",
        "currency": "WAERS",
        "unit": "MEINS"
    },
    common_time_periods={
        "current_year": "GJAHR = EXTRACT(YEAR FROM CURRENT_DATE)",
        "last_year": "GJAHR = EXTRACT(YEAR FROM CURRENT_DATE) - 1",
        "current_month": "PERIO = FORMAT_DATE('%Y%m', CURRENT_DATE)",
        "last_month": "PERIO = FORMAT_DATE('%Y%m', DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))",
        "ytd": "PERIO <= FORMAT_DATE('%Y%m', CURRENT_DATE) AND GJAHR = EXTRACT(YEAR FROM CURRENT_DATE)",
        "last_12_months": "BUDAT >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)"
    },
    domains=[
        DomainConfig(
            name="Profitability",
            description="Core COPA profitability analysis",
            table_mappings=[
                TableMapping(
                    business_name="COPA Line Items",
                    technical_name="CE11000",  # Actual table name in your system
                    description="COPA actual line items with all characteristics and value fields",
                    key_columns=["PERIO", "KUNNR", "MATNR", "VKORG"],
                    common_filters=["GJAHR", "BUKRS", "VKORG"],
                    relationships={
                        "KNA1": "KUNNR",  # Customer master
                        "MARA": "MATNR",  # Material master
                        "T001": "BUKRS"   # Company code
                    }
                ),
                TableMapping(
                    business_name="COPA Plan Data",
                    technical_name="CE21000",  # Plan data table
                    description="COPA planning data",
                    key_columns=["PERIO", "VERSI", "KUNNR", "MATNR"],
                    common_filters=["GJAHR", "VERSI", "BUKRS"]
                ),
                TableMapping(
                    business_name="Customer Master",
                    technical_name="KNA1",
                    description="Customer master data",
                    key_columns=["KUNNR"],
                    common_filters=["LAND1", "REGIO"]
                ),
                TableMapping(
                    business_name="Material Master",
                    technical_name="MARA",
                    description="Material master data",
                    key_columns=["MATNR"],
                    common_filters=["MATKL", "MTART"]
                )
            ],
            query_templates=[
                QueryTemplate(
                    name="profitability_by_customer",
                    description="Analyze profitability by customer",
                    pattern=r"(profit|profitability|margin).*(customer|client)",
                    sql_template="""
                    SELECT 
                        c.KUNNR as customer_number,
                        c.NAME1 as customer_name,
                        SUM(a.VV001) as revenue,
                        SUM(a.VV002) as cost,
                        SUM(a.VV001 - a.VV002) as profit,
                        SAFE_DIVIDE(SUM(a.VV001 - a.VV002), SUM(a.VV001)) * 100 as profit_margin_pct
                    FROM `{project}.{dataset}.CE11000` a
                    JOIN `{project}.{dataset}.KNA1` c ON a.KUNNR = c.KUNNR
                    WHERE {time_filter}
                        AND a.BUKRS = '{company_code}'
                    GROUP BY c.KUNNR, c.NAME1
                    ORDER BY profit DESC
                    """,
                    required_tables=["CE11000", "KNA1"],
                    parameters=["time_filter", "company_code"]
                ),
                QueryTemplate(
                    name="profitability_by_product",
                    description="Analyze profitability by product",
                    pattern=r"(profit|profitability|margin).*(product|material)",
                    sql_template="""
                    SELECT 
                        m.MATNR as material_number,
                        m.MAKTX as material_description,
                        m.MATKL as material_group,
                        SUM(a.VV001) as revenue,
                        SUM(a.VV002) as cost,
                        SUM(a.VV001 - a.VV002) as profit,
                        SUM(a.ABSMG) as quantity,
                        SAFE_DIVIDE(SUM(a.VV001 - a.VV002), SUM(a.VV001)) * 100 as profit_margin_pct
                    FROM `{project}.{dataset}.CE11000` a
                    JOIN `{project}.{dataset}.MARA` m ON a.MATNR = m.MATNR
                    WHERE {time_filter}
                    GROUP BY m.MATNR, m.MAKTX, m.MATKL
                    ORDER BY profit DESC
                    """,
                    required_tables=["CE11000", "MARA"],
                    parameters=["time_filter"]
                )
            ],
            common_metrics={
                "revenue": "SUM(VV001)",
                "cost": "SUM(VV002)",
                "profit": "SUM(VV001 - VV002)",
                "profit_margin": "SAFE_DIVIDE(SUM(VV001 - VV002), SUM(VV001)) * 100",
                "quantity": "SUM(ABSMG)",
                "average_price": "SAFE_DIVIDE(SUM(VV001), SUM(ABSMG))"
            },
            dimension_hierarchies={
                "customer": ["KUNNR", "KDGRP", "LAND1", "REGIO"],
                "product": ["MATNR", "MATKL", "MTART"],
                "organization": ["BUKRS", "VKORG", "VTWEG", "SPART"],
                "time": ["GJAHR", "PERIO", "BUDAT"]
            }
        )
    ]
)


# Retail Industry Configuration (Example)
RETAIL_CONFIG = IndustryConfig(
    industry_name="Retail",
    description="Configuration for retail analytics",
    glossary={
        "sales": "sales_amount",
        "revenue": "revenue",
        "customer": "customer_id",
        "product": "product_id",
        "store": "store_id",
        "category": "product_category",
        "brand": "brand_name",
        "promotion": "promo_id"
    },
    common_time_periods={
        "today": "DATE(timestamp) = CURRENT_DATE",
        "yesterday": "DATE(timestamp) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)",
        "this_week": "DATE_TRUNC(timestamp, WEEK) = DATE_TRUNC(CURRENT_DATE, WEEK)",
        "last_week": "DATE_TRUNC(timestamp, WEEK) = DATE_TRUNC(DATE_SUB(CURRENT_DATE, INTERVAL 1 WEEK), WEEK)",
        "this_month": "DATE_TRUNC(timestamp, MONTH) = DATE_TRUNC(CURRENT_DATE, MONTH)",
        "last_month": "DATE_TRUNC(timestamp, MONTH) = DATE_TRUNC(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), MONTH)"
    },
    domains=[
        DomainConfig(
            name="Sales",
            description="Sales transactions and analytics",
            table_mappings=[
                TableMapping(
                    business_name="Sales Transactions",
                    technical_name="sales_transactions",
                    description="Point of sale transaction data",
                    key_columns=["transaction_id", "timestamp"],
                    common_filters=["store_id", "date", "product_category"]
                ),
                TableMapping(
                    business_name="Products",
                    technical_name="product_master",
                    description="Product catalog and attributes",
                    key_columns=["product_id"],
                    common_filters=["category", "brand", "status"]
                )
            ],
            query_templates=[],
            common_metrics={
                "sales": "SUM(sales_amount)",
                "units": "SUM(quantity)",
                "transactions": "COUNT(DISTINCT transaction_id)",
                "average_basket": "SAFE_DIVIDE(SUM(sales_amount), COUNT(DISTINCT transaction_id))"
            },
            dimension_hierarchies={
                "product": ["product_id", "subcategory", "category", "department"],
                "location": ["store_id", "district", "region", "country"],
                "time": ["hour", "date", "week", "month", "quarter", "year"]
            }
        )
    ]
)


# Configuration Manager
# GL Mappings Configuration - Simple config for GL-based queries
GL_MAPPINGS_CONFIG = IndustryConfig(
    industry_name="GL Mappings",
    description="Configuration using General Ledger account mappings only",
    glossary={
        # Simple GL-focused business terms
        "revenue": "revenue_accounts",
        "sales": "revenue_accounts", 
        "cost": "cost_accounts",
        "expenses": "expense_accounts",
        "cogs": "cogs_accounts",
        "operating expenses": "opex_accounts"
    },
    common_time_periods={
        "current_year": "EXTRACT(YEAR FROM Posting_Date) = EXTRACT(YEAR FROM CURRENT_DATE())",
        "last_year": "EXTRACT(YEAR FROM Posting_Date) = EXTRACT(YEAR FROM CURRENT_DATE()) - 1",
        "current_month": "DATE_TRUNC(Posting_Date, MONTH) = DATE_TRUNC(CURRENT_DATE(), MONTH)",
        "last_month": "DATE_TRUNC(Posting_Date, MONTH) = DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)",
        "ytd": "Posting_Date >= DATE(EXTRACT(YEAR FROM CURRENT_DATE()), 1, 1) AND Posting_Date <= CURRENT_DATE()"
    },
    domains=[]  # No predefined domains - rely on business config mappings
)


class IndustryConfigManager:
    """Manages industry-specific configurations."""
    
    def __init__(self):
        self.configs: Dict[str, IndustryConfig] = {
            "gl_mappings": GL_MAPPINGS_CONFIG,
            "retail": RETAIL_CONFIG
        }
        self.active_config: Optional[IndustryConfig] = None
    
    def set_active_industry(self, industry_name: str):
        """Set the active industry configuration."""
        if industry_name.lower() in self.configs:
            self.active_config = self.configs[industry_name.lower()]
        else:
            raise ValueError(f"Unknown industry: {industry_name}")
    
    def get_active_config(self) -> Optional[IndustryConfig]:
        """Get the active industry configuration."""
        return self.active_config
    
    def register_config(self, industry_name: str, config: IndustryConfig):
        """Register a new industry configuration."""
        self.configs[industry_name.lower()] = config
    
    def translate_business_terms(self, query: str) -> str:
        """Translate business terms to technical terms in a query."""
        if not self.active_config:
            return query
        
        translated = query.lower()
        for business_term, technical_term in self.active_config.glossary.items():
            translated = translated.replace(business_term.lower(), technical_term)
        
        return translated
    
    def get_relevant_templates(self, query: str) -> List[QueryTemplate]:
        """Find query templates that match the user query."""
        if not self.active_config:
            return []
        
        relevant_templates = []
        
        for domain in self.active_config.domains:
            for template in domain.query_templates:
                if re.search(template.pattern, query, re.IGNORECASE):
                    relevant_templates.append(template)
        
        # Also check for financial templates if enabled
        if hasattr(self, 'include_financial_templates') and self.include_financial_templates:
            from src.core.financial_templates import get_financial_template
            from src.core.financial_semantic_parser import financial_parser
            
            # Parse query to determine hierarchy level
            parsed = financial_parser.parse_query(query)
            if isinstance(parsed, dict) and "hierarchy_level" in parsed:
                hierarchy_level = parsed["hierarchy_level"].value
            else:
                logger.error(f"Invalid parsed result type: {type(parsed)}")
                return []
            
            financial_template = get_financial_template(query, hierarchy_level)
            if financial_template:
                relevant_templates.append(financial_template)
        
        return relevant_templates