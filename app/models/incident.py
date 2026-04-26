# app/models/incident.py
"""
Satark — Incident model.
Core entity representing a cyber-incident submission with AI analysis results.
Case numbers follow the SAT-YYYY-NNNNN format via PostgreSQL SEQUENCE.
"""
import uuid
from datetime import datetime

from sqlalchemy import JSON, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Incident(Base):
    """A cyber-incident submitted by a guest or analyst for AI analysis."""

    __tablename__ = "incidents"

    # ── Identity ─────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    case_number: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )

    # ── Submitter ────────────────────────────────────────────────────────
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    guest_token: Mapped[str | None] = mapped_column(
        String(64), nullable=True, index=True
    )

    # ── Input ────────────────────────────────────────────────────────────
    input_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # text, url, image, audio, video, document
    input_content: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # For text/url inputs
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Triage ───────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="submitted", index=True
    )
    priority: Mapped[str | None] = mapped_column(
        String(20), nullable=True, index=True
    )

    # ── AI Analysis Results ──────────────────────────────────────────────
    classification: Mapped[str | None] = mapped_column(
        String(30), nullable=True, index=True
    )
    threat_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Analyst Fields ───────────────────────────────────────────────────
    analyst_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    submitter = relationship(
        "User",
        back_populates="incidents_submitted",
        foreign_keys=[submitted_by],
    )
    assignee = relationship(
        "User",
        back_populates="incidents_assigned",
        foreign_keys=[assigned_to],
    )
    evidence_files = relationship(
        "EvidenceFile",
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    audit_logs = relationship(
        "AuditLog",
        back_populates="incident",
        cascade="all, delete-orphan",
    )
