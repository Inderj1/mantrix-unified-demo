"""
PDF Templates API Routes

CRUD operations for customer PDF parser templates.
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
router = APIRouter(prefix="/pdf-templates", tags=["pdf-templates"])


def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", 5433)),
        database=os.getenv("POSTGRES_DB", "mantrix_nexxt"),
        user=os.getenv("POSTGRES_USER", "mantrix"),
        password=os.getenv("POSTGRES_PASSWORD", "mantrix123"),
    )


class TemplateCreate(BaseModel):
    template_key: str
    customer_name: str
    description: Optional[str] = None
    category: str = "purchase_order"
    identification_keywords: Optional[List[str]] = []
    po_number_pattern: Optional[str] = None
    date_pattern: Optional[str] = None
    total_pattern: Optional[str] = None
    required_fields: Optional[List[str]] = []
    optional_fields: Optional[List[str]] = []
    items_schema: Optional[Dict] = {}
    is_active: bool = True


class TemplateUpdate(BaseModel):
    customer_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    identification_keywords: Optional[List[str]] = None
    po_number_pattern: Optional[str] = None
    date_pattern: Optional[str] = None
    total_pattern: Optional[str] = None
    required_fields: Optional[List[str]] = None
    optional_fields: Optional[List[str]] = None
    items_schema: Optional[Dict] = None
    is_active: Optional[bool] = None


@router.get("")
async def get_templates() -> Dict[str, Any]:
    """Get all PDF parser templates."""
    try:
        conn = get_db_connection()
    except Exception as conn_error:
        # Database not available - return empty list gracefully
        logger.warning(f"PDF templates database not available: {conn_error}")
        return {'success': True, 'data': [], 'count': 0, 'message': 'Database not configured'}

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if table exists first
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'document_intelligence'
                AND table_name = 'pdf_templates'
            )
        """)
        table_exists = cur.fetchone()['exists']

        if not table_exists:
            cur.close()
            conn.close()
            return {'success': True, 'data': [], 'count': 0, 'message': 'Templates table not configured'}

        # Get templates
        cur.execute("""
            SELECT
                t.id,
                t.template_key,
                t.customer_name,
                t.description,
                t.category,
                t.identification_keywords,
                t.po_number_pattern,
                t.date_pattern,
                t.total_pattern,
                t.required_fields,
                t.optional_fields,
                t.items_schema,
                t.sample_filenames,
                0 as po_count,
                t.is_active,
                t.created_at,
                t.updated_at
            FROM document_intelligence.pdf_templates t
            ORDER BY t.customer_name
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
        logger.error(f"Error getting templates: {e}")
        try:
            conn.close()
        except:
            pass
        return {'success': True, 'data': [], 'count': 0, 'message': f'Error: {str(e)}'}


@router.get("/stats")
async def get_template_stats() -> Dict[str, Any]:
    """Get template statistics."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                COUNT(*) as total_templates,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_templates,
                SUM(po_count) as total_pos,
                COUNT(CASE WHEN po_count > 0 THEN 1 END) as templates_with_pos
            FROM document_intelligence.pdf_templates
        """)

        stats = cur.fetchone()

        cur.close()
        conn.close()

        return {'success': True, 'data': dict(stats)}

    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{template_id}")
async def get_template(template_id: int) -> Dict[str, Any]:
    """Get a single template by ID."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT * FROM document_intelligence.pdf_templates
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
        logger.error(f"Error getting template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_template(data: TemplateCreate) -> Dict[str, Any]:
    """Create a new template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO document_intelligence.pdf_templates
            (template_key, customer_name, description, category, identification_keywords,
             po_number_pattern, date_pattern, total_pattern,
             required_fields, optional_fields, items_schema, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data.template_key,
            data.customer_name,
            data.description,
            data.category,
            data.identification_keywords,
            data.po_number_pattern,
            data.date_pattern,
            data.total_pattern,
            json.dumps(data.required_fields),
            json.dumps(data.optional_fields),
            json.dumps(data.items_schema),
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
        logger.error(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}")
async def update_template(template_id: int, data: TemplateUpdate) -> Dict[str, Any]:
    """Update a template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Build dynamic update query
        updates = []
        values = []

        if data.customer_name is not None:
            updates.append("customer_name = %s")
            values.append(data.customer_name)
        if data.description is not None:
            updates.append("description = %s")
            values.append(data.description)
        if data.category is not None:
            updates.append("category = %s")
            values.append(data.category)
        if data.identification_keywords is not None:
            updates.append("identification_keywords = %s")
            values.append(data.identification_keywords)
        if data.po_number_pattern is not None:
            updates.append("po_number_pattern = %s")
            values.append(data.po_number_pattern)
        if data.date_pattern is not None:
            updates.append("date_pattern = %s")
            values.append(data.date_pattern)
        if data.total_pattern is not None:
            updates.append("total_pattern = %s")
            values.append(data.total_pattern)
        if data.required_fields is not None:
            updates.append("required_fields = %s")
            values.append(json.dumps(data.required_fields))
        if data.optional_fields is not None:
            updates.append("optional_fields = %s")
            values.append(json.dumps(data.optional_fields))
        if data.items_schema is not None:
            updates.append("items_schema = %s")
            values.append(json.dumps(data.items_schema))
        if data.is_active is not None:
            updates.append("is_active = %s")
            values.append(data.is_active)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updates.append("updated_at = NOW()")
        values.append(template_id)

        query = f"""
            UPDATE document_intelligence.pdf_templates SET
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
        logger.error(f"Error updating template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{template_id}")
async def delete_template(template_id: int) -> Dict[str, Any]:
    """Delete a template."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM document_intelligence.pdf_templates
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
        logger.error(f"Error deleting template: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{template_id}/toggle")
async def toggle_template(template_id: int) -> Dict[str, Any]:
    """Toggle template active status."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE document_intelligence.pdf_templates SET
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
        logger.error(f"Error toggling template: {e}")
        raise HTTPException(status_code=500, detail=str(e))
