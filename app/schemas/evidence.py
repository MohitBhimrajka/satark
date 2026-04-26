# app/schemas/evidence.py
"""Satark — EvidenceFile response schema."""
import uuid
from datetime import datetime

from pydantic import BaseModel


class EvidenceFileResponse(BaseModel):
    """Evidence file metadata in API responses."""

    id: uuid.UUID
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}
