"""
Similar Order Matcher Service for ORDLY.AI

Provides functionality to find similar historical orders for comparison.
"""

import structlog
from typing import List, Dict, Any, Optional

logger = structlog.get_logger()


class SimilarOrderMatcher:
    """Finds similar historical orders based on customer, material, and specifications."""

    def __init__(self):
        self._initialized = True
        logger.info("SimilarOrderMatcher initialized")

    def find_similar_orders(
        self,
        order_id: str,
        customer_id: Optional[str] = None,
        material_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar historical orders.

        Returns mock data for now - can be enhanced with actual database queries.
        """
        # Mock similar orders data
        similar_orders = [
            {
                "so": "SO-892341",
                "match": "98%",
                "details": "Same customer, identical spec - shipped 3 weeks ago",
                "customer": customer_id or "CUST-001",
                "material": material_id or "MAT-001",
                "value": 45000,
                "margin_pct": 24.5,
            },
            {
                "so": "SO-871256",
                "match": "92%",
                "details": "Same material family, similar quantity",
                "customer": customer_id or "CUST-001",
                "material": material_id or "MAT-002",
                "value": 38000,
                "margin_pct": 22.8,
            },
            {
                "so": "SO-865892",
                "match": "87%",
                "details": "Same customer, alternate SKU accepted",
                "customer": customer_id or "CUST-001",
                "material": material_id or "MAT-001",
                "value": 52000,
                "margin_pct": 26.2,
            },
            {
                "so": "SO-854123",
                "match": "82%",
                "details": "Similar spec, different plant source",
                "customer": customer_id or "CUST-002",
                "material": material_id or "MAT-001",
                "value": 41000,
                "margin_pct": 23.1,
            },
            {
                "so": "SO-843567",
                "match": "78%",
                "details": "Same product category, rush order",
                "customer": customer_id or "CUST-003",
                "material": material_id or "MAT-003",
                "value": 35000,
                "margin_pct": 21.5,
            },
        ]

        return similar_orders[:limit]


# Singleton instance
_matcher_instance: Optional[SimilarOrderMatcher] = None


def get_similar_order_matcher() -> SimilarOrderMatcher:
    """Get or create the singleton SimilarOrderMatcher instance."""
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = SimilarOrderMatcher()
    return _matcher_instance
