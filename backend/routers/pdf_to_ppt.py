"""
pdf_to_ppt.py — Convert PDF pages to PowerPoint slides (each page = one image slide).
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_pdf_to_ppt_job

router = APIRouter(tags=["Convert"])


@router.post("/pdf-to-ppt", response_model=JobResponse)
async def pdf_to_ppt(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job = process_pdf_to_ppt_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)
