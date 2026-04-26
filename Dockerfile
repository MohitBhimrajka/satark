# ==============================================================================
#  Satark Backend Dockerfile — FastAPI + Gunicorn + Uvicorn
#  Multi-stage build for minimal production image
# ==============================================================================

# --- Stage 1: Builder ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies (needed for psycopg2 binary, bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies (cached layer — only re-runs when requirements change)
COPY packages/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# --- Stage 2: Runtime ---
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install runtime dependencies only (libpq for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Unbuffered logging — critical for Cloud Run / Cloud Logging
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create upload directory for local dev file storage
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Copy application source
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini ./
COPY scripts/ ./scripts/
COPY gunicorn/ ./gunicorn/
COPY start_gunicorn.py ./

# Create non-root user for security
RUN adduser --disabled-password --no-create-home satark_user && \
    chown -R satark_user:satark_user /app

USER satark_user

# Cloud Run sets PORT env var — default 8000 for our setup
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start with gunicorn for production (single worker is optimal for Cloud Run)
CMD ["python", "start_gunicorn.py"]