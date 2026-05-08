"""
number_pages.py — Add page numbers to every page of a PDF.
"""
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_number_pages_job

router = APIRouter(tags=["Edit"])


@router.post("/number-pages", response_model=JobResponse)
async def number_pages(
    file: UploadFile = File(...),
    h_align: str = Form("center"),       # left | center | right
    v_align: str = Form("footer"),       # header | footer
    start_number: int = Form(1),
    font_size: int = Form(12),
    prefix: str = Form(""),
    suffix: str = Form(""),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if h_align not in ("left", "center", "right"):
        raise HTTPException(status_code=422, detail="h_align must be left, center, or right.")
    if v_align not in ("header", "footer"):
        raise HTTPException(status_code=422, detail="v_align must be header or footer.")
    if start_number < 1:
        raise HTTPException(status_code=422, detail="start_number must be >= 1.")
    if not (6 <= font_size <= 48):
        raise HTTPException(status_code=422, detail="font_size must be between 6 and 48.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    process_number_pages_job.delay(
        job_id, session_id, file_path,
        h_align, v_align, start_number, font_size, prefix, suffix
    )
    return JobResponse(job_id=job.id)
