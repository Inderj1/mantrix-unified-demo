"""
FastAPI routes for BigQuery queries - AXIS.AI
Supports configurable datasets for multi-source connectivity
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import structlog
from datetime import datetime, timezone
import uuid

from src.core.bigquery_sql_generator import BigQuerySQLGenerator
from src.db.mongodb_client import get_mongodb_client, MongoDBClient
from src.models.conversation import Message
from src.config import settings

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/bigquery", tags=["bigquery"])

# Initialize BigQuery generator (lazy loading)
bq_generator = None


def get_bq_generator() -> BigQuerySQLGenerator:
    """Get or create BigQuery SQL generator"""
    global bq_generator
    if bq_generator is None:
        bq_generator = BigQuerySQLGenerator()
    return bq_generator


# Request/Response Models
class BigQueryRequest(BaseModel):
    question: str
    dataset: Optional[str] = None  # Override default dataset
    conversationId: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class BigQueryResponse(BaseModel):
    success: bool
    sql: Optional[str] = None
    explanation: Optional[str] = None
    results: Optional[List[Dict[str, Any]]] = None
    columns: Optional[List[str]] = None
    row_count: Optional[int] = None
    tables_used: Optional[List[str]] = None
    dataset: Optional[str] = None
    project: Optional[str] = None
    from_cache: bool = False
    bytes_processed: Optional[int] = None
    estimated_cost_usd: Optional[float] = None
    error: Optional[str] = None
    execution: Optional[Dict[str, Any]] = None


class DatasetInfo(BaseModel):
    dataset_id: str
    tables: List[str]
    table_count: int


class SchemaResponse(BaseModel):
    dataset: str
    project: str
    tables: List[Dict[str, Any]]


# Helper function for date conversion
def convert_dates_to_datetime(obj):
    """Convert datetime.date to datetime.datetime for MongoDB compatibility."""
    from datetime import date, time
    from decimal import Decimal

    if isinstance(obj, date) and not isinstance(obj, datetime):
        return datetime.combine(obj, time.min)
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_dates_to_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_dates_to_datetime(item) for item in obj]
    return obj


@router.post("/query", response_model=BigQueryResponse)
async def query_bigquery(
    request: BigQueryRequest,
    generator: BigQuerySQLGenerator = Depends(get_bq_generator),
    mongodb: MongoDBClient = Depends(get_mongodb_client)
):
    """
    Process a natural language query against BigQuery.

    - Generates SQL from natural language
    - Executes against configured BigQuery dataset
    - Optionally stores conversation history
    """
    start_time = datetime.utcnow()
    execution_id = str(uuid.uuid4())

    try:
        # Switch dataset if specified
        if request.dataset and request.dataset != generator.dataset_id:
            generator.set_dataset(request.dataset)
            logger.info(f"Switched to dataset: {request.dataset}")

        # Get options
        options = request.options or {}
        max_tables = options.get("max_tables", 5)
        execute = options.get("execute", True)

        # Get conversation history for context if conversationId provided
        conversation_context = None
        if request.conversationId:
            try:
                conversation = await mongodb.get_conversation(request.conversationId)
                if conversation and conversation.get("messages"):
                    # Get recent messages for context (last 6 messages = 3 Q&A pairs)
                    recent_messages = conversation["messages"][-6:]
                    conversation_context = []
                    for msg in recent_messages:
                        msg_type = msg.get("type", "user")
                        content = msg.get("content", "")
                        sql = msg.get("sql", "")
                        if msg_type == "user":
                            conversation_context.append(f"User: {content}")
                        elif msg_type == "assistant" and sql:
                            conversation_context.append(f"Assistant SQL: {sql}")
                    logger.info(f"Loaded {len(conversation_context)} messages for context")
            except Exception as e:
                logger.warning(f"Failed to load conversation context: {e}")

            # Save user message to conversation
            user_message = Message(
                id=f"msg-{int(datetime.now(timezone.utc).timestamp())}-user",
                type="user",
                content=request.question,
                timestamp=datetime.now(timezone.utc)
            )
            await mongodb.add_message(request.conversationId, user_message.model_dump())

        # Generate and execute query with conversation context
        if execute:
            result = generator.generate_and_execute(request.question, max_tables, conversation_context=conversation_context)
        else:
            result = generator.generate_sql(request.question, max_tables, conversation_context=conversation_context)

        # Extract execution results if available
        execution = result.get("execution", {})

        # Build response
        response_data = {
            "success": not result.get("error"),
            "sql": result.get("sql"),
            "explanation": result.get("explanation"),
            "results": execution.get("data") if execute else None,
            "columns": execution.get("columns") if execute else None,
            "row_count": execution.get("row_count", 0) if execute else None,
            "tables_used": result.get("tables_used", []),
            "dataset": result.get("dataset", generator.dataset_id),
            "project": result.get("project", generator.project_id),
            "from_cache": result.get("from_cache", False),
            "bytes_processed": execution.get("bytes_processed"),
            "estimated_cost_usd": execution.get("estimated_cost_usd"),
            "error": result.get("error"),
            "execution": execution if execute else None
        }

        # Save assistant response to conversation if conversationId provided
        if request.conversationId:
            assistant_message = Message(
                id=f"msg-{int(datetime.now(timezone.utc).timestamp())}-assistant",
                type="assistant",
                content=result.get("explanation", "Query processed successfully."),
                sql=result.get("sql"),
                results=execution.get("data") if execute else None,
                result_count=execution.get("row_count", 0) if execute else None,
                error=result.get("error"),
                metadata={
                    "dataset": generator.dataset_id,
                    "project": generator.project_id,
                    "bytes_processed": execution.get("bytes_processed"),
                    "estimated_cost_usd": execution.get("estimated_cost_usd"),
                    "tables_used": result.get("tables_used", [])
                },
                timestamp=datetime.now(timezone.utc)
            )
            message_data = convert_dates_to_datetime(assistant_message.model_dump())
            await mongodb.add_message(request.conversationId, message_data)

        logger.info(f"BigQuery query completed: {execution.get('row_count', 0)} rows")
        return BigQueryResponse(**response_data)

    except Exception as e:
        logger.error(f"BigQuery query failed: {e}")

        # Save error to conversation
        if request.conversationId:
            error_message = Message(
                id=f"msg-{int(datetime.now(timezone.utc).timestamp())}-assistant",
                type="assistant",
                content="Sorry, I encountered an error processing your BigQuery query.",
                error=str(e),
                timestamp=datetime.now(timezone.utc)
            )
            await mongodb.add_message(request.conversationId, error_message.model_dump())

        raise HTTPException(status_code=500, detail=str(e))


@router.get("/datasets", response_model=List[str])
async def list_datasets(
    generator: BigQuerySQLGenerator = Depends(get_bq_generator)
):
    """List all available BigQuery datasets in the project"""
    try:
        datasets = generator.get_available_datasets()
        return datasets
    except Exception as e:
        logger.error(f"Failed to list datasets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables", response_model=List[str])
async def list_tables(
    dataset: Optional[str] = Query(None, description="Dataset to list tables from"),
    generator: BigQuerySQLGenerator = Depends(get_bq_generator)
):
    """List all tables in the current or specified dataset"""
    try:
        if dataset and dataset != generator.dataset_id:
            generator.set_dataset(dataset)

        tables = generator.list_tables()
        return tables
    except Exception as e:
        logger.error(f"Failed to list tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schema", response_model=SchemaResponse)
async def get_schema(
    dataset: Optional[str] = Query(None, description="Dataset to get schema from"),
    tables: Optional[str] = Query(None, description="Comma-separated table names"),
    generator: BigQuerySQLGenerator = Depends(get_bq_generator)
):
    """Get schema information for tables in the dataset"""
    try:
        if dataset and dataset != generator.dataset_id:
            generator.set_dataset(dataset)

        table_list = tables.split(",") if tables else None
        schemas = generator.get_table_schemas(table_list)

        return SchemaResponse(
            dataset=generator.dataset_id,
            project=generator.project_id,
            tables=schemas
        )
    except Exception as e:
        logger.error(f"Failed to get schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/table/{table_name}/schema")
async def get_table_schema(
    table_name: str,
    dataset: Optional[str] = Query(None, description="Dataset containing the table"),
    generator: BigQuerySQLGenerator = Depends(get_bq_generator)
):
    """Get schema for a specific table"""
    try:
        if dataset and dataset != generator.dataset_id:
            generator.set_dataset(dataset)

        schema = generator.get_table_schema(table_name)
        if not schema:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")

        return schema
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get table schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute")
async def execute_sql(
    sql: str,
    dataset: Optional[str] = Query(None, description="Dataset context"),
    generator: BigQuerySQLGenerator = Depends(get_bq_generator)
):
    """Execute raw SQL against BigQuery"""
    try:
        if dataset and dataset != generator.dataset_id:
            generator.set_dataset(dataset)

        result = generator.execute_sql(sql)
        return result
    except Exception as e:
        logger.error(f"SQL execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def bigquery_health():
    """Check BigQuery connectivity"""
    try:
        generator = get_bq_generator()
        tables = generator.list_tables()

        return {
            "status": "healthy",
            "project": generator.project_id,
            "dataset": generator.dataset_id,
            "table_count": len(tables),
            "tables": tables[:10],  # First 10 tables
            "message": f"Connected to {generator.project_id}.{generator.dataset_id}"
        }
    except Exception as e:
        logger.error(f"BigQuery health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "project": settings.google_cloud_project,
            "dataset": settings.bigquery_dataset
        }
