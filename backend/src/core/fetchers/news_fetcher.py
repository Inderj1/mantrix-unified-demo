"""
News & Media Signal Fetcher
Fetches news-related market intelligence signals
Data sources: NewsAPI, RSS feeds, financial news
"""
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
import os
from urllib.parse import urlencode

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher


class NewsSignalFetcher(BaseSignalFetcher):
    """
    Fetches news and media signals from various sources
    Sources: NewsAPI, financial news RSS feeds
    """

    def __init__(self):
        super().__init__(SignalCategory.NEWS)
        self.news_api_key = os.getenv("NEWS_API_KEY")  # Optional - newsapi.org
        self.news_api_base = "https://newsapi.org/v2"

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch news-related signals"""
        signals = []

        # Fetch supply chain news
        supply_chain_signals = await self._fetch_supply_chain_news()
        signals.extend(supply_chain_signals)

        # Fetch industry-specific news
        industry_signals = await self._fetch_industry_news()
        signals.extend(industry_signals)

        # Fetch market disruption news
        disruption_signals = await self._fetch_disruption_news()
        signals.extend(disruption_signals)

        self.logger.info(
            "news_signals_fetched",
            total=len(signals),
            supply_chain=len(supply_chain_signals),
            industry=len(industry_signals),
            disruptions=len(disruption_signals)
        )

        return signals

    async def _fetch_supply_chain_news(self) -> List[MarketSignal]:
        """Fetch supply chain-related news signals"""
        signals = []

        try:
            # Mock supply chain news data
            # Real implementation would use NewsAPI or similar
            supply_chain_stories = [
                {
                    "title": "Port Strikes Disrupt Asian Shipping",
                    "description": "Labor disputes at major Asian ports causing significant delays in container shipping",
                    "source": "Reuters",
                    "url": "https://www.reuters.com/supply-chain-disruption",
                    "published_at": datetime.utcnow() - timedelta(hours=2),
                    "severity_keywords": ["strike", "disruption", "delay"],
                    "locations": ["Asia Pacific", "Shanghai", "Hong Kong", "Singapore"],
                    "estimated_delay_days": 14
                },
                {
                    "title": "Semiconductor Shortage Eases",
                    "description": "Major chip manufacturers report increased production capacity",
                    "source": "Bloomberg",
                    "url": "https://www.bloomberg.com/tech-supply-chain",
                    "published_at": datetime.utcnow() - timedelta(hours=5),
                    "severity_keywords": ["shortage", "easing", "improvement"],
                    "locations": ["Global", "Taiwan", "South Korea"],
                    "is_positive": True
                },
                {
                    "title": "Freight Costs Surge on Fuel Prices",
                    "description": "Rising fuel costs pushing up freight and logistics expenses across the industry",
                    "source": "WSJ",
                    "url": "https://www.wsj.com/freight-costs",
                    "published_at": datetime.utcnow() - timedelta(hours=8),
                    "severity_keywords": ["surge", "rising", "costs"],
                    "locations": ["United States", "Global"]
                }
            ]

            for story in supply_chain_stories:
                severity_score = self._calculate_news_severity(
                    story.get("severity_keywords", []),
                    story.get("is_positive", False)
                )

                if severity_score >= 50:  # Only create signals for notable stories
                    locations_str = ", ".join(story["locations"][:3])

                    signal = self._create_signal(
                        name=story["title"],
                        description=story["description"],
                        severity_score=severity_score,
                        location=locations_str,
                        time_to_impact=self._estimate_time_to_impact(story),
                        source=story["source"],
                        source_url=story.get("url"),
                        confidence=0.82,
                        impact_value=self._estimate_impact_value(severity_score, story.get("is_positive", False)),
                        impact_description=self._generate_impact_description(story),
                        affected_skus=self._estimate_affected_skus(severity_score),
                        affected_suppliers=self._estimate_affected_suppliers(severity_score),
                        affected_regions=story["locations"],
                        recommendations=self._generate_recommendations(story),
                        tags=["supply-chain", "logistics"] + story.get("severity_keywords", [])[:3],
                        metadata={
                            "published_at": story["published_at"].isoformat(),
                            "is_positive": story.get("is_positive", False),
                            "estimated_delay_days": story.get("estimated_delay_days")
                        }
                    )
                    signals.append(signal)

        except Exception as e:
            self.logger.error(
                "supply_chain_news_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_industry_news(self) -> List[MarketSignal]:
        """Fetch industry-specific news signals"""
        signals = []

        try:
            # Mock industry news data
            industry_stories = [
                {
                    "title": "Retail Sector Sees Strong Holiday Forecast",
                    "description": "Industry analysts predict robust holiday shopping season",
                    "source": "NRF",
                    "published_at": datetime.utcnow() - timedelta(hours=12),
                    "severity_keywords": ["strong", "growth", "positive"],
                    "is_positive": True,
                    "locations": ["United States"]
                },
                {
                    "title": "E-commerce Growth Accelerates",
                    "description": "Online shopping continues to gain market share from brick-and-mortar",
                    "source": "eMarketer",
                    "published_at": datetime.utcnow() - timedelta(days=1),
                    "severity_keywords": ["accelerates", "growth"],
                    "is_positive": True,
                    "locations": ["Global"]
                }
            ]

            for story in industry_stories:
                severity_score = self._calculate_news_severity(
                    story.get("severity_keywords", []),
                    story.get("is_positive", False)
                )

                if severity_score >= 45:
                    signal = self._create_signal(
                        name=story["title"],
                        description=story["description"],
                        severity_score=severity_score,
                        location=", ".join(story["locations"]),
                        time_to_impact="Ongoing",
                        source=story["source"],
                        confidence=0.75,
                        impact_value=self._estimate_impact_value(severity_score, story.get("is_positive", False)),
                        impact_description="Market trend signal",
                        recommendations=[
                            "Monitor market trends",
                            "Adjust strategic planning",
                            "Review competitive positioning"
                        ],
                        tags=["industry-news", "market-trends"] + story.get("severity_keywords", [])[:2],
                        metadata={
                            "published_at": story["published_at"].isoformat(),
                            "is_positive": story.get("is_positive", False)
                        }
                    )
                    signals.append(signal)

        except Exception as e:
            self.logger.error(
                "industry_news_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_disruption_news(self) -> List[MarketSignal]:
        """Fetch market disruption and crisis news"""
        signals = []

        try:
            # Mock disruption news
            disruption_stories = [
                {
                    "title": "Cyberattack Hits Major Logistics Provider",
                    "description": "Ransomware attack disrupts operations at international shipping company",
                    "source": "Reuters",
                    "published_at": datetime.utcnow() - timedelta(hours=3),
                    "severity_keywords": ["cyberattack", "disrupts", "ransomware"],
                    "locations": ["Global"],
                    "disruption_type": "cyber"
                }
            ]

            for story in disruption_stories:
                # Disruptions are always high severity
                severity_score = 75

                signal = self._create_signal(
                    name=story["title"],
                    description=story["description"],
                    severity_score=severity_score,
                    location=", ".join(story["locations"]),
                    time_to_impact="Immediate",
                    source=story["source"],
                    confidence=0.88,
                    impact_value=-1500000,
                    impact_description="Potential service disruptions, logistics delays",
                    affected_skus=180,
                    affected_suppliers=12,
                    recommendations=[
                        "Assess exposure to affected provider",
                        "Activate backup logistics plans",
                        "Monitor for service restoration",
                        "Communicate with stakeholders"
                    ],
                    tags=["disruption", "crisis"] + story.get("severity_keywords", [])[:3],
                    metadata={
                        "published_at": story["published_at"].isoformat(),
                        "disruption_type": story.get("disruption_type")
                    }
                )
                signals.append(signal)

        except Exception as e:
            self.logger.error(
                "disruption_news_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _calculate_news_severity(
        self, keywords: List[str], is_positive: bool
    ) -> int:
        """Calculate severity score based on keywords"""
        base_score = 45

        # High-severity keywords
        high_severity = ["crisis", "collapse", "strike", "disruption", "surge", "shortage"]
        medium_severity = ["concern", "delay", "warning", "rising"]
        positive = ["improvement", "growth", "strong", "easing"]

        for keyword in keywords:
            keyword_lower = keyword.lower()
            if any(hs in keyword_lower for hs in high_severity):
                base_score += 20
            elif any(ms in keyword_lower for ms in medium_severity):
                base_score += 10
            elif any(p in keyword_lower for p in positive):
                base_score -= 5 if is_positive else 0

        # Positive news is generally less severe
        if is_positive:
            base_score = max(35, base_score - 15)

        return min(base_score, 100)

    def _estimate_time_to_impact(self, story: dict) -> str:
        """Estimate time to business impact"""
        if story.get("estimated_delay_days"):
            days = story["estimated_delay_days"]
            if days <= 3:
                return "Immediate"
            elif days <= 7:
                return "1 week"
            elif days <= 14:
                return "2 weeks"
            else:
                return "3-4 weeks"

        # Default based on story age
        hours_ago = (datetime.utcnow() - story["published_at"]).total_seconds() / 3600
        if hours_ago <= 6:
            return "Immediate"
        elif hours_ago <= 24:
            return "1-2 days"
        else:
            return "1 week"

    def _estimate_impact_value(self, severity_score: int, is_positive: bool) -> float:
        """Estimate business impact value"""
        base_impact = (severity_score - 50) * 30000  # Scale with severity

        if is_positive:
            return abs(base_impact)  # Positive impact
        else:
            return -abs(base_impact)  # Negative impact

    def _generate_impact_description(self, story: dict) -> str:
        """Generate impact description from story"""
        if "delay" in story["title"].lower() or "disruption" in story["title"].lower():
            return "Potential inventory delays, logistics disruptions"
        elif "cost" in story["title"].lower() or "price" in story["title"].lower():
            return "Cost pressure on operations and margins"
        elif "shortage" in story["title"].lower():
            return "Supply constraints, potential stockouts"
        else:
            return "Business operations impact"

    def _estimate_affected_skus(self, severity_score: int) -> int:
        """Estimate number of affected SKUs"""
        return min(100 + (severity_score * 3), 500)

    def _estimate_affected_suppliers(self, severity_score: int) -> int:
        """Estimate number of affected suppliers"""
        return min(5 + (severity_score // 10), 25)

    def _generate_recommendations(self, story: dict) -> List[str]:
        """Generate recommendations based on story type"""
        recommendations = []

        if "strike" in story["title"].lower() or "disruption" in story["title"].lower():
            recommendations = [
                "Expedite in-transit orders",
                "Secure alternative shipping routes",
                "Communicate with affected suppliers",
                "Review contingency plans"
            ]
        elif "cost" in story["title"].lower():
            recommendations = [
                "Review pricing strategy",
                "Negotiate with suppliers",
                "Assess margin protection",
                "Consider alternative sourcing"
            ]
        elif "shortage" in story["title"].lower():
            recommendations = [
                "Secure alternative suppliers",
                "Increase safety stock",
                "Prioritize critical SKUs",
                "Communicate with customers"
            ]
        else:
            recommendations = [
                "Monitor situation closely",
                "Assess business impact",
                "Update risk assessments",
                "Prepare response plans"
            ]

        return recommendations
