"""Automated Materialized View Optimizer with cost-benefit analysis."""

from typing import Dict, List, Optional
import structlog
from datetime import datetime, timezone

from .mv_manager import MaterializedViewManager, MaterializedViewConfig

logger = structlog.get_logger()


class MaterializedViewOptimizer:
    """Automatically creates and manages beneficial materialized views."""
    
    def __init__(self, mv_manager: MaterializedViewManager, cost_threshold_usd: float = 10.0):
        self.mv_manager = mv_manager
        self.cost_threshold = cost_threshold_usd
        
    def auto_create_beneficial_mvs(self) -> List[Dict]:
        """Automatically create MVs that meet cost/benefit criteria."""
        recommendations = self.mv_manager.get_mv_recommendations()
        created_mvs = []
        
        for rec in recommendations:
            if self._meets_criteria(rec):
                try:
                    config = self._create_config_from_recommendation(rec)
                    result = self.mv_manager.create_materialized_view(config)
                    
                    created_mvs.append({
                        "mv_name": config.name,
                        "status": "created",
                        "estimated_monthly_savings": rec['potential_savings']['monthly_usd'],
                        "estimated_monthly_cost": result['estimated_monthly_cost']
                    })
                    
                    logger.info(
                        f"Auto-created MV: {config.name}",
                        monthly_savings=rec['potential_savings']['monthly_usd'],
                        monthly_cost=result['estimated_monthly_cost']
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to auto-create MV: {e}", recommendation=rec)
                    created_mvs.append({
                        "query_pattern": rec['query_pattern'],
                        "status": "failed",
                        "error": str(e)
                    })
        
        return created_mvs
    
    def optimize_existing_mvs(self) -> List[Dict]:
        """Optimize existing materialized views based on usage patterns."""
        project = self.mv_manager.bq_client.project
        dataset = self.mv_manager.bq_client.dataset
        
        existing_mvs = self.mv_manager.list_materialized_views(project, dataset)
        optimization_actions = []
        
        for mv in existing_mvs:
            if 'error' in mv:
                continue
                
            action = self._analyze_mv_performance(mv)
            if action:
                optimization_actions.append(action)
                
                if action['action'] == 'drop':
                    try:
                        self.mv_manager.drop_materialized_view(project, dataset, mv['name'])
                        logger.info(f"Dropped underutilized MV: {mv['name']}")
                    except Exception as e:
                        logger.error(f"Failed to drop MV {mv['name']}: {e}")
                        action['status'] = 'failed'
                        action['error'] = str(e)
        
        return optimization_actions
    
    def get_optimization_report(self) -> Dict:
        """Generate a comprehensive optimization report."""
        # Check cache first
        if self.mv_manager.cache_manager:
            cached_report = self.mv_manager.cache_manager.get_optimization_report()
            if cached_report:
                logger.info("Retrieved optimization report from cache")
                return cached_report
        
        project = self.mv_manager.bq_client.project
        dataset = self.mv_manager.bq_client.dataset
        
        existing_mvs = self.mv_manager.list_materialized_views(project, dataset)
        recommendations = self.mv_manager.get_mv_recommendations()
        
        # Calculate totals
        total_mvs = len([mv for mv in existing_mvs if 'error' not in mv])
        total_cost = sum(mv.get('estimated_monthly_cost', 0) for mv in existing_mvs if 'error' not in mv)
        
        # Identify optimization opportunities
        underutilized_mvs = [
            mv for mv in existing_mvs 
            if 'error' not in mv and self._is_underutilized(mv)
        ]
        
        high_value_recommendations = [
            rec for rec in recommendations
            if self._meets_criteria(rec)
        ]
        
        report = {
            "summary": {
                "total_materialized_views": total_mvs,
                "total_monthly_cost_usd": round(total_cost, 2),
                "underutilized_mvs": len(underutilized_mvs),
                "high_value_recommendations": len(high_value_recommendations)
            },
            "existing_mvs": existing_mvs,
            "underutilized_mvs": underutilized_mvs,
            "recommendations": high_value_recommendations,
            "potential_monthly_savings": self._calculate_total_savings(high_value_recommendations),
            "report_generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Cache the report
        if self.mv_manager.cache_manager:
            self.mv_manager.cache_manager.cache_optimization_report(report)
        
        return report
    
    def _meets_criteria(self, recommendation: Dict) -> bool:
        """Check if MV creation criteria are met."""
        # Cost-benefit analysis
        monthly_savings = recommendation['potential_savings']['monthly_usd']
        mv_cost = recommendation['suggested_mv'].get('estimated_cost_usd', 10)
        
        return (
            monthly_savings > mv_cost * 2  # 2x ROI
            and monthly_savings > self.cost_threshold
            and recommendation['frequency'] > 20  # High frequency
        )
    
    def _create_config_from_recommendation(self, rec: Dict) -> MaterializedViewConfig:
        """Create MV configuration from recommendation."""
        import hashlib
        
        # Generate unique name
        pattern_hash = hashlib.md5(rec['query_pattern'].encode()).hexdigest()[:8]
        mv_name = f"mv_opt_{pattern_hash}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        
        suggested = rec['suggested_mv']
        
        return MaterializedViewConfig(
            name=mv_name,
            query=suggested['query'],
            dataset=self.mv_manager.bq_client.dataset,
            project=self.mv_manager.bq_client.project,
            partition_by=suggested.get('partition_by'),
            cluster_by=suggested.get('cluster_by'),
            auto_refresh=True,
            refresh_interval_hours=24,
            description=f"Auto-optimized MV - Saves ${rec['potential_savings']['monthly_usd']:.2f}/month"
        )
    
    def _analyze_mv_performance(self, mv: Dict) -> Optional[Dict]:
        """Analyze MV performance and suggest actions."""
        # Check if MV is stale
        if mv.get('staleness_hours', 0) > 48:
            return {
                "mv_name": mv['name'],
                "action": "refresh",
                "reason": f"MV is {mv['staleness_hours']:.1f} hours stale"
            }
        
        # Check if MV is underutilized
        if self._is_underutilized(mv):
            return {
                "mv_name": mv['name'],
                "action": "drop",
                "reason": "Low usage relative to cost",
                "monthly_cost": mv.get('estimated_monthly_cost', 0)
            }
        
        return None
    
    def _is_underutilized(self, mv: Dict) -> bool:
        """Check if an MV is underutilized based on cost vs usage."""
        # Simple heuristic: if cost > $5/month and no recent queries
        cost = mv.get('estimated_monthly_cost', 0)
        staleness = mv.get('staleness_hours', 0)
        
        # If it hasn't been refreshed in 7 days, it's probably not being used
        return cost > 5 and staleness > 168
    
    def _calculate_total_savings(self, recommendations: List[Dict]) -> float:
        """Calculate total potential savings from recommendations."""
        return sum(rec['potential_savings']['monthly_usd'] for rec in recommendations)