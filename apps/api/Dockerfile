FROM node:20-alpine AS base

# Chromium + deps required by Puppeteer on Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl

# Tell Puppeteer to skip downloading its own Chromium and use the system one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# ---- Build stage ----
FROM base AS builder
WORKDIR /app

# Copy workspace manifests and root tsconfig first for layer caching
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install all workspace dependencies
RUN yarn install

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Build shared package first (API depends on it)
WORKDIR /app/packages/shared
RUN yarn build

# Build the NestJS API
WORKDIR /app/apps/api
RUN yarn build

# ---- Production stage ----
FROM base AS runner
WORKDIR /app

# Copy workspace manifests and install only production deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json
RUN yarn install --production

# Copy compiled output from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3001

# Run migrations, seed, then start the server
CMD ["sh", "-c", "node dist/db/run-migrations.js && node dist/db/seed.js && node dist/main.js"]
