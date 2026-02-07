"""
Proactive Pattern Templates for Enterprise Pulse
12 ERP-actionable detection patterns: 7 COPA + 5 STOX
Each template defines detection SQL, thresholds, simulation params, and ERP action configs.
"""

PROACTIVE_PATTERNS = {
    # ================================================================
    # COPA Profitability Patterns (BigQuery: arizona-poc.composite_demo)
    # ================================================================
    "copa_margin_erosion": {
        "id": "copa_margin_erosion",
        "name": "Margin Erosion Detection",
        "category": "copa",
        "description": "Detects product categories or customers with declining gross margins over consecutive periods.",
        "detection_tables": ["margin_by_product_category", "period_trend"],
        "detection_sql": """
            SELECT
                Product_Category,
                ROUND(AVG(Gross_Margin_Pct), 2) AS avg_margin,
                ROUND(MIN(Gross_Margin_Pct), 2) AS min_margin,
                COUNT(*) AS periods
            FROM `arizona-poc.composite_demo.margin_by_product_category`
            WHERE Gross_Margin_Pct < {threshold_margin_decline}
            GROUP BY Product_Category
            HAVING COUNT(*) >= 2
            ORDER BY avg_margin ASC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_margin_decline": 25},
        "recommendation_prompt": (
            "Analyze margin erosion for product category '{Product_Category}' "
            "with average margin {avg_margin}%. Recommend pricing adjustments "
            "considering cost trends and competitive positioning."
        ),
        "simulation_sql": """
            SELECT
                Product_Category,
                Gross_Margin_Pct AS current_margin,
                ROUND(Gross_Margin_Pct + {price_change_pct}, 2) AS projected_margin,
                ROUND(Net_Revenue * (1 + {price_change_pct}/100), 2) AS projected_revenue
            FROM `arizona-poc.composite_demo.margin_by_product_category`
            WHERE Gross_Margin_Pct < {threshold_margin_decline}
            ORDER BY Net_Revenue DESC
            LIMIT 10
        """,
        "simulation_params": {"price_change_pct": [3, 5, 7, 10]},
        "action_type": "price_adjustment",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_customer_contribution": {
        "id": "copa_customer_contribution",
        "name": "Customer Contribution Decline",
        "category": "copa",
        "description": "Identifies customers whose contribution margin has dropped below thresholds.",
        "detection_tables": ["customer_contribution"],
        "detection_sql": """
            SELECT
                Customer_Name,
                Customer_Number,
                ROUND(Contribution_Margin_Pct, 2) AS contribution_pct,
                ROUND(Net_Revenue, 2) AS revenue,
                ROUND(Contribution_Margin, 2) AS contribution
            FROM `arizona-poc.composite_demo.customer_contribution`
            WHERE Contribution_Margin_Pct < {threshold_contribution_pct}
            ORDER BY Net_Revenue DESC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_contribution_pct": 15},
        "recommendation_prompt": (
            "Customer '{Customer_Name}' has contribution margin of {contribution_pct}%. "
            "Recommend discount structure review considering customer lifetime value and segment."
        ),
        "simulation_sql": """
            SELECT
                Customer_Name,
                Contribution_Margin_Pct AS current_pct,
                ROUND(Contribution_Margin_Pct + {discount_reduction_pct}, 2) AS projected_pct,
                ROUND(Contribution_Margin * (1 + {discount_reduction_pct}/100), 2) AS projected_contribution
            FROM `arizona-poc.composite_demo.customer_contribution`
            WHERE Contribution_Margin_Pct < {threshold_contribution_pct}
            ORDER BY Net_Revenue DESC
            LIMIT 10
        """,
        "simulation_params": {"discount_reduction_pct": [2, 5, 8]},
        "action_type": "discount_review",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_discount_leakage": {
        "id": "copa_discount_leakage",
        "name": "Discount/Rebate Leakage",
        "category": "copa",
        "description": "Detects revenue leakage from excess discounts or rebate mismatches.",
        "detection_tables": ["discount_rebate_impact"],
        "detection_sql": """
            SELECT
                Product_Category,
                Customer_Segment,
                ROUND(Total_Discount_Amount, 2) AS discount_amount,
                ROUND(Discount_Pct, 2) AS discount_pct,
                ROUND(Rebate_Amount, 2) AS rebate_amount,
                ROUND(Net_Leakage, 2) AS leakage
            FROM `arizona-poc.composite_demo.discount_rebate_impact`
            WHERE Discount_Pct > {threshold_discount_pct}
            ORDER BY Net_Leakage DESC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_discount_pct": 12},
        "recommendation_prompt": (
            "Discount leakage of ${leakage} detected in '{Product_Category}' "
            "for segment '{Customer_Segment}'. Recommend rebate recalculation."
        ),
        "simulation_sql": """
            SELECT
                Product_Category,
                Discount_Pct AS current_discount,
                ROUND(Discount_Pct - {correction_pct}, 2) AS corrected_discount,
                ROUND(Net_Leakage * {correction_pct} / Discount_Pct, 2) AS recovered_revenue
            FROM `arizona-poc.composite_demo.discount_rebate_impact`
            WHERE Discount_Pct > {threshold_discount_pct}
            ORDER BY Net_Leakage DESC
            LIMIT 10
        """,
        "simulation_params": {"correction_pct": [2, 4, 6]},
        "action_type": "rebate_recalculation",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_cost_variance": {
        "id": "copa_cost_variance",
        "name": "Cost Variance Spike",
        "category": "copa",
        "description": "Alerts on significant plan-vs-actual cost variances.",
        "detection_tables": ["cost_variance_analysis"],
        "detection_sql": """
            SELECT
                Cost_Element,
                Cost_Center,
                ROUND(Plan_Amount, 2) AS plan_amount,
                ROUND(Actual_Amount, 2) AS actual_amount,
                ROUND(Variance_Amount, 2) AS variance,
                ROUND(Variance_Pct, 2) AS variance_pct
            FROM `arizona-poc.composite_demo.cost_variance_analysis`
            WHERE ABS(Variance_Pct) > {threshold_variance_pct}
            ORDER BY ABS(Variance_Amount) DESC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_variance_pct": 10},
        "recommendation_prompt": (
            "Cost variance of {variance_pct}% detected at cost center '{Cost_Center}' "
            "for element '{Cost_Element}'. Investigate root cause and recommend corrective action."
        ),
        "simulation_sql": """
            SELECT
                Cost_Element,
                Variance_Pct AS current_variance,
                ROUND(Actual_Amount * (1 - {reduction_pct}/100), 2) AS projected_actual,
                ROUND(Variance_Amount * (1 - {reduction_pct}/100), 2) AS projected_variance
            FROM `arizona-poc.composite_demo.cost_variance_analysis`
            WHERE ABS(Variance_Pct) > {threshold_variance_pct}
            ORDER BY ABS(Variance_Amount) DESC
            LIMIT 10
        """,
        "simulation_params": {"reduction_pct": [5, 10, 15]},
        "action_type": "variance_investigation",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_supplier_degradation": {
        "id": "copa_supplier_degradation",
        "name": "Supplier Performance Degradation",
        "category": "copa",
        "description": "Monitors supplier delivery performance and cost compliance trends.",
        "detection_tables": ["supplier_performance"],
        "detection_sql": """
            SELECT
                Supplier_Name,
                Supplier_Number,
                ROUND(On_Time_Delivery_Pct, 2) AS otd_pct,
                ROUND(Quality_Score, 2) AS quality,
                ROUND(Cost_Compliance_Pct, 2) AS cost_compliance,
                Total_PO_Count
            FROM `arizona-poc.composite_demo.supplier_performance`
            WHERE On_Time_Delivery_Pct < {threshold_otd_pct}
               OR Quality_Score < {threshold_quality}
            ORDER BY On_Time_Delivery_Pct ASC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_otd_pct": 85, "threshold_quality": 80},
        "recommendation_prompt": (
            "Supplier '{Supplier_Name}' OTD at {otd_pct}%, quality at {quality}. "
            "Recommend vendor scorecard update and potential alternative sourcing."
        ),
        "simulation_sql": """
            SELECT
                Supplier_Name,
                On_Time_Delivery_Pct AS current_otd,
                Quality_Score AS current_quality,
                Total_PO_Count,
                ROUND(Total_PO_Count * (100 - On_Time_Delivery_Pct) / 100, 0) AS delayed_pos
            FROM `arizona-poc.composite_demo.supplier_performance`
            WHERE On_Time_Delivery_Pct < {threshold_otd_pct}
            ORDER BY Total_PO_Count DESC
            LIMIT 10
        """,
        "simulation_params": {},
        "action_type": "vendor_scorecard_update",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_contract_profitability": {
        "id": "copa_contract_profitability",
        "name": "Contract Profitability Alert",
        "category": "copa",
        "description": "Flags contracts where actual profitability deviates from plan.",
        "detection_tables": ["contract_profitability"],
        "detection_sql": """
            SELECT
                Contract_Number,
                Customer_Name,
                ROUND(Plan_Margin_Pct, 2) AS plan_margin,
                ROUND(Actual_Margin_Pct, 2) AS actual_margin,
                ROUND(Plan_Margin_Pct - Actual_Margin_Pct, 2) AS margin_gap,
                ROUND(Contract_Value, 2) AS contract_value
            FROM `arizona-poc.composite_demo.contract_profitability`
            WHERE (Plan_Margin_Pct - Actual_Margin_Pct) > {threshold_margin_gap}
            ORDER BY Contract_Value DESC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_margin_gap": 5},
        "recommendation_prompt": (
            "Contract '{Contract_Number}' for '{Customer_Name}' has {margin_gap}% margin gap. "
            "Plan: {plan_margin}%, Actual: {actual_margin}%. Recommend renegotiation review."
        ),
        "simulation_sql": """
            SELECT
                Contract_Number,
                Actual_Margin_Pct AS current_margin,
                ROUND(Actual_Margin_Pct + {improvement_pct}, 2) AS projected_margin,
                ROUND(Contract_Value * {improvement_pct} / 100, 2) AS recovered_value
            FROM `arizona-poc.composite_demo.contract_profitability`
            WHERE (Plan_Margin_Pct - Actual_Margin_Pct) > {threshold_margin_gap}
            ORDER BY Contract_Value DESC
            LIMIT 10
        """,
        "simulation_params": {"improvement_pct": [2, 4, 6]},
        "action_type": "renegotiation_flag",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "copa_regional_shift": {
        "id": "copa_regional_shift",
        "name": "Regional Profitability Shift",
        "category": "copa",
        "description": "Detects significant profitability changes across regions including freight.",
        "detection_tables": ["freight_by_region"],
        "detection_sql": """
            SELECT
                Region,
                ROUND(Net_Revenue, 2) AS revenue,
                ROUND(Freight_Cost, 2) AS freight,
                ROUND(Freight_Pct_of_Revenue, 2) AS freight_pct,
                ROUND(Net_Margin_After_Freight, 2) AS net_margin
            FROM `arizona-poc.composite_demo.freight_by_region`
            WHERE Freight_Pct_of_Revenue > {threshold_freight_pct}
            ORDER BY Net_Revenue DESC
            LIMIT 20
        """,
        "default_thresholds": {"threshold_freight_pct": 8},
        "recommendation_prompt": (
            "Region '{Region}' has freight at {freight_pct}% of revenue. "
            "Net margin after freight: {net_margin}. Recommend regional pricing review."
        ),
        "simulation_sql": """
            SELECT
                Region,
                Freight_Pct_of_Revenue AS current_freight_pct,
                ROUND(Freight_Cost * (1 - {freight_reduction_pct}/100), 2) AS optimized_freight,
                ROUND(Net_Margin_After_Freight + Freight_Cost * {freight_reduction_pct}/100, 2) AS projected_margin
            FROM `arizona-poc.composite_demo.freight_by_region`
            WHERE Freight_Pct_of_Revenue > {threshold_freight_pct}
            ORDER BY Net_Revenue DESC
            LIMIT 10
        """,
        "simulation_params": {"freight_reduction_pct": [5, 10, 15]},
        "action_type": "regional_pricing_review",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    # ================================================================
    # STOX Supply Chain Patterns
    # ================================================================
    "stox_stockout_risk": {
        "id": "stox_stockout_risk",
        "name": "Stockout Risk",
        "category": "stox",
        "description": "Monitors safety stock levels and demand velocity to predict stockouts.",
        "detection_tables": [],
        "detection_sql": """
            -- STOX detection runs against inventory health metrics
            -- Placeholder: actual STOX data comes from separate inventory system
            SELECT 'stockout_risk' AS pattern, 'Simulated STOX detection' AS note
        """,
        "default_thresholds": {"threshold_days_cover": 5},
        "recommendation_prompt": "Stockout risk detected. Recommend expedited purchase order.",
        "simulation_sql": "SELECT 'stockout_simulation' AS pattern",
        "simulation_params": {"reorder_qty_multiplier": [1.0, 1.5, 2.0]},
        "action_type": "create_po",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "stox_excess_inventory": {
        "id": "stox_excess_inventory",
        "name": "Excess Inventory",
        "category": "stox",
        "description": "Identifies SKUs with coverage days exceeding thresholds.",
        "detection_tables": [],
        "detection_sql": """
            SELECT 'excess_inventory' AS pattern, 'Simulated STOX detection' AS note
        """,
        "default_thresholds": {"threshold_coverage_days": 60},
        "recommendation_prompt": "Excess inventory detected. Recommend rebalance or transfer.",
        "simulation_sql": "SELECT 'excess_simulation' AS pattern",
        "simulation_params": {"transfer_pct": [25, 50, 75]},
        "action_type": "rebalance_transfer",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "stox_demand_shift": {
        "id": "stox_demand_shift",
        "name": "Demand Shift Detection",
        "category": "stox",
        "description": "Detects deviations between forecasted and actual demand.",
        "detection_tables": [],
        "detection_sql": """
            SELECT 'demand_shift' AS pattern, 'Simulated STOX detection' AS note
        """,
        "default_thresholds": {"threshold_deviation_pct": 15},
        "recommendation_prompt": "Demand shift detected. Recommend MRP parameter update.",
        "simulation_sql": "SELECT 'demand_simulation' AS pattern",
        "simulation_params": {"forecast_adjustment_pct": [5, 10, 20]},
        "action_type": "mrp_update",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "stox_lead_time_risk": {
        "id": "stox_lead_time_risk",
        "name": "Lead Time Risk",
        "category": "stox",
        "description": "Monitors supplier OTD trends to predict lead time deviations.",
        "detection_tables": [],
        "detection_sql": """
            SELECT 'lead_time_risk' AS pattern, 'Simulated STOX detection' AS note
        """,
        "default_thresholds": {"threshold_otd_pct": 80},
        "recommendation_prompt": "Lead time risk detected. Recommend expedite request.",
        "simulation_sql": "SELECT 'lead_time_simulation' AS pattern",
        "simulation_params": {},
        "action_type": "expedite",
        "action_target": "command_tower",
        "requires_approval": True,
    },

    "stox_mrp_optimization": {
        "id": "stox_mrp_optimization",
        "name": "MRP Parameter Optimization",
        "category": "stox",
        "description": "Recommends safety stock, reorder point, and lot size adjustments.",
        "detection_tables": [],
        "detection_sql": """
            SELECT 'mrp_optimization' AS pattern, 'Simulated STOX detection' AS note
        """,
        "default_thresholds": {"threshold_service_level": 95},
        "recommendation_prompt": "MRP parameters sub-optimal. Recommend parameter update.",
        "simulation_sql": "SELECT 'mrp_simulation' AS pattern",
        "simulation_params": {"safety_stock_multiplier": [1.0, 1.2, 1.5]},
        "action_type": "parameter_update",
        "action_target": "command_tower",
        "requires_approval": True,
    },
}


def get_all_patterns():
    """Return all 12 pattern templates."""
    return list(PROACTIVE_PATTERNS.values())


def get_pattern(pattern_id: str):
    """Return a single pattern template by ID."""
    return PROACTIVE_PATTERNS.get(pattern_id)


def get_patterns_by_category(category: str):
    """Return patterns filtered by category (copa/stox)."""
    return [p for p in PROACTIVE_PATTERNS.values() if p["category"] == category]
