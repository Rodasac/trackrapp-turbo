FROM node:24-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune worker --docker

FROM node:24-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm@10
# Install dependencies using pruned package.json files (cache-friendly layer)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Copy full pruned source and build (tsup bundles all deps inline — fully standalone)
COPY --from=pruner /app/out/full/ .
RUN --mount=type=secret,id=ENV_FILE \
    set -a && \
    . /run/secrets/ENV_FILE && \
    set +a && \
    pnpm turbo run build --filter=worker

FROM node:24-alpine AS runner
WORKDIR /app
# tini as PID 1 for correct signal forwarding in cron worker
RUN apk add --no-cache tini
ENV NODE_ENV=production
# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker
# Only the bundled dist is needed — all deps inlined, banner provides createRequire shim
COPY --from=installer --chown=worker:nodejs /app/apps/worker/dist ./dist

USER worker
EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
