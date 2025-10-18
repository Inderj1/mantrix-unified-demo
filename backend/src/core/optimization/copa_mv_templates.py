"""COPA-specific Materialized View Templates for common profitability analysis patterns."""

import structlog
from typing import Dict, List
from .mv_manager import MaterializedViewManager, MaterializedViewConfig

logger = structlog.get_logger()

# COPA-specific materialized view templates
COPA_MV_TEMPLATES = {
    "monthly_profitability": {
        "name": "mv_copa_monthly_profit",
        "description": "Pre-aggregated monthly profitability by key dimensions",
        "query": """
        SELECT 
            GJAHR,
            PERIO,
            BUKRS,
            VKORG,
            VTWEG,
            SPART,
            KUNNR,
            MATNR,
            PRCTR,
            SUM(VV001) as total_revenue,
            SUM(VV002) as total_cogs,
            SUM(VV001 - VV002) as gross_profit,
            SUM(VV301) as contribution_margin_1,
            COUNT(*) as line_items
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR))
        GROUP BY 1,2,3,4,5,6,7,8,9
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["BUKRS", "KUNNR", "GJAHR", "PERIO"]
    },
    
    "customer_profitability": {
        "name": "mv_copa_customer_profit",
        "description": "Customer profitability analysis view",
        "query": """
        SELECT 
            KUNNR,
            GJAHR,
            EXTRACT(QUARTER FROM PARSE_DATE('%Y%m', CAST(PERIO AS STRING))) as quarter,
            SUM(VV001) as total_revenue,
            SUM(VV002) as total_cost,
            SUM(VV001 - VV002) as gross_profit,
            SUM(VV001 - VV002) / NULLIF(SUM(VV001), 0) * 100 as margin_percent,
            COUNT(DISTINCT MATNR) as product_count,
            COUNT(DISTINCT CONCAT(GJAHR, PERIO)) as active_periods
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR))
        GROUP BY 1,2,3
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["KUNNR", "GJAHR"]
    },
    
    "product_margin_analysis": {
        "name": "mv_copa_product_margins",
        "description": "Product margin analysis with YoY comparison",
        "query": """
        WITH current_year AS (
            SELECT 
                MATNR,
                MATKL,
                GJAHR,
                SUM(VV001) as revenue,
                SUM(VV002) as cogs,
                SUM(VV001 - VV002) as gross_margin,
                SUM(VV301) as cm1
            FROM `{project}.{dataset}.CE11000`
            WHERE GJAHR = EXTRACT(YEAR FROM CURRENT_DATE())
            GROUP BY 1,2,3
        ),
        previous_year AS (
            SELECT 
                MATNR,
                GJAHR,
                SUM(VV001) as revenue_ly,
                SUM(VV001 - VV002) as gross_margin_ly
            FROM `{project}.{dataset}.CE11000`
            WHERE GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) - 1
            GROUP BY 1,2
        )
        SELECT 
            c.*,
            p.revenue_ly,
            p.gross_margin_ly,
            (c.revenue - p.revenue_ly) / NULLIF(p.revenue_ly, 0) * 100 as revenue_growth,
            (c.gross_margin - p.gross_margin_ly) / NULLIF(p.gross_margin_ly, 0) * 100 as margin_growth
        FROM current_year c
        LEFT JOIN previous_year p ON c.MATNR = p.MATNR
        """,
        "cluster_by": ["MATNR", "MATKL"]
    },
    
    "sales_org_performance": {
        "name": "mv_copa_sales_org_perf",
        "description": "Sales organization performance metrics",
        "query": """
        SELECT 
            VKORG,
            VTWEG,
            SPART,
            GJAHR,
            PERIO,
            COUNT(DISTINCT KUNNR) as customer_count,
            COUNT(DISTINCT MATNR) as product_count,
            SUM(VV001) as total_revenue,
            SUM(VV002) as total_costs,
            SUM(VV001 - VV002) as gross_profit,
            SUM(VV001 - VV002) / NULLIF(SUM(VV001), 0) * 100 as margin_percent,
            SUM(VV301) as contribution_margin_1,
            SUM(VV302) as contribution_margin_2,
            COUNT(*) as transaction_count
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR))
        GROUP BY 1,2,3,4,5
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["VKORG", "GJAHR", "PERIO"]
    },
    
    "profit_center_analysis": {
        "name": "mv_copa_profit_center",
        "description": "Profit center performance analysis",
        "query": """
        SELECT 
            PRCTR,
            BUKRS,
            GJAHR,
            PERIO,
            SUM(VV001) as total_revenue,
            SUM(VV002) as direct_costs,
            SUM(VV100) as indirect_costs,
            SUM(VV001 - VV002 - VV100) as operating_profit,
            SUM(VV001 - VV002 - VV100) / NULLIF(SUM(VV001), 0) * 100 as operating_margin,
            COUNT(DISTINCT KUNNR) as customer_count,
            COUNT(DISTINCT MATNR) as product_count,
            COUNT(*) as transaction_count
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR))
        GROUP BY 1,2,3,4
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["PRCTR", "BUKRS", "GJAHR"]
    },
    
    "material_group_trends": {
        "name": "mv_copa_material_trends",
        "description": "Material group trends and seasonality analysis",
        "query": """
        SELECT 
            MATKL,
            GJAHR,
            PERIO,
            EXTRACT(QUARTER FROM PARSE_DATE('%Y%m', CAST(PERIO AS STRING))) as quarter,
            COUNT(DISTINCT MATNR) as product_count,
            SUM(VV001) as total_revenue,
            SUM(VV002) as total_costs,
            SUM(VV001 - VV002) as gross_profit,
            AVG(VV001 - VV002) as avg_profit_per_transaction,
            SUM(CASE WHEN VV001 > 0 THEN 1 ELSE 0 END) as revenue_transactions,
            COUNT(*) as total_transactions
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR))
        GROUP BY 1,2,3,4
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["MATKL", "GJAHR", "PERIO"]
    },
    
    "customer_product_matrix": {
        "name": "mv_copa_cust_prod_matrix",
        "description": "Customer-Product profitability matrix",
        "query": """
        SELECT 
            KUNNR,
            MATNR,
            MATKL,
            GJAHR,
            SUM(VV001) as total_revenue,
            SUM(VV002) as total_costs,
            SUM(VV001 - VV002) as gross_profit,
            SUM(VV001 - VV002) / NULLIF(SUM(VV001), 0) * 100 as margin_percent,
            COUNT(DISTINCT PERIO) as active_periods,
            SUM(ABSMG) as quantity_sold,
            COUNT(*) as transaction_count,
            MIN(PERIO) as first_period,
            MAX(PERIO) as last_period
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR))
        GROUP BY 1,2,3,4
        HAVING SUM(VV001) > 0
        """,
        "partition_by": "GJAHR",
        "cluster_by": ["KUNNR", "MATNR", "GJAHR"]
    },
    
    "daily_flash_report": {
        "name": "mv_copa_daily_flash",
        "description": "Daily flash report for current month performance",
        "query": """
        SELECT 
            CURRENT_DATE() as report_date,
            BUKRS,
            VKORG,
            SUM(CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) 
                     AND PERIO = EXTRACT(MONTH FROM CURRENT_DATE()) 
                THEN VV001 ELSE 0 END) as mtd_revenue,
            SUM(CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) 
                     AND PERIO = EXTRACT(MONTH FROM CURRENT_DATE()) 
                THEN VV001 - VV002 ELSE 0 END) as mtd_gross_profit,
            SUM(CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) - 1 
                     AND PERIO = EXTRACT(MONTH FROM CURRENT_DATE()) 
                THEN VV001 ELSE 0 END) as mtd_revenue_ly,
            SUM(CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) 
                THEN VV001 ELSE 0 END) as ytd_revenue,
            SUM(CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) 
                THEN VV001 - VV002 ELSE 0 END) as ytd_gross_profit,
            COUNT(DISTINCT CASE WHEN GJAHR = EXTRACT(YEAR FROM CURRENT_DATE()) 
                              AND PERIO = EXTRACT(MONTH FROM CURRENT_DATE()) 
                         THEN KUNNR END) as mtd_active_customers
        FROM `{project}.{dataset}.CE11000`
        WHERE GJAHR >= EXTRACT(YEAR FROM CURRENT_DATE()) - 1
        GROUP BY 1,2,3
        """,
        "cluster_by": ["BUKRS", "VKORG"],
        "refresh_interval_hours": 4  # Refresh 6 times per day
    }
}


def create_copa_standard_mvs(mv_manager: MaterializedViewManager, templates: List[str] = None) -> Dict[str, str]:
    """
    Create standard COPA materialized views.
    
    Args:
        mv_manager: MaterializedViewManager instance
        templates: List of template names to create (None = create all)
    
    Returns:
        Dict mapping template names to creation status
    """
    results = {}
    
    # If no specific templates requested, create all
    if templates is None:
        templates = list(COPA_MV_TEMPLATES.keys())
    
    for template_name in templates:
        if template_name not in COPA_MV_TEMPLATES:
            logger.warning(f"Unknown template: {template_name}")
            results[template_name] = "unknown_template"
            continue
        
        template = COPA_MV_TEMPLATES[template_name]
        
        # Format query with project and dataset
        formatted_query = template['query'].format(
            project=mv_manager.bq_client.project,
            dataset=mv_manager.bq_client.dataset
        )
        
        config = MaterializedViewConfig(
            name=template['name'],
            query=formatted_query,
            dataset=mv_manager.bq_client.dataset,
            project=mv_manager.bq_client.project,
            partition_by=template.get('partition_by'),
            cluster_by=template.get('cluster_by'),
            auto_refresh=True,
            refresh_interval_hours=template.get('refresh_interval_hours', 24),
            description=template['description']
        )
        
        try:
            mv_manager.create_materialized_view(config)
            logger.info(f"Created COPA MV: {template_name}")
            results[template_name] = "created"
        except Exception as e:
            logger.error(f"Failed to create COPA MV {template_name}: {e}")
            results[template_name] = f"error: {str(e)}"
    
    return results


def get_copa_mv_recommendations(table_name: str = "CE11000") -> List[Dict[str, str]]:
    """
    Get recommendations for which COPA MVs to create based on use case.
    
    Args:
        table_name: COPA table name (default: CE11000)
    
    Returns:
        List of recommendations with template names and descriptions
    """
    recommendations = [
        {
            "use_case": "Executive Dashboard",
            "templates": ["monthly_profitability", "daily_flash_report", "sales_org_performance"],
            "description": "High-level KPIs for executive reporting"
        },
        {
            "use_case": "Sales Analysis",
            "templates": ["customer_profitability", "sales_org_performance", "customer_product_matrix"],
            "description": "Customer and sales performance analysis"
        },
        {
            "use_case": "Product Management",
            "templates": ["product_margin_analysis", "material_group_trends", "customer_product_matrix"],
            "description": "Product profitability and trends"
        },
        {
            "use_case": "Financial Planning",
            "templates": ["profit_center_analysis", "monthly_profitability", "material_group_trends"],
            "description": "Financial planning and analysis"
        },
        {
            "use_case": "Operational Reporting",
            "templates": ["daily_flash_report", "sales_org_performance", "profit_center_analysis"],
            "description": "Day-to-day operational metrics"
        }
    ]
    
    return recommendations


def estimate_copa_mv_costs(mv_manager: MaterializedViewManager) -> Dict[str, Dict[str, float]]:
    """
    Estimate monthly costs for each COPA MV template.
    
    Args:
        mv_manager: MaterializedViewManager instance
    
    Returns:
        Dict mapping template names to cost estimates
    """
    cost_estimates = {}
    
    for template_name, template in COPA_MV_TEMPLATES.items():
        # Estimate based on typical COPA data volumes
        # These are rough estimates - actual costs depend on data volume
        
        if template_name == "daily_flash_report":
            # Refreshes 6x daily, smaller result set
            storage_gb = 0.5
            refresh_scans_tb = 0.05 * 6 * 30  # 6x daily * 30 days
        elif template_name in ["customer_product_matrix", "monthly_profitability"]:
            # Large detailed views
            storage_gb = 50
            refresh_scans_tb = 0.5 * 30  # Daily refresh
        elif template_name in ["customer_profitability", "product_margin_analysis"]:
            # Medium aggregated views
            storage_gb = 20
            refresh_scans_tb = 0.3 * 30
        else:
            # Other views
            storage_gb = 10
            refresh_scans_tb = 0.2 * 30
        
        # BigQuery costs: $0.02/GB storage, $5/TB scanned
        storage_cost = storage_gb * 0.02
        refresh_cost = refresh_scans_tb * 5
        
        cost_estimates[template_name] = {
            "storage_cost_usd": round(storage_cost, 2),
            "refresh_cost_usd": round(refresh_cost, 2),
            "total_monthly_cost_usd": round(storage_cost + refresh_cost, 2),
            "estimated_storage_gb": storage_gb,
            "estimated_monthly_scans_tb": round(refresh_scans_tb, 2)
        }
    
    return cost_estimates