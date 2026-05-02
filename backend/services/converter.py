"""
converter.py — Office/HTML/OCR conversions.
All heavy operations run as subprocesses or in threads.
"""
import os
import asyncio
import io
import uuid
import zipfile
from typing import Optional, List
from PIL import Image

from services.storage import get_output_path, get_session_dir


# ─── LibreOffice: Office → PDF ─────────────────────────────────────────────────

async def office_to_pdf(session_id: str, input_path: str) -> str:
    """Convert Office document to PDF using LibreOffice headless (async subprocess)."""
    session_dir = get_session_dir(session_id)
    proc = await asyncio.create_subprocess_exec(
        "libreoffice",
        "--headless",
        "--convert-to", "pdf",
        "--outdir", session_dir,
        input_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
    except asyncio.TimeoutError:
        proc.kill()
        raise RuntimeError("LibreOffice conversion timed out after 120 seconds.")

    if proc.returncode != 0:
        raise RuntimeError(f"LibreOffice failed: {stderr.decode()}")

    # LibreOffice names the output after the input stem
    stem = os.path.splitext(os.path.basename(input_path))[0]
    converted_path = os.path.join(session_dir, f"{stem}.pdf")
    if not os.path.exists(converted_path):
        raise RuntimeError("LibreOffice did not produce a PDF output.")

    # Rename to UUID
    final_path = get_output_path(session_id, ".pdf")
    os.rename(converted_path, final_path)
    return final_path


# ─── WeasyPrint: HTML → PDF ────────────────────────────────────────────────────

def html_to_pdf(session_id: str,
                html_content: Optional[str],
                url: Optional[str]) -> str:
    from weasyprint import HTML
    out_path = get_output_path(session_id, ".pdf")
    if url:
        HTML(url=url).write_pdf(out_path)
    elif html_content:
        HTML(string=html_content).write_pdf(out_path)
    else:
        raise ValueError("Either html_content or url must be provided.")
    return out_path


# ─── PDF → Word (python-docx) ──────────────────────────────────────────────────

def pdf_to_word(session_id: str, input_path: str) -> str:
    import fitz
    from docx import Document
    from docx.shared import Pt

    doc = fitz.open(input_path)
    word = Document()
    for i, page in enumerate(doc):
        if i > 0:
            word.add_page_break()
        word.add_heading(f"Page {i + 1}", level=2)
        blocks = page.get_text("blocks")
        for block in sorted(blocks, key=lambda b: (b[1], b[0])):
            txt = block[4].strip()
            if txt:
                para = word.add_paragraph(txt)
                para.runs[0].font.size = Pt(10) if para.runs else None

    out_path = get_output_path(session_id, ".docx")
    word.save(out_path)
    doc.close()
    return out_path


# ─── PDF → Excel (pdfplumber) ──────────────────────────────────────────────────

def pdf_to_excel(session_id: str, input_path: str) -> str:
    import pdfplumber
    from openpyxl import Workbook

    wb = Workbook()
    wb.remove(wb.active)  # Remove default sheet

    with pdfplumber.open(input_path) as pdf:
        for i, page in enumerate(pdf.pages):
            ws = wb.create_sheet(title=f"Page {i + 1}")
            tables = page.extract_tables()
            row_offset = 1
            if tables:
                for table in tables:
                    for row in table:
                        ws.append([cell or "" for cell in row])
                    row_offset += len(table) + 2
            else:
                # No tables — just dump raw text in column A
                text = page.extract_text() or ""
                for line in text.splitlines():
                    ws.append([line])

    out_path = get_output_path(session_id, ".xlsx")
    wb.save(out_path)
    return out_path


# ─── PDF → PowerPoint (python-pptx) ───────────────────────────────────────────

def pdf_to_ppt(session_id: str, input_path: str) -> str:
    import fitz
    from pptx import Presentation
    from pptx.util import Inches

    doc = fitz.open(input_path)
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]  # blank layout
    mat = fitz.Matrix(2, 2)  # 2x scaling for crisp slides

    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_buf = io.BytesIO(pix.tobytes("png"))
        slide = prs.slides.add_slide(blank_layout)
        slide.shapes.add_picture(img_buf, 0, 0,
                                  width=prs.slide_width,
                                  height=prs.slide_height)

    out_path = get_output_path(session_id, ".pptx")
    prs.save(out_path)
    doc.close()
    return out_path


# ─── OCR (pytesseract) ─────────────────────────────────────────────────────────

def ocr_pdf(session_id: str, input_path: str, language: str, dpi: int) -> str:
    """Render each PDF page to an image and run Tesseract OCR, producing a searchable PDF."""
    import fitz
    import pytesseract

    doc = fitz.open(input_path)
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    out_doc = fitz.open()

    for page in doc:
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension="pdf", lang=language)
        tmp = fitz.open("pdf", pdf_bytes)
        out_doc.insert_pdf(tmp)
        tmp.close()

    out_path = get_output_path(session_id, ".pdf")
    out_doc.save(out_path, garbage=4, deflate=True)
    out_doc.close()
    doc.close()
    return out_path
