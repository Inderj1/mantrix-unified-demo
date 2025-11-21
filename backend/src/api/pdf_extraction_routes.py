"""PDF Template-Based Extraction API routes."""
import logging
import tempfile
import os
from typing import Dict, Any
from datetime import datetime
import json

from fastapi import APIRouter, HTTPException, UploadFile, File, Body, Form
from fastapi.responses import JSONResponse
import pymupdf
import sys
from pathlib import Path

# Add parent directory to path to import template_aware_extraction
sys.path.insert(0, str(Path(__file__).parent.parent))
from template_aware_extraction import TemplateAwareExtractor

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/extract")
async def extract_pdf_with_template(
    file: UploadFile = File(...),
    template: str = Form(...)
):
    """
    Extract data from PDF using a template schema.

    Args:
        file: PDF file to extract data from
        template: JSON string containing template definition with required_fields, optional_fields, items_schema

    Returns:
        Extracted data as JSON
    """
    try:
        # Parse template
        template_data = json.loads(template)

        # Validate template structure
        if not isinstance(template_data, dict):
            raise HTTPException(status_code=400, detail="Template must be a JSON object")

        if "name" not in template_data:
            template_data["name"] = "Custom Template"

        # Save uploaded PDF temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            # Extract text from PDF
            doc = pymupdf.open(tmp_file_path)
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.get_text()
            doc.close()

            if not text.strip():
                raise HTTPException(status_code=400, detail="No text could be extracted from PDF")

            # Initialize extractor
            extractor = TemplateAwareExtractor()

            # Check if auto-detection is requested or needed
            if template_data.get('auto_detect') or not template_data.get('required_fields'):
                logger.info("Auto-detecting template...")
                detected_type = extractor.auto_detect_template(text)

                if detected_type and detected_type in extractor.templates:
                    logger.info(f"Using auto-detected template: {detected_type}")
                    template_data = extractor.templates[detected_type]
                else:
                    logger.warning("Auto-detection failed, using provided template")

            # Create schema prompt
            schema = extractor.create_schema_prompt(template_data)

            # Build extraction prompt
            prompt = f"""You are a precise data extraction assistant. Extract information from this document using the schema below.

DOCUMENT TYPE: {template_data.get('name', 'Document')}

{schema}

EXTRACTION RULES:
1. Return ONLY valid JSON format
2. Use null for missing fields (do not omit fields)
3. For items/lists, use JSON arrays with proper structure
4. Extract ALL required fields - they must be present in output
5. Use exact field names from schema above
6. For monetary values, use numbers without currency symbols
7. For dates, preserve the format found in document

DOCUMENT TEXT:
{text}

JSON OUTPUT (all required fields must be present):"""

            # Query LLM for extraction
            response = extractor.query_ollama(prompt)

            if not response:
                raise HTTPException(status_code=500, detail="LLM extraction failed")

            # Parse LLM response to extract JSON
            extracted_data = extractor.parse_llm_response(response)

            if "error" in extracted_data:
                raise HTTPException(status_code=500, detail=f"Extraction error: {extracted_data['error']}")

            # Clean up temp file
            os.unlink(tmp_file_path)

            return JSONResponse(content={
                "success": True,
                "data": extracted_data,
                "filename": file.filename,
                "template": template_data.get('name'),
                "template_schema": {
                    "name": template_data.get('name'),
                    "description": template_data.get('description'),
                    "required_fields": template_data.get('required_fields', []),
                    "optional_fields": template_data.get('optional_fields', []),
                    "items_schema": template_data.get('items_schema', {})
                },
                "timestamp": datetime.utcnow().isoformat()
            })

        except HTTPException:
            raise
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            logger.error(f"Extraction failed: {e}")
            raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid template JSON: {str(e)}")
    except Exception as e:
        logger.error(f"PDF extraction request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-batch")
async def extract_pdf_batch(
    files: list[UploadFile] = File(...),
    template: str = Form(...)
):
    """
    Extract data from multiple PDFs using the same template.

    Args:
        files: List of PDF files to extract data from
        template: JSON string containing template definition

    Returns:
        List of extraction results
    """
    try:
        template_data = json.loads(template)
        results = []

        for file in files:
            try:
                # Process each file individually
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                    content = await file.read()
                    tmp_file.write(content)
                    tmp_file_path = tmp_file.name

                # Extract text
                doc = pymupdf.open(tmp_file_path)
                text = ""
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page.get_text()
                doc.close()

                # Initialize extractor and extract
                extractor = TemplateAwareExtractor()
                schema = extractor.create_schema_prompt(template_data)

                prompt = f"""You are a precise data extraction assistant. Extract information from this document using the schema below.

DOCUMENT TYPE: {template_data.get('name', 'Document')}

{schema}

EXTRACTION RULES:
1. Return ONLY valid JSON format
2. Use null for missing fields (do not omit fields)
3. For items/lists, use JSON arrays with proper structure
4. Extract ALL required fields - they must be present in output
5. Use exact field names from schema above
6. For monetary values, use numbers without currency symbols
7. For dates, preserve the format found in document

DOCUMENT TEXT:
{text}

JSON OUTPUT (all required fields must be present):"""

                response = extractor.query_ollama(prompt)
                extracted_data = extractor.parse_llm_response(response) if response else {"error": "No response"}

                # Clean up temp file
                os.unlink(tmp_file_path)

                results.append({
                    "filename": file.filename,
                    "success": "error" not in extracted_data,
                    "data": extracted_data
                })

            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })

        return JSONResponse(content={
            "success": True,
            "total": len(results),
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        })

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid template JSON: {str(e)}")
    except Exception as e:
        logger.error(f"Batch extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
