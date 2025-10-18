"""
Process Discovery Algorithms
Implements Directly-Follows Graph (DFG) and Heuristic Miner
"""
from typing import List, Dict, Any, Tuple, Set
from collections import defaultdict, Counter
import structlog

logger = structlog.get_logger()


class ProcessDiscovery:
    """Discover process models from event logs"""

    def __init__(self, events: List[Dict[str, Any]]):
        """
        Initialize with event log

        Args:
            events: List of events with case_id, activity, timestamp, resource, attributes
        """
        self.events = events
        self.cases = self._group_by_case()

    def _group_by_case(self) -> Dict[str, List[Dict[str, Any]]]:
        """Group events by case_id and sort by timestamp"""
        cases = defaultdict(list)
        for event in self.events:
            cases[event['case_id']].append(event)

        # Sort events within each case by timestamp
        for case_id in cases:
            cases[case_id].sort(key=lambda x: x['timestamp'])

        return dict(cases)

    def discover_dfg(self) -> Dict[str, Any]:
        """
        Discover Directly-Follows Graph (DFG)

        Returns:
            DFG with nodes (activities), edges (transitions), and frequencies
        """
        logger.info(f"Discovering DFG from {len(self.cases)} cases")

        # Count activity frequencies
        activity_counts = Counter()
        for case_events in self.cases.values():
            for event in case_events:
                activity_counts[event['activity']] += 1

        # Count directly-follows relationships
        dfg_edges = Counter()
        for case_events in self.cases.values():
            for i in range(len(case_events) - 1):
                from_activity = case_events[i]['activity']
                to_activity = case_events[i + 1]['activity']
                dfg_edges[(from_activity, to_activity)] += 1

        # Find start and end activities
        start_activities = Counter()
        end_activities = Counter()
        for case_events in self.cases.values():
            if case_events:
                start_activities[case_events[0]['activity']] += 1
                end_activities[case_events[-1]['activity']] += 1

        # Build nodes
        nodes = []
        for activity, count in activity_counts.items():
            nodes.append({
                'id': activity,
                'label': activity,
                'frequency': count,
                'is_start': activity in start_activities,
                'is_end': activity in end_activities,
                'start_count': start_activities.get(activity, 0),
                'end_count': end_activities.get(activity, 0)
            })

        # Build edges
        edges = []
        for (from_act, to_act), count in dfg_edges.items():
            edges.append({
                'source': from_act,
                'target': to_act,
                'frequency': count,
                'label': f"{count}x"
            })

        return {
            'nodes': nodes,
            'edges': edges,
            'total_cases': len(self.cases),
            'total_events': len(self.events),
            'start_activities': dict(start_activities),
            'end_activities': dict(end_activities)
        }

    def discover_variants(self) -> List[Dict[str, Any]]:
        """
        Discover process variants (unique paths through the process)

        Returns:
            List of variants with their frequencies and example case IDs
        """
        logger.info("Discovering process variants")

        variant_cases = defaultdict(list)

        for case_id, case_events in self.cases.items():
            # Create variant signature (sequence of activities)
            variant = tuple(event['activity'] for event in case_events)
            variant_cases[variant].append(case_id)

        # Build variant statistics
        variants = []
        for variant, case_ids in variant_cases.items():
            variants.append({
                'variant_id': len(variants) + 1,
                'activities': list(variant),
                'frequency': len(case_ids),
                'percentage': (len(case_ids) / len(self.cases)) * 100,
                'example_cases': case_ids[:5],  # First 5 examples
                'case_count': len(case_ids)
            })

        # Sort by frequency (most common first)
        variants.sort(key=lambda x: x['frequency'], reverse=True)

        logger.info(f"Found {len(variants)} unique process variants")
        return variants

    def find_bottlenecks(self, threshold_percentile: float = 75) -> List[Dict[str, Any]]:
        """
        Find activity bottlenecks based on waiting times

        Args:
            threshold_percentile: Percentile threshold for identifying bottlenecks (default 75)

        Returns:
            List of bottleneck activities with statistics
        """
        logger.info("Analyzing bottlenecks")

        from datetime import datetime

        # Calculate waiting times between activities
        transition_times = defaultdict(list)

        for case_events in self.cases.values():
            for i in range(len(case_events) - 1):
                from_event = case_events[i]
                to_event = case_events[i + 1]

                # Parse timestamps
                from_time = datetime.fromisoformat(from_event['timestamp'].replace('Z', '+00:00'))
                to_time = datetime.fromisoformat(to_event['timestamp'].replace('Z', '+00:00'))

                # Calculate duration in hours
                duration = (to_time - from_time).total_seconds() / 3600

                transition = f"{from_event['activity']} → {to_event['activity']}"
                transition_times[transition].append(duration)

        # Calculate statistics for each transition
        bottlenecks = []
        for transition, times in transition_times.items():
            if not times:
                continue

            times_sorted = sorted(times)
            n = len(times)

            avg_time = sum(times) / n
            median_time = times_sorted[n // 2]
            p75_time = times_sorted[int(n * 0.75)]
            p95_time = times_sorted[int(n * 0.95)]
            max_time = max(times)

            bottlenecks.append({
                'transition': transition,
                'avg_hours': round(avg_time, 2),
                'median_hours': round(median_time, 2),
                'p75_hours': round(p75_time, 2),
                'p95_hours': round(p95_time, 2),
                'max_hours': round(max_time, 2),
                'occurrence_count': n,
                'is_bottleneck': avg_time >= p75_time
            })

        # Sort by average time (longest first)
        bottlenecks.sort(key=lambda x: x['avg_hours'], reverse=True)

        return bottlenecks

    def calculate_conformance(self, reference_variant: List[str]) -> Dict[str, Any]:
        """
        Calculate conformance to a reference process variant

        Args:
            reference_variant: List of activity names representing the ideal process

        Returns:
            Conformance statistics
        """
        logger.info(f"Calculating conformance to reference variant: {reference_variant}")

        conforming_cases = 0
        total_cases = len(self.cases)

        deviations = defaultdict(int)

        for case_id, case_events in self.cases.items():
            actual_variant = [event['activity'] for event in case_events]

            if actual_variant == reference_variant:
                conforming_cases += 1
            else:
                # Record type of deviation
                if len(actual_variant) < len(reference_variant):
                    deviations['skipped_activities'] += 1
                elif len(actual_variant) > len(reference_variant):
                    deviations['extra_activities'] += 1
                else:
                    deviations['different_sequence'] += 1

        conformance_rate = (conforming_cases / total_cases) * 100 if total_cases > 0 else 0

        return {
            'conforming_cases': conforming_cases,
            'total_cases': total_cases,
            'conformance_rate': round(conformance_rate, 2),
            'deviations': dict(deviations),
            'reference_variant': reference_variant
        }

    def get_activity_statistics(self) -> List[Dict[str, Any]]:
        """
        Get detailed statistics for each activity

        Returns:
            List of activity statistics (frequency, resources, duration)
        """
        activity_stats = defaultdict(lambda: {
            'count': 0,
            'resources': Counter(),
            'cases': set()
        })

        for case_id, case_events in self.cases.items():
            for event in case_events:
                activity = event['activity']
                activity_stats[activity]['count'] += 1
                activity_stats[activity]['resources'][event['resource']] += 1
                activity_stats[activity]['cases'].add(case_id)

        # Build result
        results = []
        for activity, stats in activity_stats.items():
            results.append({
                'activity': activity,
                'total_occurrences': stats['count'],
                'unique_cases': len(stats['cases']),
                'top_resources': [
                    {'resource': r, 'count': c}
                    for r, c in stats['resources'].most_common(5)
                ],
                'resource_count': len(stats['resources'])
            })

        # Sort by frequency
        results.sort(key=lambda x: x['total_occurrences'], reverse=True)

        return results

    def get_summary(self) -> Dict[str, Any]:
        """
        Get overall process summary statistics

        Returns:
            Summary statistics for the entire event log
        """
        from datetime import datetime

        # Calculate duration statistics
        case_durations = []
        for case_events in self.cases.values():
            if len(case_events) < 2:
                continue

            start_time = datetime.fromisoformat(case_events[0]['timestamp'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(case_events[-1]['timestamp'].replace('Z', '+00:00'))

            duration_hours = (end_time - start_time).total_seconds() / 3600
            case_durations.append(duration_hours)

        # Calculate statistics
        if case_durations:
            case_durations_sorted = sorted(case_durations)
            n = len(case_durations_sorted)
            avg_duration = sum(case_durations) / n
            median_duration = case_durations_sorted[n // 2]
            min_duration = min(case_durations)
            max_duration = max(case_durations)
        else:
            avg_duration = median_duration = min_duration = max_duration = 0

        # Count unique activities and resources
        unique_activities = set(event['activity'] for event in self.events)
        unique_resources = set(event['resource'] for event in self.events)

        return {
            'total_cases': len(self.cases),
            'total_events': len(self.events),
            'unique_activities': len(unique_activities),
            'unique_resources': len(unique_resources),
            'avg_events_per_case': round(len(self.events) / len(self.cases), 2) if self.cases else 0,
            'avg_duration_hours': round(avg_duration, 2),
            'median_duration_hours': round(median_duration, 2),
            'min_duration_hours': round(min_duration, 2),
            'max_duration_hours': round(max_duration, 2),
            'activities': list(unique_activities),
            'resources': list(unique_resources)
        }
