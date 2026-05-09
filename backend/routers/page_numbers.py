from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import fitz
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import add_page_numbers

router = APIRouter()

@router.post("/page-numbers")
async def add_page_numbers_direct(
    file: UploadFile = File(...),
    h_align: str = Form("center"),
    v_align: str = Form("footer"),
    start_number: int = Form(1),
    font_size: int = Form(12),
    prefix: str = Form(""),
    suffix: str = Form(""),
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)

    try:
        out = add_page_numbers(session_id, input_path, h_align, v_align, start_number, font_size, prefix, suffix)
        return FileResponse(
            path=out,
            filename=f"numbered_{file.filename}",
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=numbered_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add page numbers: {str(e)}")
