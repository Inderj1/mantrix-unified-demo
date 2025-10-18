"""
Market Signal Data Models
Defines the structure for market intelligence signals from various sources
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class SignalCategory(str, Enum):
    """Market signal categories"""
    WEATHER = "weather"
    ECONOMIC = "economic"
    TARIFFS = "tariffs"
    COMPETITORS = "competitors"
    SOCIAL = "social"
    NEWS = "news"
    MARKETING = "marketing"
    SUPPLY_CHAIN = "supplyChain"
    REGULATORY = "regulatory"
    TECHNOLOGY = "technology"
    ENERGY = "energy"
    LABOR = "labor"
    GEOPOLITICAL = "geopolitical"
    HEALTH = "health"
    REAL_ESTATE = "realEstate"


class SeverityLevel(str, Enum):
    """Signal severity levels"""
    CRITICAL = "CRITICAL"  # 80-100
    HIGH = "HIGH"          # 60-79
    MEDIUM = "MEDIUM"      # 40-59
    LOW = "LOW"            # 0-39


class MarketSignal(BaseModel):
    """Individual market signal"""
    id: str = Field(..., description="Unique signal ID")
    category: SignalCategory
    name: str = Field(..., description="Signal name/title")
    description: str = Field(..., description="Detailed description")

    # Severity
    severity: SeverityLevel
    severityScore: int = Field(..., ge=0, le=100, description="Numeric severity score")

    # Location and timing
    location: str = Field(..., description="Geographic location or scope")
    detectedAt: datetime = Field(default_factory=datetime.utcnow)
    timeToImpact: str = Field(..., description="Expected time to impact (e.g., '3-5 days')")

    # Business impact
    impactValue: Optional[float] = Field(None, description="Estimated business impact in dollars")
    impactDescription: Optional[str] = Field(None, description="Description of business impact")

    # Affected entities
    affectedSKUs: Optional[int] = Field(None, description="Number of affected SKUs")
    affectedSuppliers: Optional[int] = Field(None, description="Number of affected suppliers")
    affectedCustomers: Optional[int] = Field(None, description="Number of affected customers")
    affectedRegions: Optional[List[str]] = Field(None, description="Affected regions")

    # Recommendations
    recommendations: List[str] = Field(default_factory=list, description="Recommended actions")

    # Metadata
    source: str = Field(..., description="Data source (API, RSS, etc.)")
    sourceUrl: Optional[str] = Field(None, description="URL to original source")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    tags: List[str] = Field(default_factory=list, description="Tags for filtering")

    # Status
    isActive: bool = Field(True, description="Whether signal is still active")
    dismissedAt: Optional[datetime] = Field(None, description="When signal was dismissed")
    resolvedAt: Optional[datetime] = Field(None, description="When issue was resolved")

    # Additional data
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "SIG-W001",
                "category": "weather",
                "name": "Hurricane Warning - Florida",
                "description": "Category 4 hurricane expected to make landfall in 72 hours",
                "severity": "CRITICAL",
                "severityScore": 95,
                "location": "Florida, USA",
                "timeToImpact": "3 days",
                "impactValue": -5000000,
                "affectedSKUs": 450,
                "recommendations": [
                    "Increase inventory in non-affected regions",
                    "Prepare emergency response team",
                    "Review insurance coverage"
                ],
                "source": "NOAA",
                "confidence": 0.95,
                "tags": ["natural-disaster", "supply-chain-risk"]
            }
        }


class MarketSignalCreate(BaseModel):
    """Schema for creating a new market signal"""
    category: SignalCategory
    name: str
    description: str
    severity: SeverityLevel
    severityScore: int = Field(..., ge=0, le=100)
    location: str
    timeToImpact: str
    impactValue: Optional[float] = None
    impactDescription: Optional[str] = None
    affectedSKUs: Optional[int] = None
    affectedSuppliers: Optional[int] = None
    affectedCustomers: Optional[int] = None
    affectedRegions: Optional[List[str]] = None
    recommendations: List[str] = Field(default_factory=list)
    source: str
    sourceUrl: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MarketSignalUpdate(BaseModel):
    """Schema for updating a market signal"""
    isActive: Optional[bool] = None
    dismissedAt: Optional[datetime] = None
    resolvedAt: Optional[datetime] = None
    severity: Optional[SeverityLevel] = None
    severityScore: Optional[int] = Field(None, ge=0, le=100)


class MarketSignalList(BaseModel):
    """Response schema for list of signals"""
    signals: List[MarketSignal]
    total: int
    categories: Dict[str, int] = Field(default_factory=dict, description="Signal count per category")
    totalImpact: float = Field(0, description="Total business impact")
    criticalCount: int = Field(0, description="Number of critical signals")


class CategoryConfig(BaseModel):
    """Configuration for which categories are enabled"""
    enabled_categories: List[SignalCategory]
    customer_id: Optional[str] = Field(None, description="Customer ID for personalization")

    class Config:
        json_schema_extra = {
            "example": {
                "enabled_categories": [
                    "weather",
                    "economic",
                    "news",
                    "supply_chain"
                ],
                "customer_id": "customer_123"
            }
        }
