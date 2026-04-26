# app/services/audit.py
"""
Satark — Audit logging service.
Creates immutable audit trail entries for every incident lifecycle event.
"""
import uuid

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    incident_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    actor_label: str = "SYSTEM",
    details: dict | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """
    Create an audit log entry.

    Args:
        action: e.g. "created", "analyzed", "status_changed", "note_added",
                "assigned", "role_changed"
        actor_label: "AI_AGENT", user display_name, "SYSTEM", "GUEST"
    """
    entry = AuditLog(
        incident_id=incident_id,
        user_id=user_id,
        actor_label=actor_label,
        action=action,
        details=details,
        ip_address=ip_address,
    )
    db.add(entry)
    db.flush()
    return entry
