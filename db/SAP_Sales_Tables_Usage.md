# SAP Sales Document Tables (VBAK/VBAP) Usage in STOX.AI

## Key SAP Sales Tables

### VBAK - Sales Document Header
Contains header-level information for sales orders, quotations, contracts, etc.

**Key Fields**:
- `VBELN` - Sales Document Number
- `ERDAT` - Document Date
- `AUART` - Order Type (OR = Sales Order, etc.)
- `VKORG` - Sales Organization
- `VTWEG` - Distribution Channel
- `KUNNR` - Sold-to Party (Customer)
- `NETWR` - Net Value of Order
- `WAERK` - Currency

### VBAP - Sales Document Items
Contains item-level details for sales documents.

**Key Fields**:
- `VBELN` - Sales Document Number
- `POSNR` - Item Number
- `MATNR` - Material Number
- `KWMENG` - Order Quantity
- `ZMENG` - Target Quantity
- `WERKS` - Plant/Store
- `NETWR` - Net Value (item level)
- `ABGRU` - Rejection Reason

### VBEP - Sales Document Schedule Lines
Delivery schedules for sales order items.

**Key Fields**:
- `VBELN` - Sales Document Number
- `POSNR` - Item Number
- `EDATU` - Requested Delivery Date
- `WMENG` - Order Quantity
- `BMENG` - Confirmed Quantity

### VBFA - Sales Document Flow
Links between sales documents (Quote → Order → Delivery → Invoice).

**Key Fields**:
- `VBELV` - Preceding Document
- `VBELN` - Subsequent Document
- `VBTYP_N` - Document Category

---

## Where VBAK/VBAP Should Be Used in STOX.AI

### 1. StoreForecast Module
**Purpose**: Use historical sales orders to train ML forecasting models

**Usage**:
```sql
-- Historical sales data for forecast training
SELECT
    vbap.WERKS as store_id,
    vbap.MATNR as product_sku,
    vbak.ERDAT as order_date,
    SUM(vbap.KWMENG) as daily_sales_units,
    COUNT(DISTINCT vbak.VBELN) as num_orders,
    SUM(vbap.NETWR) as daily_revenue
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
WHERE vbak.AUART = 'OR'  -- Sales Order
    AND vbak.ERDAT >= '2024-01-01'  -- Last 365 days
    AND vbap.ABGRU = ''  -- Not rejected
GROUP BY vbap.WERKS, vbap.MATNR, vbak.ERDAT
```

**New Columns to Add**:
- `historical_sales` (from VBAP.KWMENG aggregated)
- `sales_revenue` (from VBAP.NETWR)
- `num_transactions` (COUNT of VBAK.VBELN)
- `avg_order_size` (AVG of VBAP.KWMENG)

---

### 2. StoreHealthMonitor Module
**Purpose**: Calculate actual committed orders and fill rate

**Usage**:
```sql
-- Committed orders (open sales orders not yet delivered)
SELECT
    vbap.WERKS as store_id,
    vbap.MATNR as product_sku,
    SUM(vbap.KWMENG - COALESCE(lips.LFIMG, 0)) as committed_qty,
    COUNT(DISTINCT vbak.VBELN) as open_orders
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
LEFT JOIN LIPS lips ON vbap.VBELN = lips.VBELN
    AND vbap.POSNR = lips.POSNR
WHERE vbak.GBSTK <> 'C'  -- Not fully delivered
    AND vbap.ABGRU = ''  -- Not rejected
GROUP BY vbap.WERKS, vbap.MATNR
```

**Enhanced Column**:
- `committed_orders` - Should come from VBAP (ordered but not delivered)

**Fill Rate Calculation**:
```sql
-- Fill rate: % of orders fulfilled on time
SELECT
    vbap.WERKS,
    vbap.MATNR,
    COUNT(DISTINCT vbak.VBELN) as total_orders,
    SUM(CASE WHEN lips.WADAT_IST <= vbep.EDATU THEN 1 ELSE 0 END) as ontime_orders,
    CAST(SUM(CASE WHEN lips.WADAT_IST <= vbep.EDATU THEN 1 ELSE 0 END) AS FLOAT)
        / COUNT(DISTINCT vbak.VBELN) as fill_rate
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
INNER JOIN VBEP vbep ON vbap.VBELN = vbep.VBELN AND vbap.POSNR = vbep.POSNR
LEFT JOIN LIPS lips ON vbap.VBELN = lips.VBELN AND vbap.POSNR = lips.POSNR
WHERE vbak.ERDAT >= CURRENT_DATE - 90  -- Last 90 days
GROUP BY vbap.WERKS, vbap.MATNR
```

---

### 3. StoreFinancialImpact Module
**Purpose**: Calculate lost sales due to stockouts

**Usage**:
```sql
-- Identify rejected/cancelled orders due to stockout
SELECT
    vbap.WERKS as store_id,
    vbap.MATNR as product_sku,
    SUM(CASE WHEN vbap.ABGRU IN ('01', '02') THEN vbap.KWMENG ELSE 0 END) as lost_sales_qty,
    SUM(CASE WHEN vbap.ABGRU IN ('01', '02') THEN vbap.NETWR ELSE 0 END) as lost_revenue
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
WHERE vbak.ERDAT >= CURRENT_DATE - 30  -- Last 30 days
    AND vbap.ABGRU IN ('01', '02')  -- Rejection reasons: out of stock
GROUP BY vbap.WERKS, vbap.MATNR
```

**New Columns to Add**:
- `lost_sales` (from VBAP with ABGRU = stockout rejection codes)
- `lost_revenue` (from VBAP.NETWR for rejected items)
- `stockout_incidents` (COUNT of stockout rejections)

---

### 4. DCDemandAggregation Module
**Purpose**: Aggregate actual sales orders by channel

**Usage**:
```sql
-- Channel-level demand aggregation from sales orders
SELECT
    vbap.WERKS as dc_location,
    vbap.MATNR as product_sku,
    vbak.VTWEG as distribution_channel,
    CASE
        WHEN vbak.VTWEG = '10' THEN 'Retail'
        WHEN vbak.VTWEG = '20' THEN 'Wholesale'
        WHEN vbak.VTWEG = '30' THEN 'Amazon'
        WHEN vbak.VTWEG = '40' THEN 'D2C'
    END as channel_name,
    SUM(vbap.KWMENG) as total_demand
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
WHERE vbak.ERDAT >= CURRENT_DATE - 7  -- Last week
GROUP BY vbap.WERKS, vbap.MATNR, vbak.VTWEG
```

**Enhanced Columns**:
- `retail_fcst` - Can be validated against actual VBAK/VBAP sales
- `amazon_fcst` - Channel-specific validation
- `d2c_fcst` - Direct channel validation
- `wholesale_fcst` - B2B channel validation

---

### 5. DCPlanningTable Module
**Purpose**: Use sales orders as independent requirements for MRP

**Usage**:
```sql
-- Independent requirements from customer sales orders
SELECT
    vbap.WERKS as dc_location,
    vbap.MATNR as component,
    vbep.EDATU as requirement_date,
    SUM(vbep.WMENG) as gross_requirement,
    'Sales Order' as mrp_element_type,
    vbak.VBELN as document_number
FROM VBAK vbak
INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
INNER JOIN VBEP vbep ON vbap.VBELN = vbep.VBELN AND vbap.POSNR = vbep.POSNR
WHERE vbep.EDATU >= CURRENT_DATE
    AND vbak.GBSTK <> 'C'  -- Not completed
GROUP BY vbap.WERKS, vbap.MATNR, vbep.EDATU, vbak.VBELN
```

**New Column**:
- `mrp_element` - Should include 'SO' (Sales Order) with VBELN reference

---

## Updated Column Mapping with VBAK/VBAP

### Additional Columns to Include

| Module | Column Name | SAP Table.Field | Description |
|--------|-------------|-----------------|-------------|
| StoreForecast | historical_sales | VBAP.KWMENG (aggregated) | Actual sales history for model training |
| StoreForecast | sales_revenue | VBAP.NETWR (aggregated) | Revenue history |
| StoreForecast | num_transactions | COUNT(VBAK.VBELN) | Number of sales orders |
| StoreHealthMonitor | committed_orders | VBAP.KWMENG - LIPS.LFIMG | Open sales orders not delivered |
| StoreHealthMonitor | fill_rate | Calculated from VBAK/VBEP/LIPS | On-time fulfillment rate |
| StoreHealthMonitor | backorders | VBAP where GBSTK = 'B' | Backordered quantity |
| StoreFinancialImpact | lost_sales | VBAP.KWMENG (ABGRU = stockout) | Lost sales due to stockout |
| StoreFinancialImpact | lost_revenue | VBAP.NETWR (ABGRU = stockout) | Revenue lost from stockouts |
| StoreFinancialImpact | stockout_incidents | COUNT(VBAP with ABGRU) | Number of stockout events |
| DCDemandAggregation | retail_actual | VBAP (VTWEG = 10) | Actual retail channel sales |
| DCDemandAggregation | amazon_actual | VBAP (VTWEG = 30) | Actual Amazon sales |
| DCDemandAggregation | d2c_actual | VBAP (VTWEG = 40) | Actual D2C sales |
| DCDemandAggregation | wholesale_actual | VBAP (VTWEG = 20) | Actual wholesale sales |
| DCDemandAggregation | forecast_vs_actual | Calculated | Forecast accuracy |
| DCPlanningTable | sales_order_demand | VBAP.KWMENG via VBEP | Customer demand from sales orders |
| DCPlanningTable | so_document | VBAK.VBELN | Sales order number |

---

## SAP Document Flow

```
Customer Order → VBAK (Header) + VBAP (Items) + VBEP (Schedule)
    ↓
Delivery → LIKP (Header) + LIPS (Items)
    ↓
Goods Issue → MARD.LABST updated (inventory reduction)
    ↓
Invoice → VBRK (Header) + VBRP (Items)
```

**Key Integration Points**:
1. **VBAK/VBAP** → Demand signal for forecasting
2. **VBEP** → Delivery schedule for committed orders
3. **VBFA** → Document flow for order-to-delivery tracking
4. **LIPS** → Actual deliveries for fill rate calculation
5. **MARD** → Inventory impact from goods issue

---

## SQL Query Examples

### Complete Store Health Monitor with Sales Orders

```sql
SELECT
    t001w.WERKS as store_id,
    t001w.NAME1 as store_name,
    mara.MATNR as product_sku,
    makt.MAKTX as product_name,

    -- Current Inventory
    mard.LABST as current_inventory,

    -- Inbound (Purchase Orders)
    COALESCE(po.on_order, 0) as inbound_shipments,

    -- Committed (Open Sales Orders)
    COALESCE(so.committed_qty, 0) as committed_orders,

    -- Available
    mard.LABST + COALESCE(po.on_order, 0) - COALESCE(so.committed_qty, 0) as available_inventory,

    -- Target & Safety Stock
    marc.EISBE as target_inventory,
    marc.MINBE as safety_stock,

    -- Fill Rate (last 30 days)
    COALESCE(fr.fill_rate, 0) as fill_rate

FROM T001W t001w
INNER JOIN MARC marc ON t001w.WERKS = marc.WERKS
INNER JOIN MARA mara ON marc.MATNR = mara.MATNR
INNER JOIN MAKT makt ON mara.MATNR = makt.MATNR AND makt.SPRAS = 'EN'
INNER JOIN MARD mard ON marc.MATNR = mard.MATNR AND marc.WERKS = mard.WERKS

-- Inbound POs
LEFT JOIN (
    SELECT
        ekpo.MATNR,
        ekpo.WERKS,
        SUM(eket.MENGE) as on_order
    FROM EKKO ekko
    INNER JOIN EKPO ekpo ON ekko.EBELN = ekpo.EBELN
    INNER JOIN EKET eket ON ekpo.EBELN = eket.EBELN AND ekpo.EBELP = eket.EBELP
    WHERE ekko.BSART = 'NB'  -- Purchase Order
        AND eket.EINDT >= CURRENT_DATE
    GROUP BY ekpo.MATNR, ekpo.WERKS
) po ON mara.MATNR = po.MATNR AND t001w.WERKS = po.WERKS

-- Committed Sales Orders
LEFT JOIN (
    SELECT
        vbap.MATNR,
        vbap.WERKS,
        SUM(vbap.KWMENG - COALESCE(lips.LFIMG, 0)) as committed_qty
    FROM VBAK vbak
    INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
    LEFT JOIN LIPS lips ON vbap.VBELN = lips.VBELN AND vbap.POSNR = lips.POSNR
    WHERE vbak.GBSTK <> 'C'  -- Not fully delivered
        AND vbap.ABGRU = ''  -- Not rejected
    GROUP BY vbap.MATNR, vbap.WERKS
) so ON mara.MATNR = so.MATNR AND t001w.WERKS = so.WERKS

-- Fill Rate
LEFT JOIN (
    SELECT
        vbap.MATNR,
        vbap.WERKS,
        CAST(COUNT(CASE WHEN lips.WADAT_IST <= vbep.EDATU THEN 1 END) AS FLOAT)
            / NULLIF(COUNT(*), 0) as fill_rate
    FROM VBAK vbak
    INNER JOIN VBAP vbap ON vbak.VBELN = vbap.VBELN
    INNER JOIN VBEP vbep ON vbap.VBELN = vbep.VBELN AND vbap.POSNR = vbep.POSNR
    LEFT JOIN LIPS lips ON vbap.VBELN = lips.VBELN AND vbap.POSNR = lips.POSNR
    WHERE vbak.ERDAT >= CURRENT_DATE - 30
        AND lips.LFIMG IS NOT NULL
    GROUP BY vbap.MATNR, vbap.WERKS
) fr ON mara.MATNR = fr.MATNR AND t001w.WERKS = fr.WERKS

WHERE t001w.WERKS LIKE 'Store-%'
```

---

## Conclusion

**VBAK/VBAP should be used for**:
1. ✅ Historical sales data for ML forecast training
2. ✅ Committed orders calculation (open sales orders)
3. ✅ Fill rate and service level calculation
4. ✅ Lost sales / stockout impact analysis
5. ✅ Channel-specific demand validation
6. ✅ Independent requirements for MRP planning

These tables are **critical** for connecting demand (sales orders) to supply planning (inventory/replenishment).
