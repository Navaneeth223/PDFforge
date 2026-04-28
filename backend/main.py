from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
from .config import settings

app = FastAPI(
    title="PDFForge API",
    description="Backend for PDFForge",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

celery_app = Celery(
    "pdfforge_worker",
    broker=settings.redis_url,
    backend=settings.redis_url
)

# TODO: Add router inclusions once routers are generated
# from .routers import merge, split, compress, convert, edit, sign, watermark, protect, unlock, rotate, crop, ocr, redact, extract, repair, metadata, jobs
# app.include_router(merge.router, prefix="/api/v1/tools")
# etc...

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
