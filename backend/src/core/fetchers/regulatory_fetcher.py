"""
Regulatory & Legal Signal Fetcher
Fetches regulatory and legal intelligence signals
Data source: Federal Register API (free, no API key required)
"""
from typing import List
from datetime import datetime, timedelta
import httpx

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher


class RegulatorySignalFetcher(BaseSignalFetcher):
    """
    Fetches regulatory and legal signals from Federal Register API
    Source: https://www.federalregister.gov/developers/documentation/api/v1
    """

    def __init__(self):
        super().__init__(SignalCategory.REGULATORY)
        self.base_url = "https://www.federalregister.gov/api/v1"

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch regulatory signals from Federal Register"""
        signals = []

        # Fetch different types of regulatory signals
        rule_signals = await self._fetch_new_rules()
        signals.extend(rule_signals)

        proposed_signals = await self._fetch_proposed_rules()
        signals.extend(proposed_signals)

        self.logger.info(
            "regulatory_signals_fetched",
            category=self.category.value,
            total=len(signals),
            new_rules=len(rule_signals),
            proposed_rules=len(proposed_signals)
        )

        return signals

    async def _fetch_new_rules(self) -> List[MarketSignal]:
        """Fetch newly published final rules"""
        signals = []

        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/documents.json"

                # Get rules from last 7 days
                params = {
                    "conditions[type]": "RULE",
                    "conditions[publication_date][gte]": (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d"),
                    "per_page": 10,
                    "order": "newest",
                    "fields[]": ["title", "abstract", "publication_date", "agencies", "html_url", "topics"]
                }

                response = await client.get(url, params=params, timeout=15.0)
                response.raise_for_status()
                data = response.json()

                for doc in data.get("results", []):
                    # Check if relevant to business/commerce
                    is_relevant = self._is_business_relevant(doc)

                    if is_relevant:
                        severity_score = self._calculate_regulatory_severity(doc)

                        agencies = ", ".join([a.get("name", "") for a in doc.get("agencies", [])[:2]])

                        signal = self._create_signal(
                            name=f'New Regulation: {doc.get("title", "")[:80]}',
                            description=doc.get("abstract", "No description available")[:500],
                            severity_score=severity_score,
                            location="United States",
                            time_to_impact="30-90 days",
                            source=f"Federal Register - {agencies}",
                            source_url=doc.get("html_url", ""),
                            confidence=0.95,
                            impact_value=-500000 if severity_score >= 60 else -200000,
                            impact_description="New compliance requirements may require operational changes",
                            recommendations=[
                                "Review regulation details",
                                "Assess compliance requirements",
                                "Consult legal/compliance team",
                                "Identify operational impacts"
                            ],
                            tags=["regulation", "compliance", "federal-register"],
                            metadata={
                                "publication_date": doc.get("publication_date"),
                                "agencies": [a.get("name") for a in doc.get("agencies", [])],
                                "topics": doc.get("topics", []),
                                "document_type": "RULE"
                            }
                        )
                        signals.append(signal)

        except Exception as e:
            self.logger.error(
                "regulatory_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_proposed_rules(self) -> List[MarketSignal]:
        """Fetch proposed rules (advance notice)"""
        signals = []

        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/documents.json"

                params = {
                    "conditions[type]": "PRORULE",  # Proposed Rule
                    "conditions[publication_date][gte]": (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d"),
                    "per_page": 5,
                    "order": "newest",
                    "fields[]": ["title", "abstract", "publication_date", "agencies", "html_url", "comment_date"]
                }

                response = await client.get(url, params=params, timeout=15.0)
                response.raise_for_status()
                data = response.json()

                for doc in data.get("results", []):
                    if self._is_business_relevant(doc):
                        severity_score = max(40, self._calculate_regulatory_severity(doc) - 15)  # Lower severity for proposed

                        agencies = ", ".join([a.get("name", "") for a in doc.get("agencies", [])[:2]])
                        comment_deadline = doc.get("comment_date", "Not specified")

                        signal = self._create_signal(
                            name=f'Proposed Rule: {doc.get("title", "")[:80]}',
                            description=f'{doc.get("abstract", "")[:400]} | Comment deadline: {comment_deadline}',
                            severity_score=severity_score,
                            location="United States",
                            time_to_impact="6-12 months",
                            source=f"Federal Register - {agencies}",
                            source_url=doc.get("html_url", ""),
                            confidence=0.75,  # Lower confidence - still proposed
                            impact_value=-300000,
                            impact_description="Potential future compliance requirements - opportunity to submit comments",
                            recommendations=[
                                "Review proposed rule",
                                "Consider submitting public comments",
                                "Monitor rule finalization",
                                "Assess potential impact"
                            ],
                            tags=["proposed-rule", "regulatory", "comment-period"],
                            metadata={
                                "publication_date": doc.get("publication_date"),
                                "comment_deadline": comment_deadline,
                                "agencies": [a.get("name") for a in doc.get("agencies", [])],
                                "document_type": "PRORULE"
                            }
                        )
                        signals.append(signal)

        except Exception as e:
            self.logger.error(
                "proposed_rule_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _is_business_relevant(self, document: dict) -> bool:
        """
        Check if a regulatory document is relevant to business operations
        Focus on: commerce, food safety, labor, environmental, tax
        """
        relevant_keywords = [
            "commerce", "trade", "business", "food", "beverage", "safety",
            "label", "packaging", "environmental", "labor", "employment",
            "tax", "tariff", "import", "export", "manufacturing"
        ]

        text_to_check = (
            document.get("title", "").lower() + " " +
            document.get("abstract", "").lower()
        )

        # Check agencies
        relevant_agencies = ["FDA", "EPA", "OSHA", "Commerce", "Agriculture", "Treasury", "Labor"]
        agencies = [a.get("name", "") for a in document.get("agencies", [])]

        has_relevant_agency = any(
            relevant_agency.lower() in agency.lower()
            for agency in agencies
            for relevant_agency in relevant_agencies
        )

        # Check keywords
        has_relevant_keyword = any(keyword in text_to_check for keyword in relevant_keywords)

        return has_relevant_agency or has_relevant_keyword

    def _calculate_regulatory_severity(self, document: dict) -> int:
        """Calculate severity score for a regulatory change"""
        base_score = 55  # Medium severity by default

        # Check for high-impact keywords
        high_impact_keywords = ["mandatory", "prohibited", "requirement", "must", "shall", "penalty", "fine"]
        text = (document.get("title", "") + " " + document.get("abstract", "")).lower()

        high_impact_count = sum(1 for keyword in high_impact_keywords if keyword in text)
        base_score += min(high_impact_count * 5, 25)

        # Adjust based on agencies (FDA, EPA, OSHA tend to be higher impact)
        high_impact_agencies = ["FDA", "EPA", "OSHA", "SEC"]
        agencies = [a.get("name", "") for a in document.get("agencies", [])]

        for agency in agencies:
            if any(hia in agency for hia in high_impact_agencies):
                base_score += 10
                break

        return min(base_score, 90)  # Cap at 90
