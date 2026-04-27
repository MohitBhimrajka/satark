#!/bin/bash
# ==============================================================================
#  Satark — Google Cloud Run Deployment Script
#  Deploys backend (FastAPI) and frontend (Next.js) to Cloud Run
#  Uses Artifact Registry (not deprecated GCR)
# ==============================================================================
# Usage:
#   ./satark-deploy.sh                 # Deploy both services
#   ./satark-deploy.sh --backend-only  # Backend only
#   ./satark-deploy.sh --frontend-only # Frontend only
#   ./satark-deploy.sh --yes           # Skip confirmation
# ==============================================================================

set -euo pipefail

# ── Config (override via env or .env.prod) ──────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.prod"

# Load .env.prod if it exists
if [[ -f "$ENV_FILE" ]]; then
    set -a; source "$ENV_FILE"; set +a
fi

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT in deployment/.env.prod}"
REGION="${GOOGLE_CLOUD_REGION:-asia-south1}"
BACKEND_SERVICE="${BACKEND_SERVICE_NAME:-satark-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE_NAME:-satark-frontend}"
CLOUD_SQL_CONNECTION_NAME="${CLOUD_SQL_CONNECTION_NAME:?Set CLOUD_SQL_CONNECTION_NAME in deployment/.env.prod}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/satark"  # Artifact Registry (not GCR)
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$SCRIPT_DIR/.." rev-parse --short HEAD 2>/dev/null || echo 'latest')}"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }

# ── Args ─────────────────────────────────────────────────────────────────────
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true
SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)  DEPLOY_FRONTEND=false; shift ;;
        --frontend-only) DEPLOY_BACKEND=false;  shift ;;
        --yes|-y)        SKIP_CONFIRM=true;      shift ;;
        --help|-h)
            head -15 "$0" | tail -12
            exit 0 ;;
        *) log_error "Unknown option: $1"; exit 1 ;;
    esac
done

# ── Preflight ─────────────────────────────────────────────────────────────────
check_prerequisites() {
    log_info "Checking prerequisites..."
    command -v gcloud &>/dev/null || { log_error "gcloud not found. Install: https://cloud.google.com/sdk"; exit 1; }
    command -v docker &>/dev/null || { log_error "Docker not found or not running"; exit 1; }
    gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 &>/dev/null \
        || { log_error "Not authenticated. Run: gcloud auth login"; exit 1; }

    log_info "Setting project: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"

    log_info "Enabling required APIs..."
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
        secretmanager.googleapis.com sqladmin.googleapis.com --quiet

    # Ensure Artifact Registry repo exists
    if ! gcloud artifacts repositories describe satark --location="$REGION" &>/dev/null; then
        log_info "Creating Artifact Registry repository: satark"
        gcloud artifacts repositories create satark \
            --repository-format=docker \
            --location="$REGION" \
            --description="Satark container images"
    fi

    gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
    log_success "Prerequisites OK"
}

# ── Confirm ────────────────────────────────────────────────────────────────────
confirm_deployment() {
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  SATARK DEPLOYMENT PLAN${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    echo "  Project:  $PROJECT_ID"
    echo "  Region:   $REGION"
    echo "  Tag:      $IMAGE_TAG"
    [[ "$DEPLOY_BACKEND" == "true" ]]  && echo "  Backend:  $BACKEND_SERVICE"
    [[ "$DEPLOY_FRONTEND" == "true" ]] && echo "  Frontend: $FRONTEND_SERVICE"
    echo ""
    if [[ "$SKIP_CONFIRM" != "true" ]]; then
        read -rp "Proceed? (y/N) " reply
        [[ "$reply" =~ ^[Yy]$ ]] || { log_info "Cancelled"; exit 0; }
    fi
}

# ── Backend ────────────────────────────────────────────────────────────────────
build_push_backend() {
    local image="${REGISTRY}/backend:${IMAGE_TAG}"
    log_info "Building backend image..."
    docker build --platform linux/amd64 \
        -t "$image" \
        -f "${SCRIPT_DIR}/../Dockerfile" \
        "${SCRIPT_DIR}/.."
    docker push "$image"
    log_success "Backend image pushed: $image"
}

deploy_backend() {
    local image="${REGISTRY}/backend:${IMAGE_TAG}"
    log_info "Deploying backend to Cloud Run..."

    gcloud run deploy "$BACKEND_SERVICE" \
        --image="$image" \
        --region="$REGION" \
        --platform=managed \
        --port=8000 \
        --add-cloudsql-instances="${CLOUD_SQL_CONNECTION_NAME}" \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=3 \
        --concurrency=80 \
        --timeout=300s \
        --cpu-boost \
        --set-env-vars="APP_ENV=production,AI_MODEL=gemini-3-flash-preview,STORAGE_BACKEND=gcs,LOG_LEVEL=INFO" \
        --set-secrets="DATABASE_URL=satark-database-url:latest,GEMINI_API_KEY=satark-gemini-api-key:latest,JWT_SECRET_KEY=satark-jwt-secret-key:latest,GCS_BUCKET_NAME=satark-gcs-bucket-name:latest,FRONTEND_URL=satark-frontend-url:latest" \
        --allow-unauthenticated

    BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
        --region="$REGION" --format="value(status.url)")
    log_success "Backend deployed: $BACKEND_URL"
    echo "$BACKEND_URL" > /tmp/satark_backend_url
}

# ── Frontend ───────────────────────────────────────────────────────────────────
build_push_frontend() {
    local image="${REGISTRY}/frontend:${IMAGE_TAG}"
    local backend_url
    backend_url=$(cat /tmp/satark_backend_url 2>/dev/null || \
        gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" \
        --format="value(status.url)" 2>/dev/null || echo "${NEXT_PUBLIC_API_URL:-}")

    log_info "Building frontend image (API: $backend_url)..."
    docker build --platform linux/amd64 \
        -t "$image" \
        --build-arg "NEXT_PUBLIC_API_URL=${backend_url}" \
        --build-arg "NEXT_PUBLIC_BASE_PATH=" \
        -f "${SCRIPT_DIR}/../frontend/Dockerfile" \
        "${SCRIPT_DIR}/../frontend"
    docker push "$image"
    log_success "Frontend image pushed: $image"
}

deploy_frontend() {
    local image="${REGISTRY}/frontend:${IMAGE_TAG}"
    log_info "Deploying frontend to Cloud Run..."

    gcloud run deploy "$FRONTEND_SERVICE" \
        --image="$image" \
        --region="$REGION" \
        --platform=managed \
        --port=3000 \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=3 \
        --concurrency=80 \
        --timeout=60s \
        --cpu-boost \
        --set-env-vars="NODE_ENV=production" \
        --allow-unauthenticated

    FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
        --region="$REGION" --format="value(status.url)")
    log_success "Frontend deployed: $FRONTEND_URL"
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ DEPLOYMENT COMPLETE${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"

    if [[ "$DEPLOY_BACKEND" == "true" ]]; then
        BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
            --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "unknown")
        echo "  🔧 Backend:  $BACKEND_URL"
        echo "  📖 API Docs: $BACKEND_URL/docs"
    fi
    if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
        FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
            --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "unknown")
        echo "  🌐 Frontend: $FRONTEND_URL"
    fi
    echo ""
    echo "  📊 Logs:"
    echo "     gcloud run logs tail $BACKEND_SERVICE --region=$REGION"
    echo "     gcloud run logs tail $FRONTEND_SERVICE --region=$REGION"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    check_prerequisites
    confirm_deployment

    if [[ "$DEPLOY_BACKEND" == "true" ]]; then
        build_push_backend
        deploy_backend
    fi

    if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
        build_push_frontend
        deploy_frontend
    fi

    print_summary
}

main
