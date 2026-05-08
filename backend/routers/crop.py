"""
crop.py — Crop PDF page margins.
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_crop_job

router = APIRouter(tags=["Edit"])


@router.post("/crop", response_model=JobResponse)
async def crop_pdf(
    file: UploadFile = File(...),
    top: float = Form(0),
    right: float = Form(0),
    bottom: float = Form(0),
    left: float = Form(0),
    pages: str = Form("all"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if any(v < 0 for v in (top, right, bottom, left)):
        raise HTTPException(status_code=422, detail="Crop margins must be >= 0.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_crop_job.delay(str(uuid.uuid4()), session_id, file_path, top, right, bottom, left, pages)
    return JobResponse(job_id=job.id)
