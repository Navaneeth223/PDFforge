from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from typing import List, Dict, Any
import uuid
from services.storage import save_upload_file
from services.editor_service import import_pdf_to_editor, export_editor_pdf

router = APIRouter(prefix="/editor", tags=["Editor"])

@router.post("/import-pdf")
async def editor_import_pdf(
    file: UploadFile = File(...),
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    path = await save_upload_file(file, x_session_id)
    pages = import_pdf_to_editor(x_session_id, path)
    return {"pages": pages, "session_id": x_session_id}

@router.post("/export-pdf")
async def editor_export_pdf(
    data: Dict[str, Any],
    x_session_id: str = Header(default_factory=lambda: str(uuid.uuid4()))
):
    # This is a synchronous heavy task, but for now we'll run it directly
    # In production, this should be a Celery job.
    pages = data.get("pages", [])
    path = export_editor_pdf(x_session_id, pages)
    # We return the download link directly or a job_id?
    # For editor export, direct download might be better if it's fast enough.
    # But let's follow the job pattern for consistency.
    from services.job_queue import process_editor_export_job, submit_job
    job_id = str(uuid.uuid4())
    submit_job(process_editor_export_job, job_id, x_session_id, pages)
    return {"job_id": job_id, "session_id": x_session_id}
