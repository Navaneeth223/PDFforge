"""
temp_manager.py — Background cleanup of expired session files.
Runs as a FastAPI startup background task.
"""
import os
import shutil
import asyncio
import time
from config import settings

import tempfile
BASE_DIR = os.path.join(tempfile.gettempdir(), "docxio")


async def cleanup_loop():
    """Continuously scan session directories and remove those older than FILE_RETENTION_MINUTES."""
    retention_seconds = settings.file_retention_minutes * 60
    while True:
        try:
            if os.path.exists(BASE_DIR):
                now = time.time()
                for session_dir in os.listdir(BASE_DIR):
                    full_path = os.path.join(BASE_DIR, session_dir)
                    if os.path.isdir(full_path):
                        mtime = os.path.getmtime(full_path)
                        if now - mtime > retention_seconds:
                            shutil.rmtree(full_path, ignore_errors=True)
        except Exception:
            pass  # Never crash the cleanup loop
        await asyncio.sleep(300)  # Run every 5 minutes
