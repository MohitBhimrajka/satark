# app/models/evidence_file.py
"""
Satark — EvidenceFile model.
Tracks uploaded files (images, audio, video, documents) attached to incidents.
Files are stored in GCS (production) or local filesystem (development).
"""
import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class EvidenceFile(Base):
    """An uploaded file attached to an incident as evidence."""

    __tablename__ = "evidence_files"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    filename: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # stored filename (UUID-based)
    original_filename: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # bytes
    storage_path: Mapped[str] = mapped_column(
        String(500), nullable=False
    )  # GCS path or local path
    checksum: Mapped[str] = mapped_column(
        String(64), nullable=False
    )  # SHA-256 hex digest
    uploaded_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    incident = relationship("Incident", back_populates="evidence_files")
