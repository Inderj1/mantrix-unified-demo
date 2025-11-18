"""SAP COPA specific helper functions and optimizations."""

from typing import Dict, List, Any, Optional
import re
from datetime import datetime, date
import structlog

logger = structlog.get_logger()


class COPAQueryHelper:
    """Helper class for SAP COPA specific query generation."""
    
    # COPA Value Fields mapping
    VALUE_FIELDS = {
        # Revenue fields
        "revenue": ["VV001", "VV010", "VV100"],  # Gross revenue variants
        "gross_revenue": "VV001",
        "net_revenue": "VV010",
        "list_price": "VV100",
        
        # Cost fields
        "cogs": "VV002",  # Cost of goods sold
        "material_cost": "VV201",
        "labor_cost": "VV202",
        "overhead_cost": "VV203",
        "freight_cost": "VV204",
        
        # Margin fields
        "contribution_margin_1": "VV301",  # CM1
        "contribution_margin_2": "VV302",  # CM2
        "contribution_margin_3": "VV303",  # CM3
        
        # Quantity fields
        "quantity": "ABSMG",
        "sales_quantity": "ABSMG_ME",
        
        # Discount/Rebate fields
        "discount": "VV401",
        "rebate": "VV402",
        "cash_discount": "VV403"
    }
    
    # COPA Characteristics mapping
    CHARACTERISTICS = {
        # Customer dimensions
        "customer": "KUNNR",
        "customer_group": "KDGRP", 
        "sales_district": "BZIRK",
        "customer_region": "REGIO",
        "customer_country": "LAND1",
        
        # Product dimensions
        "material": "MATNR",
        "material_group": "MATKL",
        "product_hierarchy": "PRODH",
        "brand": "BRAND",  # Custom characteristic
        
        # Organization dimensions
        "company_code": "BUKRS",
        "sales_org": "VKORG",
        "distribution_channel": "VTWEG",
        "division": "SPART",
        "plant": "WERKS",
        "profit_center": "PRCTR",
        "cost_center": "KOSTL",
        
        # Time dimensions
        "fiscal_year": "GJAHR",
        "fiscal_period": "PERIO",
        "posting_date": "BUDAT",
        "billing_date": "FKDAT",
        
        # Other dimensions
        "version": "VERSI",  # For plan/actual
        "record_type": "VRGAR",
        "currency": "WAERS"
    }
    
    # Common COPA tables by area
    COPA_TABLES = {
        "actual": "CE11000",  # Actual line items
        "plan": "CE21000",    # Plan line items  
        "assessment": "CE31000",  # Assessment/allocation
        "summary": "CE41000"  # Summarization levels
    }
    
    @staticmethod
    def parse_time_period(period_str: str) -> Dict[str, str]:
        """Parse natural language time period to COPA filters."""
        period_str_lower = period_str.lower()
        
        current_year = datetime.now().year
        current_month = datetime.now().month
        current_period = f"{current_year}{current_month:02d}"
        
        filters = {}
        
        # Year patterns
        if "this year" in period_str_lower or "current year" in period_str_lower:
            filters["GJAHR"] = str(current_year)
        elif "last year" in period_str_lower or "previous year" in period_str_lower:
            filters["GJAHR"] = str(current_year - 1)
        elif match := re.search(r'20\d{2}', period_str):
            filters["GJAHR"] = match.group()
        
        # Month/Period patterns
        if "january" in period_str_lower or "jan" in period_str_lower:
            filters["PERIO"] = f"{filters.get('GJAHR', current_year)}01"
        elif "ytd" in period_str_lower or "year to date" in period_str_lower:
            filters["PERIO_RANGE"] = f"BETWEEN '{current_year}01' AND '{current_period}'"
        elif "last month" in period_str_lower:
            last_month = current_month - 1 if current_month > 1 else 12
            last_month_year = current_year if current_month > 1 else current_year - 1
            filters["PERIO"] = f"{last_month_year}{last_month:02d}"
        
        # Quarter patterns
        if "q1" in period_str_lower or "first quarter" in period_str_lower:
            filters["PERIO_RANGE"] = f"BETWEEN '{filters.get('GJAHR', current_year)}01' AND '{filters.get('GJAHR', current_year)}03'"
        elif "q2" in period_str_lower or "second quarter" in period_str_lower:
            filters["PERIO_RANGE"] = f"BETWEEN '{filters.get('GJAHR', current_year)}04' AND '{filters.get('GJAHR', current_year)}06'"
        
        return filters
    
    @staticmethod
    def build_copa_aggregation(metrics: List[str], grain: str = "month") -> str:
        """Build COPA-specific aggregation SQL."""
        select_fields = []
        
        # Add time dimension based on grain
        if grain == "month":
            select_fields.append("PERIO as period")
        elif grain == "year":
            select_fields.append("GJAHR as fiscal_year")
        elif grain == "day":
            select_fields.append("BUDAT as posting_date")
        
        # Add requested metrics
        for metric in metrics:
            if metric in COPAQueryHelper.VALUE_FIELDS:
                field = COPAQueryHelper.VALUE_FIELDS[metric]
                if isinstance(field, list):
                    # Sum multiple fields
                    sum_expr = " + ".join([f"SUM({f})" for f in field])
                    select_fields.append(f"({sum_expr}) as {metric}")
                else:
                    select_fields.append(f"SUM({field}) as {metric}")
        
        return ", ".join(select_fields)
    
    @staticmethod
    def optimize_copa_query(sql: str) -> str:
        """Apply COPA-specific optimizations."""
        optimized = sql
        
        # 1. Add GJAHR partition filter if missing
        if "CE11000" in sql and "GJAHR" not in sql:
            current_year = datetime.now().year
            where_clause = f"WHERE GJAHR >= {current_year - 2}"  # Last 3 years
            if "WHERE" in optimized:
                optimized = optimized.replace("WHERE", f"WHERE GJAHR >= {current_year - 2} AND")
            else:
                optimized = optimized.replace("FROM", f"FROM\n{where_clause}\nAND")
        
        # 2. Use APPROX functions for large aggregations
        optimized = re.sub(r'COUNT\(DISTINCT\s+(\w+)\)', r'APPROX_COUNT_DISTINCT(\1)', optimized)
        
        # 3. Add BUKRS (company code) filter if not present
        if "BUKRS" not in optimized and "CE11000" in optimized:
            logger.warning("No company code filter detected - query may scan all companies")
        
        return optimized
    
    @staticmethod
    def generate_variance_query(
        actual_version: str = "000",
        plan_version: str = "001",
        time_filter: str = "",
        dimensions: List[str] = None
    ) -> str:
        """Generate actual vs plan variance query."""
        if dimensions is None:
            dimensions = ["KUNNR", "MATNR", "VKORG"]
        
        dim_select = ", ".join([f"a.{dim}" for dim in dimensions])
        dim_group = ", ".join([f"a.{dim}" for dim in dimensions])
        
        return f"""
        WITH actual_data AS (
            SELECT 
                {dim_select},
                SUM(VV001) as actual_revenue,
                SUM(VV002) as actual_cost,
                SUM(VV001 - VV002) as actual_profit
            FROM {{project}}.{{dataset}}.CE11000` a
            WHERE VERSI = '{actual_version}'
                {time_filter}
            GROUP BY {dim_group}
        ),
        plan_data AS (
            SELECT 
                {dim_select},
                SUM(VV001) as plan_revenue,
                SUM(VV002) as plan_cost,
                SUM(VV001 - VV002) as plan_profit
            FROM {{project}}.{{dataset}}.CE21000` a
            WHERE VERSI = '{plan_version}'
                {time_filter}
            GROUP BY {dim_group}
        )
        SELECT 
            a.*,
            p.plan_revenue,
            p.plan_cost,
            p.plan_profit,
            a.actual_revenue - p.plan_revenue as revenue_variance,
            a.actual_cost - p.plan_cost as cost_variance,
            a.actual_profit - p.plan_profit as profit_variance,
            SAFE_DIVIDE(a.actual_revenue - p.plan_revenue, p.plan_revenue) * 100 as revenue_variance_pct
        FROM actual_data a
        LEFT JOIN plan_data p USING({", ".join(dimensions)})
        ORDER BY profit_variance DESC
        """
    
    @staticmethod
    def suggest_copa_indexes(table_name: str, query_patterns: List[str]) -> List[str]:
        """Suggest indexes for COPA tables based on query patterns."""
        suggestions = []
        
        # Always partition by GJAHR (fiscal year)
        suggestions.append(f"PARTITION BY GJAHR")
        
        # Cluster by common filter columns
        if "customer" in str(query_patterns):
            suggestions.append(f"CLUSTER BY KUNNR, GJAHR, PERIO")
        elif "product" in str(query_patterns):
            suggestions.append(f"CLUSTER BY MATNR, GJAHR, PERIO")
        elif "profit_center" in str(query_patterns):
            suggestions.append(f"CLUSTER BY PRCTR, GJAHR, PERIO")
        else:
            # Default clustering
            suggestions.append(f"CLUSTER BY BUKRS, GJAHR, PERIO")
        
        return suggestions