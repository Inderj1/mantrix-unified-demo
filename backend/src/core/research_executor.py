"""
Research Executor - Executes research plans with progress tracking
"""
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
import uuid
from enum import Enum
import structlog

from src.core.research_planner import ResearchPlan, ResearchStep, StepType
from src.core.sql_generator import SQLGenerator
from src.db.database_client import DatabaseClient as BigQueryClient

logger = structlog.get_logger()


class ExecutionStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class StepResult:
    """Result from executing a single research step"""
    step_id: str
    status: ExecutionStatus
    query: str
    results: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def duration_seconds(self) -> Optional[float]:
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    @property
    def row_count(self) -> int:
        return len(self.results) if self.results else 0


@dataclass
class ResearchExecution:
    """Tracks execution of a research plan"""
    execution_id: str
    plan_id: str
    status: ExecutionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    step_results: Dict[str, StepResult] = field(default_factory=dict)
    progress_callbacks: List[Callable] = field(default_factory=list)
    
    @property
    def progress_percentage(self) -> float:
        total_steps = len(self.step_results)
        if total_steps == 0:
            return 0.0
        completed_steps = sum(
            1 for result in self.step_results.values() 
            if result.status == ExecutionStatus.COMPLETED
        )
        return (completed_steps / total_steps) * 100
    
    @property
    def is_complete(self) -> bool:
        return all(
            result.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]
            for result in self.step_results.values()
        )
    
    def get_completed_steps(self) -> List[StepResult]:
        return [
            result for result in self.step_results.values()
            if result.status == ExecutionStatus.COMPLETED
        ]


class ResearchExecutor:
    """Executes research plans with progress tracking and error handling"""
    
    def __init__(self, sql_generator: SQLGenerator, bq_client: BigQueryClient):
        self.sql_generator = sql_generator
        self.bq_client = bq_client
        self.active_executions: Dict[str, ResearchExecution] = {}
        self.enhanced_mode = False  # Flag to enable enhanced research features
        
    async def execute_plan(
        self,
        plan: ResearchPlan,
        progress_callback: Optional[Callable] = None,
        parallel: bool = True
    ) -> ResearchExecution:
        """Execute a research plan with progress tracking"""
        execution_id = f"exec_{uuid.uuid4().hex[:8]}"
        
        # Initialize execution tracking
        execution = ResearchExecution(
            execution_id=execution_id,
            plan_id=plan.id,
            status=ExecutionStatus.RUNNING,
            started_at=datetime.utcnow(),
            progress_callbacks=[progress_callback] if progress_callback else []
        )
        
        # Initialize step results
        for step in plan.steps:
            execution.step_results[step.id] = StepResult(
                step_id=step.id,
                status=ExecutionStatus.PENDING,
                query=""
            )
        
        self.active_executions[execution_id] = execution
        
        logger.info(
            "Starting research plan execution",
            execution_id=execution_id,
            plan_id=plan.id,
            total_steps=len(plan.steps)
        )
        
        try:
            if parallel:
                await self._execute_parallel(plan, execution)
            else:
                await self._execute_sequential(plan, execution)
                
            execution.status = ExecutionStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            
        except Exception as e:
            logger.error("Research execution failed", error=str(e))
            execution.status = ExecutionStatus.FAILED
            execution.completed_at = datetime.utcnow()
            raise
            
        finally:
            # Notify completion
            await self._notify_progress(execution)
            
            # Log execution for query logger
            await self._log_execution(plan, execution)
            
        return execution
    
    async def _execute_sequential(self, plan: ResearchPlan, execution: ResearchExecution):
        """Execute steps sequentially"""
        logger.info(f"Starting sequential execution of {len(plan.steps)} steps")
        
        for i, step in enumerate(plan.steps):
            logger.info(f"Processing step {i+1}/{len(plan.steps)}: {step.id} - {step.name}")
            
            if execution.status == ExecutionStatus.CANCELLED:
                logger.info("Execution cancelled, breaking")
                break
                
            # Check dependencies
            if not self._check_dependencies(step, execution):
                logger.warning(
                    "Skipping step due to failed dependencies",
                    step_id=step.id
                )
                execution.step_results[step.id].status = ExecutionStatus.FAILED
                execution.step_results[step.id].error = "Dependencies failed"
                continue
                
            logger.info(f"Dependencies satisfied for step {step.id}, executing")
            await self._execute_step(step, execution, plan)
            logger.info(f"Completed step {step.id}")
        
        logger.info("Sequential execution completed")
    
    async def _execute_parallel(self, plan: ResearchPlan, execution: ResearchExecution):
        """Execute steps in parallel where possible"""
        # Group steps by dependency level
        dependency_levels = self._group_by_dependencies(plan.steps)
        
        # Execute each level in parallel
        for level, steps in dependency_levels.items():
            if execution.status == ExecutionStatus.CANCELLED:
                break
                
            # Execute all steps at this level in parallel
            tasks = [
                self._execute_step(step, execution, plan)
                for step in steps
                if self._check_dependencies(step, execution)
            ]
            
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _execute_step(
        self, 
        step: ResearchStep, 
        execution: ResearchExecution,
        plan: ResearchPlan
    ):
        """Execute a single research step"""
        step_result = execution.step_results[step.id]
        step_result.status = ExecutionStatus.RUNNING
        step_result.started_at = datetime.utcnow()
        
        await self._notify_progress(execution)
        
        try:
            # Generate SQL query based on step
            logger.info(f"Generating query for step {step.id}")
            # Always use chat interface logic, ignore any hardcoded templates
            query = await self._generate_query(step, execution, plan)
            step_result.query = query
            logger.info(f"Generated query: {query}")
            
            if not query or query.strip() == "":
                raise Exception("Empty query generated")
            
            # Execute query
            logger.info(f"Executing step {step.id}: {step.name}")
            results = await self._execute_query(query)
            logger.info(f"Query executed, got {len(results)} rows")
            
            step_result.results = results
            step_result.status = ExecutionStatus.COMPLETED
            step_result.completed_at = datetime.utcnow()
            
            logger.info(
                "Step completed successfully",
                step_id=step.id,
                rows_returned=len(results),
                duration=step_result.duration_seconds
            )
            
        except Exception as e:
            logger.error(
                "Step execution failed",
                step_id=step.id,
                error=str(e)
            )
            step_result.status = ExecutionStatus.FAILED
            step_result.error = str(e)
            step_result.completed_at = datetime.utcnow()
        
        await self._notify_progress(execution)
    
    async def _generate_query(
        self,
        step: ResearchStep,
        execution: ResearchExecution,
        plan: ResearchPlan
    ) -> str:
        """Generate SQL query for a research step using chat interface logic"""
        # Always use the chat interface logic (NLP -> Weaviate -> SQL)
        # Build context from previous results
        context = self._build_context(step, execution)
        
        # Check if step has GL context in metadata
        gl_context = None
        if hasattr(step, 'metadata') and step.metadata:
            gl_context = step.metadata.get('gl_context')
        
        # Create a natural language query for the SQL generator
        # Combine the step description with the overall research objective for better context
        if context:
            query_prompt = f"{step.description} for {plan.objective}. Previous analysis context: {context}"
        else:
            query_prompt = f"{step.description} for {plan.objective}"
        
        # Add GL context to prompt if available
        if gl_context and gl_context.get('identified_concepts'):
            gl_info = f" Using financial concepts: {', '.join(gl_context['identified_concepts'])}"
            if gl_context.get('required_buckets'):
                gl_info += f" with GL buckets: {', '.join(gl_context['required_buckets'][:5])}"
            query_prompt += gl_info
        
        logger.info(f"Generating SQL for step {step.id} with prompt: {query_prompt}")
        
        # Use the exact same SQL generation logic as the chat interface
        # This will:
        # 1. Generate embeddings for the query
        # 2. Search Weaviate for relevant tables using vector similarity
        # 3. Pass relevant schemas to LLM to generate SQL
        # 4. Return optimized SQL for the actual tables in the dataset
        response = await asyncio.to_thread(
            self.sql_generator.generate_sql,
            query_prompt,
            use_vector_search=True,  # Enable Weaviate vector search
            max_tables=5,            # Limit to 5 most relevant tables
            auto_optimize=True       # Apply query optimization
        )
        
        sql = response.get("sql", "")
        if response.get("error"):
            logger.error(f"SQL generation failed for step {step.id}: {response.get('error')}")
            raise Exception(response.get("error"))
            
        logger.info(f"Generated SQL for step {step.id} using tables: {response.get('tables_used', [])}")
        
        return sql
    
    async def _execute_query(self, query: str) -> List[Dict[str, Any]]:
        """Execute a SQL query and return results"""
        # Use synchronous BigQuery client in async context
        results = await asyncio.to_thread(
            self.bq_client.execute_query,
            query
        )
        
        # Convert to list of dicts
        return [dict(row) for row in results]
    
    def _check_dependencies(self, step: ResearchStep, execution: ResearchExecution) -> bool:
        """Check if all dependencies for a step are satisfied"""
        for dep_id in step.dependencies:
            dep_result = execution.step_results.get(dep_id)
            if not dep_result or dep_result.status != ExecutionStatus.COMPLETED:
                return False
        return True
    
    def _group_by_dependencies(self, steps: List[ResearchStep]) -> Dict[int, List[ResearchStep]]:
        """Group steps by dependency level for parallel execution"""
        levels = {}
        step_levels = {}
        
        # Calculate level for each step
        for step in steps:
            level = self._calculate_dependency_level(step, steps, step_levels)
            if level not in levels:
                levels[level] = []
            levels[level].append(step)
            
        return dict(sorted(levels.items()))
    
    def _calculate_dependency_level(
        self,
        step: ResearchStep,
        all_steps: List[ResearchStep],
        memo: Dict[str, int]
    ) -> int:
        """Calculate dependency level for a step (memoized)"""
        if step.id in memo:
            return memo[step.id]
            
        if not step.dependencies:
            level = 0
        else:
            # Find all dependency steps
            dep_steps = [s for s in all_steps if s.id in step.dependencies]
            # Level is max dependency level + 1
            level = max(
                self._calculate_dependency_level(dep, all_steps, memo)
                for dep in dep_steps
            ) + 1
            
        memo[step.id] = level
        return level
    
    def _build_context(self, step: ResearchStep, execution: ResearchExecution) -> str:
        """Build context from previous step results"""
        context_parts = []
        
        for dep_id in step.dependencies:
            dep_result = execution.step_results.get(dep_id)
            if dep_result and dep_result.status == ExecutionStatus.COMPLETED:
                # Include summary of results
                summary = f"Step {dep_id} returned {dep_result.row_count} rows"
                if dep_result.results and len(dep_result.results) > 0:
                    # Include column names
                    columns = list(dep_result.results[0].keys())
                    summary += f" with columns: {', '.join(columns[:5])}"
                    if len(columns) > 5:
                        summary += f" and {len(columns) - 5} more"
                        
                context_parts.append(summary)
                
        return "\n".join(context_parts)
    
    async def _notify_progress(self, execution: ResearchExecution):
        """Notify progress callbacks"""
        progress_data = {
            "execution_id": execution.execution_id,
            "plan_id": execution.plan_id,
            "status": execution.status.value,
            "progress_percentage": execution.progress_percentage,
            "steps": {
                step_id: {
                    "status": result.status.value,
                    "row_count": result.row_count,
                    "duration": result.duration_seconds
                }
                for step_id, result in execution.step_results.items()
            }
        }
        
        for callback in execution.progress_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(progress_data)
                else:
                    await asyncio.to_thread(callback, progress_data)
            except Exception as e:
                logger.error("Progress callback failed", error=str(e))
    
    def cancel_execution(self, execution_id: str) -> bool:
        """Cancel an active execution"""
        execution = self.active_executions.get(execution_id)
        if execution and execution.status == ExecutionStatus.RUNNING:
            execution.status = ExecutionStatus.CANCELLED
            return True
        return False
    
    def get_execution_status(self, execution_id: str) -> Optional[ResearchExecution]:
        """Get current status of an execution"""
        return self.active_executions.get(execution_id)
    
    async def _log_execution(self, plan: ResearchPlan, execution: ResearchExecution):
        """Log execution details for query logger"""
        try:
            # Prepare step details
            steps = []
            queries = []
            
            for step in plan.steps:
                result = execution.step_results.get(step.id)
                if result:
                    step_detail = {
                        "step_id": step.id,
                        "name": step.name,
                        "description": step.description,
                        "status": result.status.value,
                        "duration": f"{result.duration_seconds:.2f}s" if result.duration_seconds else None,
                        "error": result.error
                    }
                    steps.append(step_detail)
                    
                    if result.query and result.status == ExecutionStatus.COMPLETED:
                        queries.append({
                            "step_name": step.name,
                            "sql": result.query,
                            "row_count": result.row_count
                        })
            
            # Call logging endpoint
            from src.api.routes import log_query_execution
            log_query_execution(
                query=plan.objective,
                sql="",  # No single SQL for research
                mode="research",
                execution_id=execution.execution_id,
                status=execution.status.value,
                error=None,  # Errors logged per step
                tables_used=[],  # Could aggregate from steps
                start_time=execution.started_at,
                end_time=execution.completed_at,
                steps=steps,
                queries=queries,
                result_summary=f"Research completed with {len(execution.get_completed_steps())} successful steps"
            )
        except Exception as e:
            logger.error(f"Failed to log research execution: {e}")