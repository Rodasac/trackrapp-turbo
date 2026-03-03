FROM node:24-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune web --docker

FROM node:24-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm@10
# Install dependencies using pruned package.json files (cache-friendly layer)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Copy full pruned source and build
COPY --from=pruner /app/out/full/ .
RUN --mount=type=secret,id=ENV_FILE \
    set -a && \
    . /run/secrets/ENV_FILE && \
    set +a && \
    pnpm turbo run build --filter=web

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
# Copy standalone build
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Copy static assets
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# Copy public assets
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
