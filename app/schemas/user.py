# app/schemas/user.py
"""Satark — User-related Pydantic schemas."""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """POST /api/auth/register request body."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=2, max_length=100)


class UserLogin(BaseModel):
    """POST /api/auth/login request body."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User data returned in API responses."""

    id: uuid.UUID
    email: str
    display_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """POST /api/auth/login and /register response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserRoleUpdate(BaseModel):
    """PATCH /api/admin/users/:id request body."""

    role: str = Field(pattern="^(analyst|admin)$")
