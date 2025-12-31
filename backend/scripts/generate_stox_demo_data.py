#!/usr/bin/env python3
"""
Generate synthetic demo data for STOX.AI tiles and load into BigQuery.
Uses real Material_Numbers from existing sales data for consistency.
"""

import random
import json
from datetime import date, datetime, timedelta
from google.cloud import bigquery
from google.auth import default

# Initialize BigQuery client
credentials, project = default()
client = bigquery.Client(project='arizona-poc', credentials=credentials)
DATASET = 'copa_export_copa_data_000000000000'

# Master data extracted from BigQuery
MATERIALS = [
    ("1001420", "AZ LEMON TEA NP 24PK 22OZ CAN", "24CAN23NP"),
    ("1004022", "AZ MUCHO MANGO 4PK GALLON", "04PPL128"),
    ("1104722", "AZ MANGO NP 4/6PK 20OZ TALLBOY PECO", "24PET20NP"),
    ("1107380", "AZ AP BLACK 12PK 22OZ CAN CUBE PECO", "12CAN23QB"),
    ("1101758", "AZ FRUIT PUNCH 12PK 11OZ CAN SUITCS PECO", "12CAN11.5"),
    ("1003608", "AZ GREEN TEA $1 24PK 20OZ TALLBOY", "24PET20"),
    ("1008641", "AZ FRUIT SNACKS GREEN TEA 10-10PK 0.9OZ", "10PAC0.9"),
    ("1001581", "AZ HARD VARIETY 2-12PK 12OZ CAN 6/3/3", "24SLK12"),
    ("1001763", "AZ GREEN TEA 12PK 11.5OZ CAN SLEEK", "12CAN11.5"),
    ("1001789", "AZ MIX PLT AP/SW/L/G/ZG 12PK 11.5OZ CAN", "01CAN11.5"),
    ("1008620", "AZ FRUIT SNACKS MIX FRT 72CT 5OZ DISPLAY", "72PAC5"),
    ("2012791", "AZ BLACK TEA CONCENTRATE LB90376", "FLAVOR"),
    ("1005160", "AZ GOOD BREW ARNOLD PALMER 6PK 59OZ PET", "06PET59"),
    ("1001642", "AZ GRAPE LIME RICKEY 24PK 23.5OZ CAN", "24CAN23.5"),
    ("1008644", "AZ FRUIT SNACKS SOUR WTRMLN 10-10PK 0.9", "10PAC0.9"),
    ("1008643", "AZ FRUIT SNACKS SOUR 10-10PK 0.9OZ", "10PAC0.9"),
    ("1008604", "AZ FRUIT SNACKS SOUR WTRMLN 12PK 5OZ BAG", "12PAC5"),
    ("1105694", "AZ WATERMELON BIL 24PK 458ML CAN PECO", "24CAN458"),
    ("1004415", "AZ GB STRAWBERRY RS 20PK 16.9OZ PET", "20PET16.9"),
    ("2011824", "AZ BASE KIWI STRAWBERRY EJO 33545", "FLAVOR"),
    ("2012705", "AP SPIKED HALF & HALF PREMIX 33442", "FLAVOR"),
    ("1105939", "AZ GREEN TEA 8PK 59OZ PET CIRCLE K PECO", "08PET59"),
    ("1001650", "AZ LEMON TEA 24PK 15.5OZ CAN", "24CAN15.5"),
    ("1105791", "AZ SWEET TEA 6PK 59OZ PET CIRCLE K PECO", "06PET59"),
    ("1103905", "AZ DIET VARIETY 24PK 20OZ TALLBOY PECO", "24PET20NP"),
    ("1001904", "AZ WATERMELON C600 12PK 458ML CAN", "12CAN458"),
    ("1104062", "AZ FRUIT PUNCH 4PK GALLON PECO", "04PPL128"),
    ("1101782", "AZ LEMON 12PK 11.5OZ CAN SUITCASE PECO", "12CAN11.5"),
    ("1105628", "AZ FRT PNCH BIL NP 24PK 680ML CAN PECO", "24CAN680"),
    ("1003711", "AZ SWEET TEA NP 4/6PK 20OZ TALLBOY PECO", "24PET20NP"),
    ("2012102", "AZ MUCHO MANGO WATER ENHANCER 54458", "L002"),
    ("1003971", "AZ SWEET TEA NP 12PK 20OZ TALLBOY", "12PET20"),
    ("1003507", "AZ RASPBERRY TEA 24/20OZ PET", "24PET20GT"),
    ("1004063", "AZ GREEN TEA 4PK GALLON", "04PPL128"),
    ("1006025", "AZ VAPOR WATER 24PK 710ML PET", "24PET750"),
    ("1005708", "AZ FRUIT PUNCH 6PK 59OZ PET", "06PET59"),
    ("1105684", "AZ WATRMN BIL NP 24PK 680ML CAN CK PECO", "24CAN680"),
    ("1002684", "AZ ENERGY WATERMELON 12PK 15.5OZ CAN", "12CAN15.5"),
    ("1002583", "AZ GREEN NP 12PK 22OZ CAN CUBE", "12CAN23QB"),
    ("1104002", "AZ DSPL PLT GAL MUCHO MANGO 50CS PECO", "01PPL128"),
    ("2012302", "AZ BASE SANTA FE MANGO H33634", "L00201"),
    ("1101763", "AZ GREEN TEA 12PK 11.5OZ CAN SLEEK PECO", "12SLK11.5"),
    ("1004604", "AZ JUICE VARIETY 24PK 20OZ TALLBOY", "24PET20NP"),
    ("1006066", "AZ SW BLACK RASPBERRY 3/8PK 12OZ CAN", "24CAN12"),
    ("1003903", "AZ DIET RASPBERRY NP 24PK 20OZ TALLBOY", "24PET20NP"),
    ("2011543", "AZ PRMX AP PEACH LEMONADE 24071", "FLAVOR"),
    ("1008615", "AZ FRUIT SNACKS MIX FRT 36CT 5OZ DISPLAY", "36PAC5"),
    ("1101784", "AZ DIET AP 12PK 11.5OZ CAN SUITCASE PECO", "12CAN11.5"),
    ("1002895", "AZ WELCH'S STRWBRY SODA 24PK 23.5OZ CAN", "24CAN23.5"),
    ("1001561", "HB WINTERSTERN 6-4PK 500ML CAN", "24CAN500"),
]

PLANTS = [
    ("SADDLE_CREEK_CA", "Saddle Creek, Buena Park CA", "West"),
    ("REFRESCO_WA", "Refresco Bev. Inc., WA", "Northwest"),
    ("TAMPICO_TX", "Tampico Bottling Company", "Southwest"),
    ("KNOUSE_PA", "Knouse Foods, Biglerville", "Northeast"),
    ("POLAR_GA", "Polar Beverages, Douglas", "Southeast"),
    ("DRINKPAK_CA", "DrinkPak LLC", "West"),
    ("SWORX_CA", "SWorx Bottling Group", "West"),
    ("NIAGARA_CA", "Niagara Bottling, CA", "West"),
    ("ARIZONA_MX", "Arizona South America LLC", "Mexico"),
    ("KNOUSE_OR", "Knouse Foods, Orrtanna", "Northeast"),
]

SUPPLIERS = [
    ("VND001", "Pacific Ingredients Co."),
    ("VND002", "Midwest Packaging Solutions"),
    ("VND003", "Southwest Beverage Supplies"),
    ("VND004", "Eastern Distribution Partners"),
]

ABC_DISTRIBUTION = {"A": 0.20, "B": 0.30, "C": 0.50}  # 80/20 rule
XYZ_DISTRIBUTION = {"X": 0.30, "Y": 0.40, "Z": 0.30}
PATTERNS = ["Stable", "Seasonal", "Trending", "Intermittent", "Erratic"]
HEALTH_STATUSES = ["Critical", "AtRisk", "Good", "Excellent"]
RISK_LEVELS = ["Low", "Medium", "High"]
RECOMMENDATION_STATUSES = ["Pending", "Approved", "Rejected", "Implemented"]
CHANGE_TYPES = ["Safety Stock", "Reorder Point", "Lot Size", "Lead Time", "Supplier"]
CATEGORIES = ["Safety Stock", "Lot Size", "Excess/Obsolete", "Pipeline Stock", "Terms"]
INITIATIVE_STATUSES = ["Planned", "In Progress", "Completed"]
MODELS = ["SES", "Holt-Winters", "Croston", "SARIMA", "Ensemble"]
ACCURACY_RATINGS = ["Excellent", "Good", "Fair", "Poor"]

def assign_abc_class(index, total):
    """Assign ABC class based on 80/20 rule"""
    if index < total * 0.20:
        return "A"
    elif index < total * 0.50:
        return "B"
    else:
        return "C"

def assign_xyz_class():
    """Assign XYZ class randomly based on distribution"""
    r = random.random()
    if r < 0.30:
        return "X"
    elif r < 0.70:
        return "Y"
    else:
        return "Z"

def generate_inventory_wc_baseline():
    """Generate Working Capital baseline data for 50 SKUs x 10 plants = 500 rows"""
    rows = []
    today = date.today()

    for idx, (mat_id, mat_name, category) in enumerate(MATERIALS):
        abc_class = assign_abc_class(idx, len(MATERIALS))

        for plant_id, plant_name, region in PLANTS:
            # Base metrics vary by ABC class
            if abc_class == "A":
                daily_demand = random.uniform(100, 500)
                unit_cost = random.uniform(5, 25)
                gross_margin = random.uniform(0.35, 0.50)
            elif abc_class == "B":
                daily_demand = random.uniform(30, 150)
                unit_cost = random.uniform(3, 15)
                gross_margin = random.uniform(0.25, 0.40)
            else:
                daily_demand = random.uniform(5, 50)
                unit_cost = random.uniform(1, 10)
                gross_margin = random.uniform(0.15, 0.30)

            lead_time = random.randint(7, 21)
            service_level = random.uniform(0.95, 0.99)
            xyz_class = assign_xyz_class()

            # Calculate inventory components
            lot_size = daily_demand * random.uniform(14, 35)  # 2-5 weeks
            cycle_stock = lot_size / 2

            # Safety stock based on service level and variability
            z_score = 1.65 if service_level >= 0.95 else 1.28
            demand_std = daily_demand * random.uniform(0.15, 0.40)
            safety_stock = z_score * demand_std * (lead_time ** 0.5)

            pipeline_stock = lead_time * daily_demand

            # Excess stock - some items have significant excess
            excess_pct = random.choice([0, 0, 0, 0.1, 0.2, 0.3, 0.5])  # Most have none
            on_hand = cycle_stock + safety_stock + pipeline_stock
            excess_stock = on_hand * excess_pct
            on_hand += excess_stock

            total_wc = on_hand * unit_cost

            # Health status based on excess
            if excess_pct > 0.3:
                health_status = "Critical"
            elif excess_pct > 0.1:
                health_status = "AtRisk"
            elif excess_pct > 0:
                health_status = "Good"
            else:
                health_status = "Excellent"

            # Calculate WCP and DIO
            annual_gm = daily_demand * 365 * unit_cost * gross_margin
            wcp = annual_gm / total_wc if total_wc > 0 else 0
            annual_cogs = daily_demand * 365 * unit_cost * (1 - gross_margin)
            dio = int((total_wc / annual_cogs) * 365) if annual_cogs > 0 else 0
            inv_turns = 365 / dio if dio > 0 else 0

            # Savings opportunity
            savings_opp = excess_stock * unit_cost * 0.8  # 80% of excess value
            carrying_savings = savings_opp * 0.22  # 22% carrying cost

            rows.append({
                "record_id": f"{mat_id}_{plant_id}",
                "sku_id": mat_id,
                "sku_name": mat_name,
                "plant_id": plant_id,
                "plant_name": plant_name,
                "category": category,
                "on_hand_qty": round(on_hand, 2),
                "cycle_stock_qty": round(cycle_stock, 2),
                "safety_stock_qty": round(safety_stock, 2),
                "pipeline_stock_qty": round(pipeline_stock, 2),
                "excess_stock_qty": round(excess_stock, 2),
                "unit_cost": round(unit_cost, 2),
                "total_wc_value": round(total_wc, 2),
                "cycle_stock_value": round(cycle_stock * unit_cost, 2),
                "safety_stock_value": round(safety_stock * unit_cost, 2),
                "pipeline_stock_value": round(pipeline_stock * unit_cost, 2),
                "excess_stock_value": round(excess_stock * unit_cost, 2),
                "daily_demand": round(daily_demand, 2),
                "lead_time_days": lead_time,
                "service_level": round(service_level, 4),
                "wcp": round(wcp, 2),
                "dio": dio,
                "inventory_turns": round(inv_turns, 2),
                "gross_margin_pct": round(gross_margin, 4),
                "wc_savings_opportunity": round(savings_opp, 2),
                "carrying_cost_savings": round(carrying_savings, 2),
                "health_status": health_status,
                "abc_class": abc_class,
                "xyz_class": xyz_class,
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_inventory_health():
    """Generate inventory health data"""
    rows = []
    today = date.today()

    for idx, (mat_id, mat_name, category) in enumerate(MATERIALS):
        abc_class = assign_abc_class(idx, len(MATERIALS))

        for plant_id, plant_name, region in PLANTS:
            stock_qty = random.uniform(100, 5000)
            unit_cost = random.uniform(2, 20)
            stock_value = stock_qty * unit_cost

            age_days = random.choice([15, 30, 45, 60, 90, 120, 180, 270])
            days_on_hand = random.randint(10, 90)
            coverage_months = days_on_hand / 30

            # Health score inversely related to age
            base_score = 100 - (age_days / 3)
            health_score = max(10, min(100, int(base_score + random.randint(-15, 15))))

            if health_score < 40:
                risk_level = "High"
                excess_pct = random.uniform(0.3, 0.6)
            elif health_score < 70:
                risk_level = "Medium"
                excess_pct = random.uniform(0.1, 0.3)
            else:
                risk_level = "Low"
                excess_pct = random.uniform(0, 0.1)

            excess_qty = stock_qty * excess_pct
            excess_value = excess_qty * unit_cost
            writeoff_risk = excess_pct * random.uniform(0.3, 0.8)

            actions = ["Monitor", "Review", "Liquidate", "Transfer", "Markdown", "Hold"]
            if risk_level == "High":
                action = random.choice(["Liquidate", "Markdown", "Transfer"])
            elif risk_level == "Medium":
                action = random.choice(["Review", "Transfer", "Monitor"])
            else:
                action = random.choice(["Monitor", "Hold"])

            rows.append({
                "material_id": mat_id,
                "material_name": mat_name,
                "plant_id": plant_id,
                "category": category,
                "stock_qty": round(stock_qty, 2),
                "stock_value": round(stock_value, 2),
                "age_days": age_days,
                "days_on_hand": days_on_hand,
                "coverage_months": round(coverage_months, 2),
                "health_score": health_score,
                "excess_qty": round(excess_qty, 2),
                "excess_value": round(excess_value, 2),
                "risk_level": risk_level,
                "writeoff_risk_pct": round(writeoff_risk, 4),
                "abc_class": abc_class,
                "xyz_class": assign_xyz_class(),
                "recommended_action": action,
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_mrp_parameters():
    """Generate MRP parameter data"""
    rows = []
    today = date.today()

    for idx, (mat_id, mat_name, category) in enumerate(MATERIALS):
        abc_class = assign_abc_class(idx, len(MATERIALS))

        for plant_id, plant_name, region in PLANTS:
            lead_time = random.randint(7, 21)
            demand_var = random.uniform(0.15, 0.45)
            supply_var = random.uniform(0.10, 0.30)
            service_target = random.choice([0.95, 0.97, 0.98, 0.99])

            # Current parameters (suboptimal)
            current_ss = random.uniform(50, 300)
            current_rop = current_ss + random.uniform(100, 500)
            current_lot = random.uniform(200, 1000)

            # Optimal parameters (calculated)
            z_score = 1.65 if service_target >= 0.95 else 1.28
            optimal_ss = current_ss * random.uniform(0.7, 1.1)  # Could be lower or higher
            optimal_rop = optimal_ss + lead_time * random.uniform(10, 50)

            # EOQ calculation
            ordering_cost = random.uniform(50, 200)
            holding_pct = random.uniform(0.18, 0.28)
            annual_demand = random.uniform(5000, 50000)
            unit_cost = random.uniform(2, 20)
            eoq = ((2 * annual_demand * ordering_cost) / (holding_pct * unit_cost)) ** 0.5
            optimal_lot = eoq

            # Savings potential
            ss_diff = current_ss - optimal_ss
            savings = max(0, ss_diff * unit_cost * 0.22)  # Carrying cost savings

            stockout_risk = random.uniform(0.01, 0.10) if optimal_ss < current_ss else random.uniform(0.005, 0.03)

            rows.append({
                "material_id": mat_id,
                "plant_id": plant_id,
                "mrp_type": random.choice(["PD", "VB", "VV", "ND"]),
                "abc_class": abc_class,
                "current_safety_stock": round(current_ss, 2),
                "current_reorder_point": round(current_rop, 2),
                "current_lot_size": round(current_lot, 2),
                "optimal_safety_stock": round(optimal_ss, 2),
                "optimal_reorder_point": round(optimal_rop, 2),
                "optimal_lot_size": round(optimal_lot, 2),
                "lead_time_days": lead_time,
                "demand_variability": round(demand_var, 4),
                "supply_variability": round(supply_var, 4),
                "service_level_target": service_target,
                "stockout_risk_pct": round(stockout_risk, 4),
                "savings_potential": round(savings, 2),
                "ordering_cost": round(ordering_cost, 2),
                "holding_cost_pct": round(holding_pct, 4),
                "eoq": round(eoq, 2),
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_supplier_lead_times():
    """Generate supplier lead time data"""
    rows = []
    today = date.today()

    for mat_id, mat_name, category in MATERIALS:
        for plant_id, plant_name, region in PLANTS[:4]:  # Only 4 plants per material
            vendor = random.choice(SUPPLIERS)

            planned_lt = random.randint(7, 21)
            actual_avg = planned_lt + random.uniform(-3, 5)
            lt_stddev = random.uniform(1, 4)
            lt_p50 = actual_avg - random.uniform(0, 2)
            lt_p90 = actual_avg + lt_stddev * 1.28

            otd_pct = random.uniform(0.70, 0.98)
            reliability_score = int(otd_pct * 100)

            if otd_pct >= 0.95:
                risk_level = "Low"
            elif otd_pct >= 0.85:
                risk_level = "Medium"
            else:
                risk_level = "High"

            orders = random.randint(50, 200)
            on_time = int(orders * otd_pct)
            early = int(orders * random.uniform(0.05, 0.15))
            late = orders - on_time - early

            ss_adj = (actual_avg - planned_lt) * random.uniform(5, 15)
            predicted_lt = actual_avg + random.uniform(-1, 1)
            trend = random.choice(["Improving", "Stable", "Degrading"])

            rows.append({
                "material_id": mat_id,
                "plant_id": plant_id,
                "vendor_id": vendor[0],
                "vendor_name": vendor[1],
                "planned_lead_time": planned_lt,
                "actual_lead_time_avg": round(actual_avg, 2),
                "lead_time_stddev": round(lt_stddev, 2),
                "lead_time_p50": round(lt_p50, 2),
                "lead_time_p90": round(lt_p90, 2),
                "on_time_delivery_pct": round(otd_pct, 4),
                "reliability_score": reliability_score,
                "risk_level": risk_level,
                "orders_analyzed": orders,
                "early_count": early,
                "on_time_count": on_time,
                "late_count": late,
                "safety_stock_adjustment": round(ss_adj, 2),
                "predicted_lead_time": round(predicted_lt, 2),
                "trend": trend,
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_recommendations():
    """Generate optimization recommendations"""
    rows = []
    today = date.today()

    titles = [
        "Reduce Safety Stock - {} at {}",
        "Optimize Lot Size - {} at {}",
        "Switch Supplier for {} at {}",
        "Reduce Lead Time - {} at {}",
        "Liquidate Excess - {} at {}",
        "Increase Reorder Point - {} at {}",
        "Consignment Conversion - {} at {}",
        "Terms Extension - {} at {}",
    ]

    for i in range(50):
        mat = random.choice(MATERIALS)
        plant = random.choice(PLANTS)
        title_template = random.choice(titles)

        change_type = random.choice(CHANGE_TYPES)
        current_val = random.uniform(50, 500)
        recommended_val = current_val * random.uniform(0.6, 0.9)

        confidence = random.uniform(0.65, 0.98)
        impact = random.uniform(0.3, 1.0)

        delta_wc = (current_val - recommended_val) * random.uniform(10, 50)
        carrying_savings = delta_wc * 0.22
        cash_months = random.randint(1, 6)
        service_risk = random.uniform(0.005, 0.05)

        status = random.choices(RECOMMENDATION_STATUSES, weights=[0.5, 0.25, 0.1, 0.15])[0]
        created = today - timedelta(days=random.randint(1, 30))
        approved = created + timedelta(days=random.randint(1, 7)) if status != "Pending" else None
        implemented = approved + timedelta(days=random.randint(1, 14)) if status == "Implemented" else None

        rows.append({
            "recommendation_id": f"REC-{i+1:04d}",
            "title": title_template.format(mat[1][:30], plant[1][:20]),
            "category": random.choice(CATEGORIES),
            "priority": random.choice(["High", "Medium", "Low"]),
            "change_type": change_type,
            "material_id": mat[0],
            "plant_id": plant[0],
            "current_value": round(current_val, 2),
            "recommended_value": round(recommended_val, 2),
            "confidence_score": round(confidence, 4),
            "impact_score": round(impact, 4),
            "delta_wc": round(delta_wc, 2),
            "carrying_cost_savings": round(carrying_savings, 2),
            "cash_release_months": cash_months,
            "service_risk_pct": round(service_risk, 4),
            "status": status,
            "created_date": created.isoformat(),
            "approved_date": approved.isoformat() if approved else None,
            "implemented_date": implemented.isoformat() if implemented else None,
            "approved_by": "System" if approved else None,
        })

    return rows

def generate_demand_patterns():
    """Generate demand pattern data"""
    rows = []
    today = date.today()

    for idx, (mat_id, mat_name, category) in enumerate(MATERIALS):
        abc_class = assign_abc_class(idx, len(MATERIALS))

        for plant_id, plant_name, region in PLANTS:
            if abc_class == "A":
                avg_demand = random.uniform(100, 500)
            elif abc_class == "B":
                avg_demand = random.uniform(30, 150)
            else:
                avg_demand = random.uniform(5, 50)

            pattern = random.choice(PATTERNS)

            if pattern == "Stable":
                cv = random.uniform(0.10, 0.25)
                peak_mult = 1.3
            elif pattern == "Seasonal":
                cv = random.uniform(0.30, 0.50)
                peak_mult = 2.0
            elif pattern == "Trending":
                cv = random.uniform(0.20, 0.35)
                peak_mult = 1.5
            elif pattern == "Intermittent":
                cv = random.uniform(0.50, 1.00)
                peak_mult = 3.0
            else:  # Erratic
                cv = random.uniform(0.60, 1.20)
                peak_mult = 4.0

            demand_std = avg_demand * cv
            peak = avg_demand * peak_mult
            min_demand = max(0, avg_demand * random.uniform(0.2, 0.5))

            adi = random.uniform(1, 5) if pattern not in ["Intermittent", "Erratic"] else random.uniform(5, 20)

            trend = random.choice(["Up", "Down", "Flat"])
            seasonality = random.uniform(0.8, 1.5) if pattern == "Seasonal" else 1.0

            anomaly_count = random.randint(0, 5)
            risk_score = cv * 0.5 + (anomaly_count * 0.1)
            supply_risk = random.uniform(0.1, 0.4)
            demand_risk = cv * 0.8

            rows.append({
                "material_id": mat_id,
                "material_name": mat_name,
                "plant_id": plant_id,
                "avg_daily_demand": round(avg_demand, 2),
                "peak_demand": round(peak, 2),
                "min_demand": round(min_demand, 2),
                "demand_stddev": round(demand_std, 2),
                "coefficient_of_variation": round(cv, 4),
                "adi": round(adi, 2),
                "pattern": pattern,
                "abc_class": abc_class,
                "xyz_class": assign_xyz_class(),
                "trend_direction": trend,
                "seasonality_index": round(seasonality, 2),
                "anomaly_count": anomaly_count,
                "risk_score": round(risk_score, 4),
                "supply_risk": round(supply_risk, 4),
                "demand_risk": round(demand_risk, 4),
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_cash_release():
    """Generate cash release initiative data"""
    rows = []
    today = date.today()

    initiatives = [
        ("Safety Stock Optimization - A-Class", "Safety Stock", 420000, 0.88, "In Progress"),
        ("EOQ Optimization - Slow Movers", "Lot Size", 280000, 0.75, "Planned"),
        ("Excess Inventory Liquidation", "Excess/Obsolete", 520000, 0.92, "In Progress"),
        ("Lead Time Reduction - Top Suppliers", "Pipeline Stock", 350000, 0.68, "Planned"),
        ("Consignment Conversion", "Terms", 180000, 0.82, "Planned"),
        ("Demand Sensing Improvement", "Safety Stock", 290000, 0.70, "Planned"),
        ("Shipment Consolidation", "Pipeline Stock", 230000, 0.78, "In Progress"),
        ("C-Class SKU Rationalization", "Excess/Obsolete", 310000, 0.85, "Planned"),
        ("Supplier Terms Extension", "Terms", 150000, 0.90, "Completed"),
        ("Safety Stock Review - B-Class", "Safety Stock", 200000, 0.72, "Planned"),
    ]

    for i, (name, category, total, confidence, status) in enumerate(initiatives):
        risk_adjusted = total * confidence
        start_month = random.randint(0, 4)
        duration = random.randint(2, 6)

        if confidence >= 0.85:
            risk_level = "Low"
        elif confidence >= 0.70:
            risk_level = "Medium"
        else:
            risk_level = "High"

        owners = ["Inventory Team", "Procurement", "Sales Ops", "Supply Chain", "Demand Planning", "Logistics"]

        # Monthly release breakdown
        monthly = [round(total / duration, 2) for _ in range(duration)]

        rows.append({
            "initiative_id": f"INIT-{i+1:03d}",
            "name": name,
            "category": category,
            "total_release": total,
            "risk_adjusted": round(risk_adjusted, 2),
            "confidence_pct": round(confidence * 100, 2),
            "start_month": start_month,
            "duration_months": duration,
            "status": status,
            "risk_level": risk_level,
            "owner": random.choice(owners),
            "monthly_release_json": json.dumps(monthly),
            "snapshot_date": today.isoformat(),
        })

    return rows

def generate_forecasts():
    """Generate forecast data"""
    rows = []
    today = date.today()

    for idx, (mat_id, mat_name, category) in enumerate(MATERIALS):
        for plant_id, plant_name, region in PLANTS:
            pattern = random.choice(PATTERNS)
            model = random.choice(MODELS)

            base_forecast = random.uniform(500, 5000)
            forecast_1m = base_forecast * random.uniform(0.9, 1.1)
            forecast_3m = base_forecast * 3 * random.uniform(0.85, 1.15)
            forecast_6m = base_forecast * 6 * random.uniform(0.80, 1.20)

            uncertainty = random.uniform(0.15, 0.35)
            p10 = forecast_1m * (1 - uncertainty)
            p90 = forecast_1m * (1 + uncertainty)

            mape = random.uniform(0.05, 0.25)
            mae = base_forecast * mape
            rmse = mae * random.uniform(1.1, 1.3)
            bias = random.uniform(-0.10, 0.10)

            if mape < 0.10:
                accuracy = "Excellent"
                confidence = random.uniform(0.85, 0.95)
            elif mape < 0.15:
                accuracy = "Good"
                confidence = random.uniform(0.75, 0.85)
            elif mape < 0.20:
                accuracy = "Fair"
                confidence = random.uniform(0.60, 0.75)
            else:
                accuracy = "Poor"
                confidence = random.uniform(0.40, 0.60)

            rows.append({
                "material_id": mat_id,
                "material_name": mat_name,
                "plant_id": plant_id,
                "pattern": pattern,
                "selected_model": model,
                "forecast_1m": round(forecast_1m, 2),
                "forecast_3m": round(forecast_3m, 2),
                "forecast_6m": round(forecast_6m, 2),
                "p10": round(p10, 2),
                "p90": round(p90, 2),
                "mape": round(mape, 4),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "bias": round(bias, 4),
                "accuracy_rating": accuracy,
                "confidence_level": round(confidence, 4),
                "snapshot_date": today.isoformat(),
            })

    return rows

def generate_exceptions():
    """Generate exception data for Command Center"""
    rows = []
    now = datetime.now()

    exception_templates = [
        ("critical", "Excess Stock Alert", "SKU {} at {} has ${:,.0f}K excess inventory ({} days old)", "${:,.0f}K WC tied", "Review excess stock", "working-capital-baseline"),
        ("warning", "Safety Stock Below Target", "SKU {} safety stock at {}% of recommended level", "{:.1f}% stockout risk", "Adjust safety stock", "mrp-parameter-optimizer"),
        ("critical", "Supplier Lead Time Increase", "Vendor {} lead time increased from {} to {} days", "Affects {} SKUs", "Update parameters", "supply-lead-time"),
        ("info", "Pending Recommendations", "{} high-priority recommendations awaiting approval", "${:,.0f}K potential savings", "Review recommendations", "recommendations-hub"),
        ("warning", "DIO Above Target", "Plant {} DIO at {} days vs {} day target", "${:,.0f}K WC opportunity", "Review inventory", "working-capital-baseline"),
        ("critical", "Lot Size Optimization", "EOQ analysis shows {}% reduction opportunity", "${:,.0f}K annual savings", "Review lot sizes", "mrp-parameter-optimizer"),
        ("info", "Forecast Accuracy Improved", "Model retraining improved MAPE from {}% to {}%", "{} SKUs affected", "Review forecasts", "forecasting-engine"),
        ("warning", "Aging Inventory Alert", "{} SKUs with inventory > {} days", "${:,.0f}K at risk", "Review aging", "aging-stock-intelligence"),
    ]

    for i in range(20):
        template = random.choice(exception_templates)
        exc_type, title, desc_template, impact_template, action, tile = template

        mat = random.choice(MATERIALS)
        plant = random.choice(PLANTS)

        # Generate dynamic values for description
        if "Excess Stock" in title:
            desc = desc_template.format(mat[0], plant[1][:15], random.randint(20, 100), random.randint(60, 180))
            impact = impact_template.format(random.randint(20, 100))
        elif "Safety Stock" in title:
            desc = desc_template.format(mat[0], random.randint(50, 80))
            impact = impact_template.format(random.uniform(1, 5))
        elif "Lead Time" in title:
            desc = desc_template.format(random.choice(SUPPLIERS)[1], random.randint(7, 14), random.randint(14, 28))
            impact = impact_template.format(random.randint(5, 20))
        elif "Pending" in title:
            desc = desc_template.format(random.randint(3, 10))
            impact = impact_template.format(random.randint(50, 200))
        elif "DIO" in title:
            desc = desc_template.format(plant[1][:15], random.randint(40, 60), random.randint(25, 35))
            impact = impact_template.format(random.randint(100, 300))
        elif "Lot Size" in title:
            desc = desc_template.format(random.randint(10, 25))
            impact = impact_template.format(random.randint(50, 150))
        elif "Forecast" in title:
            old_mape = random.randint(15, 25)
            desc = desc_template.format(old_mape, old_mape - random.randint(3, 8))
            impact = impact_template.format(random.randint(20, 50))
        else:
            desc = desc_template.format(random.randint(5, 15), random.randint(90, 180))
            impact = impact_template.format(random.randint(30, 100))

        rows.append({
            "exception_id": f"EXC-{i+1:04d}",
            "type": exc_type,
            "title": title,
            "description": desc,
            "impact": impact,
            "action": action,
            "tile": tile,
            "priority": i + 1,
            "created_date": (now - timedelta(hours=random.randint(1, 72))).isoformat(),
        })

    return rows

def load_to_bigquery(table_name, rows):
    """Load rows to BigQuery table"""
    table_id = f"arizona-poc.{DATASET}.{table_name}"

    # Clear existing data
    client.query(f"DELETE FROM `{table_id}` WHERE TRUE").result()

    # Insert new data
    errors = client.insert_rows_json(table_id, rows)
    if errors:
        print(f"Errors loading {table_name}: {errors[:3]}")
        return False
    print(f"Loaded {len(rows)} rows to {table_name}")
    return True

def main():
    print("Generating STOX demo data...")

    # Generate and load each table
    tables = [
        ("stox_demo_inventory_wc_baseline", generate_inventory_wc_baseline),
        ("stox_demo_inventory_health", generate_inventory_health),
        ("stox_demo_mrp_parameters", generate_mrp_parameters),
        ("stox_demo_supplier_lead_times", generate_supplier_lead_times),
        ("stox_demo_recommendations", generate_recommendations),
        ("stox_demo_demand_patterns", generate_demand_patterns),
        ("stox_demo_cash_release", generate_cash_release),
        ("stox_demo_forecasts", generate_forecasts),
        ("stox_demo_exceptions", generate_exceptions),
    ]

    for table_name, generator in tables:
        print(f"\nGenerating {table_name}...")
        rows = generator()
        load_to_bigquery(table_name, rows)

    print("\nDone! All STOX demo data loaded to BigQuery.")

if __name__ == "__main__":
    main()
