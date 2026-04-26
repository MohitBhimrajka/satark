# Phase 6 — Deployment (Google Cloud Run)

> Goal: Deploy Satark to production — both services on Cloud Run, Cloud SQL PostgreSQL, GCS for evidence storage.
> All infrastructure is managed via `make` commands and `deployment/satark-deploy.sh`.

## MCP Tools for This Phase

| Task | MCP Tool |
|------|----------|
| Verify GCP project exists | `mcp_cloudrun_list_projects()` |
| Create GCP project if needed | `mcp_cloudrun_create_project(projectId="satark-sih-2025")` |
| **Deploy backend to Cloud Run** | `mcp_cloudrun_deploy_local_folder(project=..., folderPath="...", service="satark-backend", region="asia-south1")` |
| **Deploy frontend to Cloud Run** | `mcp_cloudrun_deploy_local_folder(project=..., folderPath=".../frontend", service="satark-frontend", region="asia-south1")` |
| Get service URL after deploy | `mcp_cloudrun_get_service(project=..., service="satark-backend", region="asia-south1")` |
| Check Cloud Run logs | `mcp_cloudrun_get_service_log(project=..., service="satark-backend", region="asia-south1")` |
| Look up Cloud Run config | `mcp_google-developer-knowledge_search_documents("cloud run secret manager environment variables python")` |
| Cloud SQL connection patterns | `mcp_google-developer-knowledge_answer_query("How to connect FastAPI to Cloud SQL PostgreSQL on Cloud Run?")` |

> **Preferred deployment flow:** `mcp_cloudrun_deploy_local_folder` is faster than building Docker images manually. It handles Artifact Registry automatically. Use it for quick deploys; use `make deploy` (which runs `satark-deploy.sh`) for full production CI/CD.

---

## Overview

| Component | Service | Notes |
|-----------|---------|-------|
| Backend (FastAPI) | Cloud Run `satark-backend` | Port 8000, 512Mi, Artifact Registry |
| Frontend (Next.js) | Cloud Run `satark-frontend` | Port 3000, 512Mi, standalone output |
| Database | Cloud SQL PostgreSQL 15 | `satark-postgres` instance |
| File Storage | Cloud Storage | `satark-evidence` bucket |
| Secrets | Secret Manager | 6 secrets, auto-injected |
| CI/CD | Cloud Build | Triggers on push to `main` |
| Container Registry | Artifact Registry | `asia-south1-docker.pkg.dev/PROJECT/satark` |

---

## Step 6.1 — GCP Project Setup

### Prerequisites
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Docker running locally
- A GCP project created (or create one: `gcloud projects create satark-sih-2025`)

### Tasks
- [ ] Set active project: `gcloud config set project YOUR_PROJECT_ID`
- [ ] Enable required APIs:
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com
```
- [ ] Copy `deployment/prod.example.env` → `deployment/.env.prod` and fill in project ID

### Commits
```
chore: fill in GCP project config in deployment/.env.prod
```

---

## Step 6.2 — Cloud SQL (PostgreSQL)

### Tasks
- [ ] Create PostgreSQL 15 instance:
```bash
gcloud sql instances create satark-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=asia-south1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --root-password=$(openssl rand -base64 32)
```
- [ ] Create database and user:
```bash
gcloud sql databases create satark_db --instance=satark-postgres
gcloud sql users create satark_user \
  --instance=satark-postgres \
  --password=$(openssl rand -base64 24)
```
- [ ] Get connection name: `gcloud sql instances describe satark-postgres --format="value(connectionName)"`
- [ ] Build DATABASE_URL: `postgresql://satark_user:PASSWORD@/satark_db?host=/cloudsql/CONNECTION_NAME`

### Commits
```
chore: document Cloud SQL setup steps in deployment guide
```

---

## Step 6.3 — Secret Manager Setup

### Tasks
- [ ] Run `make setup-secrets` — interactive script creates all 4 primary secrets
- [ ] After backend deploys, add URL secrets:
```bash
echo -n "https://satark-backend-HASH.a.run.app" | gcloud secrets create satark-frontend-url --data-file=-
echo -n "https://satark-backend-HASH.a.run.app" | gcloud secrets create satark-next-public-api-url --data-file=-
```
- [ ] Verify all 6 secrets exist:
```bash
gcloud secrets list --filter="name:satark-"
```

**Required secrets:**
| Secret Name | Value |
|-------------|-------|
| `satark-gemini-api-key` | Your Gemini API key |
| `satark-jwt-secret-key` | Random 64-char string (openssl rand -hex 32) |
| `satark-gcs-bucket-name` | `satark-evidence` |
| `satark-database-url` | Full PostgreSQL connection URL |
| `satark-frontend-url` | Frontend Cloud Run URL (set after deploy) |
| `satark-next-public-api-url` | Backend Cloud Run URL (set after deploy) |

### Commits
```
chore: document Secret Manager secret names and setup process
```

---

## Step 6.4 — GCS Bucket Setup

### Tasks
- [ ] Create evidence bucket:
```bash
gcloud storage buckets create gs://satark-evidence \
  --location=ASIA-SOUTH1 \
  --uniform-bucket-level-access
```
- [ ] Set CORS policy for direct browser uploads (future):
```bash
cat > /tmp/cors.json << 'EOF'
[{"origin": ["*"], "method": ["GET", "HEAD", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]
EOF
gcloud storage buckets update gs://satark-evidence --cors-file=/tmp/cors.json
```
- [ ] Grant Cloud Run SA access:
```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud storage buckets add-iam-policy-binding gs://satark-evidence \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### Commits
```
chore: document GCS bucket setup for evidence storage
```

---

## Step 6.5 — Artifact Registry Setup

### Tasks
- [ ] Create Artifact Registry repository (satark-deploy.sh does this automatically, but can be done manually):
```bash
gcloud artifacts repositories create satark \
  --repository-format=docker \
  --location=asia-south1 \
  --description="Satark container images"
```
- [ ] Auth Docker: `gcloud auth configure-docker asia-south1-docker.pkg.dev`

---

## Step 6.6 — First Deployment

### Tasks
- [ ] Fill in `deployment/.env.prod` with project ID and region
- [ ] Run first backend-only deploy:
```bash
make deploy-backend
```
- [ ] Get backend URL: `make deploy-status`
- [ ] Update `satark-frontend-url` and `satark-next-public-api-url` secrets with backend URL
- [ ] Deploy frontend:
```bash
make deploy-frontend
```
- [ ] Check both services:
```bash
make deploy-status
```

### Commits
```
chore: initial Cloud Run deployment of backend
chore: initial Cloud Run deployment of frontend
```

---

## Step 6.7 — Database Migrations in Production

### Tasks
- [ ] After backend deploys, run migrations via Cloud Run exec (or Cloud SQL Proxy):
```bash
# Option A: Cloud SQL Proxy locally
cloud-sql-proxy PROJECT:REGION:satark-postgres &
DATABASE_URL="postgresql://satark_user:PASS@localhost:5432/satark_db" \
  alembic upgrade head

# Option B: Cloud Run Jobs (advanced)
gcloud run jobs create satark-migrate \
  --image=REGISTRY/backend:latest \
  --region=asia-south1 \
  --set-cloudsql-instances=PROJECT:REGION:satark-postgres \
  --set-secrets=DATABASE_URL=satark-database-url:latest \
  --command="alembic" \
  --args="upgrade,head"
gcloud run jobs execute satark-migrate --region=asia-south1
```
- [ ] Seed production demo data:
```bash
# Via Cloud Run exec after job completes
gcloud run jobs create satark-seed \
  --image=REGISTRY/backend:latest \
  --region=asia-south1 \
  --set-cloudsql-instances=PROJECT:REGION:satark-postgres \
  --set-secrets=DATABASE_URL=satark-database-url:latest \
  --command="python" \
  --args="scripts/seed_demo_data.py"
gcloud run jobs execute satark-seed --region=asia-south1
```

### Commits
```
chore: run initial database migrations on production
chore: seed production database with demo incidents
```

---

## Step 6.8 — CI/CD Pipeline Setup (Cloud Build)

### Tasks
- [ ] Connect GitHub repo in Cloud Build console: `console.cloud.google.com/cloud-build/triggers`
- [ ] Grant Cloud Build SA permissions:
```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant Cloud Run deployer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/run.admin"

# Grant Secret Manager accessor for all satark secrets
for secret in satark-database-url satark-frontend-url satark-next-public-api-url \
              satark-gemini-api-key satark-jwt-secret-key satark-gcs-bucket-name; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$SA" \
    --role="roles/secretmanager.secretAccessor"
done

# Grant Artifact Registry write access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/artifactregistry.writer"
```
- [ ] Create Cloud Build trigger:
```bash
gcloud builds triggers create github \
  --repo-name=satark \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern=main \
  --build-config=deployment/cloudbuild.yaml \
  --name=satark-main-deploy
```
- [ ] Test trigger with a push to main

### Commits
```
chore: configure Cloud Build CI/CD trigger for main branch
```

---

## Step 6.9 — Production Verification

### Tasks
- [ ] End-to-end test on production URL:
  - [ ] Submit a text incident (guest mode)
  - [ ] Submit a URL incident
  - [ ] Submit an image upload
  - [ ] Login as analyst — verify dashboard charts populate
  - [ ] Open workbench — verify incident appears with AI analysis
  - [ ] Download PDF report
  - [ ] "Try It Now" demo works on landing page
- [ ] Verify camera/mic work (HTTPS enables getUserMedia)
- [ ] Performance: AI analysis completes within 15 seconds
- [ ] Check Cloud Logging for any errors: `gcloud run logs tail satark-backend --region=asia-south1`

### Commits
```
docs: record production URLs in README
fix: any production issues found during verification
```

---

## Step 6.10 — Final README Update

### Tasks
- [ ] Update `README.md` with:
  - What Satark is and the SIH problem statement
  - Architecture diagram
  - Live URLs (backend API docs, frontend)
  - How to run locally (make up)
  - How to deploy (make deploy)
  - Commit count at submission

### Commits
```
docs: update README with Satark description, architecture, and live URLs
```

---

## Deployment Reference

```bash
# All deployment via Makefile
make deploy              # Full deploy (both services)
make deploy-backend      # Backend only
make deploy-frontend     # Frontend only
make deploy-status       # Check Cloud Run status
make setup-secrets       # Create Secret Manager secrets

# Check logs
gcloud run logs tail satark-backend --region=asia-south1
gcloud run logs tail satark-frontend --region=asia-south1

# Check services
gcloud run services list --region=asia-south1
```
