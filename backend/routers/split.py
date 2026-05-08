from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_split_job

router = APIRouter(tags=["Split"])

@router.post("/split", response_model=JobResponse)
async def split_pdf(
    file: UploadFile = File(...),
    mode: str = Form(...),            # "ranges" | "every_n" | "pages"
    ranges: str = Form(None),         # e.g. "1-3,5,7-9"
    every_n: int = Form(None),
    pages: str = Form(None),          # e.g. "1,3,5"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if mode not in ("ranges", "every_n", "pages"):
        raise HTTPException(status_code=422, detail="mode must be 'ranges', 'every_n', or 'pages'.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_split_job.delay(str(uuid.uuid4()), session_id, file_path, mode, ranges, every_n, pages)
    return JobResponse(job_id=job.id)
