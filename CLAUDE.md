# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TrackrApp — a multi-user subscription tracker with renewal reminders, expense analytics, and AI-powered spending insights. Freemium model: AI tips are a Pro (paid) feature.

See `docs/implementation-plan.md` for the full build plan and `docs/progress.md` for current implementation status.

## Package Manager & Monorepo

This is a **pnpm + Turborepo** monorepo. Always use `pnpm`, never `npm` or `yarn`.

```
apps/web        — Next.js 16 App Router (frontend + API routes)
apps/worker     — Node.js cron worker (reminders, AI tips, cleanup) [to be built]
packages/database   — Drizzle ORM + PostgreSQL, shared by all apps
packages/ui         — shadcn/ui components (Tailwind v4, new-york style)
packages/tailwind-config  — Single source of CSS tokens (tailwind.css)
packages/typescript-config / eslint-config / vitest-config — shared tooling
```

## Common Commands

```bash
# Development
pnpm dev                          # run all apps
pnpm dev --filter=web             # run only web app (port 3000)

# Building
pnpm build                        # build all packages/apps
pnpm build --filter=@repo/vitest-config  # required before first test run

# Linting & types
pnpm lint                         # lint all
pnpm check-types                  # type-check all

# Testing
pnpm test                         # run all tests via Turborepo (uses caching)
pnpm test:projects                # run all tests via Vitest projects (no caching)
pnpm test:projects:watch          # watch mode
pnpm --filter=web test            # run tests for a single package

# Database (run from repo root — Turborepo forwards to @repo/database)
pnpm db:generate                  # drizzle-kit generate (after schema changes)
pnpm db:migrate                   # drizzle-kit migrate (apply migrations)
pnpm db:push                      # push schema directly (dev shortcut)
pnpm db:seed                      # run src/seed.ts
pnpm db:studio                    # open Drizzle Studio

# Adding shadcn components (run from packages/ui)
pnpm --filter=@repo/ui dlx shadcn add <component>
```

## Architecture & Key Patterns

### Database (`packages/database`)

- **Schema:** `src/schema/index.ts` — all table definitions + exported TS types
- **Client:** `src/client.ts` — uses a global singleton (`global._db`) to survive Next.js HMR without exhausting the connection pool
- **Exports:** `src/index.ts` re-exports `{ db, schema }` and all schema types
- **Migrations:** generated into `drizzle/` directory by drizzle-kit
- **Env:** requires `DATABASE_URL` (see `packages/database/.env.example`)

In API routes, always import as:

```ts
import { db, schema } from "@repo/database";
```

### UI Package (`packages/ui`)

- shadcn components live in `packages/ui/src/` and are exported as `@repo/ui/<name>` (e.g. `import { Button } from "@repo/ui/button"`)
- Utility: `import { cn } from "@repo/ui/lib/utils"`
- **Tailwind v4** — configured via CSS, not `tailwind.config.js`. The single source of tokens is `packages/tailwind-config/tailwind.css`, imported by consuming apps via `postcss.config.mjs`
- Dark mode is toggled by adding/removing `.dark` class on `<html>` (already wired in theme tokens)
- Brand color: `bg-brand` / `text-brand` (custom token in `tailwind.css`)
- Components use the `new-york` style with `neutral` base color

### Next.js App (`apps/web`)

- App Router with route groups: `(auth)` for login/signup, `(dashboard)` for protected pages
- API routes follow the pattern in `app/api/users/route.ts`: import `db` + `schema`, use standard `Response.json()`
- Auth middleware will protect `(dashboard)` routes via `middleware.ts` (to be built)
- Auth library: **Better Auth** with Drizzle adapter + Stripe plugin (to be built in Step 2)

### Testing

- Each package has its own `vitest.config.ts` importing from `@repo/vitest-config`
- `packages` use `baseConfig` (Node env); `apps` use `uiConfig` (jsdom env)
- Root `vitest.config.ts` uses Vitest projects for unified dev-time test running
- Run `pnpm build --filter=@repo/vitest-config` once before the first `pnpm test`

## Environment Variables

| Package          | Variable                                      | Purpose                               |
| ---------------- | --------------------------------------------- | ------------------------------------- |
| `@repo/database` | `DATABASE_URL`                                | PostgreSQL connection string          |
| `apps/web`       | `BETTER_AUTH_SECRET`                          | Auth signing secret                   |
| `apps/web`       | `BETTER_AUTH_URL`                             | Full URL of the web app               |
| `apps/web`       | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`   | OAuth                                 |
| `apps/web`       | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe                                |
| `apps/worker`    | `RESEND_API_KEY`                              | Email delivery                        |
| `apps/worker`    | `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`      | Web push notifications                |
| `apps/web`       | `UPLOADTHING_TOKEN`                           | Uploadthing file uploads              |
| `apps/web`       | `SMTP_HOST`                                   | SMTP server host (default: localhost) |
| `apps/web`       | `SMTP_PORT`                                   | SMTP server port (default: 1025)      |
| `apps/web`       | `SMTP_USER`                                   | SMTP auth username                    |
| `apps/web`       | `SMTP_PASS`                                   | SMTP auth password                    |
| `apps/web`       | `EMAIL_FROM`                                  | From address for auth emails          |

Each app reads `DATABASE_URL` directly from the environment (not from `packages/database`).
