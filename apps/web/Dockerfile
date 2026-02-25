FROM node:20-alpine AS base

# ---- Build stage ----
FROM base AS builder
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all workspace dependencies from the monorepo root
RUN yarn install

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/web
RUN yarn build

# ---- Production stage ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# outputFileTracingRoot=monorepo-root means standalone mirrors the full repo tree:
#   server.js lives at standalone root
#   static assets live at apps/web/.next/static inside the standalone tree
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]
