"""
ORDLY.AI Static Data - Single source of truth for demo order data.

This module provides consistent order data that flows through all pipeline stages.
All values are mathematically consistent:
- margin_dollar = order_value * (margin_pct / 100)
- list_price = order_value (before discounts)
- cost_breakdown adds up to (order_value - margin_dollar)

Three demo orders matching extracted PO data:
- 3M Industrial: $36,750 order
- Quanex Building: $55,616 order
- Shurtape Technologies: $27,512 order
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class OrderFinancials:
    """Financial metrics for an order - all values mathematically consistent."""
    order_value: float          # Total order value (list price after any discounts)
    margin_pct: float           # Margin percentage
    margin_dollar: float = 0    # Calculated: order_value * margin_pct / 100
    material_cost: float = 0    # 60% of total costs
    conversion_cost: float = 0  # 25% of total costs
    freight_cost: float = 0     # 15% of total costs

    def __post_init__(self):
        """Calculate derived values to ensure consistency."""
        self.margin_dollar = round(self.order_value * (self.margin_pct / 100), 2)
        total_costs = self.order_value - self.margin_dollar
        self.material_cost = round(total_costs * 0.60, 2)
        self.conversion_cost = round(total_costs * 0.25, 2)
        self.freight_cost = round(total_costs * 0.15, 2)


@dataclass
class CustomerMetrics:
    """Customer-level metrics for CLV and credit risk."""
    customer_id: str
    customer_name: str
    # CLV metrics - realistic values based on customer tier
    clv: float                  # Customer lifetime value
    alive_probability: float    # Probability customer remains active (0-1)
    expected_purchases: int     # Expected future purchases
    avg_order_value: float      # Historical average order value
    frequency: int              # Orders per year
    recency_days: int           # Days since last order
    # Credit metrics
    credit_grade: str           # A+, A, B, C
    risk_score: int             # 0-100 (lower is better)
    payment_terms: str          # Net 30, Net 45, etc.
    credit_limit: float         # Credit limit in USD
    segment: str                # INVEST, MAINTAIN, GROW


@dataclass
class SkuOption:
    """SKU option with consistent margin calculations."""
    sku: str
    name: str
    margin_pct: float
    availability: str           # In Stock, Partial, None
    lead_time_days: int
    plant: str
    plant_name: str
    coverage_pct: float         # Inventory coverage percentage
    is_recommended: bool = False
    is_exact_match: bool = False
    is_fastest: bool = False
    tags: List[str] = field(default_factory=list)
    specs: List[str] = field(default_factory=list)

    def get_margin_dollar(self, order_value: float) -> float:
        """Calculate margin dollar based on order value."""
        return round(order_value * (self.margin_pct / 100), 2)


@dataclass
class LineItemFinancials:
    """Financial metrics for a single line item - all values mathematically consistent."""
    line_value: float           # Extended price (qty * unit_price)
    margin_pct: float           # Line-level margin percentage
    margin_dollar: float = 0    # Calculated: line_value * margin_pct / 100
    material_cost: float = 0    # 60% of total costs
    conversion_cost: float = 0  # 25% of total costs
    freight_cost: float = 0     # 15% of total costs

    def __post_init__(self):
        """Calculate derived values to ensure consistency."""
        self.margin_dollar = round(self.line_value * (self.margin_pct / 100), 2)
        total_costs = self.line_value - self.margin_dollar
        self.material_cost = round(total_costs * 0.60, 2)
        self.conversion_cost = round(total_costs * 0.25, 2)
        self.freight_cost = round(total_costs * 0.15, 2)


@dataclass
class LineItem:
    """A single line item within an order."""
    line_number: int
    material: str               # Requested material description
    material_id: str            # SKU/Item number from PO
    quantity: float
    unit: str                   # UOM (MSI, LM, EA, etc.)
    unit_price: float
    extended_price: float       # quantity * unit_price

    # Per-line workflow status
    line_stage: int = 0         # 0=Intent, 1=Decisioning, 2=Arbitration, 3=Committing, 4=Complete
    line_status: str = "pending"  # pending, approved, held, rejected, escalated

    # Per-line SKU selection
    selected_sku: Optional[str] = None
    selected_plant: Optional[str] = None

    # Per-line financials
    financials: Optional[LineItemFinancials] = None

    # Line-level delivery
    requested_delivery: Optional[str] = None
    promised_delivery: Optional[str] = None
    lead_time_days: Optional[int] = None

    def __post_init__(self):
        """Auto-calculate financials if not provided."""
        if self.financials is None and self.extended_price > 0:
            # Default margin of 26% if not specified
            self.financials = LineItemFinancials(
                line_value=self.extended_price,
                margin_pct=26.0
            )


# ============================================================================
# STATIC ORDER DATA - Single source of truth
# ============================================================================

DEMO_ORDERS: Dict[str, Dict[str, Any]] = {
    # Order 1: Single line item (1 line)
    "3588457": {
        "po_number": "3588457",
        "customer": "Shurtape Technologies LLC",
        "customer_id": "0001004122",
        "material": "BoPET Film 2mil Release Liner",
        "material_id": "RL-BOPET-2M-S",
        "quantity": 8000,
        "unit": "SF",
        "order_date": "2024-12-22",
        "requested_delivery": "2025-01-20",
        "ship_to": "1712 8th St Dr SE, Hickory, NC 28602",
        "payment_terms": "Net 30",
        "freight_terms": "FOB Destination",
        "incoterms": "DAP",
        "line_items": [
            LineItem(
                line_number=1,
                material="BoPET Film 2mil Release Liner",
                material_id="RL-BOPET-2M-S",
                quantity=8000,
                unit="SF",
                unit_price=3.44,
                extended_price=27512.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-01-20",
                financials=LineItemFinancials(line_value=27512.00, margin_pct=25.8),
            ),
        ],
        "financials": OrderFinancials(order_value=27512.00, margin_pct=25.8),
        "customer_metrics": CustomerMetrics(
            customer_id="0001004122",
            customer_name="Shurtape Technologies LLC",
            clv=385000.00,
            alive_probability=0.82,
            expected_purchases=8,
            avg_order_value=32000.00,
            frequency=8,
            recency_days=45,
            credit_grade="A",
            risk_score=32,
            payment_terms="Net 30",
            credit_limit=150000.00,
            segment="GROW",
        ),
        "stage": 2,
        "stage_label": "Arbitration",
        "status": "processing",
        "line_count": 1,
        "lines_approved": 0,
        "lines_pending": 1,
    },

    # Order 2: Royal Adhesives - REAL from DB (2 line items)
    "160769": {
        "po_number": "160769",
        "customer": "Royal Adhesives & Sealants",
        "customer_id": "ROYAL001",
        "material": "PK-2360-18,96# TN KFT LL 4000D/4000D",
        "material_id": "311529",
        "quantity": 475000,
        "unit": "SF",
        "order_date": "2024-09-16",
        "requested_delivery": "2026-02-09",
        "ship_to": "4401 Page Ave, Michigan Center, MI 49254",
        "payment_terms": "Net 90 Days",
        "freight_terms": "COLLECT",
        "incoterms": "COLLECT",
        "line_items": [
            LineItem(
                line_number=1,
                material="PK-2360-18,96# TN KFT LL 4000D/4000D",
                material_id="311529",
                quantity=250000,
                unit="SF",
                unit_price=0.0878,
                extended_price=21950.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2026-02-09",
                financials=LineItemFinancials(line_value=21950.00, margin_pct=28.5),
            ),
            LineItem(
                line_number=2,
                material="336 258, 0.875\" RP-S76# GRADE11181 BL KFT H/HP",
                material_id="312763",
                quantity=225000,
                unit="SF",
                unit_price=0.1157,
                extended_price=26021.25,
                line_stage=1,
                line_status="pending",
                requested_delivery="2026-02-09",
                financials=LineItemFinancials(line_value=26021.25, margin_pct=31.2),
            ),
        ],
        "financials": OrderFinancials(order_value=47971.25, margin_pct=29.9),
        "customer_metrics": CustomerMetrics(
            customer_id="ROYAL001",
            customer_name="Royal Adhesives & Sealants",
            clv=920000.00,
            alive_probability=0.91,
            expected_purchases=18,
            avg_order_value=52000.00,
            frequency=18,
            recency_days=20,
            credit_grade="A",
            risk_score=18,
            payment_terms="Net 90 Days",
            credit_limit=350000.00,
            segment="INVEST",
        ),
        "stage": 1,
        "stage_label": "Decisioning",
        "status": "processing",
        "line_count": 2,
        "lines_approved": 0,
        "lines_pending": 2,
    },

    # Order 3: Royal Adhesives - REAL from DB (3 line items)
    "160008": {
        "po_number": "160008",
        "customer": "Royal Adhesives & Sealants",
        "customer_id": "ROYAL001",
        "material": "PK-2317-18,5 MIL WHITE 8400J/8400J FILM",
        "material_id": "311496",
        "quantity": 675000,
        "unit": "SF",
        "order_date": "2024-07-31",
        "requested_delivery": "2025-10-27",
        "ship_to": "4401 Page Ave, Michigan Center, MI 49254",
        "payment_terms": "Net 90 Days",
        "freight_terms": "COLLECT",
        "incoterms": "COLLECT",
        "line_items": [
            LineItem(
                line_number=1,
                material="PK-2317-18,5 MIL WHITE 8400J/8400J FILM",
                material_id="311496",
                quantity=225000,
                unit="SF",
                unit_price=0.1079,
                extended_price=24275.25,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-10-27",
                financials=LineItemFinancials(line_value=24275.25, margin_pct=27.8),
            ),
            LineItem(
                line_number=2,
                material="PK-3373-5W21I,5 MIL-HPDE-2SC-WH FILM; 3-5:1",
                material_id="311908",
                quantity=225000,
                unit="SF",
                unit_price=0.1209,
                extended_price=27198.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-10-27",
                financials=LineItemFinancials(line_value=27198.00, margin_pct=29.5),
            ),
            LineItem(
                line_number=3,
                material="4\" x 3 MIL CLEAR POLYESTER FILM 7300A/7320A",
                material_id="318274",
                quantity=225000,
                unit="SF",
                unit_price=0.123,
                extended_price=27679.50,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-10-27",
                financials=LineItemFinancials(line_value=27679.50, margin_pct=31.2),
            ),
        ],
        "financials": OrderFinancials(order_value=79152.75, margin_pct=29.5),
        "customer_metrics": CustomerMetrics(
            customer_id="ROYAL001",
            customer_name="Royal Adhesives & Sealants",
            clv=920000.00,
            alive_probability=0.91,
            expected_purchases=18,
            avg_order_value=52000.00,
            frequency=18,
            recency_days=20,
            credit_grade="A",
            risk_score=18,
            payment_terms="Net 90 Days",
            credit_limit=350000.00,
            segment="INVEST",
        ),
        "stage": 1,
        "stage_label": "Decisioning",
        "status": "processing",
        "line_count": 3,
        "lines_approved": 0,
        "lines_pending": 3,
    },

    # Order 4: Quanex Building Products (4 line items)
    "841206": {
        "po_number": "841206",
        "customer": "Quanex Building Products",
        "customer_id": "0001002891",
        "material": "PP Film Release Liner - Blue Tint",
        "material_id": "RL-PP-BT-S",
        "quantity": 31975,
        "unit": "SF",
        "order_date": "2024-12-18",
        "requested_delivery": "2025-09-05",
        "ship_to": "1800 W Loop S, Houston, TX 77027",
        "payment_terms": "Net 30",
        "freight_terms": "FOB Origin",
        "incoterms": "FCA",
        "line_items": [
            LineItem(
                line_number=1,
                material="PP Film Release Liner - Blue Tint",
                material_id="RL-PP-BT-S",
                quantity=6975,
                unit="SF",
                unit_price=2.10,
                extended_price=14647.50,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-09-05",
                financials=LineItemFinancials(line_value=14647.50, margin_pct=31.2),
            ),
            LineItem(
                line_number=2,
                material="Silicone Release Paper 50lb",
                material_id="RL-SIL50-P-S",
                quantity=8000,
                unit="SF",
                unit_price=2.45,
                extended_price=19600.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-09-05",
                financials=LineItemFinancials(line_value=19600.00, margin_pct=29.5),
            ),
            LineItem(
                line_number=3,
                material="Kraft Paper Release Liner 60lb",
                material_id="RL-KFT60-P-S",
                quantity=12000,
                unit="SF",
                unit_price=2.21,
                extended_price=26520.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-09-08",
                financials=LineItemFinancials(line_value=26520.00, margin_pct=32.8),
            ),
            LineItem(
                line_number=4,
                material="PET 75um Fluoropolymer Release Liner",
                material_id="RL-PET75-FP-S",
                quantity=5000,
                unit="SF",
                unit_price=1.85,
                extended_price=9250.00,
                line_stage=1,
                line_status="pending",
                requested_delivery="2025-09-10",
                financials=LineItemFinancials(line_value=9250.00, margin_pct=28.5),
            ),
        ],
        "financials": OrderFinancials(order_value=70017.50, margin_pct=30.5),
        "customer_metrics": CustomerMetrics(
            customer_id="0001002891",
            customer_name="Quanex Building Products",
            clv=720000.00,
            alive_probability=0.88,
            expected_purchases=12,
            avg_order_value=48000.00,
            frequency=12,
            recency_days=28,
            credit_grade="A",
            risk_score=25,
            payment_terms="Net 30",
            credit_limit=250000.00,
            segment="MAINTAIN",
        ),
        "stage": 1,
        "stage_label": "Decisioning",
        "status": "processing",
        "line_count": 4,
        "lines_approved": 0,
        "lines_pending": 4,
    },
}


# ============================================================================
# SKU OPTIONS - Consistent margin calculations per order
# ============================================================================

def get_sku_options_for_order(po_number: str) -> List[SkuOption]:
    """
    Get SKU options for a specific order.
    Each order has tailored SKU options with margins that make business sense.
    """
    order = DEMO_ORDERS.get(po_number)
    if not order:
        return get_default_sku_options()

    base_margin = order["financials"].margin_pct

    # Generate 4 SKU options with varying margins around base
    options = [
        SkuOption(
            sku="RL-PET75-FP-S",
            name="Standard Fluoropolymer Release (Recommended)",
            margin_pct=base_margin + 3.5,  # Best margin option
            availability="In Stock",
            lead_time_days=5,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=100,
            is_recommended=True,
            tags=["RECOMMENDED", "BEST MARGIN"],
            specs=[
                "75μm ± 3μm thickness",
                "Fluoropolymer coating",
                "30,000 MSI available",
            ],
        ),
        SkuOption(
            sku="RL-PET75-FP-P",
            name="Premium Fluoropolymer Release (Exact Match)",
            margin_pct=base_margin,  # Base margin - exact match
            availability="Partial",
            lead_time_days=12,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=65,
            is_exact_match=True,
            tags=["EXACT MATCH"],
            specs=[
                "75μm ± 2μm thickness",
                "Premium fluoropolymer",
                "15,000 MSI in stock + 10,000 MSI in production",
            ],
        ),
        SkuOption(
            sku="RL-PET72-FP-S",
            name="72μm Thickness Alternate (Fastest)",
            margin_pct=base_margin + 1.5,  # Good margin
            availability="In Stock",
            lead_time_days=3,
            plant="2200",
            plant_name="Wisconsin Plant",
            coverage_pct=100,
            is_fastest=True,
            tags=["THICKNESS ALT", "FASTEST"],
            specs=[
                "72μm ± 2μm (within ±5% tolerance)",
                "Standard fluoropolymer",
                "28,000 MSI available",
            ],
        ),
        SkuOption(
            sku="NEW-SKU-REQ",
            name="New SKU Creation Required (Not Recommended)",
            margin_pct=base_margin - 5.0,  # Lower margin due to setup costs
            availability="None",
            lead_time_days=45,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=0,
            tags=["NOT RECOMMENDED", "NEW SKU"],
            specs=[
                "Custom specification required",
                "Qualification testing needed",
                "45+ day lead time",
            ],
        ),
    ]

    return options


def get_default_sku_options() -> List[SkuOption]:
    """Fallback SKU options when order not found."""
    return [
        SkuOption(
            sku="RL-STD-001",
            name="Standard Release Liner",
            margin_pct=28.0,
            availability="In Stock",
            lead_time_days=5,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=100,
            is_recommended=True,
            tags=["RECOMMENDED"],
            specs=["Standard specification"],
        ),
    ]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_order(po_number: str) -> Dict[str, Any]:
    """Get order data by PO number."""
    # Normalize PO number (strip prefixes)
    clean_po = po_number.replace("PO-", "").replace("INT-", "").replace("ORD-", "").replace("SO-", "").strip()
    return DEMO_ORDERS.get(clean_po, {})


def get_all_orders() -> List[Dict[str, Any]]:
    """Get all demo orders."""
    return list(DEMO_ORDERS.values())


def get_order_financials(po_number: str) -> OrderFinancials:
    """Get financial data for an order."""
    order = get_order(po_number)
    if order:
        return order["financials"]
    # Return default financials
    return OrderFinancials(order_value=50000.00, margin_pct=26.0)


def get_customer_metrics(customer_id: str) -> CustomerMetrics:
    """Get customer metrics by customer ID."""
    for order in DEMO_ORDERS.values():
        if order["customer_id"] == customer_id:
            return order["customer_metrics"]
    # Return default metrics
    return CustomerMetrics(
        customer_id=customer_id,
        customer_name="Unknown Customer",
        clv=250000.00,
        alive_probability=0.75,
        expected_purchases=6,
        avg_order_value=35000.00,
        frequency=6,
        recency_days=60,
        credit_grade="B",
        risk_score=45,
        payment_terms="Net 30",
        credit_limit=100000.00,
        segment="MAINTAIN",
    )


def format_margin_waterfall(financials: OrderFinancials) -> List[Dict[str, Any]]:
    """
    Format margin waterfall data for frontend display.
    All values are mathematically consistent.
    """
    return [
        {
            "label": "Order Value",
            "value": financials.order_value,
            "formatted": f"${financials.order_value:,.0f}",
            "isPositive": True,
            "pct": 100,
        },
        {
            "label": "Material Cost",
            "value": -financials.material_cost,
            "formatted": f"-${financials.material_cost:,.0f}",
            "isPositive": False,
            "pct": round(financials.material_cost / financials.order_value * 100, 1),
        },
        {
            "label": "Conversion Cost",
            "value": -financials.conversion_cost,
            "formatted": f"-${financials.conversion_cost:,.0f}",
            "isPositive": False,
            "pct": round(financials.conversion_cost / financials.order_value * 100, 1),
        },
        {
            "label": "Freight Cost",
            "value": -financials.freight_cost,
            "formatted": f"-${financials.freight_cost:,.0f}",
            "isPositive": False,
            "pct": round(financials.freight_cost / financials.order_value * 100, 1),
        },
        {
            "label": "Landed Margin",
            "value": financials.margin_dollar,
            "formatted": f"${financials.margin_dollar:,.0f}",
            "isPositive": True,
            "pct": financials.margin_pct,
        },
    ]


# ============================================================================
# LINE ITEM HELPER FUNCTIONS
# ============================================================================

def get_order_line_items(po_number: str) -> List[LineItem]:
    """Get all line items for an order."""
    order = get_order(po_number)
    if order and "line_items" in order:
        return order["line_items"]
    return []


def get_line_item(po_number: str, line_number: int) -> Optional[LineItem]:
    """Get a specific line item from an order."""
    line_items = get_order_line_items(po_number)
    for item in line_items:
        if item.line_number == line_number:
            return item
    return None


def get_sku_options_for_line(po_number: str, line_number: int) -> List[SkuOption]:
    """
    Get SKU options for a specific line item.
    Generates options based on the line item's material and financials.
    """
    line_item = get_line_item(po_number, line_number)
    if not line_item or not line_item.financials:
        return get_default_sku_options()

    base_margin = line_item.financials.margin_pct
    material_id = line_item.material_id

    # Generate 4 SKU options based on line item's material
    options = [
        SkuOption(
            sku=f"{material_id}-OPT1",
            name=f"{line_item.material} - Best Margin",
            margin_pct=base_margin + 3.5,
            availability="In Stock",
            lead_time_days=5,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=100,
            is_recommended=True,
            tags=["RECOMMENDED", "BEST MARGIN"],
            specs=[
                f"Matches {line_item.material}",
                "Premium specification",
                f"{int(line_item.quantity * 1.2):,} {line_item.unit} available",
            ],
        ),
        SkuOption(
            sku=material_id,
            name=f"{line_item.material} - Exact Match",
            margin_pct=base_margin,
            availability="Partial",
            lead_time_days=12,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=65,
            is_exact_match=True,
            tags=["EXACT MATCH"],
            specs=[
                "Exact specification match",
                f"{int(line_item.quantity * 0.65):,} {line_item.unit} in stock",
            ],
        ),
        SkuOption(
            sku=f"{material_id}-ALT",
            name=f"{line_item.material} Alternate - Fastest",
            margin_pct=base_margin + 1.5,
            availability="In Stock",
            lead_time_days=3,
            plant="2200",
            plant_name="Wisconsin Plant",
            coverage_pct=100,
            is_fastest=True,
            tags=["FASTEST", "ALTERNATE"],
            specs=[
                "Within tolerance specification",
                f"{int(line_item.quantity * 1.5):,} {line_item.unit} available",
            ],
        ),
        SkuOption(
            sku="NEW-SKU-REQ",
            name="New SKU Creation Required",
            margin_pct=base_margin - 5.0,
            availability="None",
            lead_time_days=45,
            plant="2100",
            plant_name="Iowa City Plant",
            coverage_pct=0,
            tags=["NOT RECOMMENDED", "NEW SKU"],
            specs=[
                "Custom specification required",
                "45+ day lead time",
            ],
        ),
    ]

    return options


def format_line_item_for_api(line_item: LineItem) -> Dict[str, Any]:
    """Format a line item for API response."""
    financials = line_item.financials
    return {
        "lineNumber": line_item.line_number,
        "material": line_item.material,
        "materialId": line_item.material_id,
        "quantity": f"{line_item.quantity:,.0f}",
        "quantityRaw": line_item.quantity,
        "unit": line_item.unit,
        "unitPrice": line_item.unit_price,
        "extendedPrice": line_item.extended_price,
        "lineStage": line_item.line_stage,
        "lineStatus": line_item.line_status,
        "selectedSku": line_item.selected_sku,
        "selectedPlant": line_item.selected_plant,
        "requestedDelivery": line_item.requested_delivery,
        "promisedDelivery": line_item.promised_delivery,
        "leadTimeDays": line_item.lead_time_days,
        "financials": {
            "lineValue": financials.line_value if financials else 0,
            "marginPct": financials.margin_pct if financials else 0,
            "marginDollar": financials.margin_dollar if financials else 0,
            "materialCost": financials.material_cost if financials else 0,
            "conversionCost": financials.conversion_cost if financials else 0,
            "freightCost": financials.freight_cost if financials else 0,
        } if financials else None,
    }


def format_order_with_lines_for_api(po_number: str) -> Dict[str, Any]:
    """Format an order with all line items for API response."""
    order = get_order(po_number)
    if not order:
        return {}

    line_items = get_order_line_items(po_number)
    formatted_lines = [format_line_item_for_api(li) for li in line_items]

    # Calculate aggregated financials
    total_value = sum(li.extended_price for li in line_items)
    total_margin = sum(li.financials.margin_dollar for li in line_items if li.financials)
    avg_margin = (total_margin / total_value * 100) if total_value > 0 else 0

    return {
        "id": f"PO-{order['po_number']}",
        "poNumber": order["po_number"],
        "customer": order["customer"],
        "customerId": order["customer_id"],
        "orderDate": order["order_date"],
        "requestedDelivery": order["requested_delivery"],
        "shipTo": order["ship_to"],
        "paymentTerms": order["payment_terms"],
        "freightTerms": order["freight_terms"],
        "incoterms": order["incoterms"],
        "stage": order.get("stage", 0),
        "stageLabel": order.get("stage_label", "Intent"),
        "status": order.get("status", "processing"),
        "lineCount": len(line_items),
        "linesApproved": order.get("lines_approved", 0),
        "linesPending": order.get("lines_pending", len(line_items)),
        "linesHeld": order.get("lines_held", 0),
        "lineItems": formatted_lines,
        "financials": {
            "orderValue": total_value,
            "marginPct": round(avg_margin, 1),
            "marginDollar": round(total_margin, 2),
        },
    }


def derive_order_stage(line_items: List[LineItem]) -> int:
    """
    Derive order stage from line items.
    Order stage = minimum stage where ALL lines have reached.
    """
    if not line_items:
        return 0

    stages = [li.line_stage for li in line_items]

    # All lines must be at a stage for order to be at that stage
    if all(s >= 4 for s in stages):
        return 4  # Complete
    if all(s >= 3 for s in stages):
        return 3  # Committing
    if all(s >= 2 for s in stages):
        return 2  # Arbitration
    if all(s >= 1 for s in stages):
        return 1  # Decisioning
    return 0  # Intent


def derive_order_status(line_items: List[LineItem]) -> str:
    """
    Derive order status from line item statuses.
    """
    if not line_items:
        return "processing"

    statuses = [li.line_status for li in line_items]

    # If any line is escalated -> order is escalated
    if "escalated" in statuses:
        return "escalated"

    # If all lines are approved -> order is approved
    if all(s == "approved" for s in statuses):
        return "approved"

    # If all lines are held -> order is all_held
    if all(s == "held" for s in statuses):
        return "all_held"

    # If some lines approved, some held/pending -> partial_hold
    has_approved = "approved" in statuses
    has_held_or_pending = any(s in ["held", "pending"] for s in statuses)
    if has_approved and has_held_or_pending:
        return "partial_hold"

    return "processing"
