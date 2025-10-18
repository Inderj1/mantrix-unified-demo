"""Enhanced Research Planner with LLM-powered decomposition and GL intelligence."""

import json
import asyncio
from typing import List, Dict, Any, Optional, Set
from datetime import datetime
from enum import Enum
import structlog
from pydantic import BaseModel, Field

from src.core.research_planner import ResearchPlan, ResearchStep, StepType, ResearchDepth
from src.core.llm_client import LLMClient
from src.core.gl_accounting_advisor import GLAccountingAdvisor, GLQueryContext
from src.db.weaviate_client import WeaviateClient
from src.config import settings

logger = structlog.get_logger()


class QueryComplexity(Enum):
    """Query complexity levels."""
    SIMPLE = "simple"          # Single metric, single table
    MODERATE = "moderate"      # Multiple metrics or joins
    COMPLEX = "complex"        # Multi-step analysis with dependencies
    EXPERT = "expert"          # Advanced analysis requiring domain expertise


class AnalysisApproach(Enum):
    """Types of analysis approaches."""
    DIRECT = "direct"                    # Direct SQL query
    AGGREGATION = "aggregation"          # Aggregation analysis
    TREND = "trend"                      # Time-series analysis
    COMPARISON = "comparison"            # Comparative analysis
    CORRELATION = "correlation"          # Correlation analysis
    BREAKDOWN = "breakdown"              # Component breakdown
    FINANCIAL = "financial"              # Financial metrics with GL


class StepDependency(BaseModel):
    """Enhanced step dependency with context passing."""
    step_id: str
    required_outputs: List[str] = Field(default_factory=list)
    context_keys: List[str] = Field(default_factory=list)


class EnhancedResearchStep(ResearchStep):
    """Extended research step with additional metadata."""
    complexity: QueryComplexity = QueryComplexity.SIMPLE
    approach: AnalysisApproach = AnalysisApproach.DIRECT
    required_tables: List[str] = Field(default_factory=list)
    required_columns: List[str] = Field(default_factory=list)
    gl_context: Optional[GLQueryContext] = None
    schema_context: Dict[str, Any] = Field(default_factory=dict)
    expected_output_format: str = "tabular"
    clarification_questions: List[str] = Field(default_factory=list)


class SchemaAwareContext(BaseModel):
    """Context about available schema for query planning."""
    available_tables: List[str]
    table_columns: Dict[str, List[str]]
    table_relationships: List[Dict[str, str]]  # foreign key relationships
    common_metrics: Dict[str, str]  # metric name -> SQL expression
    gl_mapping_available: bool = False
    customer_id: Optional[str] = None


class EnhancedResearchPlanner:
    """Enhanced planner with LLM-powered decomposition and GL intelligence."""
    
    def __init__(
        self,
        llm_client: LLMClient,
        weaviate_client: Optional[WeaviateClient] = None,
        gl_advisor: Optional[GLAccountingAdvisor] = None,
        enable_gl_intelligence: bool = True
    ):
        self.llm_client = llm_client
        self.weaviate_client = weaviate_client
        self.gl_advisor = gl_advisor
        self.enable_gl_intelligence = enable_gl_intelligence
        self.schema_cache = {}
        
    async def create_enhanced_plan(
        self,
        query: str,
        depth: ResearchDepth = ResearchDepth.STANDARD,
        focus_areas: List[str] = None,
        customer_id: str = "arizona_beverages",
        interactive_mode: bool = False
    ) -> ResearchPlan:
        """Create an enhanced research plan with intelligent decomposition."""
        logger.info(f"Creating enhanced research plan for: {query[:100]}...")
        
        # Analyze query complexity
        complexity = await self._analyze_complexity(query)
        logger.info(f"Query complexity: {complexity.value}")
        
        # Get schema context
        schema_context = await self._get_schema_context(query, customer_id)
        
        # Check for GL/financial queries if enabled
        gl_context = None
        if self.enable_gl_intelligence and self.gl_advisor:
            gl_context = self._analyze_gl_requirements(query, customer_id)
            if gl_context and gl_context.clarification_needed and interactive_mode:
                # In interactive mode, we could ask for clarification
                logger.info("GL clarification needed", questions=gl_context.clarification_questions)
        
        # Decompose query into steps
        steps = await self._decompose_query(
            query, complexity, schema_context, gl_context, depth, focus_areas
        )
        
        # Build research plan
        plan = ResearchPlan(
            id=f"plan_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title=f"Research plan for: {query[:50]}...",
            objective=query,
            original_query=query,
            steps=steps,
            depth=depth,
            estimated_duration_seconds=sum(step.estimated_duration_seconds for step in steps),
            created_at=datetime.now(),
            metadata={
                "complexity": complexity.value,
                "customer_id": customer_id,
                "gl_enabled": gl_context is not None,
                "interactive_mode": interactive_mode,
                "created_by": "enhanced_planner",
                "focus_areas": focus_areas or []
            }
        )
        
        logger.info(f"Created enhanced plan with {len(steps)} steps")
        return plan
    
    async def _analyze_complexity(self, query: str) -> QueryComplexity:
        """Analyze query complexity using LLM."""
        prompt = f"""
        Analyze the complexity of this data analysis query and classify it:
        
        Query: {query}
        
        Classification levels:
        - SIMPLE: Single metric, single table, basic filters
        - MODERATE: Multiple metrics, joins, or time-based analysis
        - COMPLEX: Multi-step analysis with dependencies, complex aggregations
        - EXPERT: Advanced statistical analysis, multiple data sources, domain expertise required
        
        Consider:
        1. Number of metrics/calculations needed
        2. Data sources required
        3. Temporal aspects (trends, comparisons)
        4. Analytical depth required
        
        Respond with just the classification level.
        """
        
        try:
            # For now, use a simple heuristic since LLMClient doesn't have generic generate
            query_lower = query.lower()
            
            # Count indicators of complexity
            complexity_indicators = {
                "complex": ["break down", "analyze", "trend", "correlation", "multiple", "compare"],
                "expert": ["predict", "forecast", "anomaly", "root cause", "statistical", "machine learning"],
                "simple": ["show", "list", "count", "sum", "total"]
            }
            
            complex_count = sum(1 for indicator in complexity_indicators["complex"] if indicator in query_lower)
            expert_count = sum(1 for indicator in complexity_indicators["expert"] if indicator in query_lower)
            simple_count = sum(1 for indicator in complexity_indicators["simple"] if indicator in query_lower)
            
            if expert_count > 0:
                return QueryComplexity.EXPERT
            elif complex_count >= 2 or ("and" in query_lower and complex_count >= 1):
                return QueryComplexity.COMPLEX
            elif simple_count > 0 and complex_count == 0:
                return QueryComplexity.SIMPLE
            else:
                return QueryComplexity.MODERATE
            
        except Exception as e:
            logger.error(f"Failed to analyze complexity: {e}")
            return QueryComplexity.MODERATE
    
    async def _get_schema_context(self, query: str, customer_id: str) -> SchemaAwareContext:
        """Get schema context for query planning."""
        context = SchemaAwareContext(
            available_tables=[],
            table_columns={},
            table_relationships=[],
            common_metrics={},
            customer_id=customer_id
        )
        
        if self.weaviate_client:
            try:
                # Search for relevant tables
                table_results = await self.weaviate_client.search_tables(
                    query, 
                    limit=10,
                    threshold=0.5
                )
                
                context.available_tables = [t["table_name"] for t in table_results]
                
                # Get column info for top tables
                for table in context.available_tables[:5]:
                    columns = await self._get_table_columns(table)
                    if columns:
                        context.table_columns[table] = columns
                
                # Check for common metric patterns
                context.common_metrics = self._extract_common_metrics(context.table_columns)
                
            except Exception as e:
                logger.error(f"Failed to get schema context: {e}")
        
        # Check GL mapping availability
        if self.gl_advisor:
            mapping = self.gl_advisor.gl_loader.get_mapping(customer_id)
            context.gl_mapping_available = mapping is not None
        
        return context
    
    def _analyze_gl_requirements(self, query: str, customer_id: str) -> Optional[GLQueryContext]:
        """Analyze GL requirements for financial queries."""
        if not self.gl_advisor:
            return None
        
        try:
            gl_context = self.gl_advisor.analyze_query(query, customer_id)
            return gl_context if gl_context.identified_concepts or gl_context.gl_accounts else None
        except Exception as e:
            logger.error(f"Failed to analyze GL requirements: {e}")
            return None
    
    async def _decompose_query(
        self,
        query: str,
        complexity: QueryComplexity,
        schema_context: SchemaAwareContext,
        gl_context: Optional[GLQueryContext],
        depth: ResearchDepth,
        focus_areas: Optional[List[str]]
    ) -> List[ResearchStep]:
        """Decompose query into research steps using LLM."""
        
        # Build context for LLM
        context_info = {
            "complexity": complexity.value,
            "available_tables": schema_context.available_tables[:10],
            "has_gl_mapping": schema_context.gl_mapping_available,
            "identified_financial_concepts": gl_context.identified_concepts if gl_context else [],
            "depth": depth.value,
            "focus_areas": focus_areas or []
        }
        
        prompt = f"""
        Decompose this data analysis query into specific research steps:
        
        Query: {query}
        
        Context:
        {json.dumps(context_info, indent=2)}
        
        Create a step-by-step research plan where each step:
        1. Has a clear objective
        2. Specifies the analysis approach (direct query, aggregation, trend analysis, etc.)
        3. Identifies data requirements (tables, columns)
        4. Notes dependencies on previous steps
        5. Estimates complexity and duration
        
        For financial queries, ensure proper GL account handling and metric calculations.
        
        Output as JSON array of steps with this structure:
        [
            {{
                "name": "Step name",
                "description": "What this step accomplishes",
                "approach": "direct|aggregation|trend|comparison|correlation|breakdown|financial",
                "query_template": "Natural language description of what to query",
                "required_tables": ["table1", "table2"],
                "dependencies": ["step_id_1", "step_id_2"],
                "complexity": "simple|moderate|complex",
                "estimated_minutes": 1-10
            }}
        ]
        
        Create {self._get_step_count(complexity, depth)} steps maximum.
        """
        
        try:
            # For now, create steps based on heuristics since LLMClient doesn't have generic generate
            steps = []
            
            # If GL context exists, create financial analysis steps
            if gl_context and gl_context.identified_concepts:
                for i, concept in enumerate(gl_context.identified_concepts):
                    step_data = {
                        "name": f"Calculate {concept.replace('_', ' ').title()}",
                        "description": f"Calculate {concept} using GL accounts",
                        "approach": "financial",
                        "query_template": f"Calculate {concept} for the specified time period",
                        "required_tables": schema_context.available_tables[:2] if schema_context.available_tables else [],
                        "dependencies": [] if i == 0 else [f"step_{i}"],
                        "complexity": "moderate",
                        "estimated_minutes": 2
                    }
                    step = self._create_enhanced_step(step_data, i + 1, schema_context, gl_context)
                    steps.append(step)
            
            # Add additional steps based on query intent
            if "trend" in query.lower():
                step_data = {
                    "name": "Analyze Trends",
                    "description": "Analyze time-based trends in the data",
                    "approach": "trend",
                    "query_template": query,
                    "required_tables": schema_context.available_tables[:1] if schema_context.available_tables else [],
                    "dependencies": [s.id for s in steps],
                    "complexity": "moderate",
                    "estimated_minutes": 3
                }
                step = self._create_enhanced_step(step_data, len(steps) + 1, schema_context, None)
                steps.append(step)
            
            if "breakdown" in query.lower() or "break down" in query.lower():
                step_data = {
                    "name": "Component Breakdown",
                    "description": "Break down components into detailed categories",
                    "approach": "breakdown",
                    "query_template": query,
                    "required_tables": schema_context.available_tables[:1] if schema_context.available_tables else [],
                    "dependencies": [s.id for s in steps if hasattr(s, 'approach') and s.approach == AnalysisApproach.FINANCIAL],
                    "complexity": "moderate",
                    "estimated_minutes": 2
                }
                step = self._create_enhanced_step(step_data, len(steps) + 1, schema_context, None)
                steps.append(step)
            
            # Ensure we have at least one step
            if not steps:
                steps = [self._create_fallback_step(query, schema_context, gl_context)]
            
            return steps
            
        except Exception as e:
            logger.error(f"Failed to decompose query: {e}")
            # Return fallback single step
            return [self._create_fallback_step(query, schema_context, gl_context)]
    
    def _get_step_count(self, complexity: QueryComplexity, depth: ResearchDepth) -> int:
        """Determine maximum number of steps based on complexity and depth."""
        base_counts = {
            QueryComplexity.SIMPLE: 1,
            QueryComplexity.MODERATE: 3,
            QueryComplexity.COMPLEX: 5,
            QueryComplexity.EXPERT: 8
        }
        
        depth_multipliers = {
            ResearchDepth.QUICK: 0.5,
            ResearchDepth.STANDARD: 1.0,
            ResearchDepth.DEEP: 1.5
        }
        
        return int(base_counts[complexity] * depth_multipliers[depth])
    
    def _parse_llm_steps(self, response: str) -> List[Dict[str, Any]]:
        """Parse LLM response to extract steps."""
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                steps_data = json.loads(json_match.group())
                return steps_data
        except Exception as e:
            logger.error(f"Failed to parse LLM steps: {e}")
        
        return []
    
    def _create_enhanced_step(
        self,
        step_data: Dict[str, Any],
        step_number: int,
        schema_context: SchemaAwareContext,
        gl_context: Optional[GLQueryContext]
    ) -> ResearchStep:
        """Create an EnhancedResearchStep from parsed data."""
        step_id = f"step_{step_number}"
        
        # Map approach string to enum
        approach_map = {
            "direct": AnalysisApproach.DIRECT,
            "aggregation": AnalysisApproach.AGGREGATION,
            "trend": AnalysisApproach.TREND,
            "comparison": AnalysisApproach.COMPARISON,
            "correlation": AnalysisApproach.CORRELATION,
            "breakdown": AnalysisApproach.BREAKDOWN,
            "financial": AnalysisApproach.FINANCIAL
        }
        approach = approach_map.get(step_data.get("approach", "direct"), AnalysisApproach.DIRECT)
        
        # Map complexity
        complexity_map = {
            "simple": QueryComplexity.SIMPLE,
            "moderate": QueryComplexity.MODERATE,
            "complex": QueryComplexity.COMPLEX
        }
        complexity = complexity_map.get(step_data.get("complexity", "moderate"), QueryComplexity.MODERATE)
        
        # Determine step type based on approach
        step_type_map = {
            AnalysisApproach.AGGREGATION: StepType.METRIC_CALCULATION,
            AnalysisApproach.TREND: StepType.TREND_ANALYSIS,
            AnalysisApproach.COMPARISON: StepType.COMPARISON,
            AnalysisApproach.BREAKDOWN: StepType.SEGMENTATION,
            AnalysisApproach.FINANCIAL: StepType.METRIC_CALCULATION,
            AnalysisApproach.CORRELATION: StepType.CORRELATION
        }
        step_type = step_type_map.get(approach, StepType.METRIC_CALCULATION)
        
        # Create a regular ResearchStep with metadata
        step = ResearchStep(
            id=step_id,
            name=step_data.get("name", f"Step {step_number}"),
            description=step_data.get("description", ""),
            query_template=step_data.get("query_template", ""),
            step_type=step_type,
            dependencies=step_data.get("dependencies", []),
            estimated_duration_seconds=step_data.get("estimated_minutes", 2) * 60,
            priority=step_number,
            metadata={
                "complexity": complexity.value,
                "approach": approach.value,
                "required_tables": step_data.get("required_tables", []),
                "gl_context": gl_context.model_dump() if gl_context else None,
                "schema_context": {
                    "tables": schema_context.available_tables[:5],  # Limit for size
                    "table_count": len(schema_context.available_tables)
                }
            }
        )
        return step
    
    def _create_fallback_step(
        self,
        query: str,
        schema_context: SchemaAwareContext,
        gl_context: Optional[GLQueryContext]
    ) -> ResearchStep:
        """Create a fallback step when decomposition fails."""
        return ResearchStep(
            id="step_1",
            name="Direct Analysis",
            description=f"Execute analysis for: {query}",
            query_template=query,
            step_type=StepType.METRIC_CALCULATION,
            dependencies=[],
            estimated_duration_seconds=120,
            priority=1,
            metadata={
                "complexity": QueryComplexity.MODERATE.value,
                "approach": AnalysisApproach.FINANCIAL.value if gl_context else AnalysisApproach.DIRECT.value,
                "required_tables": schema_context.available_tables[:3] if schema_context.available_tables else [],
                "gl_context": gl_context.dict() if gl_context else None
            }
        )
    
    async def _get_table_columns(self, table_name: str) -> List[str]:
        """Get column names for a table."""
        # This would typically query the actual database schema
        # For now, return empty list
        return []
    
    def _extract_common_metrics(self, table_columns: Dict[str, List[str]]) -> Dict[str, str]:
        """Extract common metric patterns from schema."""
        common_metrics = {}
        
        # Look for common metric columns
        for table, columns in table_columns.items():
            for col in columns:
                col_lower = col.lower()
                if "revenue" in col_lower:
                    common_metrics["revenue"] = f"SUM({col})"
                elif "cost" in col_lower:
                    common_metrics["cost"] = f"SUM({col})"
                elif "quantity" in col_lower:
                    common_metrics["quantity"] = f"SUM({col})"
                elif "amount" in col_lower and "amount" not in common_metrics:
                    common_metrics["amount"] = f"SUM({col})"
        
        return common_metrics
    
    async def optimize_plan(self, plan: ResearchPlan) -> ResearchPlan:
        """Optimize a research plan for better performance."""
        logger.info("Optimizing research plan")
        
        # Identify parallelizable steps
        parallel_groups = self._identify_parallel_groups(plan.steps)
        
        # Reorder steps for optimal execution
        optimized_steps = self._reorder_steps(plan.steps, parallel_groups)
        
        # Update plan
        plan.steps = optimized_steps
        plan.metadata["optimized"] = True
        plan.metadata["parallel_groups"] = len(parallel_groups)
        
        return plan
    
    def _identify_parallel_groups(self, steps: List[ResearchStep]) -> List[Set[str]]:
        """Identify groups of steps that can run in parallel."""
        groups = []
        processed = set()
        
        for step in steps:
            if step.id in processed:
                continue
            
            # Find all steps that can run in parallel with this one
            group = {step.id}
            for other in steps:
                if other.id != step.id and other.id not in processed:
                    # Check if they have conflicting dependencies
                    if not self._has_dependency_conflict(step, other, steps):
                        group.add(other.id)
            
            if len(group) > 1:
                groups.append(group)
                processed.update(group)
        
        return groups
    
    def _has_dependency_conflict(
        self, 
        step1: ResearchStep, 
        step2: ResearchStep,
        all_steps: List[ResearchStep]
    ) -> bool:
        """Check if two steps have dependency conflicts."""
        # Step 2 depends on step 1
        if step1.id in step2.dependencies:
            return True
        
        # Step 1 depends on step 2
        if step2.id in step1.dependencies:
            return True
        
        # Check transitive dependencies
        step1_deps = self._get_all_dependencies(step1.id, all_steps)
        step2_deps = self._get_all_dependencies(step2.id, all_steps)
        
        if step1.id in step2_deps or step2.id in step1_deps:
            return True
        
        return False
    
    def _get_all_dependencies(self, step_id: str, all_steps: List[ResearchStep]) -> Set[str]:
        """Get all transitive dependencies for a step."""
        step_map = {s.id: s for s in all_steps}
        dependencies = set()
        to_process = [step_id]
        
        while to_process:
            current = to_process.pop()
            if current in step_map:
                for dep in step_map[current].dependencies:
                    if dep not in dependencies:
                        dependencies.add(dep)
                        to_process.append(dep)
        
        return dependencies
    
    def _reorder_steps(
        self, 
        steps: List[ResearchStep], 
        parallel_groups: List[Set[str]]
    ) -> List[ResearchStep]:
        """Reorder steps for optimal execution."""
        # For now, return steps as-is
        # In a production system, this would implement topological sorting
        # with consideration for parallel execution
        return steps