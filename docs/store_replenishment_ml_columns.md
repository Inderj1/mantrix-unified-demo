# Store Replenishment - Machine Learning Columns

This document defines ML-predicted columns in the Store Replenishment module, including model types, features, and prediction logic.

## ML-Predicted Columns

| Column Name | ML Model Type | Prediction Horizon | Output | Description |
|-------------|---------------|-------------------|--------|-------------|
| **forecasted_demand** | Time Series Forecasting | 7-14 days ahead | Daily units | Daily demand forecast per store-SKU |
| **eoq** | Optimization Model | Current | Units | Economic Order Quantity (optimal order size) |
| **confidence_level** | Uncertainty Quantification | N/A | 0.0 - 1.0 | Confidence in demand forecast |
| **stockout_probability** | Classification Model | Lead time period | 0.0 - 1.0 | Probability of stockout before next delivery |

---

## 1. Forecasted Demand (Time Series Model)

### Model Type
**Prophet / ARIMA / Ensemble Time Series Model**

### Objective
Predict daily demand for each store-SKU combination for the next 7-14 days.

### Input Features
```python
features = {
    # Historical data (last 365 days)
    'historical_sales': 'Daily sales history',
    'day_of_week': 'Weekday effect (1-7)',
    'day_of_month': 'Monthly pattern (1-31)',
    'month': 'Seasonal pattern (1-12)',
    'is_weekend': 'Binary (0/1)',
    'is_holiday': 'Binary (0/1)',

    # Promotional features
    'promotion_flag': 'Binary (0/1)',
    'discount_percentage': '0-100%',
    'marketing_spend': 'Dollar amount',

    # External factors
    'local_events': 'Concerts, sports, etc.',
    'weather': 'Temperature, precipitation',

    # Product attributes
    'product_category': 'Hair Color, Root Touch-Up, etc.',
    'price_tier': 'Premium, Standard, Budget',

    # Store attributes
    'store_size': 'Small, Medium, Large',
    'store_location_type': 'Urban, Suburban, Mall',
    'foot_traffic': 'Average daily visitors'
}
```

### Model Architecture
```python
from prophet import Prophet
import pandas as pd

def train_demand_forecast_model(historical_data):
    """
    Train Prophet model for demand forecasting.
    Prophet handles seasonality, holidays, and trend automatically.
    """
    # Prepare data in Prophet format
    df = pd.DataFrame({
        'ds': historical_data['date'],
        'y': historical_data['sales_units']
    })

    # Add regressors
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,  # Trend flexibility
        seasonality_prior_scale=10.0,  # Seasonality strength
    )

    # Add custom regressors
    model.add_regressor('promotion_flag')
    model.add_regressor('discount_percentage')
    model.add_regressor('is_holiday')

    # Fit model
    model.fit(df)

    return model

def predict_demand(model, store_id, sku, forecast_days=14):
    """
    Generate demand forecast for next N days.
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=forecast_days)

    # Add regressor values for future dates
    future['promotion_flag'] = get_planned_promotions(store_id, sku)
    future['discount_percentage'] = get_planned_discounts(store_id, sku)
    future['is_holiday'] = get_holiday_calendar()

    # Predict
    forecast = model.predict(future)

    # Return daily forecasts with confidence intervals
    return {
        'date': forecast['ds'].tolist(),
        'forecast': forecast['yhat'].tolist(),  # Point estimate
        'lower_bound': forecast['yhat_lower'].tolist(),  # 95% CI lower
        'upper_bound': forecast['yhat_upper'].tolist(),  # 95% CI upper
    }
```

### Output Example
```json
{
    "store_id": "Store-Chicago-001",
    "sku": "MR_HAIR_101",
    "forecast_date": "2025-10-27",
    "forecasted_demand": 20,
    "confidence_level": 0.92,
    "upper_bound": 23,
    "lower_bound": 17
}
```

### Model Performance Metrics
- **MAPE** (Mean Absolute Percentage Error): Target < 15%
- **RMSE** (Root Mean Squared Error): Measured in units
- **Coverage**: 95% CI should contain actual 95% of the time

---

## 2. Economic Order Quantity (EOQ) - Optimization Model

### Model Type
**Mathematical Optimization / Reinforcement Learning**

### Objective
Calculate optimal order quantity that minimizes total inventory costs (ordering + holding + stockout).

### Classical EOQ Formula
```python
import math

def calculate_eoq_classic(annual_demand, order_cost, holding_cost_per_unit):
    """
    Classic EOQ formula (Wilson formula).

    EOQ = sqrt((2 × D × S) / H)

    Where:
    - D = Annual demand (units)
    - S = Ordering cost per order ($)
    - H = Holding cost per unit per year ($)
    """
    eoq = math.sqrt((2 * annual_demand * order_cost) / holding_cost_per_unit)
    return eoq
```

### ML-Enhanced EOQ
```python
def calculate_eoq_ml(store_id, sku, forecasted_demand, lead_time_days, current_inventory, unit_cost):
    """
    ML-enhanced EOQ that considers:
    - Demand variability (from forecast confidence intervals)
    - Storage capacity constraints
    - Shelf life / expiration
    - Promotional calendar
    - Freight consolidation opportunities
    """

    # Get forecast with uncertainty
    forecast = get_demand_forecast(store_id, sku, days=365)
    annual_demand = sum(forecast['forecast'])
    demand_std = calculate_std(forecast['upper_bound'], forecast['lower_bound'])

    # Cost parameters
    order_cost = 50  # Cost to place an order ($)
    holding_cost_rate = 0.20  # 20% of unit cost per year
    holding_cost_per_unit = unit_cost * holding_cost_rate

    # Stockout cost (estimated from lost sales and customer dissatisfaction)
    stockout_cost_per_unit = unit_cost * 3  # 3x markup

    # Classic EOQ
    eoq_base = math.sqrt((2 * annual_demand * order_cost) / holding_cost_per_unit)

    # Adjust for demand variability (safety stock factor)
    service_level = 0.95  # 95% fill rate target
    z_score = 1.64  # Z-score for 95% service level
    safety_factor = z_score * demand_std * math.sqrt(lead_time_days / 365)

    eoq_adjusted = eoq_base + safety_factor

    # Apply constraints
    moq = get_moq(sku)
    order_multiple = get_order_multiple(sku)
    max_capacity = get_storage_capacity(store_id, sku)

    # Round to order multiple and apply constraints
    eoq_final = round_to_multiple(
        min(max(eoq_adjusted, moq), max_capacity),
        order_multiple
    )

    return int(eoq_final)

def round_to_multiple(value, multiple):
    """Round up to nearest multiple."""
    return math.ceil(value / multiple) * multiple
```

### Reinforcement Learning Approach (Advanced)
```python
import gym
import numpy as np
from stable_baselines3 import PPO

class InventoryEnv(gym.Env):
    """
    RL environment for learning optimal order quantities.
    """
    def __init__(self, store_id, sku):
        super().__init__()
        self.store_id = store_id
        self.sku = sku

        # State space: [current_inventory, days_since_order, forecasted_demand_7d, on_order]
        self.observation_space = gym.spaces.Box(low=0, high=1000, shape=(4,))

        # Action space: order quantity (0-500)
        self.action_space = gym.spaces.Discrete(500)

    def step(self, action):
        """
        Execute order action and observe outcome.
        """
        order_qty = action

        # Simulate demand (from forecast + noise)
        demand = self.sample_demand()

        # Update inventory
        self.current_inventory -= demand
        if order_qty > 0:
            self.on_order += order_qty

        # Calculate costs
        holding_cost = max(0, self.current_inventory) * self.holding_rate
        stockout_cost = max(0, -self.current_inventory) * self.stockout_rate
        order_cost = 50 if order_qty > 0 else 0

        total_cost = holding_cost + stockout_cost + order_cost

        # Reward = negative cost (minimize cost)
        reward = -total_cost

        done = self.days_elapsed >= 365
        return self.get_state(), reward, done, {}

def train_rl_eoq_model():
    """
    Train RL agent to learn optimal ordering policy.
    """
    env = InventoryEnv(store_id='Store-Chicago-001', sku='MR_HAIR_101')
    model = PPO('MlpPolicy', env, verbose=1)
    model.learn(total_timesteps=100000)
    return model
```

### Output Example
```json
{
    "store_id": "Store-Chicago-001",
    "sku": "MR_HAIR_101",
    "eoq": 180,
    "method": "ml_enhanced",
    "components": {
        "base_eoq": 160,
        "safety_adjustment": 20,
        "final_rounded": 180
    }
}
```

---

## 3. Confidence Level (Uncertainty Quantification)

### Model Type
**Bayesian Neural Network / Quantile Regression**

### Objective
Quantify uncertainty in demand forecasts to enable risk-aware decision making.

### Implementation
```python
import tensorflow as tf
import tensorflow_probability as tfp

def build_uncertainty_model(input_shape):
    """
    Bayesian neural network that outputs mean and variance.
    """
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_shape=input_shape),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tfp.layers.DenseVariational(32, activation='relu'),  # Bayesian layer
        tfp.layers.DenseVariational(1)  # Output: mean and variance
    ])

    return model

def calculate_confidence_level(forecast, actual_history):
    """
    Calculate confidence based on forecast accuracy over time.

    High confidence (0.90-1.0): Stable demand, accurate forecasts
    Medium confidence (0.70-0.89): Moderate variability
    Low confidence (0.0-0.69): High variability, poor fit
    """
    # Calculate MAPE over last 30 days
    mape = calculate_mape(forecast, actual_history, window=30)

    # Convert MAPE to confidence score
    confidence = max(0.0, min(1.0, 1.0 - (mape / 100)))

    # Adjust for forecast horizon
    # Longer horizon = lower confidence
    horizon_days = 7
    confidence_adjusted = confidence * (0.95 ** (horizon_days / 7))

    return confidence_adjusted

def calculate_mape(forecast, actual, window=30):
    """Mean Absolute Percentage Error."""
    errors = abs((actual - forecast) / actual)
    return np.mean(errors[-window:]) * 100
```

### Confidence Interpretation
```python
def interpret_confidence(confidence_level):
    """
    Translate confidence score to decision guidance.
    """
    if confidence_level >= 0.90:
        return {
            'level': 'High',
            'action': 'Proceed with forecast-driven replenishment',
            'risk': 'Low'
        }
    elif confidence_level >= 0.75:
        return {
            'level': 'Medium',
            'action': 'Add 10-15% safety buffer',
            'risk': 'Moderate'
        }
    else:
        return {
            'level': 'Low',
            'action': 'Manual review recommended, increase safety stock',
            'risk': 'High'
        }
```

---

## 4. Stockout Probability (Classification Model)

### Model Type
**Gradient Boosting Classifier (XGBoost / LightGBM)**

### Objective
Predict probability of stockout during lead time period.

### Input Features
```python
features = {
    # Inventory state
    'current_inventory': 'Current stock level',
    'on_order': 'Inbound shipments',
    'committed': 'Allocated/reserved units',

    # Demand features
    'forecasted_demand_7d': 'Sum of next 7 days forecast',
    'forecasted_demand_14d': 'Sum of next 14 days forecast',
    'demand_volatility': 'Coefficient of variation',

    # Supply features
    'lead_time_days': 'Replenishment lead time',
    'supplier_ontime_rate': 'Historical on-time delivery %',
    'last_order_delay_days': 'Last order delay',

    # Ratios
    'days_of_supply': 'current_inventory / daily_demand',
    'safety_stock_coverage': 'current_inventory / safety_stock',

    # Temporal features
    'day_of_week': 'Weekday effect',
    'is_promotional_period': 'Binary',
    'is_peak_season': 'Binary (holiday season, etc.)',
}
```

### Model Training
```python
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

def train_stockout_model(historical_data):
    """
    Train binary classifier to predict stockout risk.

    Target: 1 if stockout occurred within lead time, 0 otherwise
    """
    # Prepare features
    X = historical_data[features]

    # Target: Did stockout occur?
    y = (historical_data['min_inventory_next_7d'] <= 0).astype(int)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    # Train XGBoost
    model = XGBClassifier(
        max_depth=6,
        learning_rate=0.1,
        n_estimators=200,
        objective='binary:logistic',
        eval_metric='auc'
    )

    model.fit(X_train, y_train)

    # Evaluate
    auc_score = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    print(f'Stockout prediction AUC: {auc_score:.3f}')

    return model

def predict_stockout_probability(model, store_id, sku, lead_time_days):
    """
    Predict stockout probability over lead time period.
    """
    # Get current state
    current_state = get_current_inventory_state(store_id, sku)
    forecast = get_demand_forecast(store_id, sku, days=lead_time_days)

    # Build feature vector
    features = {
        'current_inventory': current_state['on_hand'],
        'on_order': current_state['on_order'],
        'forecasted_demand_7d': sum(forecast['forecast'][:7]),
        'days_of_supply': current_state['on_hand'] / forecast['forecast'][0],
        'lead_time_days': lead_time_days,
        # ... other features
    }

    # Predict probability
    X = pd.DataFrame([features])
    stockout_prob = model.predict_proba(X)[0, 1]

    return stockout_prob
```

### Risk Classification
```python
def classify_stockout_risk(stockout_probability):
    """
    Translate probability to risk level.
    """
    if stockout_probability >= 0.70:
        return 'High Risk - Stockout Imminent'
    elif stockout_probability >= 0.40:
        return 'Medium Risk - Monitor Closely'
    elif stockout_probability >= 0.15:
        return 'Low Risk'
    else:
        return 'No Risk'
```

---

## Model Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ML Model Serving Layer                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Demand       │  │ EOQ          │  │ Stockout Risk   │  │
│  │ Forecast     │  │ Optimization │  │ Classifier      │  │
│  │ (Prophet)    │  │ (RL/Math)    │  │ (XGBoost)       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Model Monitoring & Retraining Pipeline        │  │
│  │  - Drift detection                                     │  │
│  │  - Performance tracking                                │  │
│  │  - Automated retraining (weekly/monthly)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ REST API / gRPC
                            │
┌─────────────────────────────────────────────────────────────┐
│              STOX.AI Store Replenishment Module              │
│  - Fetches ML predictions at runtime                         │
│  - Combines with SAP data and derived calculations           │
│  - Displays recommendations to planners                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Model Refresh Schedule

| Model | Retraining Frequency | Inference Frequency | Latency SLA |
|-------|---------------------|---------------------|-------------|
| Demand Forecast | Weekly (every Sunday) | Daily (batch) | < 5 min |
| EOQ Optimization | Monthly | On-demand | < 1 sec |
| Stockout Risk | Bi-weekly | Daily (batch) | < 5 min |
| Confidence Score | Weekly | Daily (batch) | < 1 sec |

---

## Sample ML Pipeline Output

```json
{
    "store_id": "Store-Chicago-001",
    "sku": "MR_HAIR_101",
    "timestamp": "2025-10-27T08:00:00Z",
    "ml_predictions": {
        "forecasted_demand": {
            "value": 20,
            "unit": "units/day",
            "model": "prophet_v2.3",
            "confidence_level": 0.92,
            "upper_bound": 23,
            "lower_bound": 17
        },
        "eoq": {
            "value": 180,
            "unit": "units",
            "model": "rl_agent_v1.5",
            "method": "ml_enhanced"
        },
        "stockout_probability": {
            "value": 0.12,
            "risk_level": "Low Risk",
            "model": "xgboost_v1.2",
            "lead_time_days": 7
        }
    },
    "model_metadata": {
        "forecast_model_last_trained": "2025-10-20",
        "forecast_model_mape": 0.12,
        "stockout_model_auc": 0.89
    }
}
```
