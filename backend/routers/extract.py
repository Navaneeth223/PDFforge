from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import extract_pages

router = APIRouter()

@router.post("/extract-pages")
async def extract_pages_direct(
    file: UploadFile = File(...),
    pages: str = Form(...), # e.g. "1,3,5"
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)

    try:
        out = extract_pages(session_id, input_path, pages)
        return FileResponse(
            path=out,
            filename=f"extracted_{file.filename}",
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=extracted_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
