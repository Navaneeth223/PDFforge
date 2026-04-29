"""
pdf_engine.py — Core PyMuPDF wrapper.
All functions are synchronous (CPU-bound) and must be called via asyncio.to_thread().
"""
import os
import io
import uuid
import zipfile
from typing import List, Optional, Dict, Any
import fitz  # PyMuPDF
from PIL import Image
from .storage import get_output_path, get_session_dir


# ─── Merge ────────────────────────────────────────────────────────────────────

def merge_pdfs(session_id: str, input_paths: List[str]) -> str:
    """Merge multiple PDFs in order and return output path."""
    out_path = get_output_path(session_id, ".pdf")
    result = fitz.open()
    for path in input_paths:
        src = fitz.open(path)
        result.insert_pdf(src)
        src.close()
    result.save(out_path, garbage=4, deflate=True)
    result.close()
    return out_path


# ─── Split ─────────────────────────────────────────────────────────────────────

def _parse_page_ranges(spec: str, total: int) -> List[List[int]]:
    """Parse a range string like '1-3,5,7-9' into 0-indexed page groups."""
    groups: List[List[int]] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-", 1)
            groups.append(list(range(int(start) - 1, int(end))))
        else:
            groups.append([int(part) - 1])
    return groups


def split_pdf(session_id: str, input_path: str, mode: str,
              ranges: Optional[str], every_n: Optional[int],
              pages: Optional[str]) -> str:
    """Split PDF and return a ZIP of resulting PDFs."""
    src = fitz.open(input_path)
    total = len(src)
    groups: List[List[int]] = []

    if mode == "ranges" and ranges:
        groups = _parse_page_ranges(ranges, total)
    elif mode == "every_n" and every_n:
        groups = [list(range(i, min(i + every_n, total))) for i in range(0, total, every_n)]
    elif mode == "pages" and pages:
        groups = [[int(p) - 1] for p in pages.split(",")]

    zip_path = get_output_path(session_id, ".zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        for idx, page_nums in enumerate(groups):
            out = fitz.open()
            for pg in page_nums:
                if 0 <= pg < total:
                    out.insert_pdf(src, from_page=pg, to_page=pg)
            part_path = get_output_path(session_id, ".pdf")
            out.save(part_path, garbage=4, deflate=True)
            out.close()
            zf.write(part_path, arcname=f"part_{idx + 1}.pdf")

    src.close()
    return zip_path


# ─── Compress ──────────────────────────────────────────────────────────────────

_COMPRESS_LEVELS = {
    "low":    {"garbage": 1, "deflate": True, "clean": False},
    "medium": {"garbage": 3, "deflate": True, "clean": True},
    "high":   {"garbage": 4, "deflate": True, "clean": True},
}


def compress_pdf(session_id: str, input_path: str, level: str) -> Dict[str, Any]:
    """Compress PDF and return output path + before/after sizes."""
    opts = _COMPRESS_LEVELS.get(level, _COMPRESS_LEVELS["medium"])
    out_path = get_output_path(session_id, ".pdf")
    doc = fitz.open(input_path)

    if level == "high":
        # Downsample embedded images
        for page in doc:
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                try:
                    base = doc.extract_image(xref)
                    pil_img = Image.open(io.BytesIO(base["image"]))
                    max_dim = 1200
                    if max(pil_img.size) > max_dim:
                        pil_img.thumbnail((max_dim, max_dim), Image.LANCZOS)
                    buf = io.BytesIO()
                    pil_img.save(buf, format="JPEG", quality=70)
                    doc.update_stream(xref, buf.getvalue())
                except Exception:
                    pass  # Skip images that can't be processed

    doc.save(out_path, **opts)
    doc.close()

    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(out_path)
    return {
        "output_path": out_path,
        "original_size": original_size,
        "compressed_size": compressed_size,
        "reduction_percent": round((1 - compressed_size / original_size) * 100, 1) if original_size else 0,
    }


# ─── Rotate ────────────────────────────────────────────────────────────────────

def rotate_pdf(session_id: str, input_path: str, angle: int, pages: str) -> str:
    doc = fitz.open(input_path)
    total = len(doc)
    if pages == "all":
        target = list(range(total))
    else:
        target = [int(p) - 1 for p in pages.split(",") if p.strip().isdigit()]

    for pg_num in target:
        if 0 <= pg_num < total:
            page = doc[pg_num]
            page.set_rotation((page.rotation + angle) % 360)

    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path


# ─── Extract Pages ─────────────────────────────────────────────────────────────

def extract_pages(session_id: str, input_path: str, pages: str) -> str:
    src = fitz.open(input_path)
    total = len(src)
    target = _parse_page_ranges(pages, total)
    flat = [pg for group in target for pg in group]

    out = fitz.open()
    for pg in flat:
        if 0 <= pg < total:
            out.insert_pdf(src, from_page=pg, to_page=pg)

    out_path = get_output_path(session_id, ".pdf")
    out.save(out_path, garbage=4, deflate=True)
    out.close()
    src.close()
    return out_path


# ─── Extract Images ────────────────────────────────────────────────────────────

def extract_images(session_id: str, input_path: str) -> str:
    doc = fitz.open(input_path)
    zip_path = get_output_path(session_id, ".zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        img_count = 0
        for pg_num, page in enumerate(doc):
            for img_info in page.get_images(full=True):
                xref = img_info[0]
                try:
                    base = doc.extract_image(xref)
                    ext = base["ext"]
                    img_bytes = base["image"]
                    zf.writestr(f"page{pg_num + 1}_img{img_count + 1}.{ext}", img_bytes)
                    img_count += 1
                except Exception:
                    pass
    doc.close()
    return zip_path


# ─── Watermark ─────────────────────────────────────────────────────────────────

def add_watermark(session_id: str, input_path: str, watermark_type: str,
                  text: Optional[str], wm_image_path: Optional[str],
                  opacity: float, angle: float, position: str,
                  font_size: int, color: str) -> str:
    doc = fitz.open(input_path)

    def _hex_to_rgb(hex_color: str):
        hex_color = hex_color.lstrip("#")
        r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
        return r / 255, g / 255, b / 255

    rgb = _hex_to_rgb(color)

    for page in doc:
        w, h = page.rect.width, page.rect.height
        if position == "center":
            x, y = w / 2, h / 2
        elif position == "top-left":
            x, y = w * 0.15, h * 0.1
        elif position == "top-right":
            x, y = w * 0.85, h * 0.1
        elif position == "bottom-left":
            x, y = w * 0.15, h * 0.9
        elif position == "bottom-right":
            x, y = w * 0.85, h * 0.9
        else:
            x, y = w / 2, h / 2  # fallback to center

        if watermark_type == "text" and text:
            page.insert_text(
                (x, y),
                text,
                fontsize=font_size,
                color=rgb,
                rotate=angle,
                overlay=True,
            )
        elif watermark_type == "image" and wm_image_path and os.path.exists(wm_image_path):
            wm_rect = fitz.Rect(x - 100, y - 50, x + 100, y + 50)
            page.insert_image(wm_rect, filename=wm_image_path, overlay=True)

    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path


# ─── Protect ───────────────────────────────────────────────────────────────────

def protect_pdf(session_id: str, input_path: str,
                user_password: str, owner_password: str,
                allow_print: bool, allow_copy: bool,
                allow_edit: bool, allow_annotate: bool) -> str:
    import pikepdf
    out_path = get_output_path(session_id, ".pdf")
    permissions = pikepdf.Permissions(
        print_lowres=allow_print,
        print_highres=allow_print,
        extract=allow_copy,
        modify_form=allow_edit,
        modify_annotation=allow_annotate,
        modify_other=allow_edit,
        modify_assembly=allow_edit,
    )
    with pikepdf.open(input_path) as pdf:
        pdf.save(
            out_path,
            encryption=pikepdf.Encryption(
                user=user_password,
                owner=owner_password,
                R=6,  # AES-256
                allow=permissions,
            ),
        )
    return out_path


# ─── Unlock ────────────────────────────────────────────────────────────────────

def unlock_pdf(session_id: str, input_path: str, password: str) -> str:
    import pikepdf
    out_path = get_output_path(session_id, ".pdf")
    with pikepdf.open(input_path, password=password) as pdf:
        pdf.save(out_path)
    return out_path


# ─── Repair ────────────────────────────────────────────────────────────────────

def repair_pdf(session_id: str, input_path: str) -> str:
    """Attempt to repair a corrupted PDF using pikepdf's lenient parser."""
    import pikepdf
    out_path = get_output_path(session_id, ".pdf")
    with pikepdf.open(input_path, suppress_warnings=True) as pdf:
        pdf.save(out_path)
    return out_path


# ─── Redact ────────────────────────────────────────────────────────────────────

def redact_pdf(session_id: str, input_path: str,
               search_terms: List[str], case_sensitive: bool) -> str:
    doc = fitz.open(input_path)
    for page in doc:
        for term in search_terms:
            flags = 0 if case_sensitive else fitz.TEXT_INHIBIT_SPACES
            hits = page.search_for(term, flags=flags)
            for rect in hits:
                page.add_redact_annot(rect, fill=(0, 0, 0))
        page.apply_redactions()

    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path


# ─── Sign ──────────────────────────────────────────────────────────────────────

def sign_pdf(session_id: str, input_path: str, sign_type: str,
             sig_path: Optional[str], typed_text: Optional[str],
             page_number: int, x: float, y: float,
             width: float, height: float) -> str:
    doc = fitz.open(input_path)
    page_idx = max(0, page_number - 1)
    if page_idx >= len(doc):
        page_idx = len(doc) - 1
    page = doc[page_idx]

    rect = fitz.Rect(x, y, x + width, y + height)

    if sign_type == "type" and typed_text:
        page.insert_textbox(
            rect, typed_text,
            fontsize=24,
            color=(0.1, 0.1, 0.5),
            align=fitz.TEXT_ALIGN_CENTER,
        )
    elif sign_type in ("draw", "image") and sig_path and os.path.exists(sig_path):
        page.insert_image(rect, filename=sig_path, overlay=True)

    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path


# ─── Metadata ──────────────────────────────────────────────────────────────────

def read_metadata(input_path: str) -> Dict[str, Any]:
    doc = fitz.open(input_path)
    meta = doc.metadata
    page_count = len(doc)
    doc.close()
    return {
        "title": meta.get("title", ""),
        "author": meta.get("author", ""),
        "subject": meta.get("subject", ""),
        "keywords": meta.get("keywords", ""),
        "creator": meta.get("creator", ""),
        "producer": meta.get("producer", ""),
        "creation_date": meta.get("creationDate", ""),
        "mod_date": meta.get("modDate", ""),
        "page_count": page_count,
    }


def write_metadata(session_id: str, input_path: str,
                   title: Optional[str], author: Optional[str],
                   subject: Optional[str], keywords: Optional[str],
                   creator: Optional[str]) -> str:
    doc = fitz.open(input_path)
    existing = doc.metadata
    new_meta = {
        "title": title if title is not None else existing.get("title", ""),
        "author": author if author is not None else existing.get("author", ""),
        "subject": subject if subject is not None else existing.get("subject", ""),
        "keywords": keywords if keywords is not None else existing.get("keywords", ""),
        "creator": creator if creator is not None else existing.get("creator", ""),
    }
    doc.set_metadata(new_meta)
    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path


# ─── PDF to Images ─────────────────────────────────────────────────────────────

def pdf_to_images(session_id: str, input_path: str, dpi: int, fmt: str) -> str:
    doc = fitz.open(input_path)
    zip_path = get_output_path(session_id, ".zip")
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    ext = "jpg" if fmt == "jpeg" else "png"
    with zipfile.ZipFile(zip_path, "w") as zf:
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_bytes = pix.tobytes(output=fmt)
            zf.writestr(f"page_{i + 1}.{ext}", img_bytes)
    doc.close()
    return zip_path


# ─── PDF to Text ───────────────────────────────────────────────────────────────

def pdf_to_text(session_id: str, input_path: str) -> str:
    doc = fitz.open(input_path)
    lines = []
    for i, page in enumerate(doc):
        lines.append(f"--- Page {i + 1} ---\n")
        lines.append(page.get_text("text"))
        lines.append("\n")
    doc.close()
    out_path = get_output_path(session_id, ".txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    return out_path


# ─── Images to PDF ─────────────────────────────────────────────────────────────

def images_to_pdf(session_id: str, image_paths: List[str],
                  layout: str, page_size: str) -> str:
    PAGE_SIZES = {"A4": (595, 842), "Letter": (612, 792), "A3": (842, 1191)}
    pw, ph = PAGE_SIZES.get(page_size, (595, 842))

    doc = fitz.open()
    for img_path in image_paths:
        img = Image.open(img_path).convert("RGB")
        iw, ih = img.size

        if layout == "fit":
            scale = min(pw / iw, ph / ih)
            nw, nh = int(iw * scale), int(ih * scale)
            img = img.resize((nw, nh), Image.LANCZOS)
        elif layout == "fill":
            scale = max(pw / iw, ph / ih)
            nw, nh = int(iw * scale), int(ih * scale)
            img = img.resize((nw, nh), Image.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        buf.seek(0)

        page = doc.new_page(width=pw, height=ph)
        img_rect = fitz.Rect(0, 0, pw, ph)
        page.insert_image(img_rect, stream=buf.read())

    out_path = get_output_path(session_id, ".pdf")
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    return out_path
