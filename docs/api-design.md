# Satark API Design Specification

> Complete API contract for the Satark backend. All endpoints follow the standard envelope format.

---

## Standard Response Envelope

### Success (single resource)
```json
{
  "data": { ... },
  "message": "Human-readable success message"
}
```

### Success (list with pagination)
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  }
}
```

### Error
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Human-readable error message",
    "details": []
  }
}
```

### Error Codes
| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `BAD_REQUEST` | Invalid input, missing fields |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Valid JWT but insufficient role |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate email on registration |
| 422 | `VALIDATION_ERROR` | Pydantic validation failure |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

JWT payload:
```json
{
  "sub": "<user_id>",
  "role": "analyst",
  "exp": 1719849600
}
```

---

## Endpoints

### Health & Root

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/health` | None | `{"status": "healthy", "service": "satark-api"}` |
| GET | `/` | None | `{"service": "Satark API", "version": "0.1.0", ...}` |

---

### Auth (`/api/auth`)

#### POST `/api/auth/register`
**Auth:** None
**Body:**
```json
{
  "email": "analyst@cert.army.in",
  "password": "SecureP@ss123",
  "display_name": "Major Singh"
}
```
**Response (201):**
```json
{
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "email": "analyst@cert.army.in",
      "display_name": "Major Singh",
      "role": "analyst",
      "created_at": "2026-04-27T00:00:00Z"
    }
  },
  "message": "Registration successful."
}
```

#### POST `/api/auth/login`
**Auth:** None
**Body:**
```json
{
  "email": "analyst@cert.army.in",
  "password": "SecureP@ss123"
}
```
**Response (200):** Same as register (returns token + user).

#### GET `/api/auth/me`
**Auth:** Any authenticated user
**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "analyst@cert.army.in",
    "display_name": "Major Singh",
    "role": "analyst",
    "created_at": "2026-04-27T00:00:00Z"
  }
}
```

---

### Incidents (`/api/incidents`)

#### POST `/api/incidents`
**Auth:** None (guest submission)
**Content-Type:** `multipart/form-data`
**Fields:**
- `input_type` (string, required): `text | url | image | audio | video | document`
- `input_content` (string, required): The text/URL content (for text/url types)
- `description` (string, optional): Free-text description of the incident
- `files` (file[], optional): Evidence files (for image/audio/video/document types)

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "case_number": "SAT-2026-00001",
    "guest_token": "uuid-token-for-guest-access",
    "status": "analyzing",
    "input_type": "text",
    "created_at": "2026-04-27T00:00:00Z"
  },
  "message": "Incident submitted. AI analysis in progress."
}
```

#### GET `/api/incidents`
**Auth:** analyst or admin
**Query params:**
- `page` (int, default: 1)
- `page_size` (int, default: 20, max: 100)
- `status` (string, optional): Filter by status
- `priority` (string, optional): Filter by priority
- `classification` (string, optional): Filter by classification
- `search` (string, optional): Search case_number, input_content
- `date_from` (datetime, optional)
- `date_to` (datetime, optional)
- `sort_by` (string, default: `created_at`)
- `sort_order` (string, default: `desc`)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "case_number": "SAT-2026-00001",
      "input_type": "text",
      "status": "analyzed",
      "priority": "high",
      "classification": "phishing",
      "threat_score": 85,
      "created_at": "2026-04-27T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total_items": 42, "total_pages": 3 }
}
```

#### GET `/api/incidents/:id`
**Auth:** guest_token (query param) OR analyst/admin
**Query params:**
- `token` (string, optional): Guest access token

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "case_number": "SAT-2026-00001",
    "input_type": "text",
    "input_content": "You have won a lottery...",
    "status": "analyzed",
    "priority": "high",
    "classification": "phishing",
    "threat_score": 85,
    "ai_analysis": {
      "classification": "phishing",
      "threat_score": 85,
      "confidence": 0.92,
      "summary": "This message exhibits classic phishing indicators...",
      "indicators": ["suspicious-domain.com", "185.234.56.78"],
      "mitigation_steps": ["Do not click any links", "Report to IT security", "..."],
      "risk_factors": ["Urgency language", "Unknown sender", "Suspicious URL"]
    },
    "analyst_notes": null,
    "assigned_to": null,
    "evidence_files": [
      {
        "id": "uuid",
        "filename": "screenshot.png",
        "mime_type": "image/png",
        "file_size": 245000,
        "uploaded_at": "2026-04-27T00:00:00Z"
      }
    ],
    "audit_trail": [
      {
        "action": "incident_created",
        "details": {},
        "created_at": "2026-04-27T00:00:00Z"
      },
      {
        "action": "analysis_complete",
        "details": {"threat_score": 85},
        "created_at": "2026-04-27T00:00:15Z"
      }
    ],
    "created_at": "2026-04-27T00:00:00Z",
    "updated_at": "2026-04-27T00:00:15Z"
  }
}
```

#### PATCH `/api/incidents/:id`
**Auth:** analyst or admin
**Body:**
```json
{
  "status": "investigating",
  "priority": "critical",
  "analyst_notes": "Confirmed phishing campaign targeting Regiment HQ.",
  "assigned_to": "user-uuid"
}
```
**Response (200):**
```json
{
  "data": { "...updated incident..." },
  "message": "Incident updated."
}
```

#### GET `/api/incidents/:id/report`
**Auth:** analyst or admin
**Response:** PDF file download (`application/pdf`)

---

### Quick Analysis (`/api/analyze`)

#### POST `/api/analyze/text`
**Auth:** None
**Body:**
```json
{
  "content": "You have won a lottery! Click here to claim..."
}
```
**Response (200):**
```json
{
  "data": {
    "classification": "phishing",
    "threat_score": 85,
    "confidence": 0.92,
    "summary": "...",
    "indicators": ["..."],
    "mitigation_steps": ["..."],
    "risk_factors": ["..."]
  }
}
```

#### POST `/api/analyze/url`
**Auth:** None
**Body:**
```json
{
  "url": "https://suspicious-domain.com/login"
}
```
**Response (200):** Same structure as text analysis.

#### POST `/api/analyze/file`
**Auth:** None
**Content-Type:** `multipart/form-data`
**Fields:**
- `file` (file, required): The file to analyze

**Response (200):** Same structure as text analysis.

---

### Dashboard (`/api/dashboard`)

#### GET `/api/dashboard/stats`
**Auth:** analyst or admin
**Response (200):**
```json
{
  "data": {
    "total_incidents": 150,
    "active_cases": 23,
    "threats_detected": 89,
    "avg_threat_score": 62.4,
    "by_status": { "submitted": 5, "analyzing": 2, "analyzed": 45, "investigating": 12, "resolved": 86 },
    "by_priority": { "critical": 8, "high": 25, "medium": 45, "low": 72 },
    "by_classification": { "phishing": 40, "malware": 22, "fraud": 15, "espionage": 3, "opsec_risk": 9, "safe": 61 }
  }
}
```

#### GET `/api/dashboard/charts/:type`
**Auth:** analyst or admin
**Path param:** `type` — one of: `incidents_by_type`, `severity_timeline`, `geo_map`, `top_iocs`, `trend_line`, `confidence_distribution`
**Query params:**
- `date_from` (datetime, optional)
- `date_to` (datetime, optional)

**Response (200):**
```json
{
  "data": {
    "labels": ["phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"],
    "datasets": [
      {
        "label": "Incidents by Classification",
        "data": [40, 22, 15, 3, 9, 61]
      }
    ]
  }
}
```

---

### Admin (`/api/admin`)

#### GET `/api/admin/users`
**Auth:** admin only
**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "admin@cert.army.in",
      "display_name": "Colonel Mehta",
      "role": "admin",
      "created_at": "2026-04-20T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total_items": 5, "total_pages": 1 }
}
```

#### PATCH `/api/admin/users/:id`
**Auth:** admin only
**Body:**
```json
{
  "role": "analyst"
}
```
**Response (200):**
```json
{
  "data": { "...updated user..." },
  "message": "User role updated."
}
```

---

## File Upload Constraints

| Input Type | Allowed MIME Types | Max File Size |
|------------|-------------------|---------------|
| image | image/jpeg, image/png, image/webp, image/gif | 10 MB |
| audio | audio/mpeg, audio/wav, audio/ogg, audio/webm | 25 MB |
| video | video/mp4, video/webm, video/quicktime | 50 MB |
| document | application/pdf, text/plain, text/csv, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document | 25 MB |

---

## Pagination Convention

All list endpoints use offset-based pagination:
- `page` (1-indexed)
- `page_size` (default 20, max 100)
- Response includes `pagination` object with `total_items` and `total_pages`
