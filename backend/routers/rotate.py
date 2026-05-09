from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import fitz  # PyMuPDF
import uuid
import os
from config import settings
from services.storage import save_upload_file

router = APIRouter()

@router.post("/rotate")
async def rotate_pdf(
    file: UploadFile = File(...),
    angle: int = Form(...),       # 90, 180, or 270
    pages: str = Form("all"),     # "all" or "1,3,5" or "1-5"
):
    # Validate
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF")
    if angle not in [90, 180, 270, -90, -180, -270]:
        raise HTTPException(status_code=422, detail="Angle must be 90, 180, or 270")

    session_id = str(uuid.uuid4())
    input_path = await save_upload_file(file, session_id)
    output_path = os.path.join(os.path.dirname(input_path), f"rotated_{uuid.uuid4()}.pdf")

    # Parse page selection
    target_pages = _parse_pages(pages)

    # Rotate with PyMuPDF
    try:
        doc = fitz.open(input_path)
        total_pages = len(doc)

        for page_num in range(total_pages):
            if target_pages == "all" or (page_num + 1) in target_pages:
                page = doc[page_num]
                page.set_rotation((page.rotation + angle) % 360)

        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rotate PDF: {str(e)}")

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=f"rotated_{file.filename}",
        headers={"Content-Disposition": f"attachment; filename=rotated_{file.filename}"}
    )

def _parse_pages(pages_str: str):
    """Parse '1,3,5-8' into a set of page numbers. Returns 'all' if input is 'all'."""
    if not pages_str or pages_str.strip().lower() == "all":
        return "all"
    result = set()
    try:
        for part in pages_str.split(","):
            part = part.strip()
            if "-" in part:
                start, end = part.split("-", 1)
                result.update(range(int(start), int(end) + 1))
            else:
                result.add(int(part))
        return result
    except:
        return "all"
