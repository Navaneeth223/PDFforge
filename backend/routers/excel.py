from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from typing import List, Optional
import uuid
from services.storage import save_upload_file
from services.job_queue import (
    process_excel_to_pdf_job,
    process_excel_to_csv_job,
    process_excel_to_json_job,
    process_merge_excel_job
)

router = APIRouter(prefix="/excel", tags=["Excel Tools"])

@router.post("/to-pdf")
async def excel_to_pdf(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job = process_excel_to_pdf_job.delay(str(uuid.uuid4()), x_session_id, path)
    return {"job_id": job.id, "session_id": x_session_id}

@router.post("/to-csv")
async def excel_to_csv(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job = process_excel_to_csv_job.delay(str(uuid.uuid4()), x_session_id, path)
    return {"job_id": job.id, "session_id": x_session_id}

@router.post("/to-json")
async def excel_to_json(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    job = process_excel_to_json_job.delay(str(uuid.uuid4()), x_session_id, path)
    return {"job_id": job.id, "session_id": x_session_id}

@router.post("/merge")
async def merge_excel(
    files: List[UploadFile] = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    paths = []
    for file in files:
        paths.append(await save_upload_file(file, x_session_id))
    job = process_merge_excel_job.delay(str(uuid.uuid4()), x_session_id, paths)
    return {"job_id": job.id, "session_id": x_session_id}
