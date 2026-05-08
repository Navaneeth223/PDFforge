from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from typing import List, Optional
import uuid
from services.storage import save_upload_file
from services.job_queue import (
    process_ppt_to_pdf_job,
    process_ppt_to_images_job,
    process_merge_ppt_job
)

router = APIRouter(prefix="/ppt", tags=["PowerPoint Tools"])

@router.post("/to-pdf")
async def ppt_to_pdf(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job = process_ppt_to_pdf_job.delay(str(uuid.uuid4()), x_session_id, path)
    return {"job_id": job.id, "session_id": x_session_id}

@router.post("/to-images")
async def ppt_to_images(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job = process_ppt_to_images_job.delay(str(uuid.uuid4()), x_session_id, path)
    return {"job_id": job.id, "session_id": x_session_id}

@router.post("/merge")
async def merge_ppt(
    files: List[UploadFile] = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    paths = []
    for file in files:
        paths.append(await save_upload_file(file, x_session_id))
    job = process_merge_ppt_job.delay(str(uuid.uuid4()), x_session_id, paths)
    return {"job_id": job.id, "session_id": x_session_id}
