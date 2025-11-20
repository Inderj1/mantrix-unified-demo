"""
Excel AI Processor API Routes
Handles Excel file processing with AI-powered templates
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import sys
from datetime import datetime
import traceback

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from src.cgs_generator import FinalHybridCGSGenerator

router = APIRouter()

# Store for processing status
processing_status: Dict[str, Dict[str, Any]] = {}


class ProcessingRequest(BaseModel):
    template_id: str
    template_name: str
    output_format: str = "enhanced_excel"


class ProcessingStatus(BaseModel):
    status: str  # "pending", "processing", "completed", "error"
    message: str
    progress: int  # 0-100
    output_file: Optional[str] = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


@router.post("/api/v1/excel/process/financial-analysis")
async def process_financial_analysis(background_tasks: BackgroundTasks):
    """
    Process Financial Analysis CGS Generation
    This is a long-running task that generates CGS reports
    """
    try:
        # Generate a unique job ID
        job_id = f"cgs_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Initialize status
        processing_status[job_id] = {
            "status": "pending",
            "message": "Job queued for processing",
            "progress": 0,
            "started_at": datetime.now().isoformat()
        }

        # Add to background tasks
        background_tasks.add_task(run_cgs_generator, job_id)

        return {
            "success": True,
            "job_id": job_id,
            "message": "Financial Analysis processing started",
            "status_endpoint": f"/api/v1/excel/status/{job_id}"
        }

    except Exception as e:
        print(f"Error starting CGS generation: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def run_cgs_generator(job_id: str):
    """
    Background task to run the CGS generator
    """
    try:
        # Update status to processing
        processing_status[job_id]["status"] = "processing"
        processing_status[job_id]["message"] = "Loading source files..."
        processing_status[job_id]["progress"] = 10

        # Get the project root directory
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
        project_root = os.path.dirname(backend_dir)

        # Initialize generator
        generator = FinalHybridCGSGenerator(base_path=project_root)

        # Update progress
        processing_status[job_id]["message"] = "Generating CGS report..."
        processing_status[job_id]["progress"] = 30

        # Run the generator
        result_df, output_file = generator.generate(output_dir='output')

        # Update status to completed
        processing_status[job_id]["status"] = "completed"
        processing_status[job_id]["message"] = "CGS report generated successfully"
        processing_status[job_id]["progress"] = 100
        processing_status[job_id]["output_file"] = output_file
        processing_status[job_id]["completed_at"] = datetime.now().isoformat()
        processing_status[job_id]["row_count"] = len(result_df)

    except Exception as e:
        # Update status to error
        processing_status[job_id]["status"] = "error"
        processing_status[job_id]["message"] = f"Error: {str(e)}"
        processing_status[job_id]["error"] = traceback.format_exc()
        processing_status[job_id]["completed_at"] = datetime.now().isoformat()
        print(f"Error in CGS generation: {str(e)}")
        traceback.print_exc()


@router.get("/api/v1/excel/status/{job_id}")
async def get_processing_status(job_id: str):
    """
    Get the status of a processing job
    """
    if job_id not in processing_status:
        raise HTTPException(status_code=404, detail="Job not found")

    status = processing_status[job_id].copy()

    # Add download URLs if completed
    if status.get("status") == "completed" and status.get("output_file"):
        output_file = status["output_file"]
        filename = os.path.basename(output_file)
        status["download_url"] = f"/api/v1/excel/download/{job_id}"
        status["static_url"] = f"/output/{filename}"
        status["filename"] = filename

    return {
        "success": True,
        "job_id": job_id,
        **status
    }


@router.get("/api/v1/excel/download/{job_id}")
async def download_output(job_id: str):
    """
    Download the generated output file
    """
    if job_id not in processing_status:
        raise HTTPException(status_code=404, detail="Job not found")

    status = processing_status[job_id]

    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")

    output_file = status.get("output_file")
    if not output_file or not os.path.exists(output_file):
        raise HTTPException(status_code=404, detail="Output file not found")

    # Return the file for download
    return FileResponse(
        path=output_file,
        filename=os.path.basename(output_file),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.get("/api/v1/excel/jobs")
async def list_jobs():
    """
    List all processing jobs
    """
    jobs = []
    for job_id, status in processing_status.items():
        jobs.append({
            "job_id": job_id,
            "status": status["status"],
            "message": status["message"],
            "progress": status["progress"],
            "started_at": status.get("started_at"),
            "completed_at": status.get("completed_at")
        })

    return {
        "success": True,
        "jobs": sorted(jobs, key=lambda x: x.get("started_at", ""), reverse=True)
    }


@router.delete("/api/v1/excel/job/{job_id}")
async def delete_job(job_id: str):
    """
    Delete a processing job and its output file
    """
    if job_id not in processing_status:
        raise HTTPException(status_code=404, detail="Job not found")

    status = processing_status[job_id]

    # Delete output file if exists
    output_file = status.get("output_file")
    if output_file and os.path.exists(output_file):
        try:
            os.remove(output_file)
        except Exception as e:
            print(f"Error deleting output file: {str(e)}")

    # Remove from status
    del processing_status[job_id]

    return {
        "success": True,
        "message": "Job deleted successfully"
    }


@router.get("/api/v1/excel/templates")
async def list_templates():
    """
    List available Excel processing templates
    """
    templates = [
        {
            "id": "financial-analysis-cgs",
            "name": "Financial Analysis CGS Generator",
            "description": "Hybrid CGS generator with historical costs and distributor mapping",
            "category": "Financial Analysis",
            "input_files_required": [
                "Invoice Data",
                "Manufacturing Std Cost",
                "Item Data File",
                "MSR 2025 Data",
                "Original CGS"
            ],
            "output_format": "Excel with Summary and Data sheets",
            "features": [
                "Distributor mapping from multiple sources",
                "Historical cost tracking",
                "Financial metrics calculation",
                "Formatted Excel output with grouping",
                "Grand totals with formulas"
            ]
        }
    ]

    return {
        "success": True,
        "templates": templates
    }
