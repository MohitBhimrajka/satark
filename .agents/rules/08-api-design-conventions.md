---
trigger: model_decision
description: Reference when creating or modifying API endpoints, request/response schemas, pagination, filtering, or error handling patterns
---

# 1. RESTful URL Patterns
- Use **plural nouns** for resource collections: `/api/incidents`, `/api/users`.
- Use path parameters for specific resources: `/api/incidents/{incident_id}`.
- Use nested routes for true parent-child: `/api/incidents/{incident_id}/files`.
- Use `kebab-case` for multi-word segments: `/api/audit-logs`, `/api/analyze/url`.
- Max 2 levels deep (flatten with query params if deeper).

# 2. Satark API Route Reference

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| POST | `/api/incidents` | None (guest) | Submit incident with optional files |
| GET | `/api/incidents` | analyst+ | List all incidents with filters |
| GET | `/api/incidents/{id}` | None (guest_token) or analyst+ | Get incident detail |
| PATCH | `/api/incidents/{id}` | analyst+ | Update status, notes, priority |
| GET | `/api/incidents/{id}/report` | analyst+ | Download PDF report |
| POST | `/api/analyze/url` | None | Quick URL scan |
| POST | `/api/analyze/text` | None | Quick text analysis |
| POST | `/api/analyze/file` | None | Quick file upload and analysis |
| GET | `/api/dashboard/stats` | analyst+ | Platform statistics |
| GET | `/api/dashboard/charts/{type}` | analyst+ | Chart data (A-F) |
| POST | `/api/auth/register` | None | User registration |
| POST | `/api/auth/login` | None | User login (returns JWT) |
| GET | `/api/auth/me` | authenticated | Current user info |
| GET | `/api/admin/users` | admin | List all users |
| PATCH | `/api/admin/users/{id}` | admin | Update user role |
| GET | `/api/health` | None | Health check |

# 3. Standard Response Envelope (ALL responses MUST use this)

**Success (single resource):**
```json
{
  "data": { "id": "...", "case_number": "SAT-2026-00001" },
  "message": "Incident created successfully"
}
```

**Success (collection):**
```json
{
  "data": [ {...}, {...} ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 142,
    "total_pages": 8
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [{ "field": "input_type", "issue": "Must be one of: url, text, image, audio, video, document" }]
  }
}
```

# 4. Satark Error Codes (app/core/errors.py)

| Code | HTTP Status | When |
|------|-------------|------|
| `VALIDATION_ERROR` | 422 | Bad request body |
| `NOT_FOUND` | 404 | Incident/user not found |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Wrong role for this endpoint |
| `GUEST_TOKEN_INVALID` | 403 | Guest token doesn't match |
| `AI_ANALYSIS_FAILED` | 500 | AI service error (graceful) |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `UNSUPPORTED_MIME_TYPE` | 415 | File type not allowed |
| `CASE_NOT_FOUND` | 404 | Case number not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

# 5. Access Control Pattern (FastAPI Dependencies)

NOT `authz.map.json` — use FastAPI Depends:

```python
# app/security.py
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    ...

async def get_optional_user(token: str = Depends(optional_oauth2), db: Session = Depends(get_db)) -> User | None:
    ...

def require_role(*roles: str):
    async def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dependency

# Usage in routers:
@router.get("/api/incidents", dependencies=[Depends(require_role("analyst", "admin"))])
async def list_incidents(...):
    ...
```

# 6. File Upload Limits (ENFORCE IN MIDDLEWARE)

| Input Type | Max Size | Allowed MIME Types |
|-----------|----------|-------------------|
| Image | 20 MB | image/png, image/jpeg, image/webp, image/gif |
| Audio | 100 MB | audio/mp3, audio/wav, audio/ogg, audio/m4a, audio/webm |
| Video | 500 MB | video/mp4, video/webm, video/quicktime |
| Document | 50 MB | application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Text | N/A | text/plain (field input) |
| URL | N/A | string field (validated as URL) |

# 7. Pagination

All list endpoints support:
- `?page=1&page_size=20` (defaults)
- Max page_size: 100
- Always return `pagination` object

# 8. Filtering & Sorting (incidents list)

- `?status=pending` — filter by status
- `?priority=critical` — filter by priority
- `?classification=phishing` — filter by AI classification
- `?start_date=2026-01-01&end_date=2026-12-31` — date range
- `?search=SAT-2026-0001` — search by case number or description
- `?sort_by=created_at&sort_order=desc` — sorting

# 9. Pydantic Schema Discipline
- Every endpoint has explicit Pydantic schemas in `/app/schemas/`
- Schema naming: `IncidentCreate`, `IncidentUpdate`, `IncidentResponse`, `IncidentListResponse`
- Response schemas always wrap in envelope: return `{"data": schema.model_dump()}`
- Use `Optional[]` for nullable fields

# 10. Router Organization
- One router per domain: `incidents.py`, `auth.py`, `analyze.py`, `dashboard.py`, `admin.py`
- Router files are thin — validate, call service, return response
- All business logic in `/app/services/`
- Use FastAPI `tags` for Swagger grouping
