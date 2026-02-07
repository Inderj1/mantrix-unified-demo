# STOX.AI — Revised 7-Tile Architecture
## Dual-Lens: Every Screen Shows Quantities AND Capital

### Design Principle
Every tile must pass the "Two-User Test":
- **Planner opens it**: Can they act on a shortage in the next 48 hours? YES or tile fails.
- **CFO opens it**: Can they see the cash/margin impact of that shortage? YES or tile fails.

If a tile only serves one user, it's half a product.

---

## TILE 0 — Economic Ground Truth (Foundation Layer)
**KEEP AS-IS (minor qty additions)**

Why it stays: No competitor validates data before optimizing. This is trust infrastructure.
What changes: Add quantity-level checks (UoM consistency, BOM qty validation, stock quantity reconciliation) alongside cost/valuation checks.

Example dual-lens:
- OLD: "Cost drift: -18.4% ($200 std vs $237 actual)"
- NEW: "Cost drift: -18.4% ($200 std vs $237 actual) | Stock: 1,420 EA × $37.20 variance = $52.8K phantom value"

**Verdict: KEEP. Unique. No redundancy.**

---

## TILE 1 — Inventory Capital Health (Balance Sheet Lens)
**MAJOR UPGRADE: Add full quantity decomposition**

Current problem: Shows $42.8M total but never shows 148,000 EA total, 42,000 EA excess, 18,000 EA below safety stock.

New dual-lens:
- Quantity view: Total stock qty, excess qty, shortage qty, coverage days, turns
- Capital view: Total $, excess $, trapped $, carrying cost $, ROIC
- BOTH visible simultaneously — not tabs, not toggles. Side by side.

Example:
| | Quantity | Capital |
|---|---------|---------|
| Total Stock | 148,240 EA | $42.8M |
| Excess (>90d coverage) | 42,180 EA | $11.8M |
| Below Safety Stock | 6,420 EA | $3.2M (revenue at risk) |
| Coverage Days | 68 days | $9.4M/yr carrying |

**Verdict: KEEP. Add quantities. Critical for planners.**

---

## TILE 2 — Demand vs Supply Command Center (REPLACES old "Demand Quality")
**COMPLETE REDESIGN — This is where you beat Pelico**

Old Tile 2 was "Demand Quality & Revenue Certainty" — too abstract. 
A planner doesn't care about "margin-weighted CV." They care about:
"I have 3,200 EA demand in the next 30 days and only 2,220 EA available. 
Where's my gap? Which orders are at risk? What's the $ exposure?"

NEW Tile 2 is the OPERATIONAL HEART of STOX.AI:

### Level 1: Demand vs Supply Dashboard
- Real demand (actual sales orders from VBAK/VBAP — not forecasts)
- Forecasted demand (ML models — clearly separated from real orders)
- Total supply (on-hand + open POs + planned orders + in-transit)
- NET POSITION = Supply - Demand (quantity AND $)
- Bottleneck alerts: SKUs where demand > supply in next 7/14/30/60 days
- Color-coded: GREEN (covered) / AMBER (tight) / RED (short)

### Level 2: SKU-Level Supply/Demand Waterfall
| Period | Demand (EA) | Supply (EA) | Net Position | Cum. Position | $ Exposure |
|--------|-------------|-------------|--------------|---------------|------------|
| Today  | —           | 1,420 (OH)  | +1,420       | +1,420        | —          |
| Week 1 | -680 (SO)   | +500 (PO)   | -180         | +1,240        | —          |
| Week 2 | -920 (SO+FC)| —           | -920         | +320          | —          |
| Week 3 | -840 (FC)   | +1,200 (PO) | +360         | +680          | —          |
| Week 4 | -760 (FC)   | —           | -760         | -80           | $16K risk  |

This is what Pelico does. But STOX.AI adds the $ column.

### Level 3: Order-Level Detail
- Actual sales order: SO 300012847 / Customer: Boeing / 400 EA / Due: Feb 12
- Forecast order: FC-2025-W08 / 520 EA / Confidence: 78% / Revenue: $104K
- Supply: PO 4500018923 / Vendor: VENDOR-A / 500 EA / ETA: Feb 10 / OTD risk: 28%

### What STOX.AI adds beyond Pelico:
- Revenue-at-risk for each shortage ($, not just EA)
- Margin quality of demand (is the shorted order high-margin or low-margin?)
- Demand confidence scoring (real SO = 100%, forecast = ML confidence %)
- Optimal service level per SKU (from economic calculation, not arbitrary 95%)

**Verdict: COMPLETE REDESIGN. This is your Pelico killer. Qty-first, $-enriched.**

---

## TILE 3 — Supply Risk & Vendor Performance (STREAMLINED)
**KEEP but add heavy quantity metrics**

Current problem: Too focused on "capital risk premium" without showing the actual PO quantities, delivery quantities, shortage quantities.

New dual-lens:
- Quantity view: PO qty, received qty, short-shipped qty, late qty, open qty by vendor
- Financial view: Capital burden $, risk premium $, expedite cost $
- Vendor scorecard: OTD%, quantity fill rate, lead time distribution (actual histogram)

Critical addition: VENDOR × SKU HEAT MAP
- Rows = vendors, Columns = SKUs
- Cell color = risk level
- Cell content = "320 EA short / $64K exposed"

This directly shows bottlenecks.

**Verdict: KEEP. Add quantities. Remove overlap with Tile 5.**

---

## TILE 4 — Safety Stock & Reorder Economics (Decision Engine)
**KEEP but show quantities FIRST, then economics**

Current problem: Opens with $ impact. Should open with:
"Current SS: 482 EA | Optimal SS: 680 EA | Gap: +198 EA | Investment: +$39.6K"

The planner sees the EA change. The CFO sees the $ change. Same row.

New format for every recommendation:
| Parameter | Current | Optimal | Δ Qty | Δ $ | Rationale |
|-----------|---------|---------|-------|-----|-----------|
| Safety Stock | 482 EA | 680 EA | +198 | +$39.6K | LT variance + demand CV |
| Reorder Point | 720 EA | 1,008 EA | +288 | +$57.6K | PLIFZ correction 14→21d |
| Lot Size | FX 500 | EX — | dynamic | -$18K/yr | Reduces lumpy ordering |

**Verdict: KEEP. Reorder: qty first, $ second.**

---

## TILE 5 — MRP Signal Quality & Execution Integrity
**KEEP but REMOVE overlap with Tile 3**

Honest question: Does Tile 5 overlap with Tile 3 (Supply Risk)?
- Tile 3 = EXTERNAL risk (vendor performance, lead times, supply reliability)
- Tile 5 = INTERNAL noise (MRP parameter errors, false exceptions, planning churn)

They're different. Tile 3 is "your vendors are unreliable."
Tile 5 is "your MRP settings are wrong and generating garbage signals."

But we need to make this distinction CRYSTAL CLEAR.

New framing for Tile 5:
- Quantity focus: How many exception messages per SKU? How many false PO proposals?
- Action focus: Which MRP parameters are wrong and what should they be?
- Financial focus: What does this noise cost in expedites, planner time, phantom orders?

Add: MRP exception message waterfall (visual)
- 1,847 total messages → 486 actionable (26%) → 1,361 noise (74%)
- Noise decomposition: 680 reschedule-in + 412 reschedule-out + 269 false cancels
- Financial: $3.6M/yr wasted

**Verdict: KEEP. Sharpen distinction from Tile 3. Add qty metrics.**

---

## TILE 6 — Capital Impact Simulator (CFO/Board Lens)
**KEEP AS-IS (it's the crown jewel)**

Minor additions:
- Show TOTAL quantities affected (not just $): "342 SKUs, 148,240 EA repositioned"
- Phase implementation in both qty and $
- Monte Carlo shows qty ranges too (not just $ ranges)

**Verdict: KEEP. Add quantity summary. Board-ready.**

---

## REDUNDANCY CHECK — FINAL

| Tile | Primary User | Unique Value | Overlap? |
|------|-------------|--------------|----------|
| 0 | Data Engineer / Auditor | Data trust before optimization | NONE |
| 1 | CFO / Controller | Balance sheet decomposition | NONE |
| 2 | Planner / S&OP | Demand vs Supply matching (Pelico killer) | NONE — replaces old abstract demand tile |
| 3 | Procurement / Vendor Mgr | Vendor-caused risk (EXTERNAL) | Clear boundary with Tile 5 |
| 4 | Planner / Finance | SS/ROP parameter economics | NONE |
| 5 | Planner / MRP Admin | MRP signal noise (INTERNAL) | Clear boundary with Tile 3 |
| 6 | CFO / Board | Aggregate decision + simulation | NONE — aggregates all tiles |

**Every tile serves a different primary user and answers a different question.**
**No tile can be removed without losing a critical capability.**

---

## KEY DESIGN RULE FOR REBUILD

Every KPI card, every table row, every detail view MUST show:

```
[QUANTITY]  |  [VALUE]  |  [DELTA / ACTION]
1,420 EA    |  $284K    |  -198 EA / -$39.6K needed
```

Never show $ without EA. Never show EA without $.
This is what makes STOX.AI simultaneously operational AND financial.
This is what neither Pelico (qty-only) nor o9 (abstract) delivers.
