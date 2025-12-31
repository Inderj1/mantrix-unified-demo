"""
MarginPredictor Service - ML-powered margin prediction using XGBoost.

Uses a pre-trained XGBoost model to predict profit margins based on
customer, material, plant, quantity, and pricing features.
"""

import pickle
import numpy as np
import structlog
from typing import Dict, Any, Optional, List
from pathlib import Path
import warnings

logger = structlog.get_logger()

# Suppress sklearn version mismatch warnings
warnings.filterwarnings("ignore", category=UserWarning)


class MarginPredictor:
    """
    ML-powered margin predictor using XGBoost regression.

    Features used for prediction:
    - customer_id, material_id (categorical, encoded)
    - plant, quantity, order_value, unit_price, unit_cost
    - price_cost_ratio, month, quarter
    """

    _instance = None
    _model_loaded = False

    def __new__(cls):
        """Singleton pattern to avoid reloading the model multiple times."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model_loaded:
            return

        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_columns = []
        self.categorical_columns = []
        self.training_metrics = {}

        self._load_model()

    def _load_model(self):
        """Load the margin predictor PKL model."""
        model_path = Path(__file__).parent.parent.parent.parent / "models" / "margin_predictor.pkl"

        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)

            self.model = model_data.get('model')
            self.scaler = model_data.get('scaler')
            self.label_encoders = model_data.get('label_encoders', {})
            self.feature_columns = model_data.get('feature_columns', [])
            self.categorical_columns = model_data.get('categorical_columns', [])
            self.training_metrics = model_data.get('training_metrics', {})
            is_fitted = model_data.get('is_fitted', False)

            if self.model is not None and is_fitted:
                self._model_loaded = True
                logger.info(
                    "MarginPredictor model loaded",
                    features=self.feature_columns,
                    r2_score=self.training_metrics.get('eval_r2', 0)
                )
            else:
                logger.warning("MarginPredictor model not fitted")
                self._model_loaded = False

        except FileNotFoundError:
            logger.warning("Margin predictor model not found", path=str(model_path))
            self._model_loaded = False
        except Exception as e:
            logger.error("Failed to load margin predictor model", error=str(e))
            self._model_loaded = False

    def is_loaded(self) -> bool:
        """Check if the model is loaded and ready."""
        return self._model_loaded and self.model is not None

    def predict(
        self,
        customer_id: str,
        material_id: str,
        plant: str,
        quantity: float,
        order_value: float,
        unit_price: Optional[float] = None,
        unit_cost: Optional[float] = None,
        month: Optional[int] = None,
        quarter: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Predict margin percentage for given order parameters.

        Args:
            customer_id: SAP customer number (KUNNR)
            material_id: SAP material number (MATNR)
            plant: Plant code (WERKS)
            quantity: Order quantity
            order_value: Total order value
            unit_price: Price per unit (calculated if not provided)
            unit_cost: Cost per unit (from MBEW)
            month: Order month (1-12)
            quarter: Order quarter (1-4)

        Returns:
            Dict with margin_pct, confidence, and prediction details
        """
        if not self.is_loaded():
            logger.warning("Model not loaded, returning default margin")
            return self._default_margin(customer_id, material_id)

        try:
            # Calculate derived features
            if unit_price is None:
                unit_price = order_value / max(quantity, 1)

            if unit_cost is None:
                # Estimate unit cost as 70% of unit price (industry average)
                unit_cost = unit_price * 0.70

            log_quantity = np.log1p(max(quantity, 0))
            log_order_value = np.log1p(max(order_value, 0))
            price_cost_ratio = unit_price / max(unit_cost, 0.01)

            if month is None:
                from datetime import datetime
                month = datetime.now().month

            if quarter is None:
                quarter = (month - 1) // 3 + 1

            # Prepare feature vector
            features = self._prepare_features(
                customer_id=customer_id,
                material_id=material_id,
                plant=plant,
                quantity=quantity,
                log_quantity=log_quantity,
                order_value=order_value,
                log_order_value=log_order_value,
                unit_price=unit_price,
                unit_cost=unit_cost,
                price_cost_ratio=price_cost_ratio,
                month=month,
                quarter=quarter
            )

            if features is None:
                return self._default_margin(customer_id, material_id)

            # Make prediction
            margin_pct = float(self.model.predict([features])[0])

            # Clamp to reasonable range (0-60%)
            margin_pct = max(0, min(60, margin_pct))

            # Calculate confidence based on feature coverage
            confidence = self._calculate_confidence(customer_id, material_id)

            return {
                "margin_pct": round(margin_pct, 2),
                "margin_dollar": round(order_value * margin_pct / 100, 2),
                "confidence": confidence,
                "model": "xgboost",
                "features_used": len(self.feature_columns),
                "unit_cost": round(unit_cost, 2),
                "unit_price": round(unit_price, 2),
            }

        except Exception as e:
            logger.error("Error predicting margin", error=str(e))
            return self._default_margin(customer_id, material_id)

    def predict_batch(
        self,
        materials: List[Dict[str, Any]],
        customer_id: str,
        quantity: float
    ) -> List[Dict[str, Any]]:
        """
        Predict margins for multiple materials (SKU options).

        Args:
            materials: List of material dicts with matnr, unit_cost, unit_price
            customer_id: SAP customer number
            quantity: Order quantity

        Returns:
            List of materials with predicted margins
        """
        results = []
        for mat in materials:
            matnr = mat.get('matnr', '')
            unit_cost = mat.get('unit_cost', mat.get('stprs', 0))
            unit_price = mat.get('unit_price', unit_cost * 1.35)  # Default 35% markup
            plant = mat.get('plant', mat.get('werks', '2100'))
            order_value = quantity * unit_price

            prediction = self.predict(
                customer_id=customer_id,
                material_id=matnr,
                plant=plant,
                quantity=quantity,
                order_value=order_value,
                unit_price=unit_price,
                unit_cost=unit_cost
            )

            results.append({
                **mat,
                "margin_pct": prediction["margin_pct"],
                "margin_dollar": prediction["margin_dollar"],
                "margin_confidence": prediction["confidence"],
                "total_cost": round(quantity * unit_cost, 2),
                "total_revenue": round(quantity * unit_price, 2),
            })

        return results

    def _prepare_features(self, **kwargs) -> Optional[np.ndarray]:
        """Prepare feature vector for prediction."""
        try:
            # Separate categorical and numeric features
            categorical_features = []
            numeric_features = []

            for col in self.feature_columns:
                if col in ['customer_id', 'material_id']:
                    # Encode categorical features (not scaled)
                    encoder = self.label_encoders.get(col)
                    value = kwargs.get(col, '')
                    if encoder is not None:
                        try:
                            encoded = encoder.transform([str(value).strip()])[0]
                        except ValueError:
                            # Unknown value - use median
                            encoded = len(encoder.classes_) // 2
                        categorical_features.append(encoded)
                    else:
                        categorical_features.append(hash(str(value)) % 10000)
                elif col == 'plant':
                    # Hash plant code (numeric, goes to scaler)
                    plant = kwargs.get('plant', '2100')
                    numeric_features.append(hash(str(plant).strip()) % 1000)
                else:
                    # Numeric features (goes to scaler)
                    numeric_features.append(float(kwargs.get(col, 0)))

            # Scale only numeric features
            numeric_array = np.array(numeric_features, dtype=float).reshape(1, -1)
            if self.scaler is not None:
                numeric_scaled = self.scaler.transform(numeric_array).flatten()
            else:
                numeric_scaled = numeric_array.flatten()

            # Combine categorical (unscaled) + numeric (scaled)
            all_features = np.concatenate([categorical_features, numeric_scaled])

            return all_features

        except Exception as e:
            logger.error("Error preparing features", error=str(e))
            return None

    def _calculate_confidence(self, customer_id: str, material_id: str) -> str:
        """Calculate prediction confidence based on feature coverage."""
        customer_encoder = self.label_encoders.get('customer_id')
        material_encoder = self.label_encoders.get('material_id')

        customer_known = customer_encoder is not None and customer_id in customer_encoder.classes_
        material_known = material_encoder is not None and material_id in material_encoder.classes_

        if customer_known and material_known:
            return "high"
        elif customer_known or material_known:
            return "medium"
        else:
            return "low"

    def _default_margin(self, customer_id: str, material_id: str) -> Dict[str, Any]:
        """Return default margin when model is unavailable."""
        return {
            "margin_pct": 25.0,
            "margin_dollar": 0,
            "confidence": "low",
            "model": "default",
            "features_used": 0,
            "unit_cost": 0,
            "unit_price": 0,
        }


# Singleton instance getter
_predictor_instance = None


def get_margin_predictor() -> MarginPredictor:
    """Get the singleton MarginPredictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = MarginPredictor()
    return _predictor_instance
