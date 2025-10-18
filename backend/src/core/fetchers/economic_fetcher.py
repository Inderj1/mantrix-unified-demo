"""
Economic Indicators Signal Fetcher
Fetches economic intelligence signals
Data sources: Federal Reserve, Bureau of Labor Statistics, Treasury
"""
from typing import List, Optional
from datetime import datetime, timedelta
import httpx

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher
from ...config import settings


class EconomicSignalFetcher(BaseSignalFetcher):
    """
    Fetches economic indicator signals from public APIs
    Sources: FRED (Federal Reserve), BLS, Treasury
    """

    def __init__(self):
        super().__init__(SignalCategory.ECONOMIC)
        self.fred_api_key = settings.fred_api_key  # Optional - Federal Reserve Economic Data
        self.fred_base_url = "https://api.stlouisfed.org/fred"

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch economic indicator signals"""
        signals = []

        # Fetch interest rate signals
        rate_signals = await self._fetch_interest_rate_signals()
        signals.extend(rate_signals)

        # Fetch inflation signals
        inflation_signals = await self._fetch_inflation_signals()
        signals.extend(inflation_signals)

        # Fetch employment signals
        employment_signals = await self._fetch_employment_signals()
        signals.extend(employment_signals)

        # Fetch GDP/economic growth signals
        gdp_signals = await self._fetch_gdp_signals()
        signals.extend(gdp_signals)

        self.logger.info(
            "economic_signals_fetched",
            total=len(signals),
            rates=len(rate_signals),
            inflation=len(inflation_signals),
            employment=len(employment_signals),
            gdp=len(gdp_signals)
        )

        return signals

    async def _fetch_interest_rate_signals(self) -> List[MarketSignal]:
        """Fetch interest rate and monetary policy signals"""
        signals = []

        try:
            # Fetch real FRED data if API key available
            if self.fred_api_key:
                rate_data = await self._fetch_from_fred("FEDFUNDS")  # Federal Funds Rate
            else:
                # Fallback to mock data
                rate_data = {
                    "current_rate": 5.5,
                    "projected_rate": 5.25,
                    "trend": "decreasing",
                    "last_change_date": "2024-09-18",
                    "next_meeting_date": "2024-11-07"
                }

            severity_score = self._calculate_rate_change_severity(
                rate_data["current_rate"],
                rate_data["projected_rate"]
            )

            direction = "cut" if rate_data["projected_rate"] < rate_data["current_rate"] else "hike"
            change_bps = abs(rate_data["projected_rate"] - rate_data["current_rate"]) * 100

            signal = self._create_signal(
                name=f"Fed Signals Potential Rate {direction.title()}",
                description=f'Federal Reserve hints at potential {change_bps:.0f} basis point interest rate {direction} at next meeting',
                severity_score=severity_score,
                location="United States",
                time_to_impact="1 month",
                source="Federal Reserve",
                source_url="https://www.federalreserve.gov",
                confidence=0.72,
                impact_value=950000 if direction == "cut" else -750000,
                impact_description=f'{"Lower borrowing costs, increased consumer spending potential" if direction == "cut" else "Higher borrowing costs, potential demand slowdown"}',
                recommendations=[
                    "Review capital expenditure plans",
                    "Consider refinancing options" if direction == "cut" else "Lock in current rates",
                    "Prepare for demand changes",
                    "Adjust inventory strategy"
                ],
                tags=["monetary-policy", "interest-rates", f"rate-{direction}"],
                metadata={
                    "current_rate": rate_data["current_rate"],
                    "projected_rate": rate_data["projected_rate"],
                    "change_bps": change_bps,
                    "next_meeting": rate_data["next_meeting_date"]
                }
            )
            signals.append(signal)

        except Exception as e:
            self.logger.error(
                "interest_rate_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_inflation_signals(self) -> List[MarketSignal]:
        """Fetch inflation and CPI signals"""
        signals = []

        try:
            # Mock inflation data
            inflation_data = {
                "cpi_annual": 3.7,
                "cpi_monthly": 0.6,
                "trend": "increasing",
                "target": 2.0
            }

            deviation = inflation_data["cpi_annual"] - inflation_data["target"]
            severity_score = min(40 + int(deviation * 15), 100)

            if severity_score >= 50:  # Only create signal if notable
                signal = self._create_signal(
                    name=f'Inflation {"Above" if deviation > 0 else "Below"} Target',
                    description=f'Consumer Price Index at {inflation_data["cpi_annual"]}%, {"exceeding" if deviation > 0 else "below"} Fed target of {inflation_data["target"]}%',
                    severity_score=severity_score,
                    location="United States",
                    time_to_impact="Ongoing",
                    source="Bureau of Labor Statistics",
                    source_url="https://www.bls.gov/cpi/",
                    confidence=0.95,
                    impact_value=-850000 if deviation > 0 else 300000,
                    impact_description=f'{"Cost pressures, margin compression" if deviation > 0 else "Stable pricing environment"}',
                    recommendations=[
                        "Monitor supplier cost changes",
                        "Review pricing strategy",
                        "Assess margin protection measures" if deviation > 0 else "Consider strategic investments",
                        "Update financial forecasts"
                    ],
                    tags=["inflation", "cpi", "cost-pressure" if deviation > 0 else "stable-prices"],
                    metadata={
                        "cpi_annual": inflation_data["cpi_annual"],
                        "cpi_monthly": inflation_data["cpi_monthly"],
                        "target": inflation_data["target"],
                        "deviation": deviation
                    }
                )
                signals.append(signal)

        except Exception as e:
            self.logger.error(
                "inflation_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_employment_signals(self) -> List[MarketSignal]:
        """Fetch employment and labor market signals"""
        signals = []

        try:
            # Mock employment data
            employment_data = {
                "unemployment_rate": 3.8,
                "monthly_change": -50000,  # jobs lost
                "trend": "weakening"
            }

            # Calculate severity based on unemployment rate and trend
            if employment_data["unemployment_rate"] >= 5.0:
                severity_score = 70
            elif employment_data["unemployment_rate"] >= 4.5:
                severity_score = 55
            else:
                severity_score = 40

            # Adjust for monthly changes
            if employment_data["monthly_change"] < -100000:
                severity_score += 20
            elif employment_data["monthly_change"] < 0:
                severity_score += 10

            severity_score = min(severity_score, 100)

            if severity_score >= 50:
                signal = self._create_signal(
                    name=f'Labor Market {"Weakening" if employment_data["monthly_change"] < 0 else "Strengthening"}',
                    description=f'Unemployment rate at {employment_data["unemployment_rate"]}%, with {abs(employment_data["monthly_change"]):,} jobs {"lost" if employment_data["monthly_change"] < 0 else "added"} last month',
                    severity_score=severity_score,
                    location="United States",
                    time_to_impact="Ongoing",
                    source="Bureau of Labor Statistics",
                    source_url="https://www.bls.gov/",
                    confidence=0.92,
                    impact_value=-600000 if employment_data["monthly_change"] < 0 else 400000,
                    impact_description=f'{"Consumer spending may weaken, labor costs stabilizing" if employment_data["monthly_change"] < 0 else "Consumer confidence strong, potential wage pressure"}',
                    recommendations=[
                        "Monitor consumer spending patterns",
                        "Review workforce planning",
                        "Assess demand forecasts",
                        "Consider inventory adjustments"
                    ],
                    tags=["employment", "labor-market", employment_data["trend"]],
                    metadata={
                        "unemployment_rate": employment_data["unemployment_rate"],
                        "monthly_change": employment_data["monthly_change"],
                        "trend": employment_data["trend"]
                    }
                )
                signals.append(signal)

        except Exception as e:
            self.logger.error(
                "employment_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    async def _fetch_gdp_signals(self) -> List[MarketSignal]:
        """Fetch GDP and economic growth signals"""
        signals = []

        try:
            # Mock GDP data
            gdp_data = {
                "gdp_growth_rate": 2.1,  # Annual %
                "previous_quarter": 2.6,
                "trend": "slowing",
                "forecast": 1.8
            }

            # Calculate severity - lower/negative growth is more severe
            if gdp_data["gdp_growth_rate"] < 0:
                severity_score = 85  # Recession
            elif gdp_data["gdp_growth_rate"] < 1.0:
                severity_score = 70
            elif gdp_data["gdp_growth_rate"] < 2.0:
                severity_score = 55
            else:
                severity_score = 35

            # Adjust for trend
            if gdp_data["trend"] == "slowing" and gdp_data["gdp_growth_rate"] < gdp_data["previous_quarter"]:
                severity_score += 10

            severity_score = min(severity_score, 100)

            if severity_score >= 50:
                signal = self._create_signal(
                    name=f'Economic Growth {"Slowing" if gdp_data["trend"] == "slowing" else "Accelerating"}',
                    description=f'GDP growth at {gdp_data["gdp_growth_rate"]}% annually, down from {gdp_data["previous_quarter"]}% previous quarter',
                    severity_score=severity_score,
                    location="United States",
                    time_to_impact="Ongoing",
                    source="Bureau of Economic Analysis",
                    source_url="https://www.bea.gov/",
                    confidence=0.88,
                    impact_value=-1200000 if severity_score >= 70 else -500000,
                    impact_description="Economic slowdown may impact consumer demand and business investment",
                    recommendations=[
                        "Review growth projections",
                        "Adjust inventory levels",
                        "Focus on cost efficiency",
                        "Consider defensive positioning"
                    ],
                    tags=["gdp", "economic-growth", gdp_data["trend"]],
                    metadata={
                        "gdp_growth_rate": gdp_data["gdp_growth_rate"],
                        "previous_quarter": gdp_data["previous_quarter"],
                        "forecast": gdp_data["forecast"],
                        "trend": gdp_data["trend"]
                    }
                )
                signals.append(signal)

        except Exception as e:
            self.logger.error(
                "gdp_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _calculate_rate_change_severity(
        self, current_rate: float, projected_rate: float
    ) -> int:
        """Calculate severity of interest rate changes"""
        change_bps = abs(projected_rate - current_rate) * 100

        # Base severity on magnitude of change
        if change_bps >= 75:
            base_score = 75
        elif change_bps >= 50:
            base_score = 65
        elif change_bps >= 25:
            base_score = 55
        else:
            base_score = 45

        # Rate cuts are generally positive, rate hikes negative
        # Adjust severity accordingly
        if projected_rate < current_rate:
            base_score -= 10  # Rate cuts less severe
        else:
            base_score += 5  # Rate hikes more concerning

        return max(40, min(base_score, 100))

    async def _fetch_from_fred(self, series_id: str) -> dict:
        """
        Fetch data from FRED API

        Args:
            series_id: FRED series ID (e.g., 'FEDFUNDS', 'CPIAUCSL', 'UNRATE', 'GDP')

        Returns:
            dict with latest data and metadata
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.fred_base_url}/series/observations"
                params = {
                    "series_id": series_id,
                    "api_key": self.fred_api_key,
                    "file_type": "json",
                    "limit": 2,  # Get latest 2 observations for trend
                    "sort_order": "desc"
                }

                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()

                if "observations" in data and len(data["observations"]) > 0:
                    latest = data["observations"][0]
                    previous = data["observations"][1] if len(data["observations"]) > 1 else latest

                    current_value = float(latest["value"])
                    previous_value = float(previous["value"])

                    return {
                        "current_rate": current_value,
                        "projected_rate": current_value * 0.95,  # Estimate based on trend
                        "previous_value": previous_value,
                        "trend": "decreasing" if current_value < previous_value else "increasing",
                        "last_change_date": latest["date"],
                        "next_meeting_date": "2024-12-18"  # Would need separate data source
                    }
                else:
                    raise ValueError(f"No data returned from FRED for series {series_id}")

        except Exception as e:
            self.logger.error(
                "fred_api_error",
                series_id=series_id,
                error=str(e),
                exc_info=True
            )
            # Return mock data as fallback
            return {
                "current_rate": 5.5,
                "projected_rate": 5.25,
                "trend": "decreasing",
                "last_change_date": "2024-09-18",
                "next_meeting_date": "2024-11-07"
            }
