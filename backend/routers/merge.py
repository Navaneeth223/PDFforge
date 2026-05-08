from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Form, HTTPException
from typing import List
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_merge_job

router = APIRouter(tags=["Merge"])

@router.post("/merge", response_model=JobResponse)
async def merge_pdfs(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None
):
    if len(files) < 2:
        raise HTTPException(status_code=422, detail="At least 2 files are required for merging.")
    
    session_id = str(uuid.uuid4())
    saved_files = []
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=422, detail=f"File {file.filename} is not a PDF.")
        file_path = await save_upload_file(file, session_id)
        saved_files.append(file_path)
    
    # Fire and forget job
    job = process_merge_job.delay(str(uuid.uuid4()), session_id, saved_files)
    
    return JobResponse(job_id=job.id)
