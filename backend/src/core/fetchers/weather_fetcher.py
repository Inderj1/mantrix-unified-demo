"""
Weather & Climate Signal Fetcher
Fetches weather-related market intelligence signals
Data sources: NOAA, Weather.gov, USDA
"""
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
import os

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher


class WeatherSignalFetcher(BaseSignalFetcher):
    """
    Fetches weather and climate signals from public APIs
    Sources: NOAA, Weather.gov
    """

    def __init__(self):
        super().__init__(SignalCategory.WEATHER)
        self.noaa_api_base = "https://www.ncei.noaa.gov/cdo-web/api/v2"
        self.weather_api_base = "https://api.weather.gov"
        self.api_token = os.getenv("NOAA_API_TOKEN")  # Optional

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch weather-related signals from multiple sources"""
        signals = []

        # Fetch hurricane alerts
        hurricane_signals = await self._fetch_hurricane_alerts()
        signals.extend(hurricane_signals)

        # Fetch drought conditions
        drought_signals = await self._fetch_drought_conditions()
        signals.extend(drought_signals)

        # Fetch severe weather alerts
        severe_weather_signals = await self._fetch_severe_weather()
        signals.extend(severe_weather_signals)

        self.logger.info(
            "weather_signals_fetched",
            total=len(signals),
            hurricanes=len(hurricane_signals),
            drought=len(drought_signals),
            severe=len(severe_weather_signals)
        )

        return signals

    async def _fetch_hurricane_alerts(self) -> List[MarketSignal]:
        """Fetch active hurricane warnings and watches from NOAA"""
        signals = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Get active tropical cyclones
                url = f"{self.weather_api_base}/alerts/active"
                params = {
                    "event": "Hurricane Warning,Hurricane Watch",
                    "status": "actual"
                }

                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                features = data.get("features", [])

                for feature in features[:5]:  # Limit to 5 most recent
                    properties = feature.get("properties", {})

                    event = properties.get("event", "Hurricane Alert")
                    headline = properties.get("headline", "")
                    description = properties.get("description", "")[:500]
                    area_desc = properties.get("areaDesc", "Affected Area")
                    severity = properties.get("severity", "Moderate")
                    urgency = properties.get("urgency", "Expected")
                    certainty = properties.get("certainty", "Possible")

                    # Calculate severity score based on alert properties
                    severity_score = self._calculate_hurricane_severity(
                        severity, urgency, certainty
                    )

                    # Estimate business impact
                    impact_value = -2000000 if severity_score >= 80 else -1000000

                    signal = self._create_signal(
                        name=event,
                        description=description or headline,
                        severity_score=severity_score,
                        location=area_desc,
                        time_to_impact=self._parse_time_to_impact(urgency),
                        source="NOAA/Weather.gov",
                        source_url=properties.get("id", "https://www.weather.gov"),
                        confidence=self._calculate_confidence(certainty),
                        impact_value=impact_value,
                        impact_description="Supply chain disruption, store closures, logistics delays",
                        affected_skus=200 + (severity_score * 2),
                        affected_suppliers=10 + (severity_score // 10),
                        affected_customers=5000 + (severity_score * 50),
                        affected_regions=[area_desc],
                        recommendations=[
                            "Increase safety stock in non-affected regions",
                            "Prepare emergency response team",
                            "Review insurance coverage",
                            "Communicate with affected customers"
                        ],
                        tags=["natural-disaster", "supply-chain-risk", "hurricane"],
                        metadata={
                            "severity": severity,
                            "urgency": urgency,
                            "certainty": certainty,
                            "event_type": event
                        }
                    )
                    signals.append(signal)

        except Exception as e:
            self.logger.error(
                "hurricane_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_drought_conditions(self) -> List[MarketSignal]:
        """Fetch drought condition data"""
        signals = []

        try:
            # Mock drought data for demo (replace with real API)
            # Real API: https://droughtmonitor.unl.edu/DmData/DataDownload/WebServiceInfo.aspx
            drought_areas = [
                {
                    "region": "Midwest USA",
                    "severity": "D3",  # Extreme Drought
                    "affected_acres": 45000000,
                    "confidence": 0.88
                },
                {
                    "region": "Southwest USA",
                    "severity": "D4",  # Exceptional Drought
                    "affected_acres": 25000000,
                    "confidence": 0.92
                }
            ]

            for area in drought_areas:
                severity_score = self._drought_severity_to_score(area["severity"])

                signal = self._create_signal(
                    name=f'{area["region"]} Drought Conditions',
                    description=f'Severe drought conditions ({area["severity"]}) affecting agricultural regions',
                    severity_score=severity_score,
                    location=area["region"],
                    time_to_impact="2-4 weeks",
                    source="USDA Drought Monitor",
                    source_url="https://droughtmonitor.unl.edu",
                    confidence=area["confidence"],
                    impact_value=-1500000 if severity_score >= 70 else -800000,
                    impact_description="Commodity price increases, supply constraints",
                    affected_skus=150 + (severity_score * 2),
                    affected_suppliers=8 + (severity_score // 15),
                    affected_customers=4000 + (severity_score * 40),
                    affected_regions=[area["region"]],
                    recommendations=[
                        "Secure alternative suppliers",
                        "Hedge commodity purchases",
                        "Review pricing strategy",
                        "Monitor crop yield reports"
                    ],
                    tags=["agriculture", "commodity-risk", "drought"],
                    metadata={
                        "drought_severity": area["severity"],
                        "affected_acres": area["affected_acres"]
                    }
                )
                signals.append(signal)

        except Exception as e:
            self.logger.error(
                "drought_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_severe_weather(self) -> List[MarketSignal]:
        """Fetch severe weather alerts (thunderstorms, tornadoes, floods)"""
        signals = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"{self.weather_api_base}/alerts/active"
                params = {
                    "severity": "Severe,Extreme",
                    "status": "actual"
                }

                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                features = data.get("features", [])

                # Filter for business-relevant events
                relevant_events = [
                    "Tornado Warning", "Flood Warning", "Severe Thunderstorm Warning",
                    "Winter Storm Warning", "Blizzard Warning"
                ]

                for feature in features[:10]:  # Limit to 10
                    properties = feature.get("properties", {})
                    event = properties.get("event", "")

                    # Only create signals for relevant events
                    if any(rel_event in event for rel_event in relevant_events):
                        area_desc = properties.get("areaDesc", "Affected Area")
                        description = properties.get("description", "")[:300]
                        severity = properties.get("severity", "Moderate")
                        urgency = properties.get("urgency", "Expected")

                        severity_score = self._calculate_weather_severity(severity, urgency)

                        if severity_score >= 50:  # Only create signals for medium+ severity
                            signal = self._create_signal(
                                name=event,
                                description=description or f"{event} in {area_desc}",
                                severity_score=severity_score,
                                location=area_desc,
                                time_to_impact=self._parse_time_to_impact(urgency),
                                source="NOAA/Weather.gov",
                                source_url=properties.get("id", "https://www.weather.gov"),
                                confidence=0.85,
                                impact_value=-500000 if severity_score >= 70 else -200000,
                                impact_description="Potential logistics delays, store access issues",
                                affected_skus=50 + severity_score,
                                affected_customers=1000 + (severity_score * 20),
                                affected_regions=[area_desc],
                                recommendations=[
                                    "Monitor local conditions",
                                    "Prepare contingency plans",
                                    "Alert affected stores/facilities"
                                ],
                                tags=["severe-weather", "logistics-risk"],
                                metadata={
                                    "event_type": event,
                                    "severity": severity,
                                    "urgency": urgency
                                }
                            )
                            signals.append(signal)

        except Exception as e:
            self.logger.error(
                "severe_weather_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _calculate_hurricane_severity(
        self, severity: str, urgency: str, certainty: str
    ) -> int:
        """Calculate severity score for hurricanes"""
        score = 50  # Base score

        # Severity contribution
        if severity == "Extreme":
            score += 40
        elif severity == "Severe":
            score += 30
        elif severity == "Moderate":
            score += 20
        else:
            score += 10

        # Urgency contribution
        if urgency == "Immediate":
            score += 10
        elif urgency == "Expected":
            score += 5

        # Certainty contribution (reduces uncertainty)
        if certainty == "Observed":
            score += 5
        elif certainty == "Likely":
            score += 3

        return min(score, 100)

    def _calculate_weather_severity(self, severity: str, urgency: str) -> int:
        """Calculate severity score for general weather events"""
        score = 40

        if severity == "Extreme":
            score += 40
        elif severity == "Severe":
            score += 30
        elif severity == "Moderate":
            score += 15

        if urgency == "Immediate":
            score += 15
        elif urgency == "Expected":
            score += 10

        return min(score, 100)

    def _drought_severity_to_score(self, drought_level: str) -> int:
        """Convert drought monitor level to severity score"""
        levels = {
            "D0": 40,  # Abnormally Dry
            "D1": 50,  # Moderate Drought
            "D2": 60,  # Severe Drought
            "D3": 75,  # Extreme Drought
            "D4": 90   # Exceptional Drought
        }
        return levels.get(drought_level, 50)

    def _calculate_confidence(self, certainty: str) -> float:
        """Calculate confidence score from certainty level"""
        certainty_map = {
            "Observed": 1.0,
            "Likely": 0.85,
            "Possible": 0.65,
            "Unlikely": 0.35
        }
        return certainty_map.get(certainty, 0.7)

    def _parse_time_to_impact(self, urgency: str) -> str:
        """Parse urgency to time-to-impact string"""
        urgency_map = {
            "Immediate": "0-6 hours",
            "Expected": "6-24 hours",
            "Future": "1-3 days",
            "Past": "Ongoing"
        }
        return urgency_map.get(urgency, "Unknown")
