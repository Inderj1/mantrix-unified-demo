"""
Labor & Workforce Signal Fetcher
Fetches labor market and workforce signals
Data source: BLS (Bureau of Labor Statistics) API - free with registration
"""
from typing import List
from datetime import datetime
import httpx

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher
from ...config import settings


class LaborSignalFetcher(BaseSignalFetcher):
    """
    Fetches labor and workforce signals from BLS API
    Source: https://www.bls.gov/developers/
    """

    def __init__(self):
        super().__init__(SignalCategory.LABOR)
        self.bls_api_key = settings.bls_api_key  # Register at https://data.bls.gov/registrationEngine/
        self.base_url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch labor market signals"""
        signals = []

        if not self.bls_api_key:
            self.logger.warning("BLS_API_KEY not set, skipping labor signals")
            return signals

        # Fetch unemployment signals
        unemployment_signals = await self._fetch_unemployment_data()
        signals.extend(unemployment_signals)

        self.logger.info(
            "labor_signals_fetched",
            category=self.category.value,
            total=len(signals)
        )

        return signals

    async def _fetch_unemployment_data(self) -> List[MarketSignal]:
        """Fetch unemployment rate data"""
        signals = []

        try:
            async with httpx.AsyncClient() as client:
                # LNS14000000 = Unemployment Rate
                data = {
                    "seriesid": ["LNS14000000"],
                    "startyear": str(datetime.now().year),
                    "endyear": str(datetime.now().year),
                    "registrationkey": self.bls_api_key
                }

                response = await client.post(self.base_url, json=data, timeout=15.0)
                response.raise_for_status()
                result = response.json()

                if result.get("status") == "REQUEST_SUCCEEDED" and "Results" in result:
                    series_data = result["Results"]["series"][0]["data"]
                    if len(series_data) >= 2:
                        latest = series_data[0]
                        previous = series_data[1]

                        unemployment_rate = float(latest["value"])
                        prev_rate = float(previous["value"])
                        change = unemployment_rate - prev_rate

                        severity_score = self._calculate_unemployment_severity(unemployment_rate, change)

                        if severity_score >= 50:
                            direction = "increased" if change > 0 else "decreased"

                            signal = self._create_signal(
                                name=f'Unemployment Rate {direction.title()} to {unemployment_rate}%',
                                description=f'National unemployment rate {direction} {abs(change):.1f} percentage points to {unemployment_rate}%',
                                severity_score=severity_score,
                                location="United States",
                                time_to_impact="Ongoing",
                                source="Bureau of Labor Statistics",
                                source_url="https://www.bls.gov/",
                                confidence=0.98,
                                impact_value=-800000 if change > 0 else 400000,
                                impact_description=f'{"Weakening labor market may reduce consumer spending" if change > 0 else "Stronger labor market supports consumer demand"}',
                                recommendations=[
                                    "Monitor consumer spending trends",
                                    "Review workforce planning" if change > 0 else "Prepare for wage pressures",
                                    "Adjust demand forecasts",
                                    "Consider inventory levels"
                                ],
                                tags=["labor-market", "unemployment", direction],
                                metadata={
                                    "unemployment_rate": unemployment_rate,
                                    "previous_rate": prev_rate,
                                    "change": change,
                                    "period": f'{latest["year"]}-{latest["period"]}'
                                }
                            )
                            signals.append(signal)

        except Exception as e:
            self.logger.error(
                "bls_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _calculate_unemployment_severity(self, rate: float, change: float) -> int:
        """Calculate severity based on unemployment rate and change"""
        # Base severity on absolute rate
        if rate >= 7.0:
            base = 80
        elif rate >= 5.0:
            base = 65
        elif rate >= 4.0:
            base = 50
        else:
            base = 40

        # Adjust for change direction
        if change > 0.5:
            base += 15
        elif change > 0.2:
            base += 10

        return min(base, 95)
