"""
Performance Analyzer for Process Mining
Analyzes cycle times, throughput, and performance metrics
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict
import structlog

logger = structlog.get_logger()


class PerformanceAnalyzer:
    """Analyze process performance metrics"""

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

    def _parse_timestamp(self, ts_str: str) -> datetime:
        """Parse timestamp string to datetime object"""
        return datetime.fromisoformat(ts_str.replace('Z', '+00:00'))

    def analyze_cycle_times(self) -> Dict[str, Any]:
        """
        Analyze end-to-end cycle times for all cases

        Returns:
            Cycle time statistics
        """
        logger.info("Analyzing cycle times")

        cycle_times = []
        case_details = []

        for case_id, case_events in self.cases.items():
            if len(case_events) < 2:
                continue

            start_time = self._parse_timestamp(case_events[0]['timestamp'])
            end_time = self._parse_timestamp(case_events[-1]['timestamp'])

            # Calculate duration in different units
            duration = end_time - start_time
            duration_hours = duration.total_seconds() / 3600
            duration_days = duration.total_seconds() / 86400

            cycle_times.append(duration_hours)

            case_details.append({
                'case_id': case_id,
                'start_time': case_events[0]['timestamp'],
                'end_time': case_events[-1]['timestamp'],
                'duration_hours': round(duration_hours, 2),
                'duration_days': round(duration_days, 2),
                'activity_count': len(case_events),
                'start_activity': case_events[0]['activity'],
                'end_activity': case_events[-1]['activity']
            })

        # Calculate statistics
        if cycle_times:
            cycle_times_sorted = sorted(cycle_times)
            n = len(cycle_times_sorted)

            avg_cycle_time = sum(cycle_times) / n
            median_cycle_time = cycle_times_sorted[n // 2]
            min_cycle_time = min(cycle_times)
            max_cycle_time = max(cycle_times)
            p90_cycle_time = cycle_times_sorted[int(n * 0.9)]
            p95_cycle_time = cycle_times_sorted[int(n * 0.95)]

            # Calculate standard deviation
            variance = sum((x - avg_cycle_time) ** 2 for x in cycle_times) / n
            std_dev = variance ** 0.5
        else:
            avg_cycle_time = median_cycle_time = min_cycle_time = max_cycle_time = 0
            p90_cycle_time = p95_cycle_time = std_dev = 0
            case_details = []

        return {
            'statistics': {
                'avg_hours': round(avg_cycle_time, 2),
                'median_hours': round(median_cycle_time, 2),
                'min_hours': round(min_cycle_time, 2),
                'max_hours': round(max_cycle_time, 2),
                'p90_hours': round(p90_cycle_time, 2),
                'p95_hours': round(p95_cycle_time, 2),
                'std_dev_hours': round(std_dev, 2),
                'avg_days': round(avg_cycle_time / 24, 2),
                'median_days': round(median_cycle_time / 24, 2)
            },
            'case_count': len(cycle_times),
            'fastest_cases': sorted(case_details, key=lambda x: x['duration_hours'])[:10],
            'slowest_cases': sorted(case_details, key=lambda x: x['duration_hours'], reverse=True)[:10]
        }

    def analyze_activity_durations(self) -> List[Dict[str, Any]]:
        """
        Analyze duration statistics for each activity

        Returns:
            List of activity duration statistics
        """
        logger.info("Analyzing activity durations")

        activity_durations = defaultdict(list)

        for case_events in self.cases.values():
            for i in range(len(case_events) - 1):
                current_event = case_events[i]
                next_event = case_events[i + 1]

                current_time = self._parse_timestamp(current_event['timestamp'])
                next_time = self._parse_timestamp(next_event['timestamp'])

                duration_hours = (next_time - current_time).total_seconds() / 3600

                activity_durations[current_event['activity']].append({
                    'duration_hours': duration_hours,
                    'next_activity': next_event['activity'],
                    'case_id': current_event['case_id']
                })

        # Calculate statistics for each activity
        results = []
        for activity, durations in activity_durations.items():
            if not durations:
                continue

            duration_values = [d['duration_hours'] for d in durations]
            duration_values_sorted = sorted(duration_values)
            n = len(duration_values_sorted)

            avg_duration = sum(duration_values) / n
            median_duration = duration_values_sorted[n // 2]
            min_duration = min(duration_values)
            max_duration = max(duration_values)

            results.append({
                'activity': activity,
                'avg_duration_hours': round(avg_duration, 2),
                'median_duration_hours': round(median_duration, 2),
                'min_duration_hours': round(min_duration, 2),
                'max_duration_hours': round(max_duration, 2),
                'occurrence_count': len(durations),
                'next_activities': list(set(d['next_activity'] for d in durations))
            })

        # Sort by average duration (longest first)
        results.sort(key=lambda x: x['avg_duration_hours'], reverse=True)

        return results

    def analyze_throughput(self, time_unit: str = 'day') -> Dict[str, Any]:
        """
        Analyze process throughput over time

        Args:
            time_unit: Time unit for grouping ('hour', 'day', 'week', 'month')

        Returns:
            Throughput statistics by time period
        """
        logger.info(f"Analyzing throughput by {time_unit}")

        # Group cases by completion time
        completions_by_period = defaultdict(int)
        starts_by_period = defaultdict(int)

        for case_events in self.cases.values():
            if not case_events:
                continue

            # Parse start and end timestamps
            start_time = self._parse_timestamp(case_events[0]['timestamp'])
            end_time = self._parse_timestamp(case_events[-1]['timestamp'])

            # Group by time unit
            if time_unit == 'hour':
                start_period = start_time.strftime('%Y-%m-%d %H:00')
                end_period = end_time.strftime('%Y-%m-%d %H:00')
            elif time_unit == 'day':
                start_period = start_time.strftime('%Y-%m-%d')
                end_period = end_time.strftime('%Y-%m-%d')
            elif time_unit == 'week':
                start_period = start_time.strftime('%Y-W%U')
                end_period = end_time.strftime('%Y-W%U')
            else:  # month
                start_period = start_time.strftime('%Y-%m')
                end_period = end_time.strftime('%Y-%m')

            starts_by_period[start_period] += 1
            completions_by_period[end_period] += 1

        # Convert to sorted lists
        throughput_data = []
        all_periods = sorted(set(list(starts_by_period.keys()) + list(completions_by_period.keys())))

        for period in all_periods:
            throughput_data.append({
                'period': period,
                'cases_started': starts_by_period.get(period, 0),
                'cases_completed': completions_by_period.get(period, 0)
            })

        # Calculate average throughput
        if throughput_data:
            avg_started = sum(d['cases_started'] for d in throughput_data) / len(throughput_data)
            avg_completed = sum(d['cases_completed'] for d in throughput_data) / len(throughput_data)
        else:
            avg_started = avg_completed = 0

        return {
            'time_unit': time_unit,
            'throughput_data': throughput_data,
            'avg_cases_started_per_period': round(avg_started, 2),
            'avg_cases_completed_per_period': round(avg_completed, 2),
            'total_periods': len(throughput_data)
        }

    def analyze_resource_utilization(self) -> List[Dict[str, Any]]:
        """
        Analyze resource (person/system) utilization

        Returns:
            Resource utilization statistics
        """
        logger.info("Analyzing resource utilization")

        resource_stats = defaultdict(lambda: {
            'activities': defaultdict(int),
            'cases': set(),
            'total_events': 0
        })

        for event in self.events:
            resource = event['resource']
            activity = event['activity']

            resource_stats[resource]['activities'][activity] += 1
            resource_stats[resource]['cases'].add(event['case_id'])
            resource_stats[resource]['total_events'] += 1

        # Build result
        results = []
        for resource, stats in resource_stats.items():
            # Get top activities for this resource
            top_activities = sorted(
                stats['activities'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]

            results.append({
                'resource': resource,
                'total_events': stats['total_events'],
                'unique_cases': len(stats['cases']),
                'unique_activities': len(stats['activities']),
                'top_activities': [
                    {'activity': act, 'count': count}
                    for act, count in top_activities
                ],
                'utilization_percentage': round(
                    (stats['total_events'] / len(self.events)) * 100, 2
                )
            })

        # Sort by total events (most utilized first)
        results.sort(key=lambda x: x['total_events'], reverse=True)

        return results

    def identify_rework(self) -> List[Dict[str, Any]]:
        """
        Identify cases with rework (repeated activities)

        Returns:
            List of cases with rework patterns
        """
        logger.info("Identifying rework patterns")

        rework_cases = []

        for case_id, case_events in self.cases.items():
            activities = [event['activity'] for event in case_events]

            # Check for repeated activities
            activity_counts = {}
            repeated_activities = []

            for activity in activities:
                activity_counts[activity] = activity_counts.get(activity, 0) + 1
                if activity_counts[activity] > 1:
                    if activity not in repeated_activities:
                        repeated_activities.append(activity)

            if repeated_activities:
                rework_cases.append({
                    'case_id': case_id,
                    'total_activities': len(activities),
                    'unique_activities': len(set(activities)),
                    'repeated_activities': [
                        {
                            'activity': act,
                            'occurrence_count': activity_counts[act]
                        }
                        for act in repeated_activities
                    ],
                    'rework_count': sum(activity_counts[act] - 1 for act in repeated_activities)
                })

        # Sort by rework count (most rework first)
        rework_cases.sort(key=lambda x: x['rework_count'], reverse=True)

        rework_rate = (len(rework_cases) / len(self.cases)) * 100 if self.cases else 0

        return {
            'rework_cases': rework_cases[:50],  # Top 50 cases with most rework
            'total_cases_with_rework': len(rework_cases),
            'total_cases': len(self.cases),
            'rework_rate_percentage': round(rework_rate, 2)
        }

    def get_performance_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive performance summary

        Returns:
            Overall performance metrics
        """
        logger.info("Generating performance summary")

        cycle_time_analysis = self.analyze_cycle_times()
        throughput_analysis = self.analyze_throughput(time_unit='day')
        rework_analysis = self.identify_rework()

        return {
            'cycle_time': cycle_time_analysis['statistics'],
            'throughput': {
                'avg_daily_completions': throughput_analysis['avg_cases_completed_per_period']
            },
            'rework': {
                'cases_with_rework': rework_analysis['total_cases_with_rework'],
                'rework_rate_percentage': rework_analysis['rework_rate_percentage']
            },
            'volume': {
                'total_cases': len(self.cases),
                'total_events': len(self.events)
            }
        }
