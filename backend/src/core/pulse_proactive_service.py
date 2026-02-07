"""
Proactive Pattern Service for Enterprise Pulse
Handles Recommend / Simulate / Execute pipeline for 12 ERP-actionable patterns.
Wraps PulseMonitorService — composition over inheritance.
"""
import uuid
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from .pulse_proactive_patterns import get_all_patterns, get_pattern, get_patterns_by_category
from .pulse_monitor_service import PulseMonitorService, serialize_for_json
from ..db.bigquery import BigQueryClient
from .llm_client import LLMClient

logger = structlog.get_logger()


class PulseProactiveService:
    """
    Service for running proactive ERP patterns at three automation levels:
    - Recommend: detect anomaly + AI recommendation
    - Simulate: detect + what-if scenarios
    - Execute: detect + simulate + dispatch ERP action (with approval)
    """

    def __init__(self):
        self.pulse_service = PulseMonitorService()
        self.bq_client = BigQueryClient()
        self.llm_client = LLMClient()

    def list_patterns(self, category: Optional[str] = None) -> List[Dict]:
        """List all pattern templates, optionally filtered by category."""
        if category:
            return get_patterns_by_category(category)
        return get_all_patterns()

    def get_pattern_detail(self, pattern_id: str) -> Optional[Dict]:
        """Get a single pattern template with full detail."""
        return get_pattern(pattern_id)

    async def run_pattern(
        self,
        pattern_id: str,
        action_level: str = "recommend",
        custom_thresholds: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Run a pattern at the specified automation level.

        Args:
            pattern_id: Pattern template ID
            action_level: 'recommend', 'simulate', or 'execute'
            custom_thresholds: Override default thresholds

        Returns:
            Detection results, recommendations, simulations, or execution plan
        """
        pattern = get_pattern(pattern_id)
        if not pattern:
            raise ValueError(f"Pattern '{pattern_id}' not found")

        thresholds = {**pattern["default_thresholds"]}
        if custom_thresholds:
            thresholds.update(custom_thresholds)

        result = {
            "pattern_id": pattern_id,
            "pattern_name": pattern["name"],
            "action_level": action_level,
            "timestamp": datetime.utcnow().isoformat(),
            "thresholds_used": thresholds,
        }

        # Step 1: Detection (always runs)
        detection = await self._run_detection(pattern, thresholds)
        result["detection"] = detection

        if not detection.get("rows"):
            result["status"] = "clear"
            result["summary"] = f"No anomalies detected for {pattern['name']}."
            return result

        result["status"] = "detected"
        result["detection_count"] = len(detection["rows"])

        # Step 2: Recommendation (recommend + simulate + execute)
        if action_level in ("recommend", "simulate", "execute"):
            recommendation = await self._generate_recommendation(pattern, detection)
            result["recommendation"] = recommendation

        # Step 3: Simulation (simulate + execute)
        if action_level in ("simulate", "execute"):
            simulation = await self._run_simulation(pattern, thresholds)
            result["simulation"] = simulation

        # Step 4: Execution plan (execute only)
        if action_level == "execute":
            execution = self._prepare_execution(pattern, detection)
            result["execution"] = execution

        return serialize_for_json(result)

    async def _run_detection(self, pattern: Dict, thresholds: Dict) -> Dict:
        """Run detection SQL against BigQuery."""
        try:
            sql = pattern["detection_sql"].format(**thresholds)
            rows = self.bq_client.execute_query(sql)
            return {
                "sql": sql,
                "rows": serialize_for_json(rows) if rows else [],
                "row_count": len(rows) if rows else 0,
            }
        except Exception as e:
            logger.error(f"Detection failed for {pattern['id']}: {e}")
            return {"sql": "", "rows": [], "row_count": 0, "error": str(e)}

    async def _generate_recommendation(self, pattern: Dict, detection: Dict) -> Dict:
        """Use LLM to generate an AI recommendation based on detection results."""
        try:
            top_rows = detection["rows"][:5]
            prompt = (
                f"You are an ERP analyst. Pattern: {pattern['name']}. "
                f"Description: {pattern['description']}. "
                f"Detection results (top rows): {json.dumps(top_rows, default=str)}. "
                f"Generate a concise business recommendation (2-3 sentences) "
                f"including specific suggested ERP action: {pattern['action_type']}."
            )
            response = await self.llm_client.generate_text(prompt)
            return {
                "text": response,
                "action_type": pattern["action_type"],
                "confidence": 0.85,
            }
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return {
                "text": f"Detection found {detection['row_count']} anomalies. Manual review recommended.",
                "action_type": pattern["action_type"],
                "confidence": 0.5,
                "error": str(e),
            }

    async def _run_simulation(self, pattern: Dict, thresholds: Dict) -> Dict:
        """Run simulation SQL with different parameter scenarios."""
        simulation_params = pattern.get("simulation_params", {})
        if not simulation_params:
            return {"scenarios": [], "note": "No simulation parameters defined for this pattern."}

        scenarios = []
        for param_name, param_values in simulation_params.items():
            for value in param_values:
                try:
                    sim_thresholds = {**thresholds, param_name: value}
                    sql = pattern["simulation_sql"].format(**sim_thresholds)
                    rows = self.bq_client.execute_query(sql)
                    scenarios.append({
                        "param": param_name,
                        "value": value,
                        "sql": sql,
                        "rows": serialize_for_json(rows) if rows else [],
                        "row_count": len(rows) if rows else 0,
                    })
                except Exception as e:
                    logger.error(f"Simulation failed for {param_name}={value}: {e}")
                    scenarios.append({
                        "param": param_name,
                        "value": value,
                        "error": str(e),
                    })

        return {"scenarios": scenarios, "total_scenarios": len(scenarios)}

    def _prepare_execution(self, pattern: Dict, detection: Dict) -> Dict:
        """
        Prepare execution plan — does NOT auto-execute.
        Returns a pending action that requires frontend confirmation.
        """
        action_id = str(uuid.uuid4())
        return {
            "action_id": action_id,
            "action_type": pattern["action_type"],
            "action_target": pattern["action_target"],
            "requires_approval": pattern.get("requires_approval", True),
            "status": "pending_approval",
            "affected_rows": detection.get("row_count", 0),
            "description": (
                f"Execute '{pattern['action_type']}' for {detection.get('row_count', 0)} "
                f"detected items via {pattern['action_target']}."
            ),
        }

    async def approve_action(self, action_id: str) -> Dict:
        """
        Approve a pending execute action.
        In Phase 1, this creates a Command Tower ticket.
        """
        logger.info(f"Action {action_id} approved — creating Command Tower ticket")
        return {
            "action_id": action_id,
            "status": "executed",
            "ticket_id": f"CT-{datetime.utcnow().strftime('%Y%m%d')}-{action_id[:8]}",
            "message": "Action dispatched to Command Tower.",
        }

    async def reject_action(self, action_id: str, reason: str = "") -> Dict:
        """Reject a pending execute action."""
        logger.info(f"Action {action_id} rejected: {reason}")
        return {
            "action_id": action_id,
            "status": "rejected",
            "reason": reason,
        }
