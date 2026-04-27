# Satark — Deployment Guide (Google Cloud Run)

> Deploy Satark's backend (FastAPI) and frontend (Next.js) to Google Cloud Run with Cloud SQL, GCS, and Secret Manager.

---

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI) installed and authenticated
- [Docker](https://www.docker.com/products/docker-desktop) running locally
- A GCP project with billing enabled
- APIs enabled (see Step 1)

---

## Step 1 — GCP Project Setup

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com
```

---

## Step 2 — Cloud SQL (PostgreSQL 15)

```bash
# Create instance
gcloud sql instances create satark-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=asia-south1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00

# Create database and user
gcloud sql databases create satark_db --instance=satark-postgres
gcloud sql users create satark_user \
  --instance=satark-postgres \
  --password=YOUR_SECURE_PASSWORD

# Get connection name (needed for Cloud Run)
gcloud sql instances describe satark-postgres --format="value(connectionName)"
# Output: PROJECT:REGION:satark-postgres
```

Build your `DATABASE_URL`:
```
postgresql://satark_user:PASSWORD@/satark_db?host=/cloudsql/PROJECT:REGION:satark-postgres
```

---

## Step 3 — GCS Bucket

```bash
gcloud storage buckets create gs://satark-evidence \
  --location=ASIA-SOUTH1 \
  --uniform-bucket-level-access

# Grant Cloud Run service account access
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud storage buckets add-iam-policy-binding gs://satark-evidence \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

---

## Step 4 — Secret Manager

Use the interactive helper:

```bash
make setup-secrets
```

Or create manually:

| Secret Name | Value |
|-------------|-------|
| `satark-database-url` | Full PostgreSQL connection URL |
| `satark-gemini-api-key` | Your AI API key |
| `satark-jwt-secret-key` | `openssl rand -hex 32` |
| `satark-gcs-bucket-name` | `satark-evidence` |
| `satark-frontend-url` | Frontend Cloud Run URL (set after first deploy) |
| `satark-next-public-api-url` | Backend Cloud Run URL (set after first deploy) |

Grant the Compute SA access:

```bash
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for role in roles/cloudsql.client roles/storage.objectAdmin roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:$SA" --role="$role"
done
```

---

## Step 5 — Deploy

```bash
# Deploy both services
make deploy

# Or individually
make deploy-backend
make deploy-frontend

# Check status
make deploy-status
```

After the first backend deploy, update the URL secrets:

```bash
BACKEND_URL=$(gcloud run services describe satark-backend --region=asia-south1 --format="value(status.url)")
echo -n "$BACKEND_URL" | gcloud secrets versions add satark-next-public-api-url --data-file=-
echo -n "FRONTEND_URL_HERE" | gcloud secrets versions add satark-frontend-url --data-file=-
```

Then redeploy the frontend so it picks up the correct API URL.

---

## Step 6 — Database Migrations

Migrations run automatically on backend startup via `start_gunicorn.py`. To run manually:

```bash
# Via Cloud SQL Proxy
cloud-sql-proxy PROJECT:REGION:satark-postgres &
DATABASE_URL="postgresql://satark_user:PASS@localhost:5432/satark_db" alembic upgrade head
```

---

## Step 7 — Seed Demo Data

```bash
# Via Cloud SQL Proxy
cloud-sql-proxy PROJECT:REGION:satark-postgres &
DATABASE_URL="postgresql://satark_user:PASS@localhost:5432/satark_db" python scripts/seed_demo_data.py
```

---

## CI/CD (Cloud Build)

The `cloudbuild.yaml` file is ready. Connect your GitHub repo:

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Connect your GitHub repository
3. Create a trigger on `main` branch using `deployment/cloudbuild.yaml`

---

## Monitoring

```bash
# Tail backend logs
gcloud run logs tail satark-backend --region=asia-south1

# Tail frontend logs
gcloud run logs tail satark-frontend --region=asia-south1

# List services
gcloud run services list --region=asia-south1
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `SIGILL` crash on aarch64 | Ensure `cryptography<44` and `PyJWT==2.9.0` in requirements |
| Cloud SQL connection refused | Verify `--add-cloudsql-instances` flag in deploy script |
| CORS errors | Check `FRONTEND_URL` secret matches actual frontend URL |
| Migrations fail on startup | Check `DATABASE_URL` secret format includes `?host=/cloudsql/...` |
| 502 on frontend | Ensure `NEXT_PUBLIC_API_URL` build arg is set during frontend build |
