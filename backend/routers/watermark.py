from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import add_watermark

router = APIRouter()

@router.post("/watermark")
async def watermark_pdf_direct(
    file: UploadFile = File(...),
    watermark_type: str = Form("text"), # "text" | "image"
    text: Optional[str] = Form(None),
    opacity: float = Form(0.5),
    angle: float = Form(45.0),
    position: str = Form("center"),
    font_size: int = Form(50),
    color: str = Form("#888888"),
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)

    try:
        out = add_watermark(
            session_id, input_path, watermark_type, text, 
            None, opacity, angle, position, font_size, color
        )
        return FileResponse(
            path=out,
            filename=f"watermarked_{file.filename}",
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=watermarked_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Watermark failed: {str(e)}")
