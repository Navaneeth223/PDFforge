from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_ocr_job

router = APIRouter(tags=["OCR"])

@router.post("/ocr", response_model=JobResponse)
async def ocr_pdf(
    file: UploadFile = File(...),
    language: str = Form("eng"),   # tesseract lang codes e.g. "eng", "deu", "fra"
    dpi: int = Form(300),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if dpi not in (72, 150, 300, 600):
        raise HTTPException(status_code=422, detail="dpi must be one of 72, 150, 300, 600.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    job = process_ocr_job.delay(str(uuid.uuid4()), session_id, file_path, language, dpi)
    return JobResponse(job_id=job.id)
