from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from typing import AsyncGenerator
import asyncio
import json
import os
from services.job_queue import get_job_status
from services.storage import get_output_path

router = APIRouter(tags=["Jobs"])


async def _sse_generator(job_id: str) -> AsyncGenerator[str, None]:
    """Poll job status and stream Server-Sent Events until complete or failed."""
    while True:
        status = get_job_status(job_id)
        payload = json.dumps(status)
        yield f"data: {payload}\n\n"
        if status.get("state") in ("SUCCESS", "FAILURE"):
            break
        await asyncio.sleep(1)


@router.get("/jobs/{job_id}/status")
async def job_status_sse(job_id: str):
    """SSE endpoint — streams job progress as JSON events."""
    return StreamingResponse(
        _sse_generator(job_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/jobs/{job_id}/download")
async def download_result(job_id: str):
    """Download the processed output file for a completed job."""
    status = get_job_status(job_id)
    if status.get("state") != "SUCCESS":
        raise HTTPException(
            status_code=400,
            detail={"code": "JOB_NOT_READY", "message": "Job is not yet complete or has failed."},
        )

    output_path = status.get("output_path")
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(
            status_code=404,
            detail={"code": "FILE_NOT_FOUND", "message": "Output file not found. It may have expired."},
        )

    filename = os.path.basename(output_path)
    return FileResponse(
        path=output_path,
        filename=filename,
        media_type="application/octet-stream",
    )
