from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import uuid
from ..models.schemas import JobResponse
from ..services.storage import save_upload_file
from ..services.job_queue import process_redact_job

router = APIRouter(tags=["Redact"])

@router.post("/redact", response_model=JobResponse)
async def redact_pdf(
    file: UploadFile = File(...),
    search_terms: Optional[str] = Form(None),   # comma-separated terms to auto-redact
    case_sensitive: bool = Form(False),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    terms_list = [t.strip() for t in search_terms.split(",")] if search_terms else []
    process_redact_job.delay(job_id, session_id, file_path, terms_list, case_sensitive)
    return JobResponse(job_id=job_id)
