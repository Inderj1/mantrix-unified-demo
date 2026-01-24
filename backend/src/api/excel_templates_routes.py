"""
Excel Templates API Routes

CRUD operations for Excel processing templates.
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/excel-templates", tags=["excel-templates"])


def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", 5433)),
        database=os.getenv("POSTGRES_DB", "mantrix_nexxt"),
        user=os.getenv("POSTGRES_USER", "mantrix"),
        password=os.getenv("POSTGRES_PASSWORD", "mantrix123"),
    )


class SheetConfig(BaseModel):
    sheet_name: str
    source_file: Optional[str] = None
    expected_rows: Optional[int] = None
    columns: Optional[List[str]] = []
    is_enabled: bool = True


class BusinessRule(BaseModel):
    rule_name: str
    rule_type: str = "calculation"
    description: Optional[str] = None
    expression: Optional[str] = None
    applies_to: Optional[List[str]] = []


class FilterConfig(BaseModel):
    filter_name: str
    filter_type: str = "text"
    column: Optional[str] = None
    default_value: Optional[str] = None
    is_required: bool = False


class TemplateCreate(BaseModel):
    template_key: str
    template_name: str
    description: Optional[str] = None
    template_type: str = "custom"
    category: str = "General"
    input_folder_path: Optional[str] = None
    sheets_config: Optional[List[Dict]] = []
    business_rules: Optional[List[Dict]] = []
    filters_config: Optional[List[Dict]] = []
    ai_instructions: Optional[str] = None
    output_format: str = "excel"
    is_active: bool = True


class TemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    description: Optional[str] = None
    template_type: Optional[str] = None
    category: Optional[str] = None
    input_folder_path: Optional[str] = None
    sheets_config: Optional[List[Dict]] = None
    business_rules: Optional[List[Dict]] = None
    filters_config: Optional[List[Dict]] = None
    ai_instructions: Optional[str] = None
    output_format: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("")
async def get_templates() -> Dict[str, Any]:
    """Get all Excel templates."""
    try:
        conn = get_db_connection()
    except Exception as conn_error:
        # Database not available - return empty list gracefully
        logger.warning(f"Excel templates database not available: {conn_error}")
        return {'success': True, 'data': [], 'count': 0, 'message': 'Database not configured'}

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if table exists first
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'document_intelligence'
                AND table_name = 'excel_templates'
            )
        """)
        table_exists = cur.fetchone()['exists']

        if not table_exists:
            cur.close()
            conn.close()
            return {'success': True, 'data': [], 'count': 0, 'message': 'Templates table not configured'}

        cur.execute("""
            SELECT
                id,
                template_key,
                template_name,
                description,
                template_type,
                category,
                input_folder_path,
                sheets_config,
                business_rules,
                filters_config,
                ai_instructions,
                output_format,
                is_active,
                created_at,
                updated_at
            FROM document_intelligence.excel_templates
            ORDER BY template_name
        """)

        templates = cur.fetchall()

        # Convert to serializable format
        result = []
        for t in templates:
            template = dict(t)
            template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
            template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None
            result.append(template)

        cur.close()
        conn.close()

        return {
            'success': True,
            'data': result,
            'count': len(result)
        }

    except Exception as e:
        logger.error(f"Error getting Excel templates: {e}")
        try:
            conn.close()
        except:
            pass
        return {'success': True, 'data': [], 'count': 0, 'message': f'Error: {str(e)}'}


@router.get("/stats")
async def get_template_stats() -> Dict[str, Any]:
    """Get Excel template statistics."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                COUNT(*) as total_templates,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_templates,
                COUNT(DISTINCT category) as categories,
                COUNT(DISTINCT template_type) as types
            FROM document_intelligence.excel_templates
        """)

        stats = cur.fetchone()

        cur.close()
        conn.close()

        return {'success': True, 'data': dict(stats)}

    except Exception as e:
        logger.error(f"Error getting Excel template stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}")
async def get_template(template_id: int) -> Dict[str, Any]:
    """Get a single Excel template by ID."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT * FROM document_intelligence.excel_templates
            WHERE id = %s
        """, (template_id,))

        template = cur.fetchone()

        cur.close()
        conn.close()

        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        template = dict(template)
        template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
        template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None

        return {'success': True, 'data': template}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Excel template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_template(data: TemplateCreate) -> Dict[str, Any]:
    """Create a new Excel template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO document_intelligence.excel_templates
            (template_key, template_name, description, template_type, category,
             input_folder_path, sheets_config, business_rules, filters_config,
             ai_instructions, output_format, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data.template_key,
            data.template_name,
            data.description,
            data.template_type,
            data.category,
            data.input_folder_path,
            json.dumps(data.sheets_config),
            json.dumps(data.business_rules),
            json.dumps(data.filters_config),
            data.ai_instructions,
            data.output_format,
            data.is_active
        ))

        template = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        template = dict(template)
        template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
        template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None

        return {'success': True, 'data': template}

    except Exception as e:
        logger.error(f"Error creating Excel template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}")
async def update_template(template_id: int, data: TemplateUpdate) -> Dict[str, Any]:
    """Update an Excel template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Build dynamic update query
        updates = []
        values = []

        if data.template_name is not None:
            updates.append("template_name = %s")
            values.append(data.template_name)
        if data.description is not None:
            updates.append("description = %s")
            values.append(data.description)
        if data.template_type is not None:
            updates.append("template_type = %s")
            values.append(data.template_type)
        if data.category is not None:
            updates.append("category = %s")
            values.append(data.category)
        if data.input_folder_path is not None:
            updates.append("input_folder_path = %s")
            values.append(data.input_folder_path)
        if data.sheets_config is not None:
            updates.append("sheets_config = %s")
            values.append(json.dumps(data.sheets_config))
        if data.business_rules is not None:
            updates.append("business_rules = %s")
            values.append(json.dumps(data.business_rules))
        if data.filters_config is not None:
            updates.append("filters_config = %s")
            values.append(json.dumps(data.filters_config))
        if data.ai_instructions is not None:
            updates.append("ai_instructions = %s")
            values.append(data.ai_instructions)
        if data.output_format is not None:
            updates.append("output_format = %s")
            values.append(data.output_format)
        if data.is_active is not None:
            updates.append("is_active = %s")
            values.append(data.is_active)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updates.append("updated_at = NOW()")
        values.append(template_id)

        query = f"""
            UPDATE document_intelligence.excel_templates SET
                {', '.join(updates)}
            WHERE id = %s
            RETURNING *
        """

        cur.execute(query, values)
        template = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        template = dict(template)
        template['created_at'] = template['created_at'].isoformat() if template['created_at'] else None
        template['updated_at'] = template['updated_at'].isoformat() if template['updated_at'] else None

        return {'success': True, 'data': template}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating Excel template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{template_id}")
async def delete_template(template_id: int) -> Dict[str, Any]:
    """Delete an Excel template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM document_intelligence.excel_templates
            WHERE id = %s
            RETURNING id
        """, (template_id,))

        deleted = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        if not deleted:
            raise HTTPException(status_code=404, detail="Template not found")

        return {'success': True, 'message': 'Template deleted'}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Excel template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}/toggle")
async def toggle_template(template_id: int) -> Dict[str, Any]:
    """Toggle Excel template active status."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE document_intelligence.excel_templates SET
                is_active = NOT is_active,
                updated_at = NOW()
            WHERE id = %s
            RETURNING id, is_active
        """, (template_id,))

        result = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="Template not found")

        return {
            'success': True,
            'data': {'id': result['id'], 'is_active': result['is_active']}
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling Excel template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/input-files/list")
async def list_input_files() -> Dict[str, Any]:
    """List files in the excel-input folder."""
    try:
        # Get the project root and excel-input folder
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        input_folder = os.path.join(project_root, "excel-input")

        if not os.path.exists(input_folder):
            return {'success': True, 'data': [], 'folder': input_folder}

        files = []
        for filename in os.listdir(input_folder):
            filepath = os.path.join(input_folder, filename)
            if os.path.isfile(filepath) and filename.endswith(('.xlsx', '.xls', '.csv')):
                stat = os.stat(filepath)
                files.append({
                    'filename': filename,
                    'path': filepath,
                    'size': stat.st_size,
                    'size_formatted': f"{stat.st_size / 1024:.1f} KB",
                    'modified': stat.st_mtime,
                })

        # Sort by filename
        files.sort(key=lambda x: x['filename'])

        return {
            'success': True,
            'data': files,
            'folder': input_folder,
            'count': len(files)
        }

    except Exception as e:
        logger.error(f"Error listing input files: {e}")
        raise HTTPException(status_code=500, detail=str(e))
