"""
Conformance Checking - Compare actual process execution against reference model
Identifies deviations, calculates fitness score, and detects compliance issues
"""
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import structlog

logger = structlog.get_logger()


class ConformanceChecker:
    """Check conformance between actual and reference process models"""

    def __init__(self, actual_events: List[Dict[str, Any]]):
        """
        Initialize with actual event log

        Args:
            actual_events: List of events from actual process execution
        """
        self.events = actual_events
        self.cases = self._group_by_case()

    def _group_by_case(self) -> Dict[str, List[Dict[str, Any]]]:
        """Group events by case_id and sort by timestamp"""
        cases = defaultdict(list)
        for event in self.events:
            cases[event['case_id']].append(event)

        for case_id in cases:
            cases[case_id].sort(key=lambda x: x['timestamp'])

        return dict(cases)

    def check_conformance(
        self,
        reference_model: List[str],
        strict: bool = False
    ) -> Dict[str, Any]:
        """
        Check conformance against a reference process model

        Args:
            reference_model: List of activity names in the ideal sequence
                            e.g., ['Order Created', 'Goods Delivered', 'Invoice Generated']
            strict: If True, requires exact match. If False, allows extra activities.

        Returns:
            Conformance analysis with fitness score and deviations
        """
        logger.info(f"Checking conformance against reference: {reference_model}")

        conforming_cases = []
        non_conforming_cases = []
        deviation_types = defaultdict(int)

        for case_id, case_events in self.cases.items():
            actual_trace = [event['activity'] for event in case_events]

            # Check conformance
            is_conforming, deviations = self._check_trace_conformance(
                actual_trace,
                reference_model,
                strict
            )

            case_result = {
                'case_id': case_id,
                'actual_trace': actual_trace,
                'is_conforming': is_conforming,
                'deviations': deviations,
                'num_activities': len(actual_trace)
            }

            if is_conforming:
                conforming_cases.append(case_result)
            else:
                non_conforming_cases.append(case_result)

                # Count deviation types
                for dev in deviations:
                    deviation_types[dev['type']] += 1

        # Calculate fitness score (0-100%)
        fitness_score = (len(conforming_cases) / len(self.cases)) * 100 if self.cases else 0

        return {
            'fitness_score': round(fitness_score, 2),
            'total_cases': len(self.cases),
            'conforming_cases': len(conforming_cases),
            'non_conforming_cases': len(non_conforming_cases),
            'conformance_rate': round(fitness_score, 2),
            'reference_model': reference_model,
            'deviation_summary': dict(deviation_types),
            'sample_conforming_cases': conforming_cases[:10],
            'sample_non_conforming_cases': non_conforming_cases[:20],
            'top_deviations': self._get_top_deviations(non_conforming_cases)
        }

    def _check_trace_conformance(
        self,
        actual_trace: List[str],
        reference_trace: List[str],
        strict: bool
    ) -> Tuple[bool, List[Dict]]:
        """
        Check if actual trace conforms to reference

        Returns:
            (is_conforming, list_of_deviations)
        """
        deviations = []

        # Exact match check
        if actual_trace == reference_trace:
            return (True, [])

        if strict:
            # Strict mode: must be exact match
            return (False, [{'type': 'not_exact_match', 'detail': 'Trace differs from reference'}])

        # Flexible mode: check for common deviation patterns

        # Check for skipped activities
        skipped = set(reference_trace) - set(actual_trace)
        if skipped:
            deviations.append({
                'type': 'skipped_activities',
                'activities': list(skipped),
                'detail': f"Missing activities: {', '.join(skipped)}"
            })

        # Check for extra activities
        extra = set(actual_trace) - set(reference_trace)
        if extra:
            deviations.append({
                'type': 'extra_activities',
                'activities': list(extra),
                'detail': f"Unexpected activities: {', '.join(extra)}"
            })

        # Check for wrong sequence (activities present but in wrong order)
        common_activities = set(actual_trace) & set(reference_trace)
        if common_activities:
            ref_order = {act: idx for idx, act in enumerate(reference_trace) if act in common_activities}
            actual_order = [act for act in actual_trace if act in common_activities]

            # Check if order is preserved
            is_ordered = all(
                ref_order[actual_order[i]] < ref_order[actual_order[i+1]]
                for i in range(len(actual_order) - 1)
                if i+1 < len(actual_order)
            )

            if not is_ordered:
                deviations.append({
                    'type': 'wrong_sequence',
                    'detail': 'Activities appear in incorrect order',
                    'expected_order': reference_trace,
                    'actual_order': actual_order
                })

        # Check for rework (repeated activities)
        activity_counts = defaultdict(int)
        for act in actual_trace:
            activity_counts[act] += 1

        repeated = {act: count for act, count in activity_counts.items() if count > 1}
        if repeated:
            deviations.append({
                'type': 'rework',
                'activities': repeated,
                'detail': f"Repeated activities: {repeated}"
            })

        # Conforming if no critical deviations (allow extra/rework but not skipped)
        critical_deviations = [d for d in deviations if d['type'] in ['skipped_activities', 'wrong_sequence']]
        is_conforming = len(critical_deviations) == 0

        return (is_conforming, deviations)

    def _get_top_deviations(self, non_conforming_cases: List[Dict]) -> List[Dict]:
        """Get most common deviation patterns"""
        deviation_patterns = defaultdict(lambda: {'count': 0, 'cases': []})

        for case in non_conforming_cases:
            for deviation in case['deviations']:
                key = f"{deviation['type']}: {deviation.get('detail', '')}"
                deviation_patterns[key]['count'] += 1
                deviation_patterns[key]['cases'].append(case['case_id'])

        # Sort by frequency
        top_deviations = [
            {
                'pattern': pattern,
                'count': data['count'],
                'percentage': round((data['count'] / len(non_conforming_cases)) * 100, 2),
                'sample_cases': data['cases'][:5]
            }
            for pattern, data in sorted(
                deviation_patterns.items(),
                key=lambda x: x[1]['count'],
                reverse=True
            )
        ]

        return top_deviations[:10]

    def calculate_conformance_by_dimension(
        self,
        reference_model: List[str],
        dimension: str
    ) -> List[Dict[str, Any]]:
        """
        Calculate conformance score broken down by a dimension
        (e.g., by customer, region, product)

        Args:
            reference_model: Reference process trace
            dimension: Dimension to group by (must be in event attributes)

        Returns:
            List of conformance scores per dimension value
        """
        dimension_cases = defaultdict(list)

        # Group cases by dimension
        for case_id, case_events in self.cases.items():
            # Get dimension value from first event's attributes
            if case_events and case_events[0].get('attributes'):
                dim_value = case_events[0]['attributes'].get(dimension)
                if dim_value:
                    dimension_cases[dim_value].append(case_id)

        # Calculate conformance for each dimension value
        results = []
        for dim_value, case_ids in dimension_cases.items():
            # Filter events for these cases
            filtered_events = [
                event for event in self.events
                if event['case_id'] in case_ids
            ]

            # Create temporary conformance checker
            temp_checker = ConformanceChecker(filtered_events)
            conformance_result = temp_checker.check_conformance(reference_model)

            results.append({
                'dimension': dimension,
                'value': dim_value,
                'fitness_score': conformance_result['fitness_score'],
                'total_cases': conformance_result['total_cases'],
                'conforming_cases': conformance_result['conforming_cases'],
                'non_conforming_cases': conformance_result['non_conforming_cases']
            })

        # Sort by fitness score (worst first)
        results.sort(key=lambda x: x['fitness_score'])

        return results

    def identify_compliance_violations(
        self,
        compliance_rules: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Check for compliance rule violations

        Args:
            compliance_rules: List of rules, each with:
                - name: Rule name
                - type: 'required_activity', 'forbidden_sequence', 'max_duration'
                - params: Rule-specific parameters

        Returns:
            List of violations
        """
        violations = []

        for rule in compliance_rules:
            if rule['type'] == 'required_activity':
                # Check if required activity is present in all cases
                required_activity = rule['params']['activity']

                for case_id, case_events in self.cases.items():
                    activities = [e['activity'] for e in case_events]
                    if required_activity not in activities:
                        violations.append({
                            'rule': rule['name'],
                            'case_id': case_id,
                            'violation_type': 'missing_required_activity',
                            'detail': f"Missing required activity: {required_activity}"
                        })

            elif rule['type'] == 'forbidden_sequence':
                # Check for forbidden activity sequences
                forbidden = rule['params']['sequence']

                for case_id, case_events in self.cases.items():
                    activities = [e['activity'] for e in case_events]
                    # Check if forbidden sequence appears
                    for i in range(len(activities) - len(forbidden) + 1):
                        if activities[i:i+len(forbidden)] == forbidden:
                            violations.append({
                                'rule': rule['name'],
                                'case_id': case_id,
                                'violation_type': 'forbidden_sequence',
                                'detail': f"Found forbidden sequence: {' → '.join(forbidden)}"
                            })

        return violations
