from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from typing import List, Optional
import uuid
from services.storage import save_upload_file
from services.job_queue import (
    process_images_to_pdf_direct_job,
    process_image_compress_job,
    process_image_convert_job,
    process_image_resize_job,
    process_remove_bg_job,
    submit_job
)

router = APIRouter(prefix="/image", tags=["Image Tools"])

@router.post("/to-pdf")
async def images_to_pdf(
    files: List[UploadFile] = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    paths = []
    for file in files:
        paths.append(await save_upload_file(file, x_session_id))
    job_id = str(uuid.uuid4())
    submit_job(process_images_to_pdf_direct_job, job_id, x_session_id, paths)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/compress")
async def image_compress(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_image_compress_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/convert")
async def image_convert(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_image_convert_job, job_id, x_session_id, path, target_format)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/resize")
async def image_resize(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_image_resize_job, job_id, x_session_id, path, width, height)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/remove-bg")
async def remove_bg(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_remove_bg_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}
