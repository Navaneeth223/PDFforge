from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import protect_pdf

router = APIRouter()

@router.post("/protect")
async def protect_pdf_direct(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)

    try:
        out = protect_pdf(session_id, input_path, password, password, True, True, True, True)
        return FileResponse(
            path=out,
            filename=f"protected_{file.filename}",
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=protected_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Protect failed: {str(e)}")
