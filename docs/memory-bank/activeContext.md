# Active Context

## Currently Working On
Phase 6: Deployment — **LIVE IN PRODUCTION** ✅

## Current State
- **Backend:** `https://satark-backend-1094555524365.asia-south1.run.app` — HEALTHY
- **Frontend:** `https://satark-frontend-1094555524365.asia-south1.run.app` — SERVING
- **GCP Project:** `satark-sih-2025` (billing: Pioneer)
- **Cloud SQL:** `satark-postgres` (PostgreSQL 15, asia-south1, RUNNABLE)
- **GCS Bucket:** `gs://satark-evidence/`
- **Secrets:** 6/6 in Secret Manager, all bound to Cloud Run SA
- **IAM:** Compute SA has `cloudsql.client` + `storage.objectAdmin`
- CORS configured: frontend URL → backend allows origin

## Immediate Next Steps
1. Open `https://satark-frontend-1094555524365.asia-south1.run.app` in browser — verify full flow
2. Seed production database (login, create test incidents)
3. Optional: Set up Cloud Build CI/CD trigger (Step 11 in plan)
4. Final presentation prep

## Blockers
None — both services deployed and serving

## Recent Changes (Phase 6 — 2026-04-27)
1. **GCP Project:** Created `satark-sih-2025` with billing attached
2. **Cloud SQL:** Provisioned `satark-postgres` (POSTGRES_15, db-g1-small, asia-south1)
3. **Secrets:** 6 secrets in Secret Manager (database-url, gemini-api-key, jwt-secret, gcs-bucket, frontend-url, next-public-api-url)
4. **Dockerfile fix:** Added `COPY utils/` for wait_for_db.py (was missing, caused container crash)
5. **wait_for_db.py fix:** Added DATABASE_URL support for production (was only using POSTGRES_* Docker env vars)
6. **database.py:** Added pool_size=5, pool_recycle=1800 for Cloud SQL reliability
7. **satark-deploy.sh:** Added `--add-cloudsql-instances` flag + CLOUD_SQL_CONNECTION_NAME variable
8. **cloudbuild.yaml:** Added `--add-cloudsql-instances` + substitution variable
