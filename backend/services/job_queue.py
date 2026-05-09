"""
job_queue.py — Robust task management for Docxio.
Supports both real Celery/Redis for production and an Internal Async runner for local dev.
"""
import os
import asyncio
import uuid
from typing import List, Optional, Dict, Any, Callable
from celery import Celery
from concurrent.futures import ThreadPoolExecutor
from config import settings

# ─── Celery Initialization ───────────────────────────────────────────────────
celery_app = Celery(
    "docxio_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["services.job_queue"]
)

EAGER_MODE = os.getenv("CELERY_TASK_ALWAYS_EAGER", "true").lower() == "true"

celery_app.conf.update(
    task_always_eager=EAGER_MODE,
    task_eager_propagates=False,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=3600,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# ─── Internal Task Runner (For Local Dev) ─────────────────────────────────────
# This replaces Celery Workers when REDIS_URL is not provided or in Eager Mode.
_job_registry: Dict[str, Dict[str, Any]] = {}
_executor = ThreadPoolExecutor(max_workers=4)

def _register_job_status(job_id: str, status: Dict[str, Any]):
    """Update internal registry."""
    _job_registry[job_id] = status

async def run_internal_task(task_func: Callable, job_id: str, *args, **kwargs):
    """Runs a task in a thread pool and updates the local registry."""
    _register_job_status(job_id, {"state": "PROGRESS", "progress": 10, "message": "Starting task..."})
    try:
        # Run the synchronous task function in a thread to avoid blocking uvicorn
        loop = asyncio.get_event_loop()
        # Bind a dummy 'self' if it's a bound celery task
        result = await loop.run_in_executor(_executor, lambda: task_func(None, job_id, *args, **kwargs))
        _register_job_status(job_id, {"state": "SUCCESS", "progress": 100, **result})
    except Exception as e:
        _register_job_status(job_id, {"state": "FAILURE", "progress": 0, "message": str(e)})

def submit_job(task, job_id: str, *args, **kwargs) -> str:
    """Entry point for routers to submit jobs."""
    if EAGER_MODE:
        # Fire and forget in a background thread using asyncio
        # We need to get the actual function from the celery task
        task_func = task.run
        asyncio.create_task(run_internal_task(task_func, job_id, *args, **kwargs))
        return job_id
    else:
        # Real Celery
        task.apply_async(args=(job_id, *args), kwargs=kwargs, task_id=job_id)
        return job_id

def _update(task, state: str, meta: Dict[str, Any]):
    """Helper for tasks to update their own status."""
    if task:
        task.update_state(state=state, meta=meta)
    
    # Also update local registry if we have the job_id in meta or context
    # In Celery tasks, we usually don't have easy access to the job_id without 'bind=True'
    # But since we pass job_id as the first arg, we can use it.
    pass

def get_job_status(job_id: str) -> Dict[str, Any]:
    """Query job status from local registry or Celery backend."""
    if job_id in _job_registry:
        return _job_registry[job_id]

    if not EAGER_MODE:
        try:
            from celery.result import AsyncResult
            result = AsyncResult(job_id, app=celery_app)
            if result.state == "PENDING":
                return {"state": "PENDING", "progress": 0, "message": "Job queued..."}
            elif result.state == "PROGRESS":
                return result.info or {"state": "PROGRESS", "progress": 0, "message": "Processing..."}
            elif result.state == "SUCCESS":
                info = result.info or {}
                return {"state": "SUCCESS", "progress": 100, "output_path": info.get("output_path"), **info}
            elif result.state == "FAILURE":
                return {"state": "FAILURE", "progress": 0, "message": str(result.info)}
            return {"state": result.state, "progress": 0, "message": ""}
        except Exception:
            pass

    return {"state": "PENDING", "progress": 0, "message": "Job queued..."}

# ─── Task Implementation Helpers ───────────────────────────────────────────────

def _task_wrapper(task_func):
    """Common logic for all tasks."""
    def wrapper(self, job_id, *args, **kwargs):
        try:
            if self:
                _update(self, "PROGRESS", {"progress": 20, "message": "Initializing..."})
            result = task_func(self, job_id, *args, **kwargs)
            if EAGER_MODE:
                 _register_job_status(job_id, {"state": "SUCCESS", "progress": 100, **result})
            return result
        except Exception as e:
            if EAGER_MODE:
                 _register_job_status(job_id, {"state": "FAILURE", "progress": 0, "message": str(e)})
            raise e
    return wrapper

# ─── Task Definitions ─────────────────────────────────────────────────────────

@celery_app.task(bind=True, name="tasks.merge")
def process_merge_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from services.pdf_engine import merge_pdfs
    _update(self, "PROGRESS", {"progress": 10, "message": "Merging PDFs..."})
    out = merge_pdfs(session_id, file_paths)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.split")
def process_split_job(self, job_id: str, session_id: str, file_path: str,
                      mode: str, ranges: Optional[str], every_n: Optional[int],
                      pages: Optional[str]):
    from services.pdf_engine import split_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Splitting PDF..."})
    out = split_pdf(session_id, file_path, mode, ranges, every_n, pages)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.compress")
def process_compress_job(self, job_id: str, session_id: str,
                          file_path: str, level: str):
    from services.pdf_engine import compress_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": f"Compressing ({level} mode)..."})
    result = compress_pdf(session_id, file_path, level)
    return {**result, "progress": 100}

@celery_app.task(bind=True, name="tasks.rotate")
def process_rotate_job(self, job_id: str, session_id: str,
                        file_path: str, angle: int, pages: str):
    from services.pdf_engine import rotate_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": f"Rotating pages by {angle}°..."})
    out = rotate_pdf(session_id, file_path, angle, pages)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.extract_pages")
def process_extract_pages_job(self, job_id: str, session_id: str,
                               file_path: str, pages: str):
    from services.pdf_engine import extract_pages
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting pages..."})
    out = extract_pages(session_id, file_path, pages)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.extract_images")
def process_extract_images_job(self, job_id: str, session_id: str, file_path: str):
    from services.pdf_engine import extract_images
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting embedded images..."})
    out = extract_images(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.watermark")
def process_watermark_job(self, job_id: str, session_id: str, file_path: str,
                           watermark_type: str, text: Optional[str],
                           wm_image_path: Optional[str], opacity: float,
                           angle: float, position: str, font_size: int, color: str):
    from services.pdf_engine import add_watermark
    _update(self, "PROGRESS", {"progress": 20, "message": "Applying watermark..."})
    out = add_watermark(session_id, file_path, watermark_type, text,
                        wm_image_path, opacity, angle, position, font_size, color)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.protect")
def process_protect_job(self, job_id: str, session_id: str, file_path: str,
                         user_password: str, owner_password: str,
                         allow_print: bool, allow_copy: bool,
                         allow_edit: bool, allow_annotate: bool):
    from services.pdf_engine import protect_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Encrypting PDF..."})
    out = protect_pdf(session_id, file_path, user_password, owner_password,
                      allow_print, allow_copy, allow_edit, allow_annotate)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.unlock")
def process_unlock_job(self, job_id: str, session_id: str,
                        file_path: str, password: str):
    from services.pdf_engine import unlock_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Removing password..."})
    out = unlock_pdf(session_id, file_path, password)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.ocr")
def process_ocr_job(self, job_id: str, session_id: str,
                     file_path: str, language: str, dpi: int):
    from services.converter import ocr_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering pages for OCR..."})
    out = ocr_pdf(session_id, file_path, language, dpi)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.pdf_to_images")
def process_pdf_to_images_job(self, job_id: str, session_id: str,
                                file_path: str, dpi: int, fmt: str):
    from services.pdf_engine import pdf_to_images
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting pages to images..."})
    out = pdf_to_images(session_id, file_path, dpi, fmt)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.pdf_to_word")
def process_pdf_to_word_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import pdf_to_word
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting text to Word..."})
    out = pdf_to_word(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.pdf_to_excel")
def process_pdf_to_excel_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import pdf_to_excel
    _update(self, "PROGRESS", {"progress": 20, "message": "Detecting tables and exporting..."})
    out = pdf_to_excel(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.pdf_to_text")
def process_pdf_to_text_job(self, job_id: str, session_id: str, file_path: str):
    from services.pdf_engine import pdf_to_text
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting text..."})
    out = pdf_to_text(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.office_to_pdf")
def process_office_to_pdf_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import office_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Launching LibreOffice..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(office_to_pdf(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.images_to_pdf")
def process_images_to_pdf_job(self, job_id: str, session_id: str,
                                file_paths: List[str], layout: str, page_size: str):
    from services.pdf_engine import images_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Building PDF from images..."})
    out = images_to_pdf(session_id, file_paths, layout, page_size)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.html_to_pdf")
def process_html_to_pdf_job(self, job_id: str, session_id: str,
                               html_content: Optional[str], url: Optional[str]):
    from services.converter import html_to_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Rendering HTML to PDF..."})
    out = html_to_pdf(session_id, html_content, url)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.repair")
def process_repair_job(self, job_id: str, session_id: str, file_path: str):
    from services.pdf_engine import repair_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Repairing PDF structure..."})
    out = repair_pdf(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.redact")
def process_redact_job(self, job_id: str, session_id: str, file_path: str,
                        search_terms: List[str], case_sensitive: bool):
    from services.pdf_engine import redact_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Applying redactions..."})
    out = redact_pdf(session_id, file_path, search_terms, case_sensitive)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.sign")
def process_sign_job(self, job_id: str, session_id: str, file_path: str,
                      sign_type: str, sig_path: Optional[str],
                      typed_text: Optional[str], page_number: int,
                      x: float, y: float, width: float, height: float):
    from services.pdf_engine import sign_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Placing signature..."})
    out = sign_pdf(session_id, file_path, sign_type, sig_path,
                   typed_text, page_number, x, y, width, height)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.metadata")
def process_metadata_job(self, job_id: str, session_id: str, file_path: str,
                          title: Optional[str], author: Optional[str],
                          subject: Optional[str], keywords: Optional[str],
                          creator: Optional[str]):
    from services.pdf_engine import write_metadata
    _update(self, "PROGRESS", {"progress": 20, "message": "Writing metadata..."})
    out = write_metadata(session_id, file_path, title, author, subject, keywords, creator)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.number_pages")
def process_number_pages_job(self, job_id: str, session_id: str, file_path: str,
                               h_align: str, v_align: str, start_number: int,
                               font_size: int, prefix: str, suffix: str):
    from services.pdf_engine import add_page_numbers
    _update(self, "PROGRESS", {"progress": 20, "message": "Stamping page numbers..."})
    out = add_page_numbers(session_id, file_path, h_align, v_align,
                           start_number, font_size, prefix, suffix)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.crop")
def process_crop_job(self, job_id: str, session_id: str, file_path: str,
 top: float, right: float, bottom: float, left: float, pages: str):
    from services.pdf_engine import crop_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Cropping pages..."})
    out = crop_pdf(session_id, file_path, top, right, bottom, left, pages)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.compare")
def process_compare_job(self, job_id: str, session_id: str,
 path_a: str, path_b: str):
    from services.pdf_engine import compare_pdfs
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering pages for comparison..."})
    out = compare_pdfs(session_id, path_a, path_b)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.pdf_to_ppt")
def process_pdf_to_ppt_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import pdf_to_ppt
    _update(self, "PROGRESS", {"progress": 10, "message": "Rendering PDF pages as slides..."})
    out = pdf_to_ppt(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.word_to_pdf")
def process_word_to_pdf_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import office_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting Word to PDF..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(office_to_pdf(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.word_to_html")
def process_word_to_html_job(self, job_id: str, session_id: str, file_path: str):
    from services.word_service import word_to_html
    _update(self, "PROGRESS", {"progress": 20, "message": "Converting Word to HTML..."})
    out = word_to_html(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.word_to_text")
def process_word_to_text_job(self, job_id: str, session_id: str, file_path: str):
    from services.word_service import word_to_text
    _update(self, "PROGRESS", {"progress": 20, "message": "Extracting text from Word..."})
    out = word_to_text(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.merge_word")
def process_merge_word_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from services.word_service import merge_word_docs
    _update(self, "PROGRESS", {"progress": 20, "message": "Merging Word documents..."})
    out = merge_word_docs(session_id, file_paths)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.word_compress")
def process_word_compress_job(self, job_id: str, session_id: str, file_path: str):
    from services.word_service import compress_word
    _update(self, "PROGRESS", {"progress": 20, "message": "Compressing Word file..."})
    out = compress_word(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.word_unlock")
def process_word_unlock_job(self, job_id: str, session_id: str, file_path: str, password: str):
    from services.word_service import remove_word_password
    _update(self, "PROGRESS", {"progress": 20, "message": "Removing Word password..."})
    out = remove_word_password(session_id, file_path, password)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.excel_to_pdf")
def process_excel_to_pdf_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import office_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting Excel to PDF..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(office_to_pdf(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.excel_to_csv")
def process_excel_to_csv_job(self, job_id: str, session_id: str, file_path: str):
    from services.excel_service import excel_to_csv
    _update(self, "PROGRESS", {"progress": 20, "message": "Converting Excel to CSV..."})
    out = excel_to_csv(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.excel_to_json")
def process_excel_to_json_job(self, job_id: str, session_id: str, file_path: str):
    from services.excel_service import excel_to_json
    _update(self, "PROGRESS", {"progress": 20, "message": "Converting Excel to JSON..."})
    out = excel_to_json(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.merge_excel")
def process_merge_excel_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from services.excel_service import merge_excel_sheets
    _update(self, "PROGRESS", {"progress": 20, "message": "Merging Excel sheets..."})
    out = merge_excel_sheets(session_id, file_paths)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.ppt_to_pdf")
def process_ppt_to_pdf_job(self, job_id: str, session_id: str, file_path: str):
    from services.converter import office_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting PPT to PDF..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(office_to_pdf(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.ppt_to_images")
def process_ppt_to_images_job(self, job_id: str, session_id: str, file_path: str):
    from services.ppt_service import ppt_to_images
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting PPT to images..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(ppt_to_images(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.ppt_to_video")
def process_ppt_to_video_job(self, job_id: str, session_id: str, file_path: str):
    from services.ppt_service import ppt_to_video
    _update(self, "PROGRESS", {"progress": 10, "message": "Converting PPT to video (this may take a while)..."})
    loop = asyncio.new_event_loop()
    out = loop.run_until_complete(ppt_to_video(session_id, file_path))
    loop.close()
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.merge_ppt")
def process_merge_ppt_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from services.ppt_service import merge_presentations
    _update(self, "PROGRESS", {"progress": 20, "message": "Merging Presentations..."})
    out = merge_presentations(session_id, file_paths)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.images_to_pdf_direct")
def process_images_to_pdf_direct_job(self, job_id: str, session_id: str, file_paths: List[str]):
    from services.pdf_engine import images_to_pdf
    _update(self, "PROGRESS", {"progress": 10, "message": "Building PDF from images..."})
    out = images_to_pdf(session_id, file_paths, "fit", "A4")
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.image_compress")
def process_image_compress_job(self, job_id: str, session_id: str, file_path: str):
    from services.image_service import compress_image
    _update(self, "PROGRESS", {"progress": 20, "message": "Compressing image..."})
    out = compress_image(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.image_convert")
def process_image_convert_job(self, job_id: str, session_id: str, file_path: str, fmt: str):
    from services.image_service import convert_image
    _update(self, "PROGRESS", {"progress": 20, "message": f"Converting image to {fmt}..."})
    out = convert_image(session_id, file_path, fmt)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.image_resize")
def process_image_resize_job(self, job_id: str, session_id: str, file_path: str, w: int, h: int):
    from services.image_service import resize_image
    _update(self, "PROGRESS", {"progress": 20, "message": "Resizing image..."})
    out = resize_image(session_id, file_path, w, h)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.remove_bg")
def process_remove_bg_job(self, job_id: str, session_id: str, file_path: str):
    from services.image_service import remove_background
    _update(self, "PROGRESS", {"progress": 10, "message": "Removing background with AI..."})
    out = remove_background(session_id, file_path)
    return {"output_path": out, "progress": 100}

@celery_app.task(bind=True, name="tasks.editor_export")
def process_editor_export_job(self, job_id: str, session_id: str, pages: List[Dict[str, Any]]):
    from services.editor_service import export_editor_pdf
    _update(self, "PROGRESS", {"progress": 20, "message": "Flattening canvas and exporting PDF..."})
    out = export_editor_pdf(session_id, pages)
    return {"output_path": out, "progress": 100}
