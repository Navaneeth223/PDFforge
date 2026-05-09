from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from typing import List
import uuid
import os
from config import settings
from services.storage import save_upload_file
from services.pdf_engine import merge_pdfs

router = APIRouter()

@router.post("/merge")
async def merge_pdfs_direct(
    files: List[UploadFile] = File(...),
):
    if len(files) < 2:
        raise HTTPException(status_code=422, detail="At least 2 files are required for merging.")
    
    session_id = str(uuid.uuid4())
    saved_files = []
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=422, detail=f"File {file.filename} is not a PDF.")
        file_path = await save_upload_file(file, session_id)
        saved_files.append(file_path)
    
    try:
        out = merge_pdfs(session_id, saved_files)
        return FileResponse(
            path=out,
            filename="merged_document.pdf",
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")
