from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import split_pdf

router = APIRouter()

@router.post("/split")
async def split_pdf_direct(
    file: UploadFile = File(...),
    mode: str = Form(...),            # "ranges" | "every_n" | "pages"
    ranges: str = Form(None),         # e.g. "1-3,5,7-9"
    every_n: int = Form(None),
    pages: str = Form(None),          # e.g. "1,3,5"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    
    session_id = str(uuid.uuid4())
    file_path = await save_upload_file(file, session_id)
    
    try:
        out = split_pdf(session_id, file_path, mode, ranges, every_n, pages)
        # Note: split_pdf might return a .zip if multiple files are generated
        extension = ".zip" if out.endswith(".zip") else ".pdf"
        filename = f"split_document{extension}"
        
        return FileResponse(
            path=out,
            filename=filename,
            media_type="application/zip" if extension == ".zip" else "application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")
