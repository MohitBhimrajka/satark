# Phase 2 — Backend Core (Models, Auth, Services)

> **Goal:** Build the entire backend data layer — database models, authentication, core services, and API routes.

## Duration: ~30 commits

---

## Step 2.1 — Database Models

### 2.1.1 — User Model
- [ ] Create `app/models/user.py`
  - Fields: id (UUID), email, password_hash, display_name, role (enum: guest/analyst/admin), created_at, updated_at
  - Add unique constraint on email
  - Add index on role for filtering

### 2.1.2 — Incident Model
- [ ] Create `app/models/incident.py`
  - Fields: id (UUID), case_number (auto-generated SAT-YYYY-NNNNN), submitted_by (FK User nullable), guest_token, input_type (enum), input_content, status (enum), priority (enum), classification (enum nullable), threat_score (int nullable), ai_analysis (JSON nullable), analyst_notes, assigned_to (FK User nullable), created_at, updated_at
  - Add indexes on: status, priority, classification, created_at

### 2.1.3 — EvidenceFile Model
- [ ] Create `app/models/evidence_file.py`
  - Fields: id (UUID), incident_id (FK Incident), filename, original_filename, mime_type, file_size, gcs_path, checksum (SHA-256), uploaded_at
  - Cascade delete with parent Incident

### 2.1.4 — AuditLog Model
- [ ] Create `app/models/audit_log.py`
  - Fields: id (UUID), incident_id (FK nullable), user_id (FK nullable), action (enum), details (JSON), ip_address, created_at
  - Add indexes on: incident_id, user_id, action, created_at

### 2.1.5 — Model Registration
- [ ] Update `app/models/__init__.py` to export all models
- [ ] Create Alembic migration: `make migrate-create MSG='add_satark_core_models'`
- [ ] Apply migration: `make migrate-up`
- [ ] Verify tables exist in PostgreSQL

### Success Criteria
- All 4 tables created in database
- Migration chain is clean
- `make migrate-history` shows correct chain

### Commits
```
feat: add User model with role-based access
feat: add Incident model with classification and threat scoring
feat: add EvidenceFile model with GCS path tracking
feat: add AuditLog model for compliance trail
chore: register all models and create initial migration
```

---

## Step 2.2 — Pydantic Schemas

### Tasks
- [ ] Create `app/schemas/user.py`:
  - `UserCreate` (email, password, display_name)
  - `UserLogin` (email, password)
  - `UserResponse` (id, email, display_name, role, created_at)
  - `TokenResponse` (access_token, token_type, user: UserResponse)

- [ ] Create `app/schemas/incident.py`:
  - `IncidentCreate` (input_type, input_content, description)
  - `IncidentResponse` (all fields, evidence_files list, audit entries)
  - `IncidentListItem` (summary fields for list view)
  - `IncidentUpdate` (status, priority, analyst_notes, assigned_to)
  - `IncidentFilter` (status, priority, classification, date range)

- [ ] Create `app/schemas/analysis.py`:
  - `ThreatAnalysis` (classification, threat_score, confidence, summary, indicators, mitigation_steps, risk_factors)
  - `QuickScanRequest` (url or text input)
  - `QuickScanResponse` (analysis + metadata)

- [ ] Create `app/schemas/dashboard.py`:
  - `DashboardStats` (total, by_status, by_priority, by_classification)
  - `ChartData` (labels, datasets)
  - `TimeSeriesPoint` (date, count)

- [ ] Create `app/schemas/evidence.py`:
  - `EvidenceFileResponse` (id, filename, mime_type, file_size, uploaded_at)

### Success Criteria
- All schemas validate correctly
- Pydantic v2 syntax used throughout
- All enums match database model enums

### Commits
```
feat: add User schemas (create, login, response, token)
feat: add Incident schemas (create, response, update, filter)
feat: add ThreatAnalysis schema for AI structured output
feat: add Dashboard and Chart data schemas
feat: add EvidenceFile response schema
```

---

## Step 2.3 — Authentication System

### Tasks
- [ ] Create `app/services/auth.py`:
  - `hash_password(password)` → bcrypt hash
  - `verify_password(plain, hashed)` → bool
  - `create_access_token(user_id, role)` → JWT string
  - `decode_access_token(token)` → payload dict
  
- [ ] Update `app/security.py`:
  - `get_current_user(token)` → User (from JWT)
  - `get_optional_user(token)` → User | None (for guest endpoints)
  - `require_role(roles)` → dependency that checks role

- [ ] Create `app/routers/auth.py`:
  - `POST /api/auth/register` → create user, return token
  - `POST /api/auth/login` → verify credentials, return token
  - `GET /api/auth/me` → return current user info

- [ ] Create default admin user in seed script

### Success Criteria
- Registration creates user with hashed password
- Login returns valid JWT
- Protected endpoints reject invalid/missing tokens
- Role-based access works (analyst can't access admin routes)

### Commits
```
feat: add password hashing and JWT token utilities
feat: add auth dependencies (current user, optional user, role check)
feat: add auth router (register, login, me)
feat: add admin user seeding script
```

---

## Step 2.4 — File Storage Service (GCS)

### Tasks
- [ ] Create `app/services/storage.py`:
  - `upload_file(file, incident_id)` → gcs_path
  - `download_file(gcs_path)` → file stream
  - `delete_file(gcs_path)` → bool
  - `generate_signed_url(gcs_path)` → temporary URL
  - Local filesystem fallback for development (when GCS not configured)

- [ ] Add GCS configuration to `.env.example`
- [ ] Create development fallback: save to `/app/uploads/` locally

### Success Criteria
- Files upload to local storage in dev
- Files upload to GCS when configured
- Signed URLs work for file access
- SHA-256 checksum computed on upload

### Commits
```
feat: add GCS file storage service with local fallback
feat: add file checksum computation on upload
chore: add GCS config to environment
```

---

## Step 2.5 — Incident Service & Router

### Tasks
- [ ] Create `app/services/incident.py`:
  - `create_incident(data, files, user)` → Incident
  - `get_incident(id)` → Incident
  - `get_incident_by_case_number(case_number)` → Incident
  - `list_incidents(filters, pagination)` → list[Incident]
  - `update_incident(id, data, user)` → Incident
  - `generate_case_number()` → "SAT-2026-00001"

- [ ] Create `app/routers/incidents.py`:
  - `POST /api/incidents` — Create (accepts multipart form with files)
  - `GET /api/incidents` — List (analyst+ only, with filters)
  - `GET /api/incidents/:id` — Detail (public if guest_token matches, else analyst+)
  - `PATCH /api/incidents/:id` — Update (analyst+ only)

- [ ] Wire router into `main.py`

### Success Criteria
- Can create incident with file uploads
- Case numbers auto-increment correctly
- Guests can view their own cases via token
- Analysts can list and filter all cases

### Commits
```
feat: add case number generator (SAT-YYYY-NNNNN format)
feat: add incident service with CRUD operations
feat: add incident router with create endpoint
feat: add incident list endpoint with filtering and pagination
feat: add incident detail and update endpoints
feat: wire incident router into main app
```

---

## Step 2.6 — Dashboard Service & Router

### Tasks
- [ ] Create `app/services/dashboard.py`:
  - `get_stats()` → DashboardStats
  - `get_chart_data(chart_type, date_range)` → ChartData
  - Chart types: incidents_by_type, severity_timeline, geo_map, top_iocs, trend_line, confidence_distribution

- [ ] Create `app/routers/dashboard.py`:
  - `GET /api/dashboard/stats` — Aggregated stats
  - `GET /api/dashboard/charts/:type` — Chart-specific data

### Success Criteria
- Stats endpoint returns correct aggregates
- Each chart type returns properly formatted data
- Date range filtering works

### Commits
```
feat: add dashboard service with aggregation queries
feat: add dashboard router with stats and chart endpoints
```

---

## Step 2.7 — Admin Router

### Tasks
- [ ] Create `app/routers/admin.py`:
  - `GET /api/admin/users` — List all users (admin only)
  - `PATCH /api/admin/users/:id` — Update user role (admin only)
  - `GET /api/admin/stats` — Platform-wide statistics

### Success Criteria
- Only admin role can access these endpoints
- Role changes are audited

### Commits
```
feat: add admin router with user management endpoints
```

---

## Step 2.8 — Audit Logging

### Tasks
- [ ] Create `app/services/audit.py`:
  - `log_action(incident_id, user_id, action, details, ip)` → AuditLog
  - Automatically called by incident service on every state change

- [ ] Integrate into incident service:
  - Log on create, analyze, status change, note add, report generate

### Success Criteria
- Every incident action creates an audit log entry
- Audit trail visible on incident detail

### Commits
```
feat: add audit logging service
feat: integrate audit logging into incident lifecycle
```

---

## Phase 2 Output

At the end of Phase 2:
- ✅ Complete database schema with migrations
- ✅ JWT authentication with role-based access
- ✅ File upload to GCS (or local fallback)
- ✅ Full incident CRUD with filtering
- ✅ Dashboard aggregation queries
- ✅ Admin user management
- ✅ Audit trail on every action
- ✅ ~30 atomic commits
- ✅ All endpoints testable via `/docs` (Swagger)
- ✅ Ready for Phase 3 (AI integration)
