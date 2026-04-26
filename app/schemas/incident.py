# app/schemas/incident.py
"""Satark — Incident-related Pydantic schemas."""
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from .evidence import EvidenceFileResponse


class IncidentCreate(BaseModel):
    """POST /api/incidents request body (JSON part of multipart)."""

    input_type: Literal["text", "url", "image", "audio", "video", "document"]
    input_content: str | None = None  # Required for text/url, optional for file types
    description: str | None = None


class IncidentUpdate(BaseModel):
    """PATCH /api/incidents/:id request body."""

    status: str | None = None
    priority: str | None = None
    analyst_notes: str | None = None
    assigned_to: uuid.UUID | None = None


class AuditLogEntry(BaseModel):
    """Embedded audit log entry in incident detail."""

    id: uuid.UUID
    actor_label: str
    action: str
    details: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class IncidentResponse(BaseModel):
    """GET /api/incidents/:id response — full detail view."""

    id: uuid.UUID
    case_number: str
    input_type: str
    input_content: str | None = None
    description: str | None = None
    status: str
    priority: str | None = None
    classification: str | None = None
    threat_score: int | None = None
    confidence: float | None = None
    ai_analysis: dict | None = None
    analyst_notes: str | None = None
    guest_token: str | None = None
    assigned_to: uuid.UUID | None = None
    evidence_files: list[EvidenceFileResponse] = []
    audit_logs: list[AuditLogEntry] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IncidentListItem(BaseModel):
    """Summary fields for the incidents list view."""

    id: uuid.UUID
    case_number: str
    input_type: str
    status: str
    priority: str | None = None
    classification: str | None = None
    threat_score: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class IncidentFilter(BaseModel):
    """Query parameters for filtering the incidents list."""

    status: str | None = None
    priority: str | None = None
    classification: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    search: str | None = None
    sort_by: str = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"


class PaginationMeta(BaseModel):
    """Pagination metadata in list responses."""

    page: int
    page_size: int
    total_items: int
    total_pages: int
