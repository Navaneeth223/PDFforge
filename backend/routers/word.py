from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from typing import List, Optional
import uuid
from services.storage import save_upload_file
from services.job_queue import (
    process_word_to_pdf_job,
    process_word_to_html_job,
    process_word_to_text_job,
    process_merge_word_job,
    process_word_compress_job,
    process_word_unlock_job,
    submit_job
)

router = APIRouter(prefix="/word", tags=["Word Tools"])

@router.post("/to-pdf")
async def word_to_pdf(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_word_to_pdf_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/to-html")
async def word_to_html(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_word_to_html_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/to-text")
async def word_to_text(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_word_to_text_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/merge")
async def merge_word(
    files: List[UploadFile] = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    paths = []
    for file in files:
        paths.append(await save_upload_file(file, x_session_id))
    job_id = str(uuid.uuid4())
    submit_job(process_merge_word_job, job_id, x_session_id, paths)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/compress")
async def word_compress(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_word_compress_job, job_id, x_session_id, path)
    return {"job_id": job_id, "session_id": x_session_id}

@router.post("/unlock")
async def word_unlock(
    file: UploadFile = File(...),
    password: str = Form(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job_id = str(uuid.uuid4())
    submit_job(process_word_unlock_job, job_id, x_session_id, path, password)
    return {"job_id": job_id, "session_id": x_session_id}
