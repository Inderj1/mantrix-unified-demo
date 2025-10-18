"""
AI Insights Engine - Automatically detect patterns and generate recommendations
Analyzes process data to find automation opportunities, bottlenecks, and improvements
"""
from typing import List, Dict, Any
from collections import defaultdict, Counter
import structlog

logger = structlog.get_logger()


class InsightsEngine:
    """Generate AI-powered insights from process mining data"""

    def __init__(
        self,
        process_model: Dict[str, Any],
        performance: Dict[str, Any],
        variants: List[Dict[str, Any]]
    ):
        """
        Initialize with process mining results

        Args:
            process_model: Discovered process model
            performance: Performance analysis results
            variants: Process variants
        """
        self.process_model = process_model
        self.performance = performance
        self.variants = variants

    def generate_insights(self) -> List[Dict[str, Any]]:
        """
        Generate all insights

        Returns:
            List of insights with type, severity, description, and recommendations
        """
        logger.info("Generating AI insights...")

        insights = []

        # Bottleneck insights
        insights.extend(self._detect_bottleneck_insights())

        # Automation opportunities
        insights.extend(self._detect_automation_opportunities())

        # Rework insights
        insights.extend(self._detect_rework_patterns())

        # Variant insights
        insights.extend(self._detect_variant_insights())

        # Resource utilization insights
        insights.extend(self._detect_resource_insights())

        # Handover insights
        insights.extend(self._detect_handover_inefficiencies())

        # Sort by severity (critical, high, medium, low)
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        insights.sort(key=lambda x: severity_order.get(x['severity'], 4))

        logger.info(f"Generated {len(insights)} insights")
        return insights

    def _detect_bottleneck_insights(self) -> List[Dict[str, Any]]:
        """Detect bottleneck-related insights"""
        insights = []

        bottlenecks = self.performance.get('performance', {}).get('bottlenecks', [])
        if not bottlenecks:
            return insights

        # Critical bottlenecks (>48 hours)
        critical_bottlenecks = [b for b in bottlenecks if b.get('avg_hours', 0) > 48]

        if critical_bottlenecks:
            top_bottleneck = critical_bottlenecks[0]

            insights.append({
                'type': 'bottleneck',
                'severity': 'critical',
                'title': f"Critical Bottleneck: {top_bottleneck['transition']}",
                'description': f"This transition takes an average of {top_bottleneck['avg_hours']:.1f} hours ({top_bottleneck['avg_hours']/24:.1f} days), significantly delaying the process.",
                'impact': {
                    'affected_cases': top_bottleneck.get('occurrence_count', 0),
                    'avg_delay_hours': top_bottleneck['avg_hours'],
                    'total_wasted_time_days': round((top_bottleneck['avg_hours'] * top_bottleneck.get('occurrence_count', 0)) / 24, 1)
                },
                'recommendations': [
                    f"Add capacity to reduce transition time by 50%",
                    "Investigate root cause of delays",
                    "Consider parallel processing",
                    "Implement automated handover"
                ],
                'estimated_improvement': f"Could reduce overall cycle time by {self._estimate_bottleneck_impact(top_bottleneck)}%"
            })

        return insights

    def _detect_automation_opportunities(self) -> List[Dict[str, Any]]:
        """Detect activities that could be automated"""
        insights = []

        # Look for high-frequency, low-variance activities
        activity_stats = self.performance.get('performance', {}).get('activity_durations', [])

        if not activity_stats:
            return insights

        for activity in activity_stats:
            # Automation candidate if:
            # 1. High frequency (>100 occurrences)
            # 2. Consistent duration (low variance implied by consistent median/avg)
            if activity.get('occurrence_count', 0) > 100:
                avg = activity.get('avg_duration_hours', 0)
                median = activity.get('median_duration_hours', 0)

                # Low variance if avg and median are close
                if avg > 0 and abs(avg - median) / avg < 0.3:
                    insights.append({
                        'type': 'automation_opportunity',
                        'severity': 'medium',
                        'title': f"Automation Opportunity: {activity['activity']}",
                        'description': f"This activity occurs {activity['occurrence_count']} times with consistent duration ({avg:.1f}h average). High repetition suggests automation potential.",
                        'impact': {
                            'frequency': activity['occurrence_count'],
                            'avg_duration_hours': round(avg, 2),
                            'total_time_spent_days': round((avg * activity['occurrence_count']) / 24, 1)
                        },
                        'recommendations': [
                            "Implement RPA (Robotic Process Automation)",
                            "Create automated workflow triggers",
                            "Build API integration for data entry",
                            "Use AI to automate decision-making"
                        ],
                        'estimated_improvement': f"Could save {round(avg * activity['occurrence_count'] / 24, 0)} days of manual work"
                    })

        return insights[:3]  # Top 3 automation opportunities

    def _detect_rework_patterns(self) -> List[Dict[str, Any]]:
        """Detect rework and quality issues"""
        insights = []

        rework = self.performance.get('performance', {}).get('rework', {})
        rework_rate = rework.get('rework_rate_percentage', 0)

        if rework_rate > 15:  # More than 15% rework rate
            insights.append({
                'type': 'rework',
                'severity': 'high',
                'title': f"High Rework Rate: {rework_rate:.1f}%",
                'description': f"{rework.get('total_cases_with_rework', 0)} out of {rework.get('total_cases', 0)} cases ({rework_rate:.1f}%) require rework, indicating quality or process issues.",
                'impact': {
                    'cases_affected': rework.get('total_cases_with_rework', 0),
                    'rework_rate': rework_rate
                },
                'recommendations': [
                    "Implement validation at point of entry",
                    "Add quality checks before handover",
                    "Provide better training/documentation",
                    "Identify and fix root causes of errors"
                ],
                'estimated_improvement': "Could reduce cycle time by 10-20% by eliminating rework"
            })

        return insights

    def _detect_variant_insights(self) -> List[Dict[str, Any]]:
        """Analyze process variants for insights"""
        insights = []

        if not self.variants or len(self.variants) < 2:
            return insights

        # Check if one variant dominates
        top_variant = self.variants[0]
        if top_variant.get('percentage', 0) > 60:
            insights.append({
                'type': 'variant_standardization',
                'severity': 'low',
                'title': f"Opportunity for Standardization",
                'description': f"One variant accounts for {top_variant['percentage']:.1f}% of cases. Consider standardizing on this 'happy path'.",
                'impact': {
                    'dominant_variant_percentage': top_variant['percentage'],
                    'total_variants': len(self.variants)
                },
                'recommendations': [
                    "Document the dominant variant as standard process",
                    "Train staff on best practices",
                    "Implement process controls to guide users to happy path",
                    "Investigate why other variants occur"
                ],
                'estimated_improvement': "Standardization could improve consistency and reduce errors"
            })

        # Check for too many variants (complexity)
        if len(self.variants) > 20:
            insights.append({
                'type': 'variant_complexity',
                'severity': 'medium',
                'title': f"High Process Complexity: {len(self.variants)} Variants",
                'description': f"Process has {len(self.variants)} different execution paths, indicating high complexity and lack of standardization.",
                'impact': {
                    'total_variants': len(self.variants),
                    'top_3_coverage': sum(v.get('percentage', 0) for v in self.variants[:3])
                },
                'recommendations': [
                    "Simplify process by removing unnecessary paths",
                    "Consolidate similar variants",
                    "Implement decision rules to guide execution",
                    "Focus on top 3 variants (covering {:.1f}% of cases)".format(
                        sum(v.get('percentage', 0) for v in self.variants[:3])
                    )
                ],
                'estimated_improvement': "Simplification could reduce errors and training time"
            })

        return insights

    def _detect_resource_insights(self) -> List[Dict[str, Any]]:
        """Detect resource utilization issues"""
        insights = []

        resource_util = self.performance.get('performance', {}).get('resource_utilization', [])

        if not resource_util:
            return insights

        # Check for uneven distribution
        if len(resource_util) >= 3:
            top_resource = resource_util[0]
            avg_utilization = sum(r.get('utilization_percentage', 0) for r in resource_util) / len(resource_util)

            if top_resource.get('utilization_percentage', 0) > avg_utilization * 2:
                insights.append({
                    'type': 'resource_imbalance',
                    'severity': 'medium',
                    'title': "Uneven Resource Workload",
                    'description': f"{top_resource['resource']} handles {top_resource['utilization_percentage']:.1f}% of work, while average is {avg_utilization:.1f}%. Workload imbalance detected.",
                    'impact': {
                        'top_resource': top_resource['resource'],
                        'top_utilization': top_resource['utilization_percentage'],
                        'average_utilization': round(avg_utilization, 2)
                    },
                    'recommendations': [
                        "Redistribute work more evenly",
                        "Cross-train team members",
                        "Implement workload balancing rules",
                        "Consider hiring if top resource is overloaded"
                    ],
                    'estimated_improvement': "Better distribution could reduce bottlenecks and burnout"
                })

        return insights

    def _detect_handover_inefficiencies(self) -> List[Dict[str, Any]]:
        """Detect handover delays between activities"""
        insights = []

        # Analyze transitions with long wait times
        bottlenecks = self.performance.get('performance', {}).get('bottlenecks', [])

        handover_delays = [
            b for b in bottlenecks
            if '→' in b.get('transition', '') and b.get('avg_hours', 0) > 24
        ]

        if handover_delays:
            insights.append({
                'type': 'handover_delay',
                'severity': 'high',
                'title': "Handover Delays Detected",
                'description': f"{len(handover_delays)} transitions have average wait times >24 hours, suggesting coordination issues.",
                'impact': {
                    'affected_transitions': len(handover_delays),
                    'total_delay_hours': sum(b.get('avg_hours', 0) for b in handover_delays)
                },
                'recommendations': [
                    "Implement automated notifications for handovers",
                    "Set SLAs for each transition",
                    "Create shared work queues",
                    "Reduce dependencies between teams"
                ],
                'estimated_improvement': f"Reducing handover time could save {sum(b.get('avg_hours', 0) for b in handover_delays)/24:.0f} days per case"
            })

        return insights

    def _estimate_bottleneck_impact(self, bottleneck: Dict) -> int:
        """Estimate % improvement if bottleneck is resolved"""
        # Simplified calculation: assume resolving bottleneck saves 50% of its time
        bottleneck_time = bottleneck.get('avg_hours', 0)
        total_cycle_time = self.performance.get('performance', {}).get('cycle_times', {}).get('statistics', {}).get('avg_hours', 1)

        if total_cycle_time == 0:
            return 0

        improvement = (bottleneck_time * 0.5) / total_cycle_time * 100
        return round(improvement, 0)
