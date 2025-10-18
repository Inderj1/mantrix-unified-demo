"""
Market Signal Service
Base service class and orchestration for fetching market intelligence signals
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import structlog

from ..models.market_signal import (
    MarketSignal,
    MarketSignalCreate,
    SignalCategory,
    SeverityLevel
)

logger = structlog.get_logger()


class BaseSignalFetcher(ABC):
    """
    Abstract base class for signal fetchers
    Each fetcher is responsible for one category of market signals
    """

    def __init__(self, category: SignalCategory):
        self.category = category
        self.logger = logger.bind(category=category.value)

    @abstractmethod
    async def fetch_signals(self) -> List[MarketSignal]:
        """
        Fetch signals from the data source
        Returns a list of MarketSignal objects
        """
        pass

    def _calculate_severity_level(self, score: int) -> SeverityLevel:
        """Calculate severity level from numeric score"""
        if score >= 80:
            return SeverityLevel.CRITICAL
        elif score >= 60:
            return SeverityLevel.HIGH
        elif score >= 40:
            return SeverityLevel.MEDIUM
        else:
            return SeverityLevel.LOW

    def _create_signal(
        self,
        name: str,
        description: str,
        severity_score: int,
        location: str,
        time_to_impact: str,
        source: str,
        confidence: float,
        impact_value: Optional[float] = None,
        impact_description: Optional[str] = None,
        affected_skus: Optional[int] = None,
        affected_suppliers: Optional[int] = None,
        affected_customers: Optional[int] = None,
        affected_regions: Optional[List[str]] = None,
        recommendations: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        source_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> MarketSignal:
        """
        Helper method to create a MarketSignal with common defaults
        """
        import uuid
        signal_id = f"SIG-{self.category.value[:1].upper()}{str(uuid.uuid4())[:7].upper()}"

        return MarketSignal(
            id=signal_id,
            category=self.category,
            name=name,
            description=description,
            severity=self._calculate_severity_level(severity_score),
            severityScore=severity_score,
            location=location,
            detectedAt=datetime.utcnow(),
            timeToImpact=time_to_impact,
            impactValue=impact_value,
            impactDescription=impact_description,
            affectedSKUs=affected_skus,
            affectedSuppliers=affected_suppliers,
            affectedCustomers=affected_customers,
            affectedRegions=affected_regions,
            recommendations=recommendations or [],
            source=source,
            sourceUrl=source_url,
            confidence=confidence,
            tags=tags or [],
            isActive=True,
            metadata=metadata or {}
        )


class MarketSignalService:
    """
    Main service class for managing market signals
    Orchestrates multiple signal fetchers and aggregates results
    """

    def __init__(self):
        self.fetchers: Dict[SignalCategory, BaseSignalFetcher] = {}
        self.logger = logger.bind(service="MarketSignalService")

    def register_fetcher(self, fetcher: BaseSignalFetcher):
        """Register a signal fetcher for a specific category"""
        self.fetchers[fetcher.category] = fetcher
        self.logger.info(
            "registered_fetcher",
            category=fetcher.category.value,
            fetcher_class=fetcher.__class__.__name__
        )

    async def fetch_signals_for_category(
        self, category: SignalCategory
    ) -> List[MarketSignal]:
        """Fetch signals for a specific category"""
        fetcher = self.fetchers.get(category)
        if not fetcher:
            self.logger.warning("no_fetcher_registered", category=category.value)
            return []

        try:
            signals = await fetcher.fetch_signals()
            self.logger.info(
                "fetched_signals",
                category=category.value,
                count=len(signals)
            )
            return signals
        except Exception as e:
            self.logger.error(
                "fetch_error",
                category=category.value,
                error=str(e),
                exc_info=True
            )
            return []

    async def fetch_all_signals(
        self, categories: Optional[List[SignalCategory]] = None
    ) -> List[MarketSignal]:
        """
        Fetch signals from all registered fetchers
        If categories is specified, only fetch from those categories
        """
        if categories is None:
            categories = list(self.fetchers.keys())

        all_signals = []
        for category in categories:
            signals = await self.fetch_signals_for_category(category)
            all_signals.extend(signals)

        self.logger.info(
            "fetched_all_signals",
            total_count=len(all_signals),
            categories_count=len(categories)
        )
        return all_signals

    async def get_active_signals(
        self, categories: Optional[List[SignalCategory]] = None
    ) -> List[MarketSignal]:
        """Get all active signals (convenience method)"""
        signals = await self.fetch_all_signals(categories)
        return [s for s in signals if s.isActive]

    def get_summary_stats(self, signals: List[MarketSignal]) -> Dict:
        """Calculate summary statistics for a list of signals"""
        if not signals:
            return {
                "total": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "total_impact": 0,
                "categories": {}
            }

        category_counts = {}
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        total_impact = 0

        for signal in signals:
            # Count by category
            cat = signal.category.value
            category_counts[cat] = category_counts.get(cat, 0) + 1

            # Count by severity
            if signal.severityScore >= 80:
                severity_counts["critical"] += 1
            elif signal.severityScore >= 60:
                severity_counts["high"] += 1
            elif signal.severityScore >= 40:
                severity_counts["medium"] += 1
            else:
                severity_counts["low"] += 1

            # Sum impact
            if signal.impactValue:
                total_impact += signal.impactValue

        return {
            "total": len(signals),
            "critical": severity_counts["critical"],
            "high": severity_counts["high"],
            "medium": severity_counts["medium"],
            "low": severity_counts["low"],
            "total_impact": total_impact,
            "categories": category_counts
        }


# Singleton instance
_service_instance: Optional[MarketSignalService] = None


def get_market_signal_service() -> MarketSignalService:
    """Get or create the singleton MarketSignalService instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = MarketSignalService()
    return _service_instance
