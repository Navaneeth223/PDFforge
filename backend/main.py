"""
main.py — FastAPI application entrypoint.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from utils.temp_manager import cleanup_loop
from routers import (
    merge, split, compress, rotate,
    watermark, protect, unlock, ocr,
    convert, extract, repair, redact,
    sign, metadata, jobs,
    number_pages, crop, compare, pdf_to_ppt,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background file-cleanup task on startup
    task = asyncio.create_task(cleanup_loop())
    yield
    task.cancel()


app = FastAPI(
    title="PDFForge API",
    description="Production-grade PDF tools — free, open-source, self-hostable.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again.",
                "details": str(exc),
            },
        },
    )


# ─── Routers ──────────────────────────────────────────────────────────────────
PREFIX = "/api/v1/tools"

app.include_router(merge.router,     prefix=PREFIX)
app.include_router(split.router,     prefix=PREFIX)
app.include_router(compress.router,  prefix=PREFIX)
app.include_router(rotate.router,    prefix=PREFIX)
app.include_router(watermark.router, prefix=PREFIX)
app.include_router(protect.router,   prefix=PREFIX)
app.include_router(unlock.router,    prefix=PREFIX)
app.include_router(ocr.router,       prefix=PREFIX)
app.include_router(convert.router,   prefix=PREFIX)
app.include_router(extract.router,   prefix=PREFIX)
app.include_router(repair.router,    prefix=PREFIX)
app.include_router(redact.router,    prefix=PREFIX)
app.include_router(sign.router,      prefix=PREFIX)
app.include_router(metadata.router,    prefix=PREFIX)
app.include_router(number_pages.router,prefix=PREFIX)
app.include_router(crop.router,        prefix=PREFIX)
app.include_router(compare.router,     prefix=PREFIX)
app.include_router(pdf_to_ppt.router,  prefix=PREFIX)

# Jobs router uses /api/v1 prefix (not /tools)
app.include_router(jobs.router, prefix="/api/v1")


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
