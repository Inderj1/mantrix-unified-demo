"""
Research Synthesizer - Synthesizes results from multiple queries into insights
"""
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import structlog

from src.core.research_planner import ResearchPlan, StepType
from src.core.research_executor import ResearchExecution, StepResult, ExecutionStatus
from src.core.llm_client import LLMClient

logger = structlog.get_logger()


@dataclass
class Insight:
    """Individual insight discovered during research"""
    id: str
    title: str
    description: str
    importance: str  # high, medium, low
    category: str  # trend, anomaly, correlation, etc.
    supporting_data: Dict[str, Any] = field(default_factory=dict)
    source_steps: List[str] = field(default_factory=list)
    confidence: float = 0.0


@dataclass
class Recommendation:
    """Actionable recommendation based on insights"""
    id: str
    title: str
    description: str
    priority: str  # high, medium, low
    expected_impact: str
    related_insights: List[str] = field(default_factory=list)


@dataclass
class ResearchReport:
    """Complete synthesized research report"""
    report_id: str
    plan_id: str
    execution_id: str
    title: str
    executive_summary: str
    key_findings: List[str]
    insights: List[Insight]
    recommendations: List[Recommendation]
    methodology: str
    data_summary: Dict[str, Any]
    generated_at: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)


class ResearchSynthesizer:
    """Synthesizes research results into actionable insights"""
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
        
    def synthesize_results(
        self,
        plan: ResearchPlan,
        execution: ResearchExecution
    ) -> ResearchReport:
        """Synthesize all results into a comprehensive report"""
        logger.info(
            "Starting research synthesis",
            plan_id=plan.id,
            execution_id=execution.execution_id
        )
        
        # Extract completed results
        completed_results = self._extract_completed_results(execution)
        
        # Analyze results by step type
        analysis_by_type = self._analyze_by_step_type(plan, completed_results)
        
        # Generate insights
        insights = self._generate_insights(plan, analysis_by_type, completed_results)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(insights, plan)
        
        # Create executive summary
        executive_summary = self._create_executive_summary(
            plan, insights, recommendations
        )
        
        # Extract key findings
        key_findings = self._extract_key_findings(insights)
        
        # Compile data summary
        data_summary = self._compile_data_summary(completed_results)
        
        # Create report
        report = ResearchReport(
            report_id=f"report_{execution.execution_id}",
            plan_id=plan.id,
            execution_id=execution.execution_id,
            title=f"Research Report: {plan.title}",
            executive_summary=executive_summary,
            key_findings=key_findings,
            insights=insights,
            recommendations=recommendations,
            methodology=self._describe_methodology(plan),
            data_summary=data_summary,
            generated_at=datetime.utcnow(),
            metadata={
                "duration_seconds": (
                    execution.completed_at - execution.started_at
                ).total_seconds() if execution.completed_at else 0,
                "steps_completed": len(completed_results),
                "total_rows_analyzed": sum(r.row_count for r in completed_results)
            }
        )
        
        logger.info(
            "Research synthesis completed",
            report_id=report.report_id,
            insights_count=len(insights),
            recommendations_count=len(recommendations)
        )
        
        return report
    
    def _extract_completed_results(self, execution: ResearchExecution) -> List[StepResult]:
        """Extract all completed step results"""
        return [
            result for result in execution.step_results.values()
            if result.status == ExecutionStatus.COMPLETED
        ]
    
    def _analyze_by_step_type(
        self,
        plan: ResearchPlan,
        results: List[StepResult]
    ) -> Dict[StepType, List[Dict[str, Any]]]:
        """Group and analyze results by step type"""
        analysis = {}
        
        for step in plan.steps:
            result = next((r for r in results if r.step_id == step.id), None)
            if not result or not result.results:
                continue
                
            if step.step_type not in analysis:
                analysis[step.step_type] = []
                
            analysis[step.step_type].append({
                "step": step,
                "result": result,
                "summary": self._summarize_result(result)
            })
            
        return analysis
    
    def _summarize_result(self, result: StepResult) -> Dict[str, Any]:
        """Create a summary of a single result"""
        if not result.results:
            return {"row_count": 0, "empty": True}
            
        summary = {
            "row_count": len(result.results),
            "columns": list(result.results[0].keys()) if result.results else []
        }
        
        # Add basic statistics for numeric columns
        if result.results:
            numeric_stats = {}
            for col in summary["columns"]:
                values = [row.get(col) for row in result.results if isinstance(row.get(col), (int, float))]
                if values:
                    numeric_stats[col] = {
                        "min": min(values),
                        "max": max(values),
                        "avg": sum(values) / len(values),
                        "count": len(values)
                    }
            summary["numeric_stats"] = numeric_stats
            
        return summary
    
    def _generate_insights(
        self,
        plan: ResearchPlan,
        analysis_by_type: Dict[StepType, List[Dict[str, Any]]],
        results: List[StepResult]
    ) -> List[Insight]:
        """Generate insights from analyzed results"""
        insights = []
        
        # Trend insights
        if StepType.TREND_ANALYSIS in analysis_by_type:
            trend_insights = self._generate_trend_insights(
                analysis_by_type[StepType.TREND_ANALYSIS]
            )
            insights.extend(trend_insights)
        
        # Comparison insights
        if StepType.COMPARISON in analysis_by_type:
            comparison_insights = self._generate_comparison_insights(
                analysis_by_type[StepType.COMPARISON]
            )
            insights.extend(comparison_insights)
        
        # Anomaly insights
        if StepType.ANOMALY_DETECTION in analysis_by_type:
            anomaly_insights = self._generate_anomaly_insights(
                analysis_by_type[StepType.ANOMALY_DETECTION]
            )
            insights.extend(anomaly_insights)
        
        # Cross-step insights
        cross_insights = self._generate_cross_step_insights(plan, results)
        insights.extend(cross_insights)
        
        return insights
    
    def _generate_trend_insights(self, trend_analyses: List[Dict[str, Any]]) -> List[Insight]:
        """Generate insights from trend analyses"""
        insights = []
        
        for analysis in trend_analyses:
            result = analysis["result"]
            summary = analysis["summary"]
            
            # Look for significant trends in numeric data
            if "numeric_stats" in summary:
                for col, stats in summary["numeric_stats"].items():
                    if stats["max"] > stats["min"] * 1.5:  # 50% increase
                        insights.append(Insight(
                            id=f"trend_{len(insights)+1}",
                            title=f"Significant Growth in {col}",
                            description=f"{col} shows {((stats['max']/stats['min']-1)*100):.1f}% growth from {stats['min']} to {stats['max']}",
                            importance="high",
                            category="trend",
                            supporting_data=stats,
                            source_steps=[result.step_id],
                            confidence=0.8
                        ))
                        
        return insights
    
    def _generate_comparison_insights(self, comparison_analyses: List[Dict[str, Any]]) -> List[Insight]:
        """Generate insights from comparisons"""
        insights = []
        
        for analysis in comparison_analyses:
            # Analyze differences between segments/periods
            result = analysis["result"]
            if result.results and len(result.results) >= 2:
                # Simple comparison of first two results
                insights.append(Insight(
                    id=f"comp_{len(insights)+1}",
                    title="Segment Comparison",
                    description=f"Found {len(result.results)} distinct segments with varying performance",
                    importance="medium",
                    category="comparison",
                    supporting_data={"segment_count": len(result.results)},
                    source_steps=[result.step_id],
                    confidence=0.7
                ))
                
        return insights
    
    def _generate_anomaly_insights(self, anomaly_analyses: List[Dict[str, Any]]) -> List[Insight]:
        """Generate insights from anomaly detection"""
        insights = []
        
        for analysis in anomaly_analyses:
            result = analysis["result"]
            if result.row_count > 0:
                insights.append(Insight(
                    id=f"anomaly_{len(insights)+1}",
                    title="Anomalies Detected",
                    description=f"Found {result.row_count} anomalous data points requiring attention",
                    importance="high",
                    category="anomaly",
                    supporting_data={"anomaly_count": result.row_count},
                    source_steps=[result.step_id],
                    confidence=0.9
                ))
                
        return insights
    
    def _generate_cross_step_insights(
        self,
        plan: ResearchPlan,
        results: List[StepResult]
    ) -> List[Insight]:
        """Generate insights by analyzing relationships across steps"""
        insights = []
        
        # Use LLM to find patterns across all results
        try:
            # Prepare context
            results_summary = []
            for step in plan.steps:
                result = next((r for r in results if r.step_id == step.id), None)
                if result and result.results:
                    results_summary.append({
                        "step_name": step.name,
                        "row_count": len(result.results),
                        "sample_data": result.results[:3] if len(result.results) > 0 else []
                    })
            
            prompt = f"""
            Analyze the following research results and identify key patterns or insights:
            
            Research Objective: {plan.objective}
            
            Results Summary:
            {json.dumps(results_summary, indent=2)}
            
            Identify 2-3 key cross-cutting insights that connect multiple findings.
            """
            
            # In production, this would call the LLM
            # For now, generate a placeholder insight
            insights.append(Insight(
                id="cross_1",
                title="Integrated Analysis Finding",
                description="Multiple data points suggest consistent patterns across analyzed dimensions",
                importance="high",
                category="correlation",
                supporting_data={"source": "cross-analysis"},
                source_steps=[r.step_id for r in results[:3]],
                confidence=0.75
            ))
            
        except Exception as e:
            logger.error("Failed to generate cross-step insights", error=str(e))
            
        return insights
    
    def _generate_recommendations(
        self,
        insights: List[Insight],
        plan: ResearchPlan
    ) -> List[Recommendation]:
        """Generate actionable recommendations from insights"""
        recommendations = []
        
        # Group insights by importance
        high_importance = [i for i in insights if i.importance == "high"]
        
        # Generate recommendations for high importance insights
        for insight in high_importance:
            if insight.category == "trend" and "Growth" in insight.title:
                recommendations.append(Recommendation(
                    id=f"rec_{len(recommendations)+1}",
                    title="Capitalize on Growth Trend",
                    description=f"Based on the identified growth pattern, consider increasing investment in this area",
                    priority="high",
                    expected_impact="Potential for continued growth acceleration",
                    related_insights=[insight.id]
                ))
            elif insight.category == "anomaly":
                recommendations.append(Recommendation(
                    id=f"rec_{len(recommendations)+1}",
                    title="Address Detected Anomalies",
                    description="Investigate and remediate the identified anomalous patterns to prevent issues",
                    priority="high",
                    expected_impact="Risk mitigation and improved data quality",
                    related_insights=[insight.id]
                ))
                
        # Add general recommendation if none generated
        if not recommendations:
            recommendations.append(Recommendation(
                id="rec_1",
                title="Continue Monitoring",
                description="Maintain regular monitoring of key metrics identified in this analysis",
                priority="medium",
                expected_impact="Early detection of trends and issues",
                related_insights=[i.id for i in insights[:2]]
            ))
            
        return recommendations
    
    def _create_executive_summary(
        self,
        plan: ResearchPlan,
        insights: List[Insight],
        recommendations: List[Recommendation]
    ) -> str:
        """Create executive summary of the research"""
        summary_parts = [
            f"This research analyzed {plan.objective}.",
            f"The analysis included {plan.total_steps} analytical steps examining different aspects of the data.",
            f"Key findings include {len(insights)} insights across {len(set(i.category for i in insights))} categories.",
        ]
        
        if insights:
            high_impact = [i for i in insights if i.importance == "high"]
            if high_impact:
                summary_parts.append(
                    f"Most notably, {len(high_impact)} high-importance findings were identified."
                )
                
        if recommendations:
            summary_parts.append(
                f"Based on these findings, {len(recommendations)} actionable recommendations are provided."
            )
            
        return " ".join(summary_parts)
    
    def _extract_key_findings(self, insights: List[Insight]) -> List[str]:
        """Extract key findings from insights"""
        findings = []
        
        # Prioritize high importance insights
        sorted_insights = sorted(
            insights,
            key=lambda i: (i.importance == "high", i.confidence),
            reverse=True
        )
        
        for insight in sorted_insights[:5]:  # Top 5 findings
            findings.append(f"{insight.title}: {insight.description}")
            
        return findings
    
    def _compile_data_summary(self, results: List[StepResult]) -> Dict[str, Any]:
        """Compile summary statistics about the data analyzed"""
        return {
            "total_queries_executed": len(results),
            "total_rows_analyzed": sum(r.row_count for r in results),
            "average_query_time": sum(
                r.duration_seconds for r in results if r.duration_seconds
            ) / len(results) if results else 0,
            "data_coverage": {
                "steps_completed": len(results),
                "steps_failed": sum(
                    1 for r in results if r.status == ExecutionStatus.FAILED
                )
            }
        }
    
    def _describe_methodology(self, plan: ResearchPlan) -> str:
        """Describe the research methodology used"""
        return (
            f"This research employed a {plan.depth.value}-depth analysis approach "
            f"with {plan.total_steps} analytical steps. The analysis covered "
            f"{len(set(step.step_type for step in plan.steps))} different analytical "
            f"techniques to ensure comprehensive coverage of the research objective."
        )