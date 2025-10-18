"""
Energy & Sustainability Signal Fetcher
Fetches energy price and sustainability signals
Data source: EIA (Energy Information Administration) API - free with API key
"""
from typing import List
from datetime import datetime, timedelta
import httpx

from ...models.market_signal import MarketSignal, SignalCategory
from ..market_signal_service import BaseSignalFetcher
from ...config import settings


class EnergySignalFetcher(BaseSignalFetcher):
    """
    Fetches energy and sustainability signals from EIA API
    Source: https://www.eia.gov/opendata/
    """

    def __init__(self):
        super().__init__(SignalCategory.ENERGY)
        self.eia_api_key = settings.eia_api_key  # Register at https://www.eia.gov/opendata/register.php
        self.base_url = "https://api.eia.gov/v2"

    async def fetch_signals(self) -> List[MarketSignal]:
        """Fetch energy price and sustainability signals"""
        signals = []

        if not self.eia_api_key:
            self.logger.warning("EIA_API_KEY not set, skipping energy signals")
            return signals

        # Fetch energy price signals
        price_signals = await self._fetch_energy_prices()
        signals.extend(price_signals)

        self.logger.info(
            "energy_signals_fetched",
            category=self.category.value,
            total=len(signals),
            price_signals=len(price_signals)
        )

        return signals

    async def _fetch_energy_prices(self) -> List[MarketSignal]:
        """Fetch energy price signals (electricity, natural gas)"""
        signals = []

        try:
            async with httpx.AsyncClient() as client:
                # Fetch electricity prices
                url = f"{self.base_url}/electricity/retail-sales/data/"
                params = {
                    "api_key": self.eia_api_key,
                    "frequency": "monthly",
                    "data[0]": "price",
                    "sort[0][column]": "period",
                    "sort[0][direction]": "desc",
                    "length": 2
                }

                response = await client.get(url, params=params, timeout=15.0)
                response.raise_for_status()
                data = response.json()

                if "response" in data and "data" in data["response"]:
                    prices = data["response"]["data"]
                    if len(prices) >= 2:
                        current = float(prices[0]["price"])
                        previous = float(prices[1]["price"])
                        change_pct = ((current - previous) / previous) * 100

                        severity_score = self._calculate_price_severity(change_pct)

                        if abs(change_pct) >= 5:  # Only signal if >5% change
                            direction = "increased" if change_pct > 0 else "decreased"

                            signal = self._create_signal(
                                name=f'Electricity Prices {direction.title()} {abs(change_pct):.1f}%',
                                description=f'Commercial electricity prices {direction} from ${previous:.2f} to ${current:.2f} per kWh',
                                severity_score=severity_score,
                                location="United States",
                                time_to_impact="Ongoing",
                                source="EIA (Energy Information Administration)",
                                source_url="https://www.eia.gov/electricity/",
                                confidence=0.95,
                                impact_value=-500000 if change_pct > 0 else 200000,
                                impact_description=f'{"Higher energy costs will impact operational expenses" if change_pct > 0 else "Lower energy costs improve margins"}',
                                recommendations=[
                                    "Review energy contracts" if change_pct > 0 else "Lock in favorable rates",
                                    "Assess energy efficiency programs",
                                    "Update cost forecasts",
                                    "Consider renewable energy options"
                                ],
                                tags=["energy-prices", "electricity", direction],
                                metadata={
                                    "current_price": current,
                                    "previous_price": previous,
                                    "change_percent": change_pct,
                                    "period": prices[0].get("period")
                                }
                            )
                            signals.append(signal)

        except Exception as e:
            self.logger.error(
                "energy_price_fetch_error",
                error=str(e),
                exc_info=True
            )

        return signals

    def _calculate_price_severity(self, change_pct: float) -> int:
        """Calculate severity based on price change percentage"""
        abs_change = abs(change_pct)

        if abs_change >= 20:
            return 85
        elif abs_change >= 15:
            return 70
        elif abs_change >= 10:
            return 60
        elif abs_change >= 5:
            return 50
        else:
            return 40
