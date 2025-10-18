"""
Process Simulation Engine - What-If Analysis
Monte Carlo simulation to predict impact of process changes
"""
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger()


class ProcessSimulator:
    """Simulate process execution with modified parameters"""

    def __init__(self, process_model: Dict[str, Any], historical_performance: Dict[str, Any]):
        """
        Initialize simulator with process model and historical data

        Args:
            process_model: Process model with nodes and edges
            historical_performance: Historical performance metrics
        """
        self.process_model = process_model
        self.historical_performance = historical_performance
        self.nodes = {node['id']: node for node in process_model.get('nodes', [])}
        self.edges = process_model.get('edges', [])

        # Build transition matrix
        self.transitions = {}
        for edge in self.edges:
            source = edge['source']
            if source not in self.transitions:
                self.transitions[source] = []
            self.transitions[source].append({
                'target': edge['target'],
                'frequency': edge.get('frequency', 1),
                'avg_duration_hours': edge.get('avg_duration_hours', 1.0)
            })

    def simulate_cases(
        self,
        num_cases: int = 1000,
        modifications: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run Monte Carlo simulation of N cases through the process

        Args:
            num_cases: Number of cases to simulate
            modifications: Dict of modifications to apply:
                - activity_durations: {activity_name: new_avg_hours}
                - transition_probabilities: {(source, target): new_probability}
                - resource_capacities: {activity_name: max_concurrent}

        Returns:
            Simulation results with projected metrics
        """
        logger.info(f"Running simulation for {num_cases} cases with modifications: {modifications}")

        modifications = modifications or {}
        activity_durations = modifications.get('activity_durations', {})
        transition_probs = modifications.get('transition_probabilities', {})

        # Apply modifications to transitions
        modified_transitions = self._apply_modifications(
            activity_durations,
            transition_probs
        )

        # Simulate cases
        simulated_cases = []
        for case_num in range(num_cases):
            case_trace = self._simulate_single_case(case_num, modified_transitions, activity_durations)
            simulated_cases.append(case_trace)

        # Calculate aggregate metrics
        results = self._calculate_metrics(simulated_cases)

        # Add comparison with current state
        results['comparison'] = self._compare_with_current(results)

        return results

    def _apply_modifications(
        self,
        activity_durations: Dict[str, float],
        transition_probs: Dict[str, float]
    ) -> Dict[str, List[Dict]]:
        """Apply user modifications to transition model"""
        modified = {}

        for source, targets in self.transitions.items():
            modified[source] = []

            for target_info in targets:
                # Apply duration modifications
                target_activity = target_info['target']
                avg_duration = activity_durations.get(
                    target_activity,
                    target_info['avg_duration_hours']
                )

                # Apply probability modifications if specified
                trans_key = f"{source} → {target_activity}"
                frequency = transition_probs.get(trans_key, target_info['frequency'])

                modified[source].append({
                    'target': target_activity,
                    'frequency': frequency,
                    'avg_duration_hours': avg_duration
                })

        return modified

    def _simulate_single_case(
        self,
        case_id: int,
        transitions: Dict[str, List[Dict]],
        activity_durations: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Simulate a single case through the process

        Returns case trace with activities and timestamps
        """
        # Find start activities
        start_activities = [
            node['id'] for node in self.process_model['nodes']
            if node.get('is_start', False)
        ]

        if not start_activities:
            # Fallback: use activity with highest start_count
            start_activities = [max(
                self.process_model['nodes'],
                key=lambda n: n.get('start_count', 0)
            )['id']]

        # Random start activity (weighted by start_count)
        current_activity = random.choice(start_activities)

        current_time = datetime(2025, 1, 1, 8, 0, 0)  # Start at 8am
        trace = []
        visited = set()
        max_steps = 50  # Prevent infinite loops

        for step in range(max_steps):
            # Record activity
            trace.append({
                'activity': current_activity,
                'timestamp': current_time,
                'step': step
            })

            visited.add(current_activity)

            # Check if this is an end activity
            node = self.nodes.get(current_activity)
            if node and node.get('is_end', False) and random.random() < 0.7:
                # 70% chance to end if it's an end activity
                break

            # Get possible next activities
            next_options = transitions.get(current_activity, [])

            if not next_options:
                # Dead end - process complete
                break

            # Choose next activity based on frequency (probability)
            total_freq = sum(opt['frequency'] for opt in next_options)
            if total_freq == 0:
                break

            rand_val = random.random() * total_freq
            cumulative = 0
            next_activity = None
            next_duration = 1.0

            for option in next_options:
                cumulative += option['frequency']
                if rand_val <= cumulative:
                    next_activity = option['target']
                    next_duration = option['avg_duration_hours']
                    break

            if not next_activity:
                next_activity = next_options[0]['target']
                next_duration = next_options[0]['avg_duration_hours']

            # Add variability to duration (±30%)
            actual_duration = next_duration * random.uniform(0.7, 1.3)

            # Move time forward
            current_time += timedelta(hours=actual_duration)
            current_activity = next_activity

        # Calculate case duration
        if len(trace) > 1:
            duration_hours = (trace[-1]['timestamp'] - trace[0]['timestamp']).total_seconds() / 3600
        else:
            duration_hours = 0

        return {
            'case_id': f"SIM-{case_id:06d}",
            'trace': trace,
            'duration_hours': duration_hours,
            'num_activities': len(trace)
        }

    def _calculate_metrics(self, simulated_cases: List[Dict]) -> Dict[str, Any]:
        """Calculate aggregate metrics from simulated cases"""

        if not simulated_cases:
            return {}

        # Cycle time statistics
        durations = [case['duration_hours'] for case in simulated_cases]
        durations_sorted = sorted(durations)
        n = len(durations_sorted)

        avg_duration = sum(durations) / n
        median_duration = durations_sorted[n // 2]
        min_duration = min(durations)
        max_duration = max(durations)
        p90_duration = durations_sorted[int(n * 0.9)]
        p95_duration = durations_sorted[int(n * 0.95)]

        # Activity frequencies
        activity_counts = {}
        for case in simulated_cases:
            for event in case['trace']:
                activity = event['activity']
                activity_counts[activity] = activity_counts.get(activity, 0) + 1

        # Throughput (cases per day assuming 24/7)
        total_sim_time_days = max_duration / 24 if max_duration > 0 else 1
        throughput_per_day = n / total_sim_time_days if total_sim_time_days > 0 else n

        return {
            'simulated_cases': n,
            'cycle_time': {
                'avg_hours': round(avg_duration, 2),
                'median_hours': round(median_duration, 2),
                'min_hours': round(min_duration, 2),
                'max_hours': round(max_duration, 2),
                'p90_hours': round(p90_duration, 2),
                'p95_hours': round(p95_duration, 2),
                'avg_days': round(avg_duration / 24, 2),
                'median_days': round(median_duration / 24, 2)
            },
            'throughput': {
                'cases_per_day': round(throughput_per_day, 2)
            },
            'activity_counts': activity_counts,
            'total_events': sum(case['num_activities'] for case in simulated_cases)
        }

    def _compare_with_current(self, simulated_metrics: Dict) -> Dict[str, Any]:
        """Compare simulated results with current historical performance"""

        current = self.historical_performance
        simulated = simulated_metrics

        # Extract current metrics
        current_cycle_time = current.get('cycle_times', {}).get('statistics', {})
        current_throughput = current.get('throughput', {})

        comparison = {}

        # Cycle time comparison
        if current_cycle_time.get('avg_hours'):
            current_avg = current_cycle_time['avg_hours']
            sim_avg = simulated['cycle_time']['avg_hours']

            comparison['cycle_time'] = {
                'current_avg_hours': current_avg,
                'simulated_avg_hours': sim_avg,
                'delta_hours': round(sim_avg - current_avg, 2),
                'delta_percent': round(((sim_avg - current_avg) / current_avg) * 100, 2),
                'improvement': sim_avg < current_avg
            }

        # Throughput comparison
        if current_throughput.get('avg_cases_completed_per_period'):
            current_tp = current_throughput['avg_cases_completed_per_period']
            sim_tp = simulated['throughput']['cases_per_day']

            comparison['throughput'] = {
                'current_cases_per_day': current_tp,
                'simulated_cases_per_day': sim_tp,
                'delta_cases': round(sim_tp - current_tp, 2),
                'delta_percent': round(((sim_tp - current_tp) / current_tp) * 100, 2) if current_tp > 0 else 0,
                'improvement': sim_tp > current_tp
            }

        return comparison
