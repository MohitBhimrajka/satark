# ==============================================================================
#  Satark Frontend Dockerfile — Next.js 15 Standalone Mode
#  3-stage build: deps → builder → runner
#  Uses output: 'standalone' for minimal production image (~50MB vs ~600MB)
# ==============================================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts

# Separate dev-deps install for build stage
FROM node:20-alpine AS deps-dev
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all dependencies (including devDeps needed for build)
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

# Accept build-time env vars (these are baked into the Next.js bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Stage 3: Runner (final image — only ~50-80MB) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cloud Run sets PORT env var; Next.js standalone server respects HOSTNAME+PORT
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what the standalone server needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the standalone Next.js server (no next start, no node_modules needed)
CMD ["node", "server.js"]