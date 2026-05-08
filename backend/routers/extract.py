from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_extract_pages_job, process_extract_images_job

router = APIRouter(tags=["Extract"])

@router.post("/extract-pages", response_model=JobResponse)
async def extract_pages(
    file: UploadFile = File(...),
    pages: str = Form(...),   # e.g. "1,3,5-8"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_extract_pages_job.delay(str(uuid.uuid4()), session_id, file_path, pages)
    return JobResponse(job_id=job.id)


@router.post("/extract-images", response_model=JobResponse)
async def extract_images(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_extract_images_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)
