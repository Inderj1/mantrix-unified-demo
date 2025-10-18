"""Query optimization module for cross-platform support."""

from .base import OptimizationConfig, OptimizationStrategy
from .mv_manager import MaterializedViewManager, MaterializedViewConfig, MaterializedViewStats
from .mv_optimizer import MaterializedViewOptimizer
from .bigquery import BigQueryOptimization
from .copa_mv_templates import (
    COPA_MV_TEMPLATES,
    create_copa_standard_mvs,
    get_copa_mv_recommendations,
    estimate_copa_mv_costs
)

__all__ = [
    "OptimizationConfig",
    "OptimizationStrategy",
    "MaterializedViewManager",
    "MaterializedViewConfig",
    "MaterializedViewStats",
    "MaterializedViewOptimizer",
    "BigQueryOptimization",
    "COPA_MV_TEMPLATES",
    "create_copa_standard_mvs",
    "get_copa_mv_recommendations",
    "estimate_copa_mv_costs",
]