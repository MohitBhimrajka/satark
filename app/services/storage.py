# app/services/storage.py
"""
Satark — File storage service.
Supports local filesystem (development) and GCS (production).
Handles MIME validation, size limits, and SHA-256 checksums.
"""
import hashlib
import os
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.settings import settings

# ── MIME Type Whitelist (per Rule 08) ────────────────────────────────────────
ALLOWED_MIMES: dict[str, set[str]] = {
    "image": {"image/png", "image/jpeg", "image/webp", "image/gif"},
    "audio": {
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/webm",
    },
    "video": {"video/mp4", "video/webm", "video/quicktime"},
    "document": {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
}

# ── Size Limits (bytes) ─────────────────────────────────────────────────────
MAX_SIZES: dict[str, int] = {
    "image": 20_000_000,      # 20 MB
    "audio": 100_000_000,     # 100 MB
    "video": 500_000_000,     # 500 MB
    "document": 50_000_000,   # 50 MB
}

ALL_ALLOWED_MIMES = set().union(*ALLOWED_MIMES.values())


@dataclass
class StorageResult:
    """Result of a file upload operation."""

    storage_path: str
    checksum: str
    file_size: int
    mime_type: str
    stored_filename: str


def _get_input_type_for_mime(mime_type: str) -> str | None:
    """Determine which input type category a MIME type belongs to."""
    for category, mimes in ALLOWED_MIMES.items():
        if mime_type in mimes:
            return category
    return None


def validate_file(file: UploadFile, input_type: str) -> None:
    """
    Validate file MIME type and size against whitelists.
    Raises HTTPException on violation.
    """
    if not file.content_type or file.content_type not in ALL_ALLOWED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}",
        )

    category = _get_input_type_for_mime(file.content_type)
    if category and input_type != category:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type {file.content_type} does not match input_type '{input_type}'",
        )


async def upload_file(
    file: UploadFile, incident_id: str
) -> StorageResult:
    """
    Upload a file to the configured storage backend.
    Returns metadata including checksum and storage path.
    """
    content = await file.read()
    mime_type = file.content_type or "application/octet-stream"
    file_size = len(content)

    category = _get_input_type_for_mime(mime_type)
    if category and file_size > MAX_SIZES.get(category, 50_000_000):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {MAX_SIZES[category] // 1_000_000}MB limit for {category} files",
        )

    checksum = hashlib.sha256(content).hexdigest()
    ext = Path(file.filename or "file").suffix
    stored_filename = f"{uuid.uuid4()}{ext}"
    relative_path = f"{incident_id}/{stored_filename}"

    if settings.STORAGE_BACKEND == "gcs":
        _upload_to_gcs(relative_path, content, mime_type)
    else:
        _upload_to_local(relative_path, content)

    return StorageResult(
        storage_path=relative_path,
        checksum=checksum,
        file_size=file_size,
        mime_type=mime_type,
        stored_filename=stored_filename,
    )


def _upload_to_local(relative_path: str, content: bytes) -> None:
    """Save file to local filesystem."""
    full_path = Path(settings.LOCAL_UPLOAD_DIR) / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_bytes(content)


def _upload_to_gcs(relative_path: str, content: bytes, mime_type: str) -> None:
    """Upload file to Google Cloud Storage."""
    from google.cloud import storage as gcs

    client = gcs.Client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(f"evidence/{relative_path}")
    blob.upload_from_string(content, content_type=mime_type)


def delete_file(storage_path: str) -> bool:
    """Delete a file from the configured storage backend."""
    if settings.STORAGE_BACKEND == "gcs":
        try:
            from google.cloud import storage as gcs
            client = gcs.Client()
            bucket = client.bucket(settings.GCS_BUCKET_NAME)
            blob = bucket.blob(f"evidence/{storage_path}")
            blob.delete()
            return True
        except Exception:
            return False
    else:
        full_path = Path(settings.LOCAL_UPLOAD_DIR) / storage_path
        if full_path.exists():
            os.remove(full_path)
            return True
        return False
