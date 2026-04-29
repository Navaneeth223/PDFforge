from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from ..models.schemas import JobResponse
from ..services.storage import save_upload_file
from ..services.job_queue import process_rotate_job

router = APIRouter(tags=["Rotate"])

@router.post("/rotate", response_model=JobResponse)
async def rotate_pdf(
    file: UploadFile = File(...),
    angle: int = Form(90),          # 90 | 180 | 270
    pages: str = Form("all"),       # "all" or "1,3,5"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if angle not in (90, 180, 270):
        raise HTTPException(status_code=422, detail="angle must be 90, 180, or 270.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    process_rotate_job.delay(job_id, session_id, file_path, angle, pages)
    return JobResponse(job_id=job_id)
