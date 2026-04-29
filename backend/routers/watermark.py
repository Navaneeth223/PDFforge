from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import uuid
from ..models.schemas import JobResponse
from ..services.storage import save_upload_file
from ..services.job_queue import process_watermark_job

router = APIRouter(tags=["Watermark"])

@router.post("/watermark", response_model=JobResponse)
async def add_watermark(
    file: UploadFile = File(...),
    watermark_type: str = Form("text"),        # "text" | "image"
    text: Optional[str] = Form(None),
    watermark_image: Optional[UploadFile] = File(None),
    opacity: float = Form(0.3),
    angle: float = Form(45.0),
    position: str = Form("center"),            # "center" | "tile" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
    font_size: int = Form(48),
    color: str = Form("#808080"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if watermark_type == "text" and not text:
        raise HTTPException(status_code=422, detail="text is required for text watermark.")
    if not (0.0 <= opacity <= 1.0):
        raise HTTPException(status_code=422, detail="opacity must be between 0.0 and 1.0.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    wm_image_path = None
    if watermark_image:
        wm_image_path = await save_upload_file(watermark_image, session_id)

    job_id = str(uuid.uuid4())
    process_watermark_job.delay(
        job_id, session_id, file_path,
        watermark_type, text, wm_image_path,
        opacity, angle, position, font_size, color
    )
    return JobResponse(job_id=job_id)
