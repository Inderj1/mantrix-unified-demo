"""
Research Planner - Creates structured research plans from user queries
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import uuid
import structlog
from enum import Enum

logger = structlog.get_logger()


class ResearchDepth(Enum):
    QUICK = "quick"      # 3-5 queries, basic analysis
    STANDARD = "standard"  # 5-10 queries, comprehensive analysis  
    DEEP = "deep"        # 10+ queries, exhaustive analysis


class StepType(Enum):
    METRIC_CALCULATION = "metric_calculation"
    TREND_ANALYSIS = "trend_analysis"
    COMPARISON = "comparison"
    SEGMENTATION = "segmentation"
    ANOMALY_DETECTION = "anomaly_detection"
    ROOT_CAUSE = "root_cause"
    CORRELATION = "correlation"
    PREDICTION = "prediction"


@dataclass
class ResearchStep:
    """Individual step in a research plan"""
    id: str
    name: str
    description: str
    query_template: str
    step_type: StepType
    dependencies: List[str] = field(default_factory=list)
    expected_output: str = ""
    estimated_duration_seconds: int = 5
    priority: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ResearchPlan:
    """Complete research plan with all steps"""
    id: str
    title: str
    objective: str
    original_query: str
    steps: List[ResearchStep]
    depth: ResearchDepth
    estimated_duration_seconds: int
    created_at: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def total_steps(self) -> int:
        return len(self.steps)
    
    @property
    def complexity_score(self) -> float:
        """Calculate complexity based on steps and dependencies"""
        dependency_count = sum(len(step.dependencies) for step in self.steps)
        return (self.total_steps + dependency_count * 0.5) / 10


class ResearchPlanner:
    """Creates structured research plans from natural language queries"""
    
    def __init__(self, llm_client=None):
        self.llm_client = llm_client
        self.plan_templates = self._initialize_templates()
        
    def _initialize_templates(self) -> Dict[str, List[ResearchStep]]:
        """Initialize research plan templates for common scenarios"""
        return {
            "customer_analysis": [
                ResearchStep(
                    id="ca_1",
                    name="Customer Overview",
                    description="Get total customer count and basic metrics",
                    query_template="SELECT COUNT(DISTINCT KUNNR) as total_customers, COUNT(DISTINCT KDGRP) as customer_groups FROM `{dataset}.KNA1` WHERE MANDT = '100'",
                    step_type=StepType.METRIC_CALCULATION,
                    estimated_duration_seconds=3
                ),
                ResearchStep(
                    id="ca_2", 
                    name="Customer Segmentation",
                    description="Analyze customers by segment",
                    query_template="SELECT KDGRP as customer_group, COUNT(DISTINCT KUNNR) as customer_count FROM `{dataset}.KNA1` WHERE MANDT = '100' AND KDGRP IS NOT NULL GROUP BY KDGRP ORDER BY customer_count DESC LIMIT 10",
                    step_type=StepType.SEGMENTATION,
                    dependencies=["ca_1"],
                    estimated_duration_seconds=5
                ),
                ResearchStep(
                    id="ca_3",
                    name="Recent Customer Activity", 
                    description="Analyze recent customer transactions",
                    query_template="SELECT COUNT(DISTINCT KUNNR) as active_customers, SUM(VV001) as total_revenue FROM `{dataset}.CE11000` WHERE MANDT = '100' AND GJAHR = 2023 AND PERIO >= '010'",
                    step_type=StepType.TREND_ANALYSIS,
                    dependencies=["ca_1"],
                    estimated_duration_seconds=8
                ),
            ],
            "financial_health": [
                ResearchStep(
                    id="fh_1",
                    name="Revenue Overview",
                    description="Calculate total revenue and growth",
                    query_template="SELECT SUM(revenue) as total_revenue, DATE_TRUNC('month', date) as month FROM transactions GROUP BY month",
                    step_type=StepType.METRIC_CALCULATION,
                    estimated_duration_seconds=5
                ),
                ResearchStep(
                    id="fh_2",
                    name="Cost Analysis",
                    description="Analyze cost structure and trends",
                    query_template="SELECT cost_category, SUM(amount) as total_cost FROM expenses GROUP BY cost_category",
                    step_type=StepType.SEGMENTATION,
                    estimated_duration_seconds=5
                ),
                ResearchStep(
                    id="fh_3",
                    name="Margin Calculation",
                    description="Calculate gross and net margins",
                    query_template="SELECT (revenue - costs) / revenue as margin FROM ...",
                    step_type=StepType.METRIC_CALCULATION,
                    dependencies=["fh_1", "fh_2"],
                    estimated_duration_seconds=3
                ),
            ],
            "performance_analysis": [
                ResearchStep(
                    id="pa_1",
                    name="KPI Dashboard",
                    description="Calculate key performance indicators",
                    query_template="SELECT metric_name, metric_value FROM kpi_metrics",
                    step_type=StepType.METRIC_CALCULATION,
                    estimated_duration_seconds=5
                ),
                ResearchStep(
                    id="pa_2",
                    name="Trend Analysis",
                    description="Analyze KPI trends over time",
                    query_template="SELECT metric_name, date, value FROM kpi_history ORDER BY date",
                    step_type=StepType.TREND_ANALYSIS,
                    dependencies=["pa_1"],
                    estimated_duration_seconds=7
                ),
                ResearchStep(
                    id="pa_3",
                    name="Anomaly Detection",
                    description="Identify unusual patterns or outliers",
                    query_template="WITH stats AS (...) SELECT * FROM data WHERE value > avg + 2*stddev",
                    step_type=StepType.ANOMALY_DETECTION,
                    dependencies=["pa_2"],
                    estimated_duration_seconds=10
                ),
            ]
        }
    
    def create_research_plan(
        self, 
        query: str, 
        depth: ResearchDepth = ResearchDepth.STANDARD,
        focus_areas: Optional[List[str]] = None
    ) -> ResearchPlan:
        """Create a research plan from a natural language query"""
        logger.info("Creating research plan", query=query, depth=depth.value)
        
        # Analyze query to determine research type
        research_type = self._identify_research_type(query)
        
        # Always generate custom steps to use chat interface logic
        # This ensures compatibility with any dataset schema
        steps = self._generate_custom_steps(query, depth, focus_areas)
        
        # Calculate total duration
        total_duration = sum(step.estimated_duration_seconds for step in steps)
        
        # Create plan
        plan = ResearchPlan(
            id=f"rp_{uuid.uuid4().hex[:8]}",
            title=self._generate_title(query),
            objective=self._extract_objective(query),
            original_query=query,
            steps=steps,
            depth=depth,
            estimated_duration_seconds=total_duration,
            created_at=datetime.utcnow(),
            metadata={
                "research_type": research_type,
                "focus_areas": focus_areas or []
            }
        )
        
        logger.info(
            "Research plan created",
            plan_id=plan.id,
            total_steps=plan.total_steps,
            duration=total_duration
        )
        
        return plan
    
    def _identify_research_type(self, query: str) -> str:
        """Identify the type of research based on query keywords"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["customer", "retention", "churn", "segment"]):
            return "customer_analysis"
        elif any(word in query_lower for word in ["revenue", "cost", "margin", "financial", "profit"]):
            return "financial_health"
        elif any(word in query_lower for word in ["performance", "kpi", "metric", "trend"]):
            return "performance_analysis"
        else:
            return "general_analysis"
    
    def _customize_steps(
        self, 
        base_steps: List[ResearchStep],
        query: str,
        depth: ResearchDepth,
        focus_areas: Optional[List[str]]
    ) -> List[ResearchStep]:
        """Customize template steps based on query and parameters"""
        steps = []
        
        # Copy base steps with new IDs
        for i, step in enumerate(base_steps):
            new_step = ResearchStep(
                id=f"step_{i+1}",
                name=step.name,
                description=step.description,
                query_template=step.query_template,
                step_type=step.step_type,
                dependencies=[f"step_{base_steps.index(s)+1}" for s in base_steps if s.id in step.dependencies],
                expected_output=step.expected_output,
                estimated_duration_seconds=step.estimated_duration_seconds,
                priority=step.priority,
                metadata=step.metadata
            )
            steps.append(new_step)
        
        # Adjust based on depth
        if depth == ResearchDepth.QUICK:
            # Keep only high priority steps
            steps = [s for s in steps[:3]]  # Simplified for quick analysis
        elif depth == ResearchDepth.DEEP:
            # Add additional deep analysis steps
            steps.extend(self._generate_deep_analysis_steps(len(steps)))
        
        return steps
    
    def _generate_custom_steps(
        self,
        query: str,
        depth: ResearchDepth,
        focus_areas: Optional[List[str]]
    ) -> List[ResearchStep]:
        """Generate custom steps for queries without templates"""
        steps = []
        
        # Always start with overview
        steps.append(ResearchStep(
            id="step_1",
            name="Initial Analysis",
            description=f"Overview analysis for: {query}",
            query_template="",  # Will be generated by LLM
            step_type=StepType.METRIC_CALCULATION,
            estimated_duration_seconds=5
        ))
        
        # Add trend analysis if time-related
        if any(word in query.lower() for word in ["trend", "over time", "historical", "growth"]):
            steps.append(ResearchStep(
                id="step_2",
                name="Trend Analysis",
                description="Analyze trends over time",
                query_template="",
                step_type=StepType.TREND_ANALYSIS,
                dependencies=["step_1"],
                estimated_duration_seconds=7
            ))
        
        # Add comparison if comparative words found
        if any(word in query.lower() for word in ["compare", "versus", "vs", "difference"]):
            steps.append(ResearchStep(
                id=f"step_{len(steps)+1}",
                name="Comparative Analysis",
                description="Compare different segments or periods",
                query_template="",
                step_type=StepType.COMPARISON,
                dependencies=["step_1"],
                estimated_duration_seconds=6
            ))
        
        return steps
    
    def _generate_deep_analysis_steps(self, current_step_count: int) -> List[ResearchStep]:
        """Generate additional steps for deep analysis"""
        deep_steps = []
        
        # Add correlation analysis
        deep_steps.append(ResearchStep(
            id=f"step_{current_step_count + 1}",
            name="Correlation Analysis",
            description="Find correlations between different metrics",
            query_template="",
            step_type=StepType.CORRELATION,
            dependencies=[f"step_{i+1}" for i in range(min(2, current_step_count))],
            estimated_duration_seconds=10
        ))
        
        # Add predictive analysis
        deep_steps.append(ResearchStep(
            id=f"step_{current_step_count + 2}",
            name="Predictive Insights",
            description="Generate predictions based on historical patterns",
            query_template="",
            step_type=StepType.PREDICTION,
            dependencies=[f"step_{current_step_count + 1}"],
            estimated_duration_seconds=12
        ))
        
        return deep_steps
    
    def _generate_title(self, query: str) -> str:
        """Generate a concise title for the research plan"""
        # Simple implementation - in production, use LLM
        words = query.split()[:6]
        return " ".join(words).title() + " Analysis"
    
    def _extract_objective(self, query: str) -> str:
        """Extract the main objective from the query"""
        # Simple implementation - in production, use LLM
        return f"Comprehensive analysis to address: {query}"
    
    def optimize_plan(self, plan: ResearchPlan) -> ResearchPlan:
        """Optimize plan execution order based on dependencies"""
        # TODO: Implement topological sort for optimal execution order
        return plan
    
    def estimate_cost(self, plan: ResearchPlan) -> Dict[str, Any]:
        """Estimate the cost of executing a research plan"""
        # Rough estimates based on query complexity
        estimated_queries = plan.total_steps
        estimated_tokens = estimated_queries * 500  # Average tokens per query
        estimated_cost_usd = estimated_tokens * 0.00001  # Rough estimate
        
        return {
            "estimated_queries": estimated_queries,
            "estimated_tokens": estimated_tokens,
            "estimated_cost_usd": estimated_cost_usd,
            "estimated_duration_seconds": plan.estimated_duration_seconds
        }