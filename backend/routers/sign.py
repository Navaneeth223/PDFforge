from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import process_sign_job

router = APIRouter(tags=["Sign"])

@router.post("/sign", response_model=JobResponse)
async def sign_pdf(
    file: UploadFile = File(...),
    sign_type: str = Form(...),             # "draw" | "type" | "image"
    signature_image: Optional[UploadFile] = File(None),
    typed_text: Optional[str] = Form(None),
    page_number: int = Form(1),
    x: float = Form(100.0),
    y: float = Form(700.0),
    width: float = Form(200.0),
    height: float = Form(80.0),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if sign_type not in ("draw", "type", "image"):
        raise HTTPException(status_code=422, detail="sign_type must be 'draw', 'type', or 'image'.")
    if sign_type == "type" and not typed_text:
        raise HTTPException(status_code=422, detail="typed_text is required for type signature.")
    if sign_type in ("draw", "image") and not signature_image:
        raise HTTPException(status_code=422, detail="signature_image is required for draw/image signature.")

    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    sig_path = None
    if signature_image:
        sig_path = await save_upload_file(signature_image, session_id)

    job_id = str(uuid.uuid4())
    process_sign_job.delay(
        job_id, session_id, file_path,
        sign_type, sig_path, typed_text,
        page_number, x, y, width, height
    )
    return JobResponse(job_id=job_id)
