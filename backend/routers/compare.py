"""
compare.py — Visual diff between two PDFs (renders changed pages as highlighted images in a ZIP).
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_compare_job

router = APIRouter(tags=["Analyze"])


@router.post("/compare", response_model=JobResponse)
async def compare_pdfs(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
):
    for f in (file_a, file_b):
        if not f.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=422, detail=f"{f.filename}: only PDF files are accepted.")

    session_id = str(uuid.uuid4())
    path_a = await save_upload_file(file_a, session_id)
    path_b = await save_upload_file(file_b, session_id)
        job = process_compare_job.delay(str(uuid.uuid4()), session_id, path_a, path_b)
    return JobResponse(job_id=job.id)
