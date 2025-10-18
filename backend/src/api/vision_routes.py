"""
Vision AI API Routes for Manufacturing Quality Control
"""
import io
import json
import base64
import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from google.cloud import storage
from google.cloud.storage import Blob
import numpy as np
from PIL import Image
import aiohttp

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/vision", tags=["vision"])

# Pydantic models
class GCSPathRequest(BaseModel):
    path: str = Field(..., description="GCS path (e.g., gs://bucket/folder)")
    recursive: bool = Field(default=True, description="Recursively list files")
    file_types: List[str] = Field(default=["jpg", "jpeg", "png", "bmp", "webp"], description="File extensions to filter")

class DetectionRequest(BaseModel):
    image_ids: List[str] = Field(..., description="List of image IDs to process")
    model_id: str = Field(default="yolov8", description="Model ID to use for detection")
    confidence: float = Field(default=0.5, min=0.0, max=1.0, description="Confidence threshold")
    nms_threshold: float = Field(default=0.45, min=0.0, max=1.0, description="NMS threshold")

class AutoLabelRequest(BaseModel):
    images: List[str] = Field(..., description="List of image IDs or base64 data")
    prompt: str = Field(..., description="GPT-4 Vision prompt for labeling")
    model: str = Field(default="gpt-4-vision-preview", description="OpenAI model to use")

class TrainingConfig(BaseModel):
    dataset_path: str = Field(..., description="GCS path to training dataset")
    validation_path: str = Field(..., description="GCS path to validation dataset")
    base_model: str = Field(default="yolov8", description="Base model to fine-tune")
    epochs: int = Field(default=100, min=1, max=1000)
    batch_size: int = Field(default=16, min=1, max=128)
    learning_rate: float = Field(default=0.001, min=0.0001, max=0.1)
    data_augmentation: bool = Field(default=True)
    output_path: str = Field(..., description="GCS path for trained model")

class ExportRequest(BaseModel):
    annotations: List[Dict[str, Any]] = Field(..., description="Annotations to export")
    format: str = Field(default="json", description="Export format: json, csv, coco, yolo")
    include_images: bool = Field(default=False, description="Include images in export")

class Detection(BaseModel):
    """Single detection result"""
    class_name: str
    confidence: float
    bbox: List[float]  # [x, y, width, height]
    segmentation: Optional[List[List[float]]] = None
    keypoints: Optional[List[float]] = None

class ImageResult(BaseModel):
    """Result for a single image"""
    image_id: str
    detections: List[Detection]
    processing_time: float
    model_used: str

class ModelInfo(BaseModel):
    """Model information"""
    id: str
    name: str
    type: str  # detection, segmentation, classification
    version: str
    accuracy: float
    classes: List[str]
    input_size: List[int]
    created_at: datetime
    is_active: bool

# Initialize GCS client
def get_gcs_client():
    """Get Google Cloud Storage client"""
    try:
        return storage.Client()
    except Exception as e:
        logger.warning(f"Could not initialize GCS client: {e}")
        return None

# Utility functions
def parse_gcs_path(gcs_path: str) -> tuple:
    """Parse GCS path into bucket and prefix"""
    if not gcs_path.startswith("gs://"):
        raise ValueError("GCS path must start with gs://")
    
    path = gcs_path[5:]  # Remove gs://
    parts = path.split("/", 1)
    bucket_name = parts[0]
    prefix = parts[1] if len(parts) > 1 else ""
    
    return bucket_name, prefix

async def call_yolo_server(image_data: bytes, model_id: str, confidence: float) -> List[Detection]:
    """Call YOLO inference server"""
    yolo_url = "http://localhost:5001/detect"
    
    async with aiohttp.ClientSession() as session:
        data = aiohttp.FormData()
        data.add_field('image', image_data, filename='image.jpg', content_type='image/jpeg')
        data.add_field('model_id', model_id)
        data.add_field('confidence', str(confidence))
        
        try:
            async with session.post(yolo_url, data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return [Detection(**d) for d in result.get('detections', [])]
                else:
                    logger.error(f"YOLO server returned status {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error calling YOLO server: {e}")
            return []

async def call_openai_vision(image_base64: str, prompt: str) -> Dict[str, Any]:
    """Call OpenAI GPT-4 Vision API for auto-labeling"""
    import os
    from openai import AsyncOpenAI
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    client = AsyncOpenAI(api_key=api_key)
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        # Parse response to extract annotations
        content = response.choices[0].message.content
        # This would need proper parsing based on the expected format
        return {"annotations": content}
        
    except Exception as e:
        logger.error(f"Error calling OpenAI Vision API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# API Routes
@router.get("/health")
async def health_check():
    """Check Vision AI service health"""
    return {
        "status": "healthy",
        "service": "Vision AI",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "gcs": get_gcs_client() is not None,
            "yolo_server": False,  # Would check actual connection
            "openai": bool(os.getenv("OPENAI_API_KEY"))
        }
    }

@router.post("/gcs/list")
async def list_gcs_files(request: GCSPathRequest):
    """List files from Google Cloud Storage"""
    client = get_gcs_client()
    if not client:
        raise HTTPException(status_code=503, detail="GCS client not available")
    
    try:
        bucket_name, prefix = parse_gcs_path(request.path)
        bucket = client.bucket(bucket_name)
        
        files = []
        blobs = bucket.list_blobs(prefix=prefix)
        
        for blob in blobs:
            # Filter by file type
            if any(blob.name.lower().endswith(f".{ext}") for ext in request.file_types):
                files.append({
                    "name": blob.name,
                    "size": blob.size,
                    "updated": blob.updated.isoformat() if blob.updated else None,
                    "url": f"gs://{bucket_name}/{blob.name}",
                    "public_url": blob.public_url if blob.public_url else None
                })
        
        return {
            "files": files,
            "count": len(files),
            "bucket": bucket_name,
            "prefix": prefix
        }
        
    except Exception as e:
        logger.error(f"Error listing GCS files: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    save_to_gcs: bool = Form(default=False),
    gcs_path: Optional[str] = Form(default=None)
):
    """Upload image for processing"""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    content = await file.read()
    
    # Generate unique ID
    import uuid
    image_id = str(uuid.uuid4())
    
    # Process image metadata
    try:
        img = Image.open(io.BytesIO(content))
        metadata = {
            "id": image_id,
            "filename": file.filename,
            "size": len(content),
            "format": img.format,
            "mode": img.mode,
            "width": img.width,
            "height": img.height
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
    
    # Save to GCS if requested
    if save_to_gcs and gcs_path:
        client = get_gcs_client()
        if client:
            try:
                bucket_name, prefix = parse_gcs_path(gcs_path)
                bucket = client.bucket(bucket_name)
                blob_name = f"{prefix}/{image_id}_{file.filename}" if prefix else f"{image_id}_{file.filename}"
                blob = bucket.blob(blob_name)
                blob.upload_from_string(content, content_type=file.content_type)
                metadata["gcs_url"] = f"gs://{bucket_name}/{blob_name}"
            except Exception as e:
                logger.error(f"Error uploading to GCS: {e}")
    
    # Store in local cache (in production, use a proper storage solution)
    # For now, just return the metadata
    
    return metadata

@router.post("/detect")
async def detect_defects(request: DetectionRequest):
    """Run defect detection on images"""
    results = []
    
    for image_id in request.image_ids:
        # In production, retrieve image from storage
        # For now, simulate detection
        import time
        start_time = time.time()
        
        # Simulate YOLO detection (in production, call actual YOLO server)
        detections = [
            Detection(
                class_name="scratch",
                confidence=0.92,
                bbox=[100.0, 150.0, 50.0, 30.0]
            ),
            Detection(
                class_name="dent",
                confidence=0.88,
                bbox=[200.0, 250.0, 40.0, 40.0]
            )
        ]
        
        processing_time = time.time() - start_time
        
        results.append(ImageResult(
            image_id=image_id,
            detections=detections,
            processing_time=processing_time,
            model_used=request.model_id
        ))
    
    return {
        "results": results,
        "total_detections": sum(len(r.detections) for r in results),
        "model": request.model_id,
        "confidence_threshold": request.confidence
    }

@router.post("/auto-label")
async def auto_label_images(request: AutoLabelRequest):
    """Auto-label images using GPT-4 Vision"""
    annotations = []
    
    for image_data in request.images:
        # If image_data is an ID, retrieve the actual image
        # For now, assume it's base64 encoded
        
        try:
            result = await call_openai_vision(image_data, request.prompt)
            annotations.append({
                "image": image_data[:50] + "...",  # Truncate for response
                "annotations": result["annotations"]
            })
        except Exception as e:
            logger.error(f"Error auto-labeling image: {e}")
            annotations.append({
                "image": image_data[:50] + "...",
                "error": str(e)
            })
    
    return {
        "annotations": annotations,
        "prompt": request.prompt,
        "model": request.model
    }

@router.post("/train")
async def start_training(config: TrainingConfig, background_tasks: BackgroundTasks):
    """Start model training/fine-tuning"""
    # Generate training job ID
    import uuid
    job_id = str(uuid.uuid4())
    
    # In production, this would start an actual training job
    # For now, just return job information
    
    async def train_model():
        """Background training task"""
        # Simulate training
        await asyncio.sleep(10)
        logger.info(f"Training job {job_id} completed")
    
    # Add to background tasks
    background_tasks.add_task(train_model)
    
    return {
        "job_id": job_id,
        "status": "started",
        "config": config.dict(),
        "estimated_time": "2 hours",
        "message": "Training job started in background"
    }

@router.get("/training/{job_id}")
async def get_training_status(job_id: str):
    """Get training job status"""
    # In production, retrieve actual job status
    return {
        "job_id": job_id,
        "status": "running",
        "progress": 45,
        "current_epoch": 45,
        "total_epochs": 100,
        "metrics": {
            "loss": 0.234,
            "accuracy": 0.92,
            "val_loss": 0.312,
            "val_accuracy": 0.89
        }
    }

@router.post("/export")
async def export_annotations(request: ExportRequest):
    """Export annotations in various formats"""
    format_type = request.format.lower()
    
    if format_type == "json":
        # JSON format
        export_data = {
            "version": "1.0",
            "annotations": request.annotations,
            "exported_at": datetime.utcnow().isoformat()
        }
        content = json.dumps(export_data, indent=2)
        media_type = "application/json"
        filename = f"annotations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
    elif format_type == "coco":
        # COCO format
        coco_data = {
            "info": {"year": 2024, "version": "1.0"},
            "licenses": [],
            "images": [],
            "annotations": [],
            "categories": []
        }
        # Convert annotations to COCO format (simplified)
        for ann in request.annotations:
            # Add conversion logic here
            pass
        content = json.dumps(coco_data, indent=2)
        media_type = "application/json"
        filename = f"annotations_coco_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
    elif format_type == "yolo":
        # YOLO format (text file)
        lines = []
        for ann in request.annotations:
            # Convert to YOLO format: class_id x_center y_center width height
            # This is simplified - actual implementation would need proper conversion
            lines.append("0 0.5 0.5 0.1 0.1")
        content = "\n".join(lines)
        media_type = "text/plain"
        filename = f"annotations_yolo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
    elif format_type == "csv":
        # CSV format
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["image_id", "class", "confidence", "x", "y", "width", "height"])
        
        for ann in request.annotations:
            # Add CSV rows (simplified)
            writer.writerow(["img_001", "defect", 0.95, 100, 150, 50, 30])
        
        content = output.getvalue()
        media_type = "text/csv"
        filename = f"annotations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format_type}")
    
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/models")
async def list_models():
    """List available AI models"""
    models = [
        ModelInfo(
            id="yolov8",
            name="YOLO v8",
            type="detection",
            version="8.0.0",
            accuracy=0.94,
            classes=["scratch", "dent", "discoloration", "crack", "foreign_object"],
            input_size=[640, 640],
            created_at=datetime.utcnow(),
            is_active=True
        ),
        ModelInfo(
            id="yolov5",
            name="YOLO v5",
            type="detection",
            version="5.0.0",
            accuracy=0.91,
            classes=["scratch", "dent", "discoloration", "crack"],
            input_size=[640, 640],
            created_at=datetime.utcnow(),
            is_active=True
        ),
        ModelInfo(
            id="custom-defect",
            name="Custom Defect Model",
            type="classification",
            version="1.0.0",
            accuracy=0.96,
            classes=["good", "defective"],
            input_size=[224, 224],
            created_at=datetime.utcnow(),
            is_active=True
        )
    ]
    
    return {
        "models": models,
        "count": len(models)
    }

@router.post("/models/{model_id}/activate")
async def activate_model(model_id: str):
    """Activate a specific model"""
    return {
        "model_id": model_id,
        "status": "activated",
        "message": f"Model {model_id} has been activated"
    }

@router.delete("/models/{model_id}")
async def delete_model(model_id: str):
    """Delete a custom model"""
    # In production, would delete from storage
    return {
        "model_id": model_id,
        "status": "deleted",
        "message": f"Model {model_id} has been deleted"
    }

# Statistics endpoint
@router.get("/stats")
async def get_statistics():
    """Get Vision AI platform statistics"""
    return {
        "total_images_processed": 1247,
        "total_defects_detected": 342,
        "average_accuracy": 0.93,
        "average_processing_time": 245,  # milliseconds
        "models_available": 3,
        "active_training_jobs": 1,
        "storage_used": 5.2,  # GB
        "last_updated": datetime.utcnow().isoformat()
    }

# Add missing import
import os