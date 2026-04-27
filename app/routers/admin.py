# app/routers/admin.py
"""
Satark — Admin router.
User management endpoints. Admin only.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserRoleUpdate
from app.security import get_current_user, require_role
from app.services.audit import log_action

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", dependencies=[Depends(require_role("admin"))])
def admin_stats(db: Session = Depends(get_db)):
    """Platform-wide admin statistics. Admin only."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    role_counts = dict(
        db.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )
    return {
        "total_users": total_users,
        "by_role": role_counts,
    }


@router.get("/users", dependencies=[Depends(require_role("admin"))])
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all users. Admin only."""
    import math

    total = db.query(User).count()
    offset = (page - 1) * page_size
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "data": [UserResponse.model_validate(u).model_dump() for u in users],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": math.ceil(total / page_size) if total > 0 else 0,
        },
    }


@router.patch(
    "/users/{user_id}",
    dependencies=[Depends(require_role("admin"))],
)
def update_user_role(
    user_id: uuid.UUID,
    data: UserRoleUpdate,
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a user's role. Admin only."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    old_role = target_user.role
    target_user.role = data.role

    log_action(
        db=db,
        action="role_changed",
        user_id=admin.id,
        actor_label=admin.display_name,
        details={
            "target_user_id": str(user_id),
            "from_role": old_role,
            "to_role": data.role,
        },
    )

    db.commit()
    db.refresh(target_user)

    return {
        "data": UserResponse.model_validate(target_user).model_dump(),
        "message": f"User role updated to {data.role}",
    }
