"""Document Intelligence API routes."""
import logging
import tempfile
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import json

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Body
from fastapi.responses import JSONResponse
import pypdf
import docx
import pandas as pd
from PIL import Image
import pytesseract

from ..core.llm_client import LLMClient
from ..core.cache_manager import CacheManager
from ..config import settings
from .models import (
    DocumentUploadResponse,
    DocumentAnalysisRequest,
    DocumentAnalysisResponse,
    DocumentQuestionRequest,
    DocumentQuestionResponse,
    DocumentListResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory document storage (replace with database in production)
DOCUMENTS_STORAGE: Dict[str, Dict[str, Any]] = {}

# Dependencies
def get_llm_client() -> LLMClient:
    """Get LLM client instance."""
    return LLMClient()

def get_cache_manager() -> Optional[CacheManager]:
    """Get cache manager instance."""
    if settings.CACHE_ENABLED:
        try:
            return CacheManager()
        except Exception as e:
            logger.warning(f"Cache initialization failed: {e}")
    return None


# Helper functions
def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from Word document."""
    text = ""
    try:
        doc = docx.Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        raise
    return text

def extract_text_from_excel(file_path: str) -> str:
    """Extract text from Excel file."""
    text = ""
    try:
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            text += f"\n=== Sheet: {sheet_name} ===\n"
            text += df.to_string() + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from Excel: {e}")
        raise
    return text

def extract_text_from_image(file_path: str) -> str:
    """Extract text from image using OCR (fallback for text-heavy images)."""
    text = ""
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        if text.strip():
            return text
    except Exception as e:
        logger.warning(f"OCR extraction failed: {e}")
    # Return placeholder - actual analysis will use vision API
    return "[IMAGE_REQUIRES_VISION_ANALYSIS]"


def get_image_media_type(file_extension: str) -> str:
    """Get MIME type for image extension."""
    media_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp'
    }
    return media_types.get(file_extension.lower(), 'image/png')

def extract_text_from_file(file_path: str, file_extension: str) -> str:
    """Extract text based on file type."""
    ext = file_extension.lower()
    
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif ext in ['.xlsx', '.xls', '.csv']:
        if ext == '.csv':
            df = pd.read_csv(file_path)
            return df.to_string()
        return extract_text_from_excel(file_path)
    elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
        return extract_text_from_image(file_path)
    elif ext in ['.txt', '.md', '.json']:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file type: {ext}")


# API Endpoints
@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    llm_client: LLMClient = Depends(get_llm_client)
):
    """Upload a document for analysis."""
    try:
        # Generate unique document ID
        timestamp = datetime.utcnow().isoformat()
        content_hash = hashlib.md5(f"{file.filename}{timestamp}".encode()).hexdigest()[:8]
        document_id = f"doc_{content_hash}_{int(datetime.utcnow().timestamp())}"
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Extract text from file
            file_extension = os.path.splitext(file.filename)[1]
            extracted_text = extract_text_from_file(tmp_file_path, file_extension)

            # Check if this is an image file
            is_image = file_extension.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']

            # Store document metadata
            doc_metadata = {
                "document_id": document_id,
                "filename": file.filename,
                "file_type": file_extension,
                "size_bytes": len(content),
                "upload_timestamp": timestamp,
                "extracted_text": extracted_text[:1000],  # Store first 1000 chars for preview
                "full_text": extracted_text,
                "analysis_cache": {},
                "is_image": is_image
            }

            # Store raw image data for vision analysis
            if is_image:
                import base64
                doc_metadata["image_data"] = base64.standard_b64encode(content).decode("utf-8")
                doc_metadata["media_type"] = get_image_media_type(file_extension)

            DOCUMENTS_STORAGE[document_id] = doc_metadata
            
            # Clean up temp file
            os.unlink(tmp_file_path)
            
            return DocumentUploadResponse(
                document_id=document_id,
                filename=file.filename,
                file_type=file_extension,
                size_bytes=len(content),
                upload_timestamp=timestamp,
                message="Document uploaded successfully"
            )
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise
            
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents."""
    try:
        documents = []
        for doc_id, doc_data in DOCUMENTS_STORAGE.items():
            documents.append({
                "document_id": doc_data["document_id"],
                "filename": doc_data["filename"],
                "file_type": doc_data["file_type"],
                "size_bytes": doc_data["size_bytes"],
                "upload_timestamp": doc_data["upload_timestamp"]
            })
        
        return DocumentListResponse(
            documents=documents,
            total_count=len(documents)
        )
        
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document."""
    try:
        if document_id not in DOCUMENTS_STORAGE:
            raise HTTPException(status_code=404, detail="Document not found")
        
        del DOCUMENTS_STORAGE[document_id]
        
        return {"message": "Document deleted successfully", "document_id": document_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    llm_client: LLMClient = Depends(get_llm_client),
    cache_manager: Optional[CacheManager] = Depends(get_cache_manager)
):
    """Analyze a document using Claude (with vision support for images)."""
    try:
        if request.document_id not in DOCUMENTS_STORAGE:
            raise HTTPException(status_code=404, detail="Document not found")

        doc_data = DOCUMENTS_STORAGE[request.document_id]
        is_image = doc_data.get("is_image", False)

        # Check cache
        cache_key = f"doc_analysis:{request.document_id}:{request.analysis_type}"
        if cache_manager and cache_key in doc_data.get("analysis_cache", {}):
            cached_result = doc_data["analysis_cache"][cache_key]
            return DocumentAnalysisResponse(**cached_result)

        # Use vision API for images
        if is_image and doc_data.get("image_data"):
            import base64
            image_bytes = base64.standard_b64decode(doc_data["image_data"])
            media_type = doc_data.get("media_type", "image/png")

            # Build vision prompt based on analysis type
            if request.analysis_type == "summary":
                vision_prompt = """Analyze this image and provide:
1. A concise summary describing what the image shows (2-3 paragraphs)
2. 5-7 key points or findings from the image
3. Any notable patterns, data, or insights visible

Be specific about any text, numbers, charts, or data visible in the image."""
            elif request.analysis_type == "quality":
                vision_prompt = """Analyze the quality and content of this image:
1. Image clarity and readability assessment (0-100%)
2. Data completeness assessment (0-100%) - what information is present vs missing
3. Data accuracy/consistency assessment (0-100%) - are there any inconsistencies visible
4. Specific issues or concerns found
5. Suggestions for improvement or additional context needed

Focus on any data, text, charts, or information visible."""
            elif request.analysis_type == "extract_data":
                vision_prompt = """Extract all data and information from this image:
1. Any text content (headers, labels, body text)
2. Any tables or tabular data (extract as structured data)
3. Any numerical values, statistics, or metrics
4. Any dates, time periods, or timestamps
5. Any entity names (people, companies, locations)
6. Chart/graph data if present (describe trends, values)

Provide the extracted data in a clear, structured format."""
            else:  # comprehensive
                vision_prompt = """Provide a comprehensive analysis of this image including:
1. Executive summary - what is this image showing?
2. Detailed content description
3. Key findings and insights
4. Any data, metrics, or statistics visible
5. Quality assessment of the image content
6. Recommendations or next steps based on what's shown
7. Any concerns or areas needing clarification

Be thorough and specific about all visible content."""

            # Use vision API
            response = llm_client.analyze_image(
                image_data=image_bytes,
                prompt=vision_prompt,
                media_type=media_type,
                max_tokens=2000
            )
        else:
            # Text-based analysis for non-image documents
            if request.analysis_type == "summary":
                prompt = f"""Analyze this document and provide:
1. A concise summary (2-3 paragraphs)
2. 5-7 key points or findings
3. Any notable patterns or insights

Document content:
{doc_data['full_text'][:8000]}
"""
            elif request.analysis_type == "quality":
                prompt = f"""Analyze the data quality of this document and provide:
1. Data completeness assessment (0-100%)
2. Data accuracy assessment (0-100%)
3. Data consistency assessment (0-100%)
4. Specific data quality issues found
5. Suggestions for improvement

Document content:
{doc_data['full_text'][:8000]}
"""
            elif request.analysis_type == "extract_data":
                prompt = f"""Extract all structured data from this document and convert it into a clean JSON format.
Focus on:
1. Tables and tabular data
2. Key-value pairs
3. Lists and enumerations
4. Numerical data and statistics
5. Dates and time periods
6. Entity names (people, organizations, locations)

Return the extracted data in a well-structured JSON format.

Document content:
{doc_data['full_text'][:8000]}
"""
            else:  # comprehensive
                prompt = f"""Provide a comprehensive analysis of this document including:
1. Executive summary
2. Key findings and insights
3. Data quality assessment
4. Recommendations and next steps
5. Any risks or concerns identified

Document content:
{doc_data['full_text'][:8000]}
"""

            # Get analysis from Claude
            response = llm_client.generate_completion(
                prompt=prompt,
                max_tokens=2000
            )
        
        # Parse response
        analysis_result = _parse_analysis_response(response, request.analysis_type)
        
        # Cache result
        if cache_manager:
            doc_data["analysis_cache"][cache_key] = analysis_result
        
        return DocumentAnalysisResponse(**analysis_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/question", response_model=DocumentQuestionResponse)
async def ask_document_question(
    request: DocumentQuestionRequest,
    llm_client: LLMClient = Depends(get_llm_client)
):
    """Ask a question about one or more documents (with vision support for images)."""
    try:
        import base64 as b64

        # Check if any document is an image
        image_docs = []
        text_docs = []

        for doc_id in request.document_ids:
            if doc_id not in DOCUMENTS_STORAGE:
                raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")

            doc_data = DOCUMENTS_STORAGE[doc_id]
            if doc_data.get("is_image") and doc_data.get("image_data"):
                image_docs.append(doc_data)
            else:
                text_docs.append(doc_data)

        # If we have image documents, use vision API
        if image_docs:
            # For simplicity, analyze the first image document
            # In production, you might want to handle multiple images
            img_doc = image_docs[0]
            image_bytes = b64.standard_b64decode(img_doc["image_data"])
            media_type = img_doc.get("media_type", "image/png")

            vision_prompt = f"""Look at this image and answer the following question.
Be specific and reference what you can see in the image.
If the answer cannot be determined from the image, say so clearly.

Question: {request.question}

Provide your answer in JSON format:
{{
    "answer": "your detailed answer based on what you see in the image",
    "confidence": 0.0-1.0,
    "sources": ["describe which parts of the image you referenced"],
    "follow_up_questions": ["question1", "question2", "question3"]
}}
"""

            response = llm_client.analyze_image(
                image_data=image_bytes,
                prompt=vision_prompt,
                media_type=media_type,
                max_tokens=1500
            )
        else:
            # Text-based Q&A for non-image documents
            documents_text = []
            for doc_data in text_docs:
                documents_text.append(f"Document: {doc_data['filename']}\n{doc_data['full_text'][:4000]}")

            combined_docs = "\n\n---\n\n".join(documents_text)
            prompt = f"""Answer the following question based on the provided documents.
If the answer cannot be found in the documents, say so clearly.
Also suggest 2-3 relevant follow-up questions.

Documents:
{combined_docs}

Question: {request.question}

Provide your answer in JSON format:
{{
    "answer": "your detailed answer here",
    "confidence": 0.0-1.0,
    "sources": ["relevant quotes or sections"],
    "follow_up_questions": ["question1", "question2", "question3"]
}}
"""

            response = llm_client.generate_completion(
                prompt=prompt,
                max_tokens=1500
            )

        # Parse response
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {
                    "answer": response,
                    "confidence": 0.8,
                    "sources": [],
                    "follow_up_questions": []
                }
        except:
            result = {
                "answer": response,
                "confidence": 0.8,
                "sources": [],
                "follow_up_questions": []
            }

        return DocumentQuestionResponse(
            answer=result.get("answer", response),
            confidence=float(result.get("confidence", 0.8)),
            sources=result.get("sources", []),
            follow_up_questions=result.get("follow_up_questions", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document question failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _parse_analysis_response(response: str, analysis_type: str) -> dict:
    """Parse Claude's response into structured format."""
    # Special handling for data extraction
    if analysis_type == "extract_data":
        try:
            # Try to parse as JSON
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                extracted_data = json.loads(json_match.group())
                return {
                    "summary": "Data extracted successfully",
                    "key_points": [f"Extracted {len(extracted_data)} data points"],
                    "data_quality": {"completeness": 100, "accuracy": 100, "consistency": 100},
                    "suggestions": [],
                    "response": json.dumps(extracted_data, indent=2)
                }
        except:
            pass
    
    result = {
        "summary": "",
        "key_points": [],
        "data_quality": {
            "completeness": 85,
            "accuracy": 90,
            "consistency": 88
        },
        "suggestions": [],
        "response": response
    }
    
    # Basic parsing - extract sections
    lines = response.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect sections
        if 'summary' in line.lower() and ':' in line:
            current_section = 'summary'
            continue
        elif 'key point' in line.lower() or 'finding' in line.lower():
            current_section = 'key_points'
            continue
        elif 'suggestion' in line.lower() or 'recommendation' in line.lower():
            current_section = 'suggestions'
            continue
        elif 'quality' in line.lower():
            current_section = 'quality'
            continue
            
        # Add content to sections
        if current_section == 'summary' and line:
            result['summary'] += line + ' '
        elif current_section == 'key_points' and line.strip('- •'):
            result['key_points'].append(line.strip('- •'))
        elif current_section == 'suggestions' and line.strip('- •'):
            result['suggestions'].append(line.strip('- •'))
    
    # Ensure we have some content
    if not result['summary']:
        result['summary'] = response[:500] + '...' if len(response) > 500 else response
    
    if not result['key_points']:
        # Extract bullet points from response
        for line in lines:
            if line.strip().startswith(('-', '•', '*')) and len(line.strip()) > 3:
                result['key_points'].append(line.strip('- •*').strip())
                if len(result['key_points']) >= 5:
                    break
    
    return result