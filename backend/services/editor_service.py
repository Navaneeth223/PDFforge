import os
import io
import fitz
import base64
from PIL import Image
from typing import List, Dict, Any
from services.storage import get_output_path, get_session_dir

def import_pdf_to_editor(session_id: str, file_path: str) -> List[Dict[str, Any]]:
    """Render each PDF page to high-res PNG for canvas background."""
    doc = fitz.open(file_path)
    pages = []
    mat = fitz.Matrix(2, 2)  # High res
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_bytes = pix.tobytes("png")
        base64_img = base64.b64encode(img_bytes).decode("utf-8")
        pages.append({
            "imageBase64": f"data:image/png;base64,{base64_img}",
            "width": pix.width,
            "height": pix.height,
            "pageNumber": i + 1
        })
    doc.close()
    return pages

def export_editor_pdf(session_id: str, pages_data: List[Dict[str, Any]]) -> str:
    """Flatten canvas elements (passed as images or commands) onto the PDF.
    
    This is a complex operation. A simplified approach:
    The frontend sends the full canvas as a high-res image per page.
    We merge these images into a single PDF.
    """
    output_path = get_output_path(session_id, ".pdf")
    doc = fitz.open()
    for pg in pages_data:
        # elements_img is a base64 encoded high-res image of the entire edited page
        img_data = pg.get("fullPageImage")
        if img_data:
            img_bytes = base64.b64decode(img_data.split(",")[1])
            img = Image.open(io.BytesIO(img_bytes))
            # Create a new PDF page with the image
            # PIL.save() returns None — must write into a named buffer and read it back
            buf = io.BytesIO()
            img.convert("RGB").save(buf, format="PDF", resolution=150)
            pdf_bytes = buf.getvalue()
            # fitz can open from memory
            img_doc = fitz.open("pdf", pdf_bytes)
            doc.insert_pdf(img_doc)
            img_doc.close()
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    return output_path
