from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from ..models.schemas import JobResponse
from ..services.storage import save_upload_file
from ..services.job_queue import process_unlock_job

router = APIRouter(tags=["Unlock"])

@router.post("/unlock", response_model=JobResponse)
async def unlock_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    process_unlock_job.delay(job_id, session_id, file_path, password)
    return JobResponse(job_id=job_id)
