# Store Replenishment - Raw Columns (SAP Mapping)

This document maps raw data columns from the Store Replenishment module to their source SAP tables and fields.

## Raw Data Columns

| Column Name | Data Type | SAP Table | SAP Field | Description |
|-------------|-----------|-----------|-----------|-------------|
| **id** | String | Generated | - | System-generated order ID (ORDER-YYYY-NNNNNN) |
| **store_id** | String | T001W | WERKS | Plant/Store ID (e.g., Store-Chicago-001) |
| **store_name** | String | T001W | NAME1 | Plant/Store Name |
| **product_sku** | String | MARA | MATNR | Material Number / SKU |
| **product_name** | String | MAKT | MAKTX | Material Description (Text) |
| **current_inventory** | Number | MARD | LABST | Stock on Hand (Unrestricted Use Stock) |
| **reorder_point** | Number | MARC | MINBE | Reorder Point (Safety Stock Level) |
| **target_inventory** | Number | MARC | EISBE | Target Stock Level / Safety Stock |
| **moq** | Number | MARC | BSTMI | Minimum Order Quantity |
| **order_multiple** | Number | MARC | BSTRF | Rounding Profile / Lot Size |
| **unit_cost** | Number | MBEW | VERPR | Moving Average Price / Standard Price |
| **lead_time_days** | Number | MARC | PLIFZ | Planned Delivery Time (in days) |
| **supplier** | String | LFA1 | LIFNR + NAME1 | Vendor Number + Vendor Name (DC location) |
| **release_date** | Date | EKKO | BEDAT | Purchase Order Date |
| **expected_arrival** | Date | EKET | EINDT | Delivery Date (Scheduled) |
| **truck_capacity** | Number | Custom | - | Truck/Container Capacity (from logistics config) |
| **status** | String | EKKO | BSART | Document Type / Order Status |

## SAP Table Descriptions

### Master Data Tables

**T001W - Plants/Facilities**
- Primary table for store/plant information
- Contains store ID (WERKS) and store name (NAME1)
- Links to MARC for plant-specific material data

**MARA - General Material Data**
- Central material master table
- Contains material number (MATNR) and basic attributes
- Language-independent material information

**MAKT - Material Descriptions**
- Material text table (language-dependent)
- Contains MATNR and MAKTX (material description)
- Requires SPRAS (language key) = 'EN' for English

**MARC - Plant Data for Material**
- Plant-specific material data
- Contains reorder point (MINBE), target stock (EISBE)
- MOQ (BSTMI), lot size (BSTRF), lead time (PLIFZ)

**MARD - Storage Location Data for Material**
- Storage location stock data
- LABST = Unrestricted use stock (current inventory)
- Links to MARC via MATNR + WERKS

**MBEW - Material Valuation**
- Material valuation/costing data
- VERPR = Moving average price or standard price
- Contains unit cost for purchase order calculations

**LFA1 - Vendor Master (General Section)**
- Vendor/Supplier master data
- LIFNR = Vendor number (DC identifier)
- NAME1 = Vendor name (DC location name)

### Transactional Tables

**EKKO - Purchasing Document Header**
- Purchase order header data
- EBELN = Purchasing Document Number
- BEDAT = Purchase Order Date (release_date)
- BSART = Document Type (PO, RFQ, Contract, etc.)

**EKET - Scheduling Agreement Schedule Lines**
- Delivery schedule lines
- EINDT = Delivery Date / Expected arrival date
- Links to EKKO via EBELN (PO number)

## Sample SAP Query

```sql
SELECT
    t001w.WERKS as store_id,
    t001w.NAME1 as store_name,
    mara.MATNR as product_sku,
    makt.MAKTX as product_name,
    mard.LABST as current_inventory,
    marc.MINBE as reorder_point,
    marc.EISBE as target_inventory,
    marc.BSTMI as moq,
    marc.BSTRF as order_multiple,
    mbew.VERPR as unit_cost,
    marc.PLIFZ as lead_time_days,
    lfa1.LIFNR || ' - ' || lfa1.NAME1 as supplier
FROM T001W t001w
INNER JOIN MARC marc ON t001w.WERKS = marc.WERKS
INNER JOIN MARA mara ON marc.MATNR = mara.MATNR
INNER JOIN MAKT makt ON mara.MATNR = makt.MATNR AND makt.SPRAS = 'EN'
INNER JOIN MARD mard ON marc.MATNR = mard.MATNR AND marc.WERKS = mard.WERKS
INNER JOIN MBEW mbew ON marc.MATNR = mbew.MATNR AND marc.WERKS = mbew.BWKEY
LEFT JOIN LFA1 lfa1 ON marc.LIFNR = lfa1.LIFNR
WHERE t001w.WERKS LIKE 'Store-%'
    AND mard.LGORT = '0001'  -- Storage location
    AND mard.LABST < marc.MINBE  -- Current < Reorder Point
```

## Data Integration Notes

1. **Real-time vs Batch**:
   - Inventory (MARD.LABST) should be near real-time (CDC/streaming)
   - Master data can be batch-loaded (daily refresh)

2. **Data Quality**:
   - MINBE (reorder point) must be maintained in MARC
   - EISBE (target stock) may be zero if not maintained
   - PLIFZ (lead time) critical for replenishment calculation

3. **Multi-level BOM**:
   - For products with components, join STPO (BOM Item) and MAST (Material to BOM Link)

4. **Vendor/DC Mapping**:
   - LFA1.LIFNR should map to internal DC codes (DC-East, DC-Midwest, etc.)
   - Custom mapping table may be needed for vendor-to-DC translation
