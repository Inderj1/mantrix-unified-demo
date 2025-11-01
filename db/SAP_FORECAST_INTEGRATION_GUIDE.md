# SAP Forecast Integration Guide for STOX.AI

**Purpose**: Document how STOX.AI ML forecasts are written to SAP tables for MRP and planning.

---

## 🎯 **PRIMARY FORECAST TABLES**

### **1. PBIM - Periodic Independent Requirements**
**Purpose**: Store aggregated forecasts by week/month for MRP planning

**Key Fields**:
- `MATNR` - Material Number (MR_HAIR_101)
- `WERKS` - Plant (P001=DC-East, P002=DC-Midwest)
- `PERKZ` - Period Indicator (W=Weekly, M=Monthly, D=Daily)
- `PERXX` - Period Number (202544 = Week 44 of 2025)
- `MENGE` - Forecast Quantity (959 for DC-East weekly)
- `BEDAE` - Requirement Type (VSF = Sales Forecast)

**STOX.AI Mapping**:
```
DCDemandAggregation.weekly_mean_dc → PBIM.MENGE
  - DC-East: 959 units/week
  - DC-Midwest: 749 units/week
```

---

### **2. PBED - Independent Requirements Data**
**Purpose**: Store date-specific daily forecasts for detailed planning

**Key Fields**:
- `MATNR` - Material Number
- `WERKS` - Plant
- `BEDAT` - Requirement Date (2025-10-27)
- `MENGE` - Forecast Quantity (137 for DC-East daily)
- `BEDAE` - Requirement Type (VSF)

**STOX.AI Mapping**:
```
DCDemandAggregation.daily_forecast_dc → PBED.MENGE
  - DC-East: 137 units/day
  - DC-Midwest: 107 units/day
```

---

## 📊 **DATA FLOW ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                      STOX.AI ML Engine                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ StoreForecast│→ │DCDemandAggr. │→ │ DCOptimization│     │
│  │  (12 stores) │  │ (2 DCs)      │  │  (Safety Stock)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                 ↓                   ↓             │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   SAP Forecast Tables                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     PBED     │  │     PBIM     │  │    MDKP      │     │
│  │ (Daily fcst) │  │ (Weekly agg) │  │ (Period sum) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                 ↓                   ↓             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SAP MRP Engine (MD01/MD02)              │  │
│  └──────────────────────────────────────────────────────┘  │
│         ↓                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     PLAF     │  │     EKKO     │  │     VBBE     │     │
│  │(Planned Order)│  │  (Purchase   │  │  (ATP Check) │     │
│  │              │  │   Orders)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **INTEGRATION OPTIONS**

### **Option 1: Direct Table Insert (Batch)**
**Best for**: Nightly forecast updates

```python
# Python example using SAP RFC
from pyrfc import Connection

conn = Connection(
    user='STOX_AI',
    passwd='*****',
    ashost='sap.madison.com',
    sysnr='00',
    client='100'
)

# Insert weekly forecast into PBIM
forecast_data = {
    'MATNR': 'MR_HAIR_101',
    'WERKS': 'P001',
    'PERKZ': 'W',
    'PERXX': '202544',
    'MENGE': 959.000,
    'MEINS': 'EA',
    'BEDAE': 'VSF',
    'BDZEI': '20251027',
    'ERNAM': 'STOX_AI'
}

result = conn.call('BAPI_REQUIREMENT_CREATE', IT_REQUIREMENTS=[forecast_data])
conn.commit()
```

---

### **Option 2: BAPI Function Module (Recommended)**
**Best for**: Real-time updates with validation

**Available BAPIs**:
- `BAPI_REQUIREMENT_CREATE` - Create independent requirements
- `BAPI_REQUIREMENT_CHANGE` - Update existing forecasts
- `BAPI_REQUIREMENT_DELETE` - Remove old forecasts

```abap
" ABAP code to call from STOX.AI
DATA: lt_requirements TYPE TABLE OF bapisdrequ,
      lt_return TYPE TABLE OF bapiret2.

lt_requirements = VALUE #(
  ( material = 'MR_HAIR_101'
    plant = 'P001'
    req_type = 'VSF'
    req_date = '20251027'
    req_qty = 137
    req_qty_unit = 'EA' )
).

CALL FUNCTION 'BAPI_REQUIREMENT_CREATE'
  TABLES
    requirements = lt_requirements
    return       = lt_return.

IF sy-subrc = 0.
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'.
ENDIF.
```

---

### **Option 3: IDoc Interface (Enterprise)**
**Best for**: High-volume, asynchronous integration

**IDoc Type**: `PORDCR01` (Purchase Order/Requirements)

```xml
<!-- IDoc structure for forecast -->
<IDOC BEGIN="1">
  <EDI_DC40 SEGMENT="1">
    <IDOCTYP>PORDCR01</IDOCTYP>
    <MESTYP>PORDCR</MESTYP>
    <SNDPRN>STOX_AI</SNDPRN>
  </EDI_DC40>
  <E1PORDH SEGMENT="1">
    <MATNR>MR_HAIR_101</MATNR>
    <WERKS>P001</WERKS>
  </E1PORDH>
  <E1PORDI SEGMENT="1">
    <BEDAT>20251027</BEDAT>
    <MENGE>137.000</MENGE>
    <BEDAE>VSF</BEDAE>
  </E1PORDI>
</IDOC>
```

---

### **Option 4: Custom Z-Table + Sync Job**
**Best for**: Advanced ML metadata tracking

```sql
-- Create custom forecast table
CREATE TABLE ZSTOX_FORECAST (
  MANDT CHAR(3) NOT NULL,
  MATNR CHAR(18) NOT NULL,
  WERKS CHAR(4) NOT NULL,
  CHANNEL CHAR(10) NOT NULL,
  FCST_DATE DATE NOT NULL,
  DAILY_FCST DEC(13,3),
  WEEKLY_MU DEC(13,3),
  WEEKLY_SIGMA DEC(13,3),
  CONFIDENCE_PCT DEC(5,2),
  MODEL_TYPE CHAR(20),
  UPPER_BOUND DEC(13,3),
  LOWER_BOUND DEC(13,3),
  STOX_RUN_ID CHAR(20),
  CREATED_AT TIMESTAMP,
  PRIMARY KEY (MANDT, MATNR, WERKS, CHANNEL, FCST_DATE)
);

-- Sync job: ZSTOX_FORECAST → PBED (runs every 15 min)
INSERT INTO PBED (MATNR, WERKS, BEDAT, MENGE, BEDAE)
SELECT
  MATNR,
  WERKS,
  FCST_DATE,
  SUM(DAILY_FCST) as TOTAL_FCST,
  'VSF'
FROM ZSTOX_FORECAST
WHERE FCST_DATE >= CURRENT_DATE
  AND FCST_DATE <= CURRENT_DATE + 90
GROUP BY MATNR, WERKS, FCST_DATE
ON CONFLICT (MATNR, WERKS, BEDAT)
DO UPDATE SET MENGE = EXCLUDED.MENGE;
```

---

## 📋 **SAMPLE DATA FILES**

### **PBIM_forecast_weekly.csv** (12 records)
- 4 weeks of weekly forecasts (W44-W47)
- 2 months of monthly forecasts (Nov-Dec)
- DC-East: 959 units/week, 4,138 units/month
- DC-Midwest: 749 units/week, 3,231 units/month

### **PBED_forecast_daily.csv** (30 records)
- 15 days × 2 DCs = 30 daily forecast entries
- DC-East: 137 units/day
- DC-Midwest: 107 units/day
- Date range: Oct 27 - Nov 10, 2025

---

## 🔄 **UPDATE STRATEGIES**

### **Strategy 1: Full Replace (Daily)**
```sql
-- Delete old forecasts
DELETE FROM PBED
WHERE MATNR = 'MR_HAIR_101'
  AND WERKS IN ('P001', 'P002')
  AND BEDAT >= CURRENT_DATE
  AND ERNAM = 'STOX_AI';

-- Insert new forecasts from STOX.AI
INSERT INTO PBED (...) VALUES (...);
```

### **Strategy 2: Delta Update (Hourly)**
```sql
-- Only update changed forecasts
MERGE INTO PBED AS target
USING ZSTOX_FORECAST AS source
ON target.MATNR = source.MATNR
   AND target.WERKS = source.WERKS
   AND target.BEDAT = source.FCST_DATE
WHEN MATCHED AND target.MENGE != SUM(source.DAILY_FCST) THEN
  UPDATE SET MENGE = SUM(source.DAILY_FCST)
WHEN NOT MATCHED THEN
  INSERT (MATNR, WERKS, BEDAT, MENGE, BEDAE)
  VALUES (source.MATNR, source.WERKS, source.FCST_DATE, SUM(source.DAILY_FCST), 'VSF');
```

### **Strategy 3: Versioned Forecasts**
```sql
-- Keep history of forecast versions
INSERT INTO ZSTOX_FORECAST_HISTORY
SELECT *, CURRENT_TIMESTAMP as ARCHIVED_AT
FROM ZSTOX_FORECAST
WHERE FCST_DATE = CURRENT_DATE;

-- Compare actual vs. forecast for ML retraining
SELECT
  h.FCST_DATE,
  h.DAILY_FCST as PREDICTED,
  SUM(l.LFIMG) as ACTUAL,
  ABS(h.DAILY_FCST - SUM(l.LFIMG)) as ERROR,
  h.MODEL_TYPE
FROM ZSTOX_FORECAST_HISTORY h
  LEFT JOIN LIPS l ON h.MATNR = l.MATNR
    AND h.WERKS = l.WERKS
    AND h.FCST_DATE = l.WADAT_IST
GROUP BY h.FCST_DATE, h.DAILY_FCST, h.MODEL_TYPE;
```

---

## 🎯 **STOX.AI → SAP FIELD MAPPING**

| STOX.AI Field | SAP Table | SAP Field | Transformation |
|---------------|-----------|-----------|----------------|
| **StoreForecast.forecasted_units** | PBED | MENGE | Aggregate 12 stores → 2 DCs |
| **DCDemandAggregation.daily_forecast_dc** | PBED | MENGE | Direct insert (137, 107) |
| **DCDemandAggregation.weekly_mean_dc** | PBIM | MENGE | Direct insert (959, 749) |
| **DCDemandAggregation.retail_fcst** | ZSTOX_FORECAST | DAILY_FCST | Channel='Retail' |
| **DCDemandAggregation.amazon_fcst** | ZSTOX_FORECAST | DAILY_FCST | Channel='Amazon' |
| **DCDemandAggregation.confidence_level** | ZSTOX_FORECAST | CONFIDENCE_PCT | ML confidence % |
| **DCDemandAggregation.forecast_method** | ZSTOX_FORECAST | MODEL_TYPE | Prophet/ARIMA/XGBoost |
| **DCOptimization.weekly_mu** | PBIM | MENGE | Matches weekly_mean_dc |
| **DCOptimization.sigma** | ZSTOX_FORECAST | WEEKLY_SIGMA | Std deviation |
| **DCOptimization.safety_stock** | MARC | EISBE | Update safety stock master |

---

## 🔐 **SECURITY & AUTHORIZATION**

### **Required SAP Authorizations**:
```
S_TABU_DIS - PBED, PBIM, MDKP (Display)
S_TABU_NAM - PBED, PBIM, MDKP (Change)
S_TCODE - MD61, MD62, MD63 (Forecast maintenance)
```

### **Service Account Setup**:
```abap
* Create STOX_AI user in SAP
PARAMETERS: p_user TYPE xuname VALUE 'STOX_AI',
            p_pass TYPE xubpw,
            p_email TYPE ad_smtpadr VALUE 'stox@madison.com'.

* Assign roles
CALL FUNCTION 'BAPI_USER_CREATE'
  EXPORTING
    username = p_user
    password = p_pass
    logondata = VALUE bapilogond( ustyp = 'S' )  "System user
  TABLES
    activitygroups = VALUE #(
      ( agr_name = 'Z_STOX_FORECAST_WRITE' )
    ).
```

---

## 📊 **MONITORING & VALIDATION**

### **Query 1: Verify Forecast Load**
```sql
SELECT
  MATNR,
  WERKS,
  COUNT(*) as forecast_days,
  SUM(MENGE) as total_forecast,
  MIN(BEDAT) as first_date,
  MAX(BEDAT) as last_date
FROM PBED
WHERE ERNAM = 'STOX_AI'
  AND BEDAT >= CURRENT_DATE
GROUP BY MATNR, WERKS;
```

**Expected Output**:
| MATNR | WERKS | forecast_days | total_forecast | first_date | last_date |
|-------|-------|---------------|----------------|------------|-----------|
| MR_HAIR_101 | P001 | 90 | 12,330 | 2025-10-27 | 2026-01-25 |
| MR_HAIR_101 | P002 | 90 | 9,630 | 2025-10-27 | 2026-01-25 |

### **Query 2: Compare Forecast vs. Actual**
```sql
SELECT
  p.BEDAT,
  p.MATNR,
  p.WERKS,
  p.MENGE as FORECAST,
  COALESCE(SUM(l.LFIMG), 0) as ACTUAL,
  (COALESCE(SUM(l.LFIMG), 0) - p.MENGE) as VARIANCE,
  ROUND(ABS(COALESCE(SUM(l.LFIMG), 0) - p.MENGE) / p.MENGE * 100, 2) as MAPE
FROM PBED p
  LEFT JOIN LIPS l ON p.MATNR = l.MATNR
    AND p.WERKS = l.WERKS
    AND p.BEDAT = l.WADAT_IST
WHERE p.BEDAT BETWEEN '20251001' AND '20251031'
  AND p.ERNAM = 'STOX_AI'
GROUP BY p.BEDAT, p.MATNR, p.WERKS, p.MENGE
ORDER BY p.BEDAT;
```

### **Query 3: Forecast Coverage by Horizon**
```sql
SELECT
  CASE
    WHEN BEDAT <= CURRENT_DATE + 7 THEN '1 Week'
    WHEN BEDAT <= CURRENT_DATE + 30 THEN '1 Month'
    WHEN BEDAT <= CURRENT_DATE + 90 THEN '3 Months'
    ELSE 'Beyond 3M'
  END as horizon,
  COUNT(*) as forecast_records,
  SUM(MENGE) as total_forecast
FROM PBED
WHERE ERNAM = 'STOX_AI'
  AND BEDAT >= CURRENT_DATE
GROUP BY
  CASE
    WHEN BEDAT <= CURRENT_DATE + 7 THEN '1 Week'
    WHEN BEDAT <= CURRENT_DATE + 30 THEN '1 Month'
    WHEN BEDAT <= CURRENT_DATE + 90 THEN '3 Months'
    ELSE 'Beyond 3M'
  END;
```

---

## 🚨 **ERROR HANDLING**

### **Common Issues & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| **Material not found** | MATNR doesn't exist in MARA | Validate material master before insert |
| **Plant not assigned** | WERKS not in MARC for material | Check material-plant relationship |
| **Duplicate entry** | Key violation (MATNR+WERKS+BEDAT) | Use UPSERT or delete old first |
| **Date in past** | BEDAT < system date | Filter forecasts to future dates only |
| **MRP area mismatch** | BERID doesn't exist | Use '0001' or validate MRP areas |

### **Validation Script**:
```python
def validate_forecast_data(forecast_df):
    """Validate STOX.AI forecast before SAP insert"""
    errors = []

    # Check required fields
    required = ['MATNR', 'WERKS', 'BEDAT', 'MENGE']
    for field in required:
        if field not in forecast_df.columns:
            errors.append(f"Missing required field: {field}")

    # Validate dates are future
    if (forecast_df['BEDAT'] < datetime.now().date()).any():
        errors.append("Forecast contains past dates")

    # Validate quantities are positive
    if (forecast_df['MENGE'] <= 0).any():
        errors.append("Forecast contains zero/negative quantities")

    # Validate materials exist in SAP
    sap_materials = get_valid_materials()  # Query MARA
    invalid = forecast_df[~forecast_df['MATNR'].isin(sap_materials)]
    if len(invalid) > 0:
        errors.append(f"Invalid materials: {invalid['MATNR'].tolist()}")

    return errors
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Batch Insert Strategy**:
```python
# Instead of row-by-row inserts, use bulk operations
batch_size = 1000
forecast_batches = [forecast_df[i:i+batch_size]
                    for i in range(0, len(forecast_df), batch_size)]

for batch in forecast_batches:
    conn.call('BAPI_REQUIREMENT_CREATE', IT_REQUIREMENTS=batch.to_dict('records'))
    conn.commit()
    time.sleep(0.5)  # Throttle to avoid overloading SAP
```

### **Indexing Recommendations**:
```sql
-- Create indexes for faster lookups
CREATE INDEX idx_pbed_stox ON PBED (ERNAM, BEDAT, MATNR, WERKS);
CREATE INDEX idx_pbim_period ON PBIM (PERKZ, PERXX, MATNR, WERKS);
CREATE INDEX idx_zstox_date ON ZSTOX_FORECAST (FCST_DATE, WERKS, MATNR);
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

- [ ] Create STOX_AI service account in SAP
- [ ] Assign required authorizations (S_TABU_NAM)
- [ ] Test BAPI_REQUIREMENT_CREATE with sample data
- [ ] Create ZSTOX_FORECAST custom table (if using Option 4)
- [ ] Build Python/Node.js connector using pyrfc/node-rfc
- [ ] Implement validation logic (dates, materials, quantities)
- [ ] Set up error logging and alerting
- [ ] Create nightly batch job for forecast sync
- [ ] Build monitoring dashboard (forecast coverage, accuracy)
- [ ] Document runbook for operations team
- [ ] Load sample CSV files for testing
- [ ] Validate MRP run uses STOX.AI forecasts (MD02)
- [ ] Set up forecast vs. actual tracking
- [ ] Train ML models on variance data

---

## 📂 **File Locations**

```
/db/sample_data/
├── PBIM_forecast_weekly.csv          (12 records - weekly/monthly aggregates)
├── PBED_forecast_daily.csv           (30 records - daily forecasts)
└── SAP_FORECAST_INTEGRATION_GUIDE.md (this file)
```

---

## 🎓 **SAP Transaction Codes**

| T-Code | Description | Usage |
|--------|-------------|-------|
| **MD61** | Create Independent Requirements | Manual forecast entry |
| **MD62** | Change Independent Requirements | Update forecasts |
| **MD63** | Display Independent Requirements | View PBED/PBIM data |
| **MD74** | Maintain Planning File | Refresh MRP after forecast load |
| **MD01** | Run MRP | Trigger planning run with new forecasts |
| **MD04** | Stock/Requirements List | View forecast impact on inventory |

---

**Status**: ✅ Ready for SAP integration - Sample data aligned with STOX.AI 12-store model.
