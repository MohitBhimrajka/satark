---
trigger: model_decision
description: Reference when implementing data ingestion, file upload handling, or any external data flow
---

# IMPORTANT: Rule 11 Does Not Apply to Satark

Satark does NOT use the ingestion adapter pattern. Users submit content directly through the browser UI via file uploads and text fields. There is no external data source (CSV, SAP, ServiceNow, webhook) to integrate.

**Decision logged:** `docs/memory-bank/decisionLog.md` — "Rejected: ingestion adapter architecture"

---

# Satark File Upload Architecture (Instead of Ingestion Adapters)

All file uploads in Satark flow through:

```
[Browser] → [POST /api/incidents (multipart)] → [app/routers/incidents.py]
    → [app/services/storage.py] → [GCS or /app/uploads/ locally]
    → [app/services/ai/orchestrator.py] → [Background AI analysis]
    → [Database: Incident.ai_analysis updated, status → reviewed]
```

## File Upload Service (`app/services/storage.py`)

```python
async def upload_evidence(
    file: UploadFile,
    incident_id: str,
    storage_backend: str = settings.STORAGE_BACKEND,
) -> tuple[str, str]:  # (gcs_path, sha256_checksum)
    """Upload evidence file to GCS or local filesystem.
    
    Returns (storage_path, sha256_checksum).
    """
    # Validate MIME type (whitelist)
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(415, detail={"code": "UNSUPPORTED_MIME_TYPE"})
    
    # Compute checksum
    content = await file.read()
    checksum = hashlib.sha256(content).hexdigest()
    
    if storage_backend == "gcs":
        path = await upload_to_gcs(content, file.filename, incident_id, file.content_type)
    else:
        path = await save_locally(content, file.filename, incident_id)
    
    return path, checksum
```

## Local Development Storage

When `STORAGE_BACKEND=local`:
- Files saved to `/app/uploads/{incident_id}/`
- Served by FastAPI StaticFiles at `/uploads/`
- No GCS credentials needed for local dev

When `STORAGE_BACKEND=gcs`:
- Files uploaded to `gs://{GCS_BUCKET_NAME}/incidents/{incident_id}/`
- Signed URLs generated for frontend access (15 min expiry)

## MIME Type Allowlist (`app/services/storage.py`)

```python
ALLOWED_MIME_TYPES = {
    # Images
    "image/png", "image/jpeg", "image/webp", "image/gif",
    # Audio
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm",
    # Video
    "video/mp4", "video/webm", "video/quicktime",
    # Documents
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILE_SIZES = {
    "image": 20 * 1024 * 1024,   # 20 MB
    "audio": 100 * 1024 * 1024,  # 100 MB
    "video": 500 * 1024 * 1024,  # 500 MB
    "application": 50 * 1024 * 1024,  # 50 MB (documents)
}
```
