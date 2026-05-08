from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_compress_job

router = APIRouter(tags=["Compress"])

@router.post("/compress", response_model=JobResponse)
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("medium"),   # "low" | "medium" | "high"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if level not in ("low", "medium", "high"):
        raise HTTPException(status_code=422, detail="level must be 'low', 'medium', or 'high'.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_compress_job.delay(str(uuid.uuid4()), session_id, file_path, level)
    return JobResponse(job_id=job.id)
