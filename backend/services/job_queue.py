"""
job_queue.py — Celery task definitions for all PDF operations.
All tasks call synchronous engine/converter functions via asyncio.to_thread()
or directly (Celery workers run in separate processes, blocking is acceptable).
"""
import asyncio
from typing import List, Optional, Dict, Any
from celery import Celery
from ..config import settings

celery_app = Celery(
    "pdfforge_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=3600,  # results expire after 1 hour
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)


def _update(task, state: str, meta: Dict[str, Any]):
    task.update_state(state=state, meta=meta)


def get_job_status(job_id: str) -> Dict[str, Any]:
    """Query Celery backend for the status of a job."""
    from celery.result import AsyncResult
    result = AsyncResult(job_id, app=celery_app)
    if result.state == "PENDING":
        return {"state": "PENDING", "progress": 0, "message": "Job queued…"}
    elif result.state == "PROGRESS":
        return result.info or {"state": "PROGRESS", "progress": 0, "message": "Processing…"}
    elif result.state == "SUCCESS":
        info = result.info or {}
        return {"state": "SUCCESS", "progress": 100, "output_path": info.get("output_path"), **info}
    elif result.state == "FAILURE":
        return {"state": "FAILURE", "progress": 0, "message": str(result.info)}
    return {"state": result.state, "progress": 0, "message": ""}


# ─── Merge ────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.merge")
def process_merge_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from .pdf_engine import merge_pdfs
    _update(self, "PROGRESS", {"progress": 10, "message": "Merging PDFs…"})
    out = merge_pdfs(session_id, file_paths)
    return {"output_path": out, "progress": 100}


# ─── Split ────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.split")
def process_split_job(self, job_id: str, session_id: str, file_path: str,
                      mode: str, ranges: Optional[str], every_n: Optional[int],
                      pages: Optional[str]):
    from .pdf_engine import split_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Splitting PDF…"})
    out = split_pdf(session_id, file_path, mode, ranges, every_n, pages)
    return {"output_path": out, "progress": 100}


# ─── Compress ─────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.compress")
def process_compress_job(self, job_id: str, session_id: str,
                          file_path: str, level: str):
    from .pdf_engine import compress_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": f"Compressing ({level} mode)…"})
    result = compress_pdf(session_id, file_path, level)
    return {**result, "progress": 100}


# ─── Rotate ───────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.rotate")
def process_rotate_job(self, job_id: str, session_id: str,
                        file_path: str, angle: int, pages: str):
    from .pdf_engine import rotate_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": f"Rotating pages by {angle}°…"})
    out = rotate_pdf(session_id, file_path, angle, pages)
    return {"output_path": out, "progress": 100}


# ─── Extract Pages ────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.extract_pages")
def process_extract_pages_job(self, job_id: str, session_id: str,
                               file_path: str, pages: str):
    from .pdf_engine import extract_pages
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting pages…"})
    out = extract_pages(session_id, file_path, pages)
    return {"output_path": out, "progress": 100}


# ─── Extract Images ───────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.extract_images")
def process_extract_images_job(self, job_id: str, session_id: str, file_path: str):
    from .pdf_engine import extract_images
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting embedded images…"})
    out = extract_images(session_id, file_path)
    return {"output_path": out, "progress": 100}


# ─── Watermark ────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.watermark")
def process_watermark_job(self, job_id: str, session_id: str, file_path: str,
                           watermark_type: str, text: Optional[str],
                           wm_image_path: Optional[str], opacity: float,
                           angle: float, position: str, font_size: int, color: str):
    from .pdf_engine import add_watermark
    _update(self, "PROGRESS", {"progress": 20, "message": "Applying watermark…"})
    out = add_watermark(session_id, file_path, watermark_type, text,
                        wm_image_path, opacity, angle, position, font_size, color)
    return {"output_path": out, "progress": 100}


# ─── Protect ──────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.protect")
def process_protect_job(self, job_id: str, session_id: str, file_path: str,
                         user_password: str, owner_password: str,
                         allow_print: bool, allow_copy: bool,
                         allow_edit: bool, allow_annotate: bool):
    from .pdf_engine import protect_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Encrypting PDF…"})
    out = protect_pdf(session_id, file_path, user_password, owner_password,
                      allow_print, allow_copy, allow_edit, allow_annotate)
    return {"output_path": out, "progress": 100}


# ─── Unlock ───────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.unlock")
def process_unlock_job(self, job_id: str, session_id: str,
                        file_path: str, password: str):
    from .pdf_engine import unlock_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Removing password…"})
    out = unlock_pdf(session_id, file_path, password)
    return {"output_path": out, "progress": 100}


# ─── OCR ──────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.ocr")
def process_ocr_job(self, job_id: str, session_id: str,
                     file_path: str, language: str, dpi: int):
    from .converter import ocr_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering pages for OCR…"})
    out = ocr_pdf(session_id, file_path, language, dpi)
    return {"output_path": out, "progress": 100}


# ─── Convert: PDF → Images ────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.pdf_to_images")
def process_pdf_to_images_job(self, job_id: str, session_id: str,
                                file_path: str, dpi: int, fmt: str):
    from .pdf_engine import pdf_to_images
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting pages to images…"})
    out = pdf_to_images(session_id, file_path, dpi, fmt)
    return {"output_path": out, "progress": 100}


# ─── Convert: PDF → Word ──────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.pdf_to_word")
def process_pdf_to_word_job(self, job_id: str, session_id: str, file_path: str):
    from .converter import pdf_to_word
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting text to Word…"})
    out = pdf_to_word(session_id, file_path)
    return {"output_path": out, "progress": 100}


# ─── Convert: PDF → Excel ─────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.pdf_to_excel")
def process_pdf_to_excel_job(self, job_id: str, session_id: str, file_path: str):
    from .converter import pdf_to_excel
    _update(self, "PROGRESS", {"progress": 20, "message": "Detecting tables and exporting…"})
    out = pdf_to_excel(session_id, file_path)
    return {"output_path": out, "progress": 100}


# ─── Convert: PDF → Text ──────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.pdf_to_text")
def process_pdf_to_text_job(self, job_id: str, session_id: str, file_path: str):
    from .pdf_engine import pdf_to_text
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting text…"})
    out = pdf_to_text(session_id, file_path)
    return {"output_path": out, "progress": 100}


# ─── Convert: Office → PDF ────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.office_to_pdf")
def process_office_to_pdf_job(self, job_id: str, session_id: str, file_path: str):
    from .converter import office_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Launching LibreOffice…"})
    # office_to_pdf is async — run it in an event loop
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(office_to_pdf(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}


# ─── Convert: Images → PDF ────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.images_to_pdf")
def process_images_to_pdf_job(self, job_id: str, session_id: str,
                                file_paths: List[str], layout: str, page_size: str):
    from .pdf_engine import images_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Building PDF from images…"})
    out = images_to_pdf(session_id, file_paths, layout, page_size)
    return {"output_path": out, "progress": 100}


# ─── Convert: HTML → PDF ─────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.html_to_pdf")
def process_html_to_pdf_job(self, job_id: str, session_id: str,
                              html_content: Optional[str], url: Optional[str]):
    from .converter import html_to_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Rendering HTML to PDF…"})
    out = html_to_pdf(session_id, html_content, url)
    return {"output_path": out, "progress": 100}


# ─── Repair ───────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.repair")
def process_repair_job(self, job_id: str, session_id: str, file_path: str):
    from .pdf_engine import repair_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Repairing PDF structure…"})
    out = repair_pdf(session_id, file_path)
    return {"output_path": out, "progress": 100}


# ─── Redact ───────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.redact")
def process_redact_job(self, job_id: str, session_id: str, file_path: str,
                        search_terms: List[str], case_sensitive: bool):
    from .pdf_engine import redact_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Applying redactions…"})
    out = redact_pdf(session_id, file_path, search_terms, case_sensitive)
    return {"output_path": out, "progress": 100}


# ─── Sign ─────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.sign")
def process_sign_job(self, job_id: str, session_id: str, file_path: str,
                      sign_type: str, sig_path: Optional[str],
                      typed_text: Optional[str], page_number: int,
                      x: float, y: float, width: float, height: float):
    from .pdf_engine import sign_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Placing signature…"})
    out = sign_pdf(session_id, file_path, sign_type, sig_path,
                   typed_text, page_number, x, y, width, height)
    return {"output_path": out, "progress": 100}


# ─── Metadata ─────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.metadata")
def process_metadata_job(self, job_id: str, session_id: str, file_path: str,
                          title: Optional[str], author: Optional[str],
                          subject: Optional[str], keywords: Optional[str],
                          creator: Optional[str]):
    from .pdf_engine import write_metadata
    _update(self, "PROGRESS", {"progress": 20, "message": "Writing metadata…"})
    out = write_metadata(session_id, file_path, title, author, subject, keywords, creator)
    return {"output_path": out, "progress": 100}


# ─── Number Pages ─────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.number_pages")
def process_number_pages_job(self, job_id: str, session_id: str, file_path: str,
                              h_align: str, v_align: str, start_number: int,
                              font_size: int, prefix: str, suffix: str):
    from .pdf_engine import add_page_numbers
    _update(self, "PROGRESS", {"progress": 20, "message": "Stamping page numbers…"})
    out = add_page_numbers(session_id, file_path, h_align, v_align,
                           start_number, font_size, prefix, suffix)
    return {"output_path": out, "progress": 100}


# ─── Crop ─────────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.crop")
def process_crop_job(self, job_id: str, session_id: str, file_path: str,
                     top: float, right: float, bottom: float, left: float,
                     pages: str):
    from .pdf_engine import crop_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Cropping pages…"})
    out = crop_pdf(session_id, file_path, top, right, bottom, left, pages)
    return {"output_path": out, "progress": 100}


# ─── Compare ──────────────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.compare")
def process_compare_job(self, job_id: str, session_id: str,
                         path_a: str, path_b: str):
    from .pdf_engine import compare_pdfs
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering pages for comparison…"})
    out = compare_pdfs(session_id, path_a, path_b)
    return {"output_path": out, "progress": 100}


# ─── PDF → PowerPoint ─────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.pdf_to_ppt")
def process_pdf_to_ppt_job(self, job_id: str, session_id: str, file_path: str):
    from .converter import pdf_to_ppt
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering PDF pages as slides…"})
    out = pdf_to_ppt(session_id, file_path)
    return {"output_path": out, "progress": 100}
