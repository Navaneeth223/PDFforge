from pydantic import BaseModel
from typing import Optional, Dict, Any

class JobResponse(BaseModel):
    success: bool = True
    job_id: str
    message: str = "Job queued successfully"

class ErrorResponse(BaseModel):
    success: bool = False
    error: Dict[str, Any]

class GenericResponse(BaseModel):
    success: bool = True
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
