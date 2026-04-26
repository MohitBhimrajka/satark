# app/models/audit_log.py
"""
Satark — AuditLog model.
Immutable compliance trail for every action taken on an incident.
actor_label stores a display string ("AI_AGENT", user name, "SYSTEM")
to avoid vendor name leakage per Rule 13.
"""
import uuid
from datetime import datetime

from sqlalchemy import JSON, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditLog(Base):
    """Immutable audit trail entry for incident lifecycle events."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    incident_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    actor_label: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # "AI_AGENT", display_name, "SYSTEM", "GUEST"
    action: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # "created", "analyzed", "status_changed", etc.
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(
        String(45), nullable=True
    )  # IPv4 or IPv6
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), index=True
    )

    # ── Relationships ────────────────────────────────────────────────────
    incident = relationship("Incident", back_populates="audit_logs")
    user = relationship("User")
