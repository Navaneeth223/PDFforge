from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
import uuid
import os
from config import settings
from services.storage import save_upload_file, get_output_path
from services.pdf_engine import compress_pdf

router = APIRouter()

@router.post("/compress")
async def compress_pdf_direct(
    file: UploadFile = File(...),
    level: str = Form("medium"),   # "low" | "medium" | "high"
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")
    if level not in ("low", "medium", "high"):
        raise HTTPException(status_code=422, detail="level must be 'low', 'medium', or 'high'.")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)
    
    try:
        # Run synchronous compression directly in the endpoint
        result = compress_pdf(session_id, input_path, level)
        output_path = result["output_path"]
        
        return FileResponse(
            path=output_path,
            filename=f"compressed_{file.filename}",
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=compressed_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")
