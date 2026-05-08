from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, List
import uuid
from models.schemas import JobResponse
from services.storage import save_upload_file
from services.job_queue import (
    process_pdf_to_images_job,
    process_pdf_to_word_job,
    process_pdf_to_excel_job,
    process_pdf_to_text_job,
    process_office_to_pdf_job,
    process_images_to_pdf_job,
    process_html_to_pdf_job,
)

router = APIRouter(tags=["Convert"])

OFFICE_EXTENSIONS = (".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".epub")

@router.post("/pdf-to-images", response_model=JobResponse)
async def pdf_to_images(
    file: UploadFile = File(...),
    dpi: int = Form(150),
    format: str = Form("jpeg"),   # "jpeg" | "png"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if dpi not in (72, 150, 300):
        raise HTTPException(status_code=422, detail="dpi must be 72, 150, or 300.")
    if format not in ("jpeg", "png"):
        raise HTTPException(status_code=422, detail="format must be 'jpeg' or 'png'.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_pdf_to_images_job.delay(str(uuid.uuid4()), session_id, file_path, dpi, format)
    return JobResponse(job_id=job.id)


@router.post("/pdf-to-word", response_model=JobResponse)
async def pdf_to_word(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_pdf_to_word_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)


@router.post("/pdf-to-excel", response_model=JobResponse)
async def pdf_to_excel(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_pdf_to_excel_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)


@router.post("/pdf-to-text", response_model=JobResponse)
async def pdf_to_text(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_pdf_to_text_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)


@router.post("/office-to-pdf", response_model=JobResponse)
async def office_to_pdf(file: UploadFile = File(...)):
    name_lower = file.filename.lower()
    if not any(name_lower.endswith(ext) for ext in OFFICE_EXTENSIONS):
        raise HTTPException(
            status_code=422,
            detail=f"Supported formats: {', '.join(OFFICE_EXTENSIONS)}"
        )
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
        job = process_office_to_pdf_job.delay(str(uuid.uuid4()), session_id, file_path)
    return JobResponse(job_id=job.id)


@router.post("/images-to-pdf", response_model=JobResponse)
async def images_to_pdf(
    files: List[UploadFile] = File(...),
    layout: str = Form("fit"),     # "fit" | "fill" | "original"
    page_size: str = Form("A4"),
):
    for f in files:
        if not any(f.filename.lower().endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp")):
            raise HTTPException(status_code=422, detail=f"{f.filename} is not a valid image file.")
    session_id = str(uuid.uuid4())
    saved = []
    for f in files:
        saved.append(await save_upload_file(f, session_id))
        job = process_images_to_pdf_job.delay(str(uuid.uuid4()), session_id, saved, layout, page_size)
    return JobResponse(job_id=job.id)


@router.post("/html-to-pdf", response_model=JobResponse)
async def html_to_pdf(
    html_content: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
):
    if not html_content and not url:
        raise HTTPException(status_code=422, detail="Provide either html_content or url.")
    session_id = str(uuid.uuid4())
        job = process_html_to_pdf_job.delay(str(uuid.uuid4()), session_id, html_content, url)
    return JobResponse(job_id=job.id)
