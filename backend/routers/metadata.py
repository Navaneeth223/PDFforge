from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import uuid
from ..models.schemas import JobResponse, GenericResponse
from ..services.storage import save_upload_file
from ..services.job_queue import process_metadata_job
from ..services.pdf_engine import read_metadata

router = APIRouter(tags=["Metadata"])

@router.post("/metadata/read", response_model=GenericResponse)
async def read_pdf_metadata(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    import asyncio
    meta = await asyncio.to_thread(read_metadata, file_path)
    return GenericResponse(data=meta)


@router.post("/metadata/write", response_model=JobResponse)
async def write_pdf_metadata(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    keywords: Optional[str] = Form(None),
    creator: Optional[str] = Form(None),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job_id = str(uuid.uuid4())
    process_metadata_job.delay(job_id, session_id, file_path, title, author, subject, keywords, creator)
    return JobResponse(job_id=job_id)
