# Store Replenishment - Derived Columns

This document defines derived/calculated columns in the Store Replenishment module, showing formulas and business logic.

## Derived Calculation Columns

| Column Name | Formula / Logic | Inputs | Description |
|-------------|-----------------|--------|-------------|
| **base_order_qty** | `MAX(0, target_inventory - current_inventory)` | target_inventory, current_inventory | Raw quantity needed to reach target (before constraints) |
| **final_order_qty** | `ROUND_UP(MAX(base_order_qty, moq), order_multiple)` | base_order_qty, moq, order_multiple | Final order quantity after applying MOQ and rounding to case pack |
| **order_value** | `final_order_qty × unit_cost` | final_order_qty, unit_cost | Total monetary value of the order |
| **truck_utilization** | `final_order_qty / truck_capacity` | final_order_qty, truck_capacity | Percentage of truck capacity utilized |
| **expected_arrival** | `release_date + lead_time_days` | release_date, lead_time_days | Calculated expected delivery date |
| **priority** | See Priority Logic below | current_inventory, reorder_point, lead_time_days, forecasted_demand | Order urgency classification |
| **status** | See Status Logic below | priority, final_order_qty | Order execution status |
| **action** | See Action Logic below | status, current_inventory, target_inventory, reorder_point | Recommended action with context |

---

## Detailed Calculation Logic

### 1. Base Order Quantity
```python
def calculate_base_order_qty(current_inventory, target_inventory):
    """
    Calculate raw quantity needed to reach target inventory.
    Never order if already at or above target.
    """
    return max(0, target_inventory - current_inventory)
```

**Example**:
- Current: 130, Target: 162 → Base Order = 32 units
- Current: 340, Target: 170 → Base Order = 0 (already above target)

---

### 2. Final Order Quantity
```python
def calculate_final_order_qty(base_order_qty, moq, order_multiple):
    """
    Apply MOQ and rounding constraints.
    Steps:
    1. If base_order_qty = 0, return 0
    2. If base_order_qty < moq, round up to moq
    3. Round to nearest order_multiple (case pack size)
    """
    if base_order_qty == 0:
        return 0

    # Apply MOQ constraint
    qty = max(base_order_qty, moq)

    # Round up to order multiple (case pack)
    if qty % order_multiple != 0:
        qty = ((qty // order_multiple) + 1) * order_multiple

    return qty
```

**Examples**:
- Base: 32, MOQ: 10, Multiple: 12 → Final: 36 (3 cases)
- Base: 10, MOQ: 10, Multiple: 12 → Final: 12 (1 case, rounded up)
- Base: 0, MOQ: 10, Multiple: 12 → Final: 0 (no order needed)

---

### 3. Order Value
```python
def calculate_order_value(final_order_qty, unit_cost):
    """
    Total cost of the order.
    """
    return final_order_qty * unit_cost
```

**Example**:
- Final Qty: 36, Unit Cost: $25.00 → Order Value: $900

---

### 4. Truck Utilization
```python
def calculate_truck_utilization(final_order_qty, truck_capacity):
    """
    Calculate percentage of truck/container capacity used.
    Used for freight optimization and consolidation decisions.
    """
    if truck_capacity == 0:
        return 0

    return final_order_qty / truck_capacity
```

**Example**:
- Final Qty: 36, Truck Capacity: 500 → Utilization: 7.2%

**Business Rules**:
- If utilization < 50%, consider consolidating with other orders
- If utilization > 90%, may need multiple trucks or prioritize SKUs

---

### 5. Expected Arrival Date
```python
from datetime import datetime, timedelta

def calculate_expected_arrival(release_date, lead_time_days):
    """
    Calculate expected delivery date based on lead time.
    Assumes lead time includes weekends/holidays.
    """
    if release_date is None:
        return None

    arrival_date = datetime.strptime(release_date, '%Y-%m-%d') + timedelta(days=lead_time_days)
    return arrival_date.strftime('%Y-%m-%d')
```

**Example**:
- Release: 2025-10-29, Lead Time: 7 days → Arrival: 2025-11-05

---

### 6. Priority Classification
```python
def calculate_priority(current_inventory, reorder_point, forecasted_demand, lead_time_days):
    """
    Determine order priority based on stockout risk.

    Priority Levels:
    - Expedite: High risk of stockout (days of supply < lead time)
    - Normal: Triggered replenishment (current < reorder point)
    - Hold: Overstock or no order needed
    """
    # Calculate days until stockout
    if forecasted_demand > 0:
        days_of_supply = current_inventory / forecasted_demand
    else:
        days_of_supply = float('inf')

    # Priority logic
    if days_of_supply < lead_time_days:
        return 'Expedite'  # Will stockout before next delivery
    elif current_inventory < reorder_point:
        return 'Normal'  # Standard replenishment
    else:
        return 'Hold'  # No order needed or overstock
```

**Examples**:
- Current: 37, Daily Demand: 15, Lead Time: 7 days
  - Days of Supply: 2.5 days
  - 2.5 < 7 → **Expedite** (will stockout in 2.5 days, but delivery takes 7 days)

- Current: 130, ROP: 162, Daily Demand: 20, Lead Time: 7 days
  - Days of Supply: 6.5 days
  - Current < ROP but days_of_supply >= lead_time → **Normal**

- Current: 340, ROP: 170, Target: 170
  - Current > ROP → **Hold** (overstock)

---

### 7. Status
```python
def calculate_status(priority, final_order_qty):
    """
    Determine order execution status.
    """
    if final_order_qty == 0:
        return 'No Action'
    elif priority == 'Expedite':
        return 'Rush Shipment'
    elif priority == 'Normal':
        return 'Generate Order'
    else:
        return 'On Hold'
```

**Mapping**:
- Expedite + Qty > 0 → **Rush Shipment**
- Normal + Qty > 0 → **Generate Order**
- Hold or Qty = 0 → **No Action**

---

### 8. Action Message
```python
def calculate_action(status, current_inventory, reorder_point, target_inventory):
    """
    Generate human-readable action recommendation.
    """
    if status == 'Rush Shipment':
        return f'URGENT: Days until stockout < Lead Time'

    elif status == 'Generate Order':
        return f'Order triggered: Current ({current_inventory}) < ROP ({reorder_point})'

    elif status == 'No Action' and current_inventory > target_inventory * 1.5:
        return f'Overstock: Current ({current_inventory}) >> Target ({target_inventory}) - Stop ordering'

    elif status == 'No Action' and current_inventory >= reorder_point:
        return f'Above target - no order needed'

    else:
        return 'Monitor inventory levels'
```

**Examples**:
- Status: Rush Shipment → "URGENT: Days until stockout < Lead Time"
- Status: Generate Order, Current: 130, ROP: 162 → "Order triggered: Current (130) < ROP (162)"
- Status: No Action, Current: 340, Target: 170 → "Overstock: Current (340) >> Target (170) - Stop ordering"

---

## Calculation Sequence

The derived columns must be calculated in the following order due to dependencies:

```
1. base_order_qty        (depends on: raw data)
2. final_order_qty       (depends on: base_order_qty)
3. order_value          (depends on: final_order_qty)
4. truck_utilization    (depends on: final_order_qty)
5. expected_arrival     (depends on: raw data)
6. priority             (depends on: raw data, ML forecasted_demand)
7. status               (depends on: priority, final_order_qty)
8. action               (depends on: status, raw data)
```

---

## Business Rules Summary

1. **Never order if current >= target** (unless safety stock rules override)
2. **Always respect MOQ** (Minimum Order Quantity)
3. **Always round to case pack size** (order_multiple)
4. **Expedite if stockout risk < lead time** (days of supply < lead time days)
5. **Flag overstock if current > 1.5 × target** (excess inventory alert)

---

## Example Full Calculation

**Input Data**:
- Store: Chicago-001, Product: MR_HAIR_101
- Current: 130, Target: 162, ROP: 162
- MOQ: 10, Case Pack: 12, Unit Cost: $25
- Lead Time: 7 days, Daily Demand: 20 units/day
- Truck Capacity: 500 units

**Calculations**:
1. `base_order_qty = max(0, 162 - 130) = 32`
2. `final_order_qty = round_up(max(32, 10), 12) = 36` (3 cases)
3. `order_value = 36 × 25 = $900`
4. `truck_utilization = 36 / 500 = 7.2%`
5. `expected_arrival = 2025-10-29 + 7 = 2025-11-05`
6. `days_of_supply = 130 / 20 = 6.5 days` → priority = 'Normal' (6.5 >= 7)
7. `status = 'Generate Order'` (Normal + qty > 0)
8. `action = 'Order triggered: Current (130) < ROP (162)'`

**Result**: Generate order for 36 units (3 cases) at $900 total cost, normal priority.
