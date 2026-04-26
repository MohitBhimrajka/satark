# Active Context

## Currently Working On
Phase 1 is COMPLETE. Ready to begin Phase 2 — Backend Core (models, auth, CRUD).

## Current State
- **Backend:** Clean Satark API with health/root endpoints, error envelope, settings, constants, modern database module. All template code removed. Compiles and tests pass (3/3).
- **Frontend:** Clean Satark placeholder with light-mode design system (Inter + JetBrains Mono), SWR installed, typed API client. Lint + build pass.
- **Database:** Alembic configured with empty `versions/`. Ready for Satark models.
- **Dependencies:** All Satark deps in `requirements.txt` (google-genai, PyJWT, bcrypt, python-multipart, httpx, reportlab, google-cloud-storage, pydantic-settings). Frontend has SWR.
- **Git:** 20 atomic commits, clean working tree.

## Immediate Next Steps
1. **Phase 2, Step 2.1:** Create `app/models/user.py` — User model with roles
2. **Phase 2, Step 2.2:** Create `app/models/incident.py` — Incident model with case number
3. **Phase 2, Step 2.3:** Create `app/models/evidence_file.py` — EvidenceFile model
4. **Phase 2, Step 2.4:** Create `app/models/audit_log.py` — AuditLog model
5. Create Alembic migration for all models
6. Implement JWT auth (register, login, me)

## Blockers
- None for Phase 2 start
- GCP project ID not confirmed (needed for Phase 6)
- GEMINI_API_KEY not set in `.env` (needed for Phase 3)

## Recent Changes
- Stripped all template backend code (Item model, GeoIP, template routes)
- Stripped all template frontend code (NextAuth, template layout, dark mode CSS)
- Created centralized Settings with pydantic-settings
- Created constants module (priority mapping, incident statuses, classifications)
- Modernized database.py (DeclarativeBase, pool_pre_ping)
- Set up pytest with 3 passing tests
- Updated all dependencies for Satark
- Cleared Alembic migrations
