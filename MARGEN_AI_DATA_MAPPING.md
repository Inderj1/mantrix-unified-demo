# MARGEN.AI Data Integration Plan
**Branch:** nov23-nexxt-filesintegration
**Date:** November 23, 2025
**Analysis:** All Excel files in excelfolder/

---

## Executive Summary

Analyzed 10 Excel files containing financial, operational, and transactional data for margin analytics. **csg.xlsx** identified as the primary fact table with complete revenue, cost, and margin data ($29.5M across 13,441 transactions).

### Key Metrics Overview
- **Total Revenue Tracked**: $29,571,199
- **Date Range**: Jan 1, 2025 - Nov 11, 2025
- **Transaction Count**: 13,441 complete records
- **Unique Surgeons**: 374
- **Unique Facilities**: 293
- **Product Systems**: 34
- **Distributors**: 187 (with complete P&L data for Q3 2025)

---

## File Inventory & Analysis

### 1. **csg.xlsx** ⭐ PRIMARY FACT TABLE
**Purpose:** Complete transaction-level data with pre-calculated margins
**Sheet:** 2025 - Data (13,441 rows)

**Key Fields:**
- **Revenue:** Total Sales
- **Cost:** Total Std Cost
- **Margin:** Total GM (Gross Margin)
- **Dimensions:** Surgery Date, Surgeon, Distributor, Region, Facility, System, Item Code
- **Quantities:** Quantity, Price Each

**Why Primary:** Most complete dataset with all dimensions and pre-calculated margins

---

### 2. **#1 - Invoice Data.xlsx**
**Purpose:** Detailed invoice transactions
**Records:** 21,005 line items
**Sheet:** Invoice Data

**Key Fields:**
- Invoice Number, Invoice Date, Product Description
- Invoice Amount, Quantity, Extended Price
- Customer Name, Sales Rep, Territory

**Use Case:** Revenue verification, customer analysis backup

---

### 3. **#2 - Manufacturing Std Cost.xlsx**
**Purpose:** Item master with standard costs
**Records:** 15,407 items
**Sheet:** Standard Cost

**Key Fields:**
- Item Code, Description, Unit Price (Std Cost)
- Product Category, Item Type

**Use Case:** Cost analysis, item lookup table

---

### 4. **#3 - Item Data File.xlsx**
**Purpose:** Product master records
**Records:** 12,852 items
**Sheet:** Item Data

**Key Fields:**
- Item Code, Item Description
- Item Group, Active Status, GL Account

**Use Case:** Product dimension table, GL mapping

---

### 5. **#4 - 6 Region - 2025 MSR - Tab 2025 Data.xlsx**
**Purpose:** Monthly sales reporting by region
**Sheets:** 14 (Jan-Dec 2025, 2025 Data, TOTALS)

**Key Fields:**
- Monthly revenue by region
- Budget vs Actual comparisons
- Target tracking

**Use Case:** Budget variance analysis, regional trends

---

### 6. **SOP 6.0-01-10 Distributor Profitability Q3 2025 (3).xlsx**
**Purpose:** Complete P&L by distributor
**Records:** 187 distributor-month combinations
**Sheet:** Sheet1

**Key Fields:**
- **Revenue:** Grand Total
- **COGS:** Total Product Cost
- **Gross Profit:** Gross Profit
- **OPEX:** Commission, Inventory Carrying Cost
- **Net:** Operating Profit, Net Profit

**Use Case:** P&L Statement & GL Explorer tab (complete P&L by entity)

---

### 7. **2025 Territories - 6 Regions.xlsx**
**Purpose:** Geographic hierarchy
**Sheet:** Territory Assignment

**Key Fields:**
- Territory, Region mapping
- Sales Rep assignments

**Use Case:** Geographic dimension table

---

### 8. **Cibolo Spine (Turgon) 2025 Commission (2).xlsx**
**Purpose:** Commission transactions
**Records:** 242 commissions
**Sheet:** 2025 Commission

**Key Fields:**
- Surgery Date, Surgeon, Distributor
- Total Sales, Estimated Commission

**Use Case:** Commission expense analysis

---

### 9. **Leap LLC (Knickerbocker) 2025 Commission (2).xlsx**
**Purpose:** Commission transactions
**Records:** 61 commissions
**Sheet:** 2025 Commission

**Key Fields:**
- Similar to Cibolo Spine

**Use Case:** Commission expense analysis

---

### 10. **CGS Review - ASP - System, Units, Facility - '25 8-20-25 9-5.xlsx**
**Purpose:** Pricing analysis (duplicate of csg.xlsx core data)
**Sheet:** 2025

---

## MARGEN.AI Tab Mapping

### Tab 1: Revenue & Growth Analytics
**Primary Data Source:** csg.xlsx

**Metrics to Display:**
- Total Revenue (Total Sales)
- Revenue Growth % (YoY, MoM)
- Average Selling Price (Total Sales / Quantity)
- Units Sold (Quantity)
- Revenue by Product Line (System)
- Revenue by Customer (Surgeon)
- Revenue by Channel (Distributor)
- Revenue by Region

**Supporting Sources:**
- #1 Invoice Data (verification)
- #4 MSR Data (budget comparison)

**Dimensions:**
- Time: Surgery Date (daily, monthly, quarterly)
- Product: System, Item Code, Item Group
- Customer: Surgeon, Facility
- Channel: Distributor
- Geography: Region, Territory

---

### Tab 2: Cost & COGS Analysis
**Primary Data Source:** csg.xlsx

**Metrics to Display:**
- Total COGS (Total Std Cost)
- COGS as % of Revenue
- Cost per Unit (Total Std Cost / Quantity)
- COGS by Product (System)
- COGS by Region
- COGS Trends over time

**Supporting Sources:**
- #2 Manufacturing Std Cost (item-level standard costs)
- #3 Item Data (product categorization)
- SOP Distributor Profitability (Total Product Cost by distributor)

**Breakdowns:**
- Material Cost
- Labor Cost
- Overhead (if available in standard cost)

---

### Tab 3: Margin & Profitability
**Primary Data Source:** csg.xlsx

**Metrics to Display:**
- Gross Margin $ (Total GM)
- Gross Margin % (Total GM / Total Sales)
- Margin by Product (System)
- Margin by Surgeon (high/low performers)
- Margin by Distributor
- Margin by Facility
- Margin by Case Type
- Margin Trends

**Supporting Sources:**
- SOP Distributor Profitability (operating margin, net margin)

**Waterfall Charts:**
- Revenue → COGS → Gross Margin
- Gross Margin → OPEX → Operating Margin

---

### Tab 4: P&L Statement & GL Explorer
**Primary Data Source:** SOP 6.0-01-10 Distributor Profitability Q3 2025

**P&L Structure:**
```
Revenue (Grand Total)
- COGS (Total Product Cost)
= Gross Profit
- Operating Expenses:
  - Commission
  - Inventory Carrying Cost
= Operating Profit
- Other Expenses (if any)
= Net Profit
```

**Views:**
- By Distributor
- By Month
- By Region (aggregate from distributor)

**Drill-down Sources:**
- csg.xlsx for transaction-level detail
- #4 MSR for budget variance

**GL Account Mapping:**
- #3 Item Data contains GL Account field
- Map revenue/cost to appropriate GL codes

---

### Tab 5: Financial Drivers & What-If
**Key Drivers Identified:**

1. **Volume Driver** (Quantity)
   - Source: csg.xlsx, Quantity field
   - What-If: "What if volume increases by 10%?"

2. **Price Driver** (Average Selling Price)
   - Source: csg.xlsx, Price Each
   - What-If: "What if ASP increases by 5%?"

3. **Product Mix Driver** (System distribution)
   - Source: csg.xlsx, System field
   - What-If: "What if we shift 20% of sales to higher-margin products?"

4. **Unit Cost Driver** (Standard Cost)
   - Source: #2 Manufacturing Std Cost, Unit Price
   - What-If: "What if material costs decrease by 8%?"

5. **Commission Rate Driver**
   - Source: SOP Distributor Profitability, COMM %
   - Current range: 35-50%
   - What-If: "What if commission rates are reduced to 40% cap?"

6. **Inventory Carrying Cost Driver**
   - Source: SOP Distributor Profitability, Inventory %
   - Formula: Based on 18-month ROI
   - What-If: "What if we improve inventory turns by 25%?"

**Scenario Modeling:**
- Best Case: +10% volume, +5% price, -5% cost
- Base Case: Current actuals
- Worst Case: -10% volume, -5% price, +5% cost

---

## Implementation Recommendations

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Get Revenue & Margin tabs operational

**Tasks:**
1. **ETL Pipeline Setup**
   - Create Python script to read csg.xlsx
   - Load into PostgreSQL fact table `fact_transactions`
   - Fields: surgery_date, surgeon, distributor, region, facility, system, item_code, quantity, price_each, total_sales, total_std_cost, total_gm

2. **Dimension Tables**
   - dim_surgeon (from csg.xlsx distinct surgeons)
   - dim_distributor (from csg.xlsx distinct distributors)
   - dim_system (from csg.xlsx distinct systems)
   - dim_region (from 2025 Territories)
   - dim_facility (from csg.xlsx distinct facilities)

3. **Revenue Analytics Queries**
   - Total revenue by month
   - Revenue by system
   - Revenue by surgeon (top 10)
   - Revenue by distributor (top 10)

4. **Margin Analytics Queries**
   - Gross margin $ by month
   - Gross margin % trend
   - Margin by system
   - Margin by distributor

5. **Frontend Integration**
   - Create API endpoints in FastAPI backend
   - Wire up MargenAILanding tiles to new endpoints
   - Build initial dashboard visualizations

### Phase 2: Cost & P&L (Week 3)
**Goal:** Add Cost analysis and P&L statements

**Tasks:**
1. **Cost Dimension Tables**
   - Load #2 Manufacturing Std Cost → dim_item_cost
   - Load #3 Item Data → dim_item_master

2. **P&L Fact Table**
   - Load SOP Distributor Profitability → fact_distributor_pl
   - Fields: distributor, month, revenue, cogs, gross_profit, commission, carrying_cost, operating_profit, net_profit

3. **Cost Analytics Queries**
   - COGS breakdown by item group
   - Cost trends over time
   - Cost per unit analysis

4. **P&L Queries**
   - P&L by distributor
   - P&L by month
   - Variance analysis (budget vs actual from #4 MSR)

### Phase 3: Financial Drivers (Week 4)
**Goal:** Enable What-If scenario modeling

**Tasks:**
1. **Driver Calculation Service**
   - Calculate baseline metrics from fact tables
   - Volume impact calculator
   - Price impact calculator
   - Mix impact calculator
   - Cost impact calculator

2. **Scenario Engine**
   - Create scenario_assumptions table
   - Build scenario calculation engine
   - Generate forecasted P&L for each scenario

3. **Frontend Scenario Builder**
   - Sliders for each driver
   - Real-time P&L recalculation
   - Side-by-side scenario comparison

### Phase 4: Historical Analysis (Week 5)
**Goal:** Add time-series analysis and trend detection

**Tasks:**
1. **Historical Data Load**
   - If available, load prior year data
   - Calculate YoY growth metrics

2. **Variance Analysis**
   - Budget vs Actual (from #4 MSR)
   - Prior Year vs Current Year
   - Forecast vs Actual

3. **Trend Analysis**
   - Moving averages
   - Seasonality detection
   - Anomaly detection

---

## Data Quality Checklist

### Pre-Load Validation
- [ ] All dates in valid format (YYYY-MM-DD)
- [ ] All numeric fields have no text values
- [ ] No negative quantities (unless returns)
- [ ] Total Sales = Quantity × Price Each (within rounding)
- [ ] Total GM = Total Sales - Total Std Cost

### Post-Load Validation
- [ ] Row counts match source files
- [ ] Sum of Total Sales matches Excel totals
- [ ] No duplicate transactions
- [ ] All foreign keys resolve (surgeon, distributor, etc.)
- [ ] Date range covers expected period

### Business Rule Validation
- [ ] Gross Margin % between -50% and 100%
- [ ] Commission rates between 0% and 100%
- [ ] Inventory carrying cost reasonable (< 30% of revenue)
- [ ] P&L totals reconcile (Revenue - COGS - OPEX = Net Profit)

---

## ETL Script Outline

```python
# backend/src/etl/load_margen_data.py

import pandas as pd
import psycopg2
from datetime import datetime

def load_csg_transactions():
    """Load primary fact table from csg.xlsx"""
    df = pd.read_excel('excelfolder/csg.xlsx', sheet_name='2025 - Data')

    # Clean and transform
    df['surgery_date'] = pd.to_datetime(df['Surgery Date'])
    df['total_sales'] = pd.to_numeric(df['Total Sales'], errors='coerce')
    df['total_std_cost'] = pd.to_numeric(df['Total Std Cost'], errors='coerce')
    df['total_gm'] = pd.to_numeric(df['Total GM'], errors='coerce')

    # Load to PostgreSQL
    conn = psycopg2.connect(database="customer_analytics")
    cursor = conn.cursor()

    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO fact_transactions
            (surgery_date, surgeon, distributor, region, facility, system,
             item_code, quantity, price_each, total_sales, total_std_cost, total_gm)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (row['surgery_date'], row['Surgeon'], row['Distributor'],
              row['Region'], row['Facility'], row['System'], row['Item Code'],
              row['Quantity'], row['Price Each'], row['total_sales'],
              row['total_std_cost'], row['total_gm']))

    conn.commit()
    conn.close()

def load_distributor_pl():
    """Load P&L fact table from SOP file"""
    df = pd.read_excel('excelfolder/SOP 6.0-01-10 Distributor Profitability Q3 2025 (3).xlsx')

    # Similar ETL logic...

if __name__ == '__main__':
    load_csg_transactions()
    load_distributor_pl()
    print("MARGEN.AI data load complete!")
```

---

## Database Schema

### Fact Tables

**fact_transactions**
```sql
CREATE TABLE fact_transactions (
    id SERIAL PRIMARY KEY,
    surgery_date DATE NOT NULL,
    surgeon VARCHAR(255),
    distributor VARCHAR(255),
    region VARCHAR(100),
    facility VARCHAR(255),
    system VARCHAR(100),
    item_code VARCHAR(50),
    quantity INTEGER,
    price_each DECIMAL(10,2),
    total_sales DECIMAL(12,2),
    total_std_cost DECIMAL(12,2),
    total_gm DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_surgery_date ON fact_transactions(surgery_date);
CREATE INDEX idx_surgeon ON fact_transactions(surgeon);
CREATE INDEX idx_distributor ON fact_transactions(distributor);
CREATE INDEX idx_system ON fact_transactions(system);
```

**fact_distributor_pl**
```sql
CREATE TABLE fact_distributor_pl (
    id SERIAL PRIMARY KEY,
    distributor VARCHAR(255) NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM
    grand_total DECIMAL(12,2),
    total_product_cost DECIMAL(12,2),
    gross_profit DECIMAL(12,2),
    commission DECIMAL(12,2),
    inventory_carrying_cost DECIMAL(12,2),
    operating_profit DECIMAL(12,2),
    net_profit DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_distributor_month ON fact_distributor_pl(distributor, month);
```

### Dimension Tables

**dim_surgeon, dim_distributor, dim_facility, dim_region** (similar structure)
```sql
CREATE TABLE dim_surgeon (
    surgeon_id SERIAL PRIMARY KEY,
    surgeon_name VARCHAR(255) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Needed

### Revenue Analytics
- `GET /api/margen/revenue/total` - Total revenue (filtered by date range)
- `GET /api/margen/revenue/by-month` - Monthly revenue trend
- `GET /api/margen/revenue/by-system` - Revenue by product system
- `GET /api/margen/revenue/by-surgeon` - Top surgeons by revenue
- `GET /api/margen/revenue/by-distributor` - Top distributors by revenue

### Cost Analytics
- `GET /api/margen/cost/total` - Total COGS
- `GET /api/margen/cost/by-system` - COGS by product
- `GET /api/margen/cost/trend` - Cost trends over time

### Margin Analytics
- `GET /api/margen/margin/summary` - GM $ and GM %
- `GET /api/margen/margin/by-system` - Margin by product
- `GET /api/margen/margin/by-distributor` - Margin by channel

### P&L
- `GET /api/margen/pl/by-distributor/:id` - Complete P&L for distributor
- `GET /api/margen/pl/by-month/:month` - Aggregated P&L for month

### What-If
- `POST /api/margen/scenario/calculate` - Calculate scenario impact
  - Body: { volume_change: 0.10, price_change: 0.05, ... }
  - Returns: { forecasted_revenue, forecasted_gm, forecasted_net_profit }

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Validate data mappings** - confirm Excel fields match expectations
3. **Set up database schema** - create fact and dimension tables
4. **Build ETL pipeline** - Python scripts to load Excel → PostgreSQL
5. **Create API endpoints** - FastAPI routes for each metric
6. **Build frontend components** - React components for each MARGEN.AI tab
7. **Test with sample data** - validate calculations against Excel
8. **Deploy to staging** - test end-to-end
9. **Train users** - documentation and walkthroughs
10. **Go live** - production deployment

---

## Appendix: Field-Level Mappings

### csg.xlsx → fact_transactions
| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| Surgery Date | surgery_date | DATE | Primary time dimension |
| Surgeon | surgeon | VARCHAR | FK to dim_surgeon |
| Distributor | distributor | VARCHAR | FK to dim_distributor |
| Region | region | VARCHAR | Geographic dimension |
| Facility | facility | VARCHAR | Customer location |
| System | system | VARCHAR | Product line |
| Item Code | item_code | VARCHAR | SKU identifier |
| Quantity | quantity | INTEGER | Units sold |
| Price Each | price_each | DECIMAL | Unit price |
| Total Sales | total_sales | DECIMAL | Revenue = Quantity × Price |
| Total Std Cost | total_std_cost | DECIMAL | COGS |
| Total GM | total_gm | DECIMAL | Gross Margin = Sales - Cost |

### SOP Distributor Profitability → fact_distributor_pl
| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| Distributor | distributor | VARCHAR | Entity |
| Month | month | VARCHAR | YYYY-MM format |
| Grand Total | grand_total | DECIMAL | Revenue |
| Total Product Cost | total_product_cost | DECIMAL | COGS |
| Gross Profit | gross_profit | DECIMAL | Calculated |
| Commission | commission | DECIMAL | Sales expense |
| Inv Carry Cost | inventory_carrying_cost | DECIMAL | OPEX |
| Operating Profit | operating_profit | DECIMAL | EBIT |
| Net Profit | net_profit | DECIMAL | Bottom line |

---

**End of Document**
