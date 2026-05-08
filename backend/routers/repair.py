from fastapi import APIRouter, File, UploadFile, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_repair_job

router = APIRouter(tags=["Repair"])

@router.post("/repair", response_model=JobResponse)
async def repair_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_repair_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)
