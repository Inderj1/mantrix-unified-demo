"""API routes for COMMS.AI Configuration Management."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import structlog
from src.core.database import execute_query, execute_update

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/comms/config", tags=["comms-config"])


# Models
class CommunicationType(BaseModel):
    id: Optional[int] = None
    name: str
    display_name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    tab_order: int = 0
    is_active: bool = True


class FieldDefinition(BaseModel):
    id: Optional[int] = None
    communication_type_id: int
    field_name: str
    display_name: str
    field_type: str
    is_required: bool = False
    is_searchable: bool = True
    is_filterable: bool = True
    is_sortable: bool = True
    column_order: int = 0
    column_width: int = 150
    validation_rules: Optional[Dict[str, Any]] = None
    dropdown_options: Optional[List[str]] = None
    default_value: Optional[str] = None


class Communication(BaseModel):
    id: Optional[int] = None
    communication_type_id: int
    data: Dict[str, Any]
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None


class ConfigResponse(BaseModel):
    types: List[Dict[str, Any]]
    fields: Dict[int, List[Dict[str, Any]]]


# Communication Types Endpoints
@router.get("/types", response_model=List[CommunicationType])
async def get_communication_types(active_only: bool = Query(default=True)):
    """Get all communication types."""
    try:
        query = "SELECT * FROM comms_ai.communication_types"
        if active_only:
            query += " WHERE is_active = true"
        query += " ORDER BY tab_order"

        results = execute_query(query)
        return results
    except Exception as e:
        logger.error("Failed to fetch communication types", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch communication types: {str(e)}")


@router.get("/types/{type_id}")
async def get_communication_type(type_id: int):
    """Get a specific communication type."""
    try:
        query = "SELECT * FROM comms_ai.communication_types WHERE id = %s"
        results = execute_query(query, (type_id,))

        if not results:
            raise HTTPException(status_code=404, detail="Communication type not found")

        return results[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch communication type", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch communication type: {str(e)}")


@router.post("/types")
async def create_communication_type(comm_type: CommunicationType):
    """Create a new communication type."""
    try:
        query = """
        INSERT INTO comms_ai.communication_types
        (name, display_name, description, icon, color, tab_order, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        result = execute_query(query, (
            comm_type.name,
            comm_type.display_name,
            comm_type.description,
            comm_type.icon,
            comm_type.color,
            comm_type.tab_order,
            comm_type.is_active
        ))

        return {"id": result[0]['id'], "message": "Communication type created successfully"}
    except Exception as e:
        logger.error("Failed to create communication type", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create communication type: {str(e)}")


@router.put("/types/{type_id}")
async def update_communication_type(type_id: int, comm_type: CommunicationType):
    """Update a communication type."""
    try:
        query = """
        UPDATE comms_ai.communication_types
        SET name = %s, display_name = %s, description = %s, icon = %s,
            color = %s, tab_order = %s, is_active = %s
        WHERE id = %s
        """
        execute_update(query, (
            comm_type.name,
            comm_type.display_name,
            comm_type.description,
            comm_type.icon,
            comm_type.color,
            comm_type.tab_order,
            comm_type.is_active,
            type_id
        ))

        return {"message": "Communication type updated successfully"}
    except Exception as e:
        logger.error("Failed to update communication type", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update communication type: {str(e)}")


@router.delete("/types/{type_id}")
async def delete_communication_type(type_id: int):
    """Delete a communication type."""
    try:
        query = "DELETE FROM comms_ai.communication_types WHERE id = %s"
        execute_update(query, (type_id,))

        return {"message": "Communication type deleted successfully"}
    except Exception as e:
        logger.error("Failed to delete communication type", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete communication type: {str(e)}")


# Field Definitions Endpoints
@router.get("/fields/{type_id}", response_model=List[FieldDefinition])
async def get_field_definitions(type_id: int):
    """Get field definitions for a communication type."""
    try:
        query = """
        SELECT * FROM comms_ai.field_definitions
        WHERE communication_type_id = %s
        ORDER BY column_order
        """
        results = execute_query(query, (type_id,))
        return results
    except Exception as e:
        logger.error("Failed to fetch field definitions", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch field definitions: {str(e)}")


@router.post("/fields")
async def create_field_definition(field: FieldDefinition):
    """Create a new field definition."""
    try:
        query = """
        INSERT INTO comms_ai.field_definitions
        (communication_type_id, field_name, display_name, field_type, is_required,
         is_searchable, is_filterable, is_sortable, column_order, column_width,
         validation_rules, dropdown_options, default_value)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        import json
        result = execute_query(query, (
            field.communication_type_id,
            field.field_name,
            field.display_name,
            field.field_type,
            field.is_required,
            field.is_searchable,
            field.is_filterable,
            field.is_sortable,
            field.column_order,
            field.column_width,
            json.dumps(field.validation_rules) if field.validation_rules else None,
            json.dumps(field.dropdown_options) if field.dropdown_options else None,
            field.default_value
        ))

        return {"id": result[0]['id'], "message": "Field definition created successfully"}
    except Exception as e:
        logger.error("Failed to create field definition", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create field definition: {str(e)}")


@router.put("/fields/{field_id}")
async def update_field_definition(field_id: int, field: FieldDefinition):
    """Update a field definition."""
    try:
        query = """
        UPDATE comms_ai.field_definitions
        SET field_name = %s, display_name = %s, field_type = %s, is_required = %s,
            is_searchable = %s, is_filterable = %s, is_sortable = %s, column_order = %s,
            column_width = %s, validation_rules = %s, dropdown_options = %s, default_value = %s
        WHERE id = %s
        """

        import json
        execute_update(query, (
            field.field_name,
            field.display_name,
            field.field_type,
            field.is_required,
            field.is_searchable,
            field.is_filterable,
            field.is_sortable,
            field.column_order,
            field.column_width,
            json.dumps(field.validation_rules) if field.validation_rules else None,
            json.dumps(field.dropdown_options) if field.dropdown_options else None,
            field.default_value,
            field_id
        ))

        return {"message": "Field definition updated successfully"}
    except Exception as e:
        logger.error("Failed to update field definition", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to update field definition: {str(e)}")


@router.delete("/fields/{field_id}")
async def delete_field_definition(field_id: int):
    """Delete a field definition."""
    try:
        query = "DELETE FROM comms_ai.field_definitions WHERE id = %s"
        execute_update(query, (field_id,))

        return {"message": "Field definition deleted successfully"}
    except Exception as e:
        logger.error("Failed to delete field definition", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete field definition: {str(e)}")


# Get complete configuration
@router.get("/complete")
async def get_complete_configuration():
    """Get complete configuration including all types and their fields."""
    try:
        # Get all active communication types
        types_query = """
        SELECT * FROM comms_ai.communication_types
        WHERE is_active = true
        ORDER BY tab_order
        """
        types = execute_query(types_query)

        # Get all field definitions grouped by type
        fields_query = """
        SELECT * FROM comms_ai.field_definitions
        ORDER BY communication_type_id, column_order
        """
        all_fields = execute_query(fields_query)

        # Group fields by communication_type_id
        fields_by_type = {}
        for field in all_fields:
            type_id = field['communication_type_id']
            if type_id not in fields_by_type:
                fields_by_type[type_id] = []
            fields_by_type[type_id].append(field)

        return {
            "types": types,
            "fields": fields_by_type
        }
    except Exception as e:
        logger.error("Failed to fetch complete configuration", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch complete configuration: {str(e)}")


# Get communications data by type
@router.get("/data/{type_name}")
async def get_communications_by_type(
    type_name: str,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
):
    """Get communications data for a specific type."""
    try:
        query = """
        SELECT c.id, c.data, c.status, c.priority, c.tags, c.created_at, c.updated_at
        FROM comms_ai.communications c
        JOIN comms_ai.communication_types ct ON c.communication_type_id = ct.id
        WHERE ct.name = %s
        ORDER BY c.created_at DESC
        LIMIT %s OFFSET %s
        """
        results = execute_query(query, (type_name, limit, offset))

        # Flatten data JSONB into the main object
        flattened_results = []
        for row in results:
            flat_row = {**row['data'], 'id': row['id']}
            if row.get('status'):
                flat_row['status'] = row['status']
            if row.get('priority'):
                flat_row['priority'] = row['priority']
            if row.get('tags'):
                flat_row['tags'] = row['tags']
            flat_row['created_at'] = row['created_at']
            flat_row['updated_at'] = row['updated_at']
            flattened_results.append(flat_row)

        return flattened_results
    except Exception as e:
        logger.error("Failed to fetch communications", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch communications: {str(e)}")


# Create communication
@router.post("/data/{type_name}")
async def create_communication(type_name: str, communication: Communication):
    """Create a new communication record."""
    try:
        # Get type ID
        type_query = "SELECT id FROM comms_ai.communication_types WHERE name = %s"
        type_result = execute_query(type_query, (type_name,))

        if not type_result:
            raise HTTPException(status_code=404, detail="Communication type not found")

        type_id = type_result[0]['id']

        # Insert communication
        import json
        query = """
        INSERT INTO comms_ai.communications
        (communication_type_id, data, status, priority, tags)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        result = execute_query(query, (
            type_id,
            json.dumps(communication.data),
            communication.status,
            communication.priority,
            communication.tags
        ))

        return {"id": result[0]['id'], "message": "Communication created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create communication", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create communication: {str(e)}")
