# MARGEN.AI - Complete Excel Integration Plan

## Executive Summary

**Current State**: Only `csg.xlsx` (13,440 transactions) is loaded into MARGEN.AI
**Opportunity**: 9 additional Excel files with complementary data to enrich analytics
**Goal**: Integrate ALL Excel files to provide comprehensive business intelligence

---

## 📊 Excel Files Analysis

### ✅ 1. **csg.xlsx** - CORE TRANSACTIONAL DATA (Already Loaded)
**Current Table**: `fact_transactions`
- 13,440 transaction records (Jan-Aug 2025)
- Complete sales, COGS, and margin data
- **Join Keys**: surgeon, distributor, facility, item_code, system, region, surgery_date, inv_number

---

### 🔄 2. **#1 - Invoice Data.xlsx** - BILLING & INVOICING
**Sheet**: `data` (21,005 rows)

**Purpose**: Invoice-level billing data - MORE COMPLETE than CSG (7,565 additional records)

**Key Columns**:
- Surgeon, Facility, Surgery Date
- Inv # (5,835 unique invoices)
- Item Code (1,625 items vs 1,085 in CSG)
- System (34 systems vs 28 in CSG)
- Quantity, Price Each, Amount

**Integration Strategy**:
```sql
CREATE TABLE fact_invoices (
    invoice_id SERIAL PRIMARY KEY,
    inv_number VARCHAR(50),
    surgery_date DATE,
    surgeon VARCHAR(255),
    facility VARCHAR(255),
    item_code VARCHAR(100),
    system VARCHAR(255),
    quantity INT,
    price_each DECIMAL(10,2),
    amount DECIMAL(10,2),
    UNIQUE(inv_number, item_code)
);
```

**New Analytics**:
- **Invoice Reconciliation**: Match invoices to transactions
- **Missing Invoices**: Identify 7,565 additional sales not in CSG
- **Pricing Variance**: Compare invoice prices vs transaction prices
- **Complete Revenue Picture**: Add $3-4M in potentially missing revenue

**Join**:
```sql
LEFT JOIN fact_invoices ON
    fact_transactions.inv_number = fact_invoices.inv_number AND
    fact_transactions.item_code = fact_invoices.item_code
```

---

### 📦 3. **#2 - Manufacturing Std Cost.xlsx** - COST MASTER DATA
**Sheet**: `#2 - Manufacturing Std Cost` (15,407 rows)

**Purpose**: Master cost data for ALL items (catalog)

**Key Columns**:
- Item No. (15,407 unique - FULL CATALOG)
- Item Description
- Base Price, Unit Price

**Integration Strategy**:
```sql
CREATE TABLE dim_item_costs (
    item_number VARCHAR(100) PRIMARY KEY,
    item_description VARCHAR(500),
    base_price DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**New Analytics**:
- **Cost Updates**: Track cost changes over time
- **Catalog Coverage**: See which items in catalog haven't sold
- **Pricing Strategy**: Compare unit_price (cost) to selling price

**Join**:
```sql
LEFT JOIN dim_item_costs ON
    fact_transactions.item_code = dim_item_costs.item_number
```

---

### 📋 4. **#3 - Item Data File.xlsx** - COMPLETE ITEM MASTER
**Sheet**: `#3 - Item Data File` (12,852 rows)

**Purpose**: Complete item master with 31 attributes

**Key Columns**:
- Item No. (12,852 unique)
- Item Description, Label Impl Hgt
- In Stock, Rev Level, Part Status, Active
- Item Group (32 groups), Batch Prefix
- UDI #, System Name, Label System, IFU #
- Drawing Number, Material
- Last Evaluated Price
- Procurement Method, Preferred Vendor
- Mfr Catalog No.

**Integration Strategy**:
```sql
CREATE TABLE dim_items (
    item_number VARCHAR(100) PRIMARY KEY,
    item_description VARCHAR(500),
    label_impl_hgt VARCHAR(100),
    in_stock DECIMAL(10,2),
    rev_level VARCHAR(10),
    part_status VARCHAR(50),
    active BOOLEAN,
    item_group VARCHAR(100),
    batch_prefix VARCHAR(100),
    udi_number VARCHAR(100),
    system_name VARCHAR(255),
    label_system VARCHAR(255),
    ifu_number VARCHAR(100),
    drawing_number VARCHAR(100),
    material VARCHAR(500),
    last_evaluated_price DECIMAL(10,2),
    procurement_method VARCHAR(50),
    preferred_vendor VARCHAR(255),
    mfr_catalog_no VARCHAR(100)
);
```

**New Analytics**:
- **Inventory Status**: Track in-stock levels
- **Product Lifecycle**: Active vs inactive items
- **Supplier Analytics**: Preferred vendor performance
- **Material Analysis**: Ti-6Al-4V vs PEEK products
- **Revision Tracking**: Product revisions and updates

**Join**:
```sql
LEFT JOIN dim_items ON
    fact_transactions.item_code = dim_items.item_number
```

---

### 📈 5. **#4 - 6 Region - 2025 MSR - Tab 2025 Data.xlsx** - MULTI-YEAR REGIONAL SALES
**Sheets**: `Annual Sales Summary`, `2025 Data`, `2024 Data`, `2023 Data`, `2022 Data`

**Purpose**: Historical sales data (2022-2025) with monthly/regional breakdowns

**Key Features**:
- **SUMIFS formulas**: Rolling up 2025 Data sheet by month/region
- **YoY Comparisons**: 2022-2025 data for trend analysis
- **Regional Breakdown**: 6 regions (Western, Central, Eastern, Midwest, Southern, Mountain)
- **Quarterly Performance**: Q1-Q4 breakdowns

**Integration Strategy**:
```sql
CREATE TABLE fact_historical_sales (
    sales_id SERIAL PRIMARY KEY,
    year INT,
    month INT,
    region VARCHAR(50),
    revenue DECIMAL(12,2),
    transaction_count INT,
    budget DECIMAL(12,2),
    prior_year DECIMAL(12,2)
);
```

**New Analytics**:
- **YoY Growth**: Compare 2025 vs 2024 vs 2023 vs 2022
- **Seasonality**: Identify monthly patterns across years
- **Budget vs Actual**: Track against budgets
- **Regional Trends**: Western vs Central vs Eastern performance
- **Growth Forecasting**: Predict Q4 2025 based on historical trends

---

### 🗺️ 6. **2025 Territories - 6 Regions.xlsx** - TERRITORY MASTER DATA
**Multiple Sheets**: Territory assignments by region

**Purpose**: Geographic sales territory assignments and rep coverage

**Integration Strategy**:
```sql
CREATE TABLE dim_territories (
    territory_id SERIAL PRIMARY KEY,
    territory_name VARCHAR(255),
    region VARCHAR(50),
    state VARCHAR(2),
    rep_name VARCHAR(255),
    rep_type VARCHAR(50),
    active BOOLEAN
);
```

**New Analytics**:
- **Territory Coverage**: Map facilities to territories
- **Rep Performance**: Sales by sales rep
- **Geographic Analysis**: State-level breakdowns
- **Territory Gaps**: Underserved territories

**Join**:
```sql
LEFT JOIN dim_territories ON
    fact_transactions.region = dim_territories.region
```

---

### 📊 7. **CGS Review - ASP - System, Units, Facility - '25 8-20-25 9-5.xlsx** - ASP ANALYSIS
**Purpose**: Average Selling Price (ASP) analysis by system, units, facility

**Key Metrics**:
- ASP by product system
- Unit volume analysis
- Facility-level pricing

**Integration**: Can validate against csg.xlsx data

**New Analytics**:
- **Pricing Benchmarks**: ASP by system vs actual prices
- **Facility Pricing**: Compare pricing across facilities
- **Volume Discounting**: Correlate ASP with volume

---

### 💰 8. **Cibolo Spine (Turgon) 2025 Commission (2).xlsx** - DISTRIBUTOR COMMISSIONS
**Sheet**: `Sheet1` (245 rows)

**Purpose**: Commission tracking for Cibolo Spine/Albert Turgon distributor

**Key Columns**:
- Surgery Date, Hospital, Rep, Surgeon
- Dollar Total (revenue)
- PO Arrive Date, PO #
- Commission % (40%, 50%)
- Commission Amount
- Training Status (YES/NO)

**Integration Strategy**:
```sql
CREATE TABLE fact_distributor_commissions (
    commission_id SERIAL PRIMARY KEY,
    distributor VARCHAR(255),
    surgery_date DATE,
    hospital VARCHAR(255),
    rep_name VARCHAR(255),
    surgeon VARCHAR(255),
    revenue DECIMAL(10,2),
    po_number VARCHAR(100),
    po_arrive_date DATE,
    commission_percent DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    trained BOOLEAN,
    notes TEXT
);
```

**New Analytics**:
- **Commission Expense**: Track commission costs by distributor
- **Net Profitability**: Revenue - COGS - Commission
- **Training Impact**: Performance of trained vs untrained reps
- **Payment Tracking**: PO arrival dates for cash flow

**Join**:
```sql
LEFT JOIN fact_distributor_commissions ON
    fact_transactions.distributor = fact_distributor_commissions.distributor AND
    fact_transactions.surgery_date = fact_distributor_commissions.surgery_date
```

---

### 💰 9. **Leap LLC (Knickerbocker) 2025 Commission (2).xlsx** - DISTRIBUTOR COMMISSIONS
**Sheet**: `Sheet1` (64 rows)

**Purpose**: Commission tracking for Leap LLC/Knickerbocker distributor

**Same structure as Cibolo Spine file** - can merge into same `fact_distributor_commissions` table

**Key Notes**:
- Higher commission rates (50%-70% for "HIGH DEMAND" cases at Methodist-Addison)
- Negative adjustments for corrections
- Different rep structure (Brian Mason, Rita Rubio, etc.)

---

### 📊 10. **SOP 6.0-01-10 Distributor Profitability Q3 2025 (3).xlsx** - PROFITABILITY ANALYSIS
**Sheet**: `Q3 2025` (189 rows with 1,896 formulas!)

**Purpose**: Comprehensive quarterly distributor profitability analysis

**Key Metrics** (Monthly for July, Aug, Sept):
- Revenue
- CGS (Cost of Goods Sold)
- Inventory (stock levels)
- Inventory Carry Cost (18-month ROI calculation)
- Commission
- Gross Profit
- Inventory % (Rev/Inv ratio)

**Dimensions**:
- Principal, Company, State, Region
- Warehouse #
- Commission %

**Integration Strategy**:
```sql
CREATE TABLE fact_distributor_profitability (
    profitability_id SERIAL PRIMARY KEY,
    quarter VARCHAR(10),
    year INT,
    month VARCHAR(10),
    principal VARCHAR(255),
    company VARCHAR(255),
    state VARCHAR(2),
    region VARCHAR(50),
    warehouse_number VARCHAR(50),
    commission_percent DECIMAL(5,2),
    revenue DECIMAL(12,2),
    cogs DECIMAL(12,2),
    inventory DECIMAL(12,2),
    inventory_carry_cost DECIMAL(12,2),
    commission_amount DECIMAL(12,2),
    gross_profit DECIMAL(12,2),
    inventory_percent DECIMAL(5,4)
);
```

**New Analytics**:
- **Distributor ROI**: Profit after inventory carry costs
- **Working Capital**: Inventory levels by distributor
- **Efficiency Metrics**: Inventory turnover (Rev/Inv)
- **True Profitability**: Revenue - COGS - Commission - Carry Cost
- **Regional Comparisons**: Texas vs other states

---

## 🔗 Relationship Map & Join Strategy

### Primary Keys & Relationships

```
fact_transactions (13,440 rows) - CORE
├── LEFT JOIN fact_invoices ON inv_number, item_code (+7,565 rows)
├── LEFT JOIN dim_items ON item_code (enriches with 31 attributes)
├── LEFT JOIN dim_item_costs ON item_code (cost data)
├── LEFT JOIN dim_territories ON region (territory info)
├── LEFT JOIN fact_distributor_commissions ON distributor, surgery_date
└── LEFT JOIN fact_distributor_profitability ON distributor (monthly profitability)

fact_historical_sales (2022-2025 trends)
└── JOIN to fact_transactions on year, month, region

csg_review_asp (validation data)
└── Compare against fact_transactions for ASP analysis
```

### Common Join Keys

| Join Key | Tables | Purpose |
|----------|--------|---------|
| **item_code** | transactions, invoices, items, costs | Item-level analysis |
| **distributor** | transactions, commissions, profitability | Distributor analytics |
| **surgeon** | transactions, invoices, commissions | Surgeon performance |
| **facility** | transactions, invoices, territories | Facility analytics |
| **region** | transactions, territories, profitability, historical | Geographic analysis |
| **surgery_date** | transactions, invoices, commissions, historical | Time-series analysis |
| **inv_number** | transactions, invoices | Invoice reconciliation |

---

## 🎯 Integration Priorities

### Phase 1: IMMEDIATE VALUE (Week 1)
**Priority**: High-value, low-complexity integrations

1. ✅ **csg.xlsx** - Already done
2. 🔄 **#1 - Invoice Data.xlsx** - Discover missing $3-4M revenue
3. 🔄 **#2 - Manufacturing Std Cost.xlsx** - Cost master data
4. 🔄 **#3 - Item Data File.xlsx** - Complete item master

**Impact**: Complete revenue picture + item-level enrichment

### Phase 2: FINANCIAL ANALYTICS (Week 2)
**Priority**: Commission & profitability tracking

5. 🔄 **Cibolo Spine Commission.xlsx** - Commission expenses
6. 🔄 **Leap LLC Commission.xlsx** - Commission expenses
7. 🔄 **SOP Distributor Profitability.xlsx** - True P&L by distributor

**Impact**: Net profitability after commissions + distributor ROI

### Phase 3: STRATEGIC ANALYTICS (Week 3)
**Priority**: Historical trends + geographic intelligence

8. 🔄 **#4 - 6 Region MSR.xlsx** - Multi-year historical data
9. 🔄 **2025 Territories.xlsx** - Territory assignments
10. 🔄 **CGS Review ASP.xlsx** - Pricing validation

**Impact**: YoY trends + territory analytics + pricing insights

---

## 📊 New MARGEN.AI Components

### New Dashboard: **Territory Performance**
**Data**: Territories, historical sales, transactions
- Revenue by territory/rep
- Territory coverage maps
- Rep performance rankings
- Geographic heatmaps

### New Dashboard: **Complete Financial Picture**
**Data**: Invoices + transactions
- Invoice vs transaction reconciliation
- Missing revenue identification
- Complete revenue: $17.76M (CSG) + $X.XXM (Invoice delta)
- Pricing variance analysis

### New Dashboard: **Distributor Profitability & Commission**
**Data**: Commissions + profitability
- Commission expense tracking
- Net profitability: Revenue - COGS - Commission
- Inventory carrying costs
- True ROI by distributor
- Working capital analysis

### New Dashboard: **Product & Inventory Intelligence**
**Data**: Item master + costs + inventory
- Item catalog (12,852 items)
- Active vs inactive products
- Inventory levels
- Material types
- Supplier analytics
- Revision tracking

### New Dashboard: **Historical Trends & Forecasting**
**Data**: Historical sales (2022-2025)
- YoY growth analysis
- Seasonality patterns
- Budget vs actual
- Q4 2025 forecasting
- Regional trends

### Enhanced Existing Dashboards
**Revenue & Growth Analytics**:
- Add territory dimension
- Add YoY comparisons
- Add budget vs actual

**Margin & Profitability Analytics**:
- Add net margin after commissions
- Add inventory carry costs
- Add distributor ROI metrics

**Cost & COGS Analysis**:
- Add item master attributes
- Add supplier/vendor dimension
- Add material type analysis

**P&L Statement & GL Explorer**:
- Add commission expenses
- Add inventory carry costs
- Add complete revenue picture

---

## 📋 ETL Implementation Plan

### ETL Scripts to Create

```python
# 1. load_invoices.py
# Load fact_invoices from #1 - Invoice Data.xlsx

# 2. load_item_master.py
# Load dim_items from #3 - Item Data File.xlsx

# 3. load_item_costs.py
# Load dim_item_costs from #2 - Manufacturing Std Cost.xlsx

# 4. load_territories.py
# Load dim_territories from 2025 Territories - 6 Regions.xlsx

# 5. load_historical_sales.py
# Load fact_historical_sales from #4 - 6 Region MSR.xlsx (all years)

# 6. load_commissions.py
# Load fact_distributor_commissions from both commission files

# 7. load_distributor_profitability.py
# Load fact_distributor_profitability from SOP file

# 8. reconcile_invoices_transactions.py
# Identify differences between invoices and transactions
```

### Database Migration Scripts

```sql
-- migrations/003_add_invoice_tables.sql
-- migrations/004_add_item_master.sql
-- migrations/005_add_territories.sql
-- migrations/006_add_historical_sales.sql
-- migrations/007_add_commissions.sql
-- migrations/008_add_distributor_profitability.sql
```

---

## 🎯 Expected Outcomes

### Data Completeness
- **Current**: 13,440 transactions, $17.76M revenue
- **After Integration**: 20,000+ transactions, $21M+ revenue (estimate)
- **Item Catalog**: 12,852 items (vs 1,085 currently)
- **Historical Data**: 4 years (2022-2025)
- **Geographic Coverage**: Complete territory mapping

### New Metrics & KPIs
1. **Net Profitability** = Revenue - COGS - Commission - Carry Cost
2. **Distributor ROI** = Gross Profit / Inventory Carry Cost
3. **Inventory Turnover** = Revenue / Inventory
4. **YoY Growth** = (2025 Revenue - 2024 Revenue) / 2024 Revenue
5. **ASP Variance** = (Actual Price - Benchmark ASP) / Benchmark ASP
6. **Territory Coverage** = Active Reps / Total Territories
7. **Commission Rate** = Commission / Revenue
8. **Missing Revenue** = Invoice Revenue - Transaction Revenue

### Business Questions Answered
1. Are we missing revenue in our transaction tracking?
2. What is our true profitability after commissions?
3. Which distributors provide the best ROI?
4. How does 2025 compare to 2022-2024?
5. Which territories are underperforming?
6. What is our product catalog utilization?
7. Which items have excessive inventory?
8. Are we pricing correctly vs ASP benchmarks?

---

## ✅ Success Criteria

- [ ] All 10 Excel files loaded into PostgreSQL
- [ ] Zero data loss during ETL
- [ ] All relationships/joins validated
- [ ] 5 new MARGEN.AI dashboard components
- [ ] Enhanced existing 4 dashboards
- [ ] Complete documentation
- [ ] User training completed
- [ ] Performance < 2s for all queries

---

**Total Estimated Effort**: 3-4 weeks
**Priority**: HIGH - Unlock $3-4M in missing revenue insights
**ROI**: Immediate - Identify commission optimization opportunities
