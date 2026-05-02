"""
storage.py — File I/O helpers.

Rules:
- All files saved under /tmp/pdfforge/<session_id>/
- Filenames on disk are always UUID-based; original filename is never used.
- Auto-cleanup runs via a background scheduler (see temp_manager.py).
"""
import os
import uuid
import aiofiles
from fastapi import UploadFile
from config import settings

BASE_DIR = "/tmp/pdfforge"


def get_session_dir(session_id: str) -> str:
    path = os.path.join(BASE_DIR, session_id)
    os.makedirs(path, exist_ok=True)
    return path


async def save_upload_file(upload: UploadFile, session_id: str) -> str:
    """Save an UploadFile to disk under the session directory.

    Returns the absolute path to the saved file.
    """
    ext = os.path.splitext(upload.filename)[-1].lower() if upload.filename else ""
    disk_name = f"{uuid.uuid4()}{ext}"
    session_dir = get_session_dir(session_id)
    dest = os.path.join(session_dir, disk_name)

    async with aiofiles.open(dest, "wb") as f:
        while chunk := await upload.read(1024 * 1024):  # 1 MB chunks
            await f.write(chunk)

    return dest


def get_output_path(session_id: str, extension: str = ".pdf") -> str:
    """Return a new UUID-named output path inside the session directory."""
    session_dir = get_session_dir(session_id)
    return os.path.join(session_dir, f"output_{uuid.uuid4()}{extension}")
