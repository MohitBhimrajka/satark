# app/routers/auth.py
"""
Satark — Authentication router.
Handles user registration, login, and current user info.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.security import get_current_user
from app.services.auth import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        role="analyst",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.role)
    return {
        "data": TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        ).model_dump(),
        "message": "Registration successful",
    }


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )

    token = create_access_token(user.id, user.role)
    return {
        "data": TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        ).model_dump(),
        "message": "Login successful",
    }


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return {
        "data": UserResponse.model_validate(user).model_dump(),
    }
