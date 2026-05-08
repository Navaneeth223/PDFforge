from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_protect_job

router = APIRouter(tags=["Protect"])

@router.post("/protect", response_model=JobResponse)
async def protect_pdf(
    file: UploadFile = File(...),
    user_password: str = Form(...),
    owner_password: Optional[str] = Form(None),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(True),
    allow_edit: bool = Form(False),
    allow_annotate: bool = Form(False),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    process_protect_job.delay(
        job_id, session_id, file_path,
        user_password, owner_password or user_password,
        allow_print, allow_copy, allow_edit, allow_annotate
    )
    return JobResponse(job_id=job.id)
