FROM node:24-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune worker --docker

FROM node:24-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm@10
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=worker

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker
# Bundled ESM output (workspace code inlined, npm imports are external specifiers)
COPY --from=installer --chown=worker:nodejs /app/apps/worker/dist ./dist
# package.json with "type": "module" so node treats .js as ESM
COPY --from=installer --chown=worker:nodejs /app/apps/worker/package.json ./package.json
# Full workspace node_modules — turbo prune already scopes this to the worker's dep tree.
# pnpm's relative symlinks (.pnpm store + top-level links) are preserved together, so
# transitive deps of bundled workspace packages (e.g. pino from @repo/logger) resolve correctly.
COPY --from=installer --chown=worker:nodejs /app/node_modules ./node_modules
USER worker
EXPOSE 3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
