# Active Context

## Currently Working On
Phase 3 (AI Analysis Pipeline) — **COMPLETE**. Ready to begin Phase 4 (Frontend Implementation).

## Current State
- **Database**: Unchanged from Phase 2 — 4 tables (users, incidents, evidence_files, audit_logs) + satark_case_seq.
- **AI Pipeline**: Fully implemented in `app/services/ai/`:
  - `client.py` — Gemini singleton with retry (exponential backoff on 429) + `asyncio.Semaphore(5)` concurrency control
  - `schemas.py` — Canonical `ThreatAnalysis` Pydantic model (re-exported from `app/schemas/analysis.py`)
  - `prompts.py` — `SYSTEM_PROMPT_BASE` + 6 modality-specific prompt templates
  - `orchestrator.py` — Routes incidents to correct analyzer, updates DB, handles errors → `analysis_failed` status
  - `analyzers/` — 6 modules: text, URL, image, audio, video, document
- **Background Tasks**: Incident creation now triggers `analyze_incident` via `BackgroundTasks`
- **Quick Scan Endpoints**: `/api/analyze/text`, `/api/analyze/url`, `/api/analyze/file` (no auth, no DB write)
- **Test Suite**: 41 tests passing (26 Phase 2 + 15 Phase 3, all mocked)
- **Docker**: Not yet re-verified with `make up` (services are currently down)

## Immediate Next Steps
1. **Phase 4 — Frontend**: Build Next.js pages with route groups, design system, and all views
2. Key pages: landing, submit, case/:id, login, register (public) + dashboard, workbench, admin (protected)
3. Implement `usePolling.ts` hook (poll `GET /api/incidents/:id` every 2s until `status != "analyzing"`)
4. Build "Try It Now" section with pre-loaded demo samples (from `demo-samples.json`)

## Blockers
- GCP project ID unconfirmed — needed for Phase 6 deployment
- Camera/mic require HTTPS — only testable on deployed URL

## Recent Changes
- Created `app/services/ai/` package with 6 analyzers, client, prompts, schemas, orchestrator
- Added `/api/analyze/text|url|file` quick-scan endpoints (no auth, no DB)
- Wired `BackgroundTasks.add_task(analyze_incident, ...)` into incident creation router
- Added `analysis_failed` to `IncidentStatus.ALL`
- Added `AI_CONCURRENCY_LIMIT` to settings
- Added `mock_ai_background_task` autouse fixture in conftest (prevents tests from hitting PostgreSQL)
- 9 atomic commits for Phase 3
