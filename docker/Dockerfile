FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile || pnpm install

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/lifeos.db
ENV ATTACHMENTS_PATH=/app/data/attachments
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 lifeos

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=deps /app/node_modules ./node_modules
COPY docker/migrate-runtime.js ./migrate-runtime.js
COPY docker/entrypoint.sh ./entrypoint.sh

# Create data directories
RUN mkdir -p /app/data/attachments /app/data/backups && \
    chown -R lifeos:nodejs /app/data && \
    chmod +x /app/entrypoint.sh

USER lifeos

EXPOSE 3000

CMD ["./entrypoint.sh"]
