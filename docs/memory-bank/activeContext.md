# Active Context

## Currently Working On
Phase 2 (Backend Core) — **COMPLETE**. Ready to begin Phase 3 (AI Analysis Pipeline).

## Current State
- **Database**: PostgreSQL schema fully applied — 4 tables (users, incidents, evidence_files, audit_logs) + satark_case_seq SEQUENCE.
- **Backend API**: Fully functional with 4 router groups:
  - `POST /api/auth/register|login`, `GET /api/auth/me`
  - `POST/GET/PATCH /api/incidents` (multipart, guest access, filtering, pagination)
  - `GET /api/dashboard/stats|charts/{type}` (6 chart types)
  - `GET/PATCH /api/admin/users` (admin-only)
- **Security**: JWT auth via `get_current_user`, `get_optional_user`, `require_role` dependency chain.
- **Test Suite**: 26 tests passing (SQLite in-memory, no Docker needed).
- **Docker**: Backend boots cleanly on aarch64 (pinned cryptography<44, PyJWT==2.9.0).
- **Seed**: Default admin/analyst users via `scripts/seed_db.py`.

## Immediate Next Steps
1. **Phase 3 — AI Analysis Pipeline**: Implement the 6 AI analyzers (text, URL, image, audio, video, document) using Gemini structured output with `ThreatAnalysis` schema.
2. Create `/api/analyze/*` quick-scan endpoints.
3. Integrate AI analysis into the incident creation flow (background task on create).
4. Set `GEMINI_API_KEY` in `.env`.

## Blockers
- `GEMINI_API_KEY` not yet set — required for Phase 3.
- GCP project ID unconfirmed — needed for Phase 6 deployment.

## Recent Changes
- Audit found and fixed: `start_date`/`end_date` query params not wired into IncidentFilter.
- 18 atomic commits implementing full Phase 2 backend.
- Pinned `cryptography<44` and `PyJWT==2.9.0` for Docker aarch64 compatibility.
- Added `email-validator` to requirements.
- Fixed `require_role` to return callable (not `Depends()`).
- Made `generate_case_number` SQLite-compatible for tests.

