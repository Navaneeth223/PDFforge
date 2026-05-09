from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
from contextlib import asynccontextmanager

from config import settings
from routers import (
    merge, split, compress, rotate, watermark, protect, unlock,
    extract, ocr, page_numbers, jobs, convert, word, excel, ppt, image, editor
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create temp directory
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Docxio API",
    version="1.0.0",
    description="Universal Document Toolkit API",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────
# In dev, we allow everything from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────
# Adopting the user's requested /api/v1/pdf prefix for PDF tools
PREFIX = "/api/v1/pdf"

app.include_router(merge.router,        prefix=PREFIX,  tags=["PDF"])
app.include_router(split.router,        prefix=PREFIX,  tags=["PDF"])
app.include_router(compress.router,     prefix=PREFIX,  tags=["PDF"])
app.include_router(rotate.router,       prefix=PREFIX,  tags=["PDF"])
app.include_router(watermark.router,    prefix=PREFIX,  tags=["PDF"])
app.include_router(protect.router,      prefix=PREFIX,  tags=["PDF"])
app.include_router(unlock.router,       prefix=PREFIX,  tags=["PDF"])
app.include_router(extract.router,      prefix=PREFIX,  tags=["PDF"])
app.include_router(ocr.router,          prefix=PREFIX,  tags=["PDF"])
app.include_router(page_numbers.router, prefix=PREFIX,  tags=["PDF"])

# Other categories
app.include_router(convert.router, prefix="/api/v1", tags=["Smart Convert"])
app.include_router(word.router,    prefix="/api/v1", tags=["Word"])
app.include_router(excel.router,   prefix="/api/v1", tags=["Excel"])
app.include_router(ppt.router,     prefix="/api/v1", tags=["PowerPoint"])
app.include_router(image.router,   prefix="/api/v1", tags=["Image"])
app.include_router(editor.router,  prefix="/api/v1", tags=["Editor"])
app.include_router(jobs.router,    prefix="/api/v1", tags=["Jobs"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "docxio-api"}

@app.get("/")
async def root():
    return {"message": "Docxio API is running. Visit /docs for documentation."}
