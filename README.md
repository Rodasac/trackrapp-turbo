# TrackrApp

A multi-user subscription tracker with automatic renewal reminders, expense analytics, and AI-powered spending insights. TrackrApp helps you see every recurring expense in one place, visualize where your money goes, and get personalized tips for cutting waste. Freemium model — AI insights are a Pro (paid) feature.

## Features

- Subscription CRUD with categories, currencies, billing cycles, and renewal dates
- Renewal reminders via email and web push (VAPID)
- Dashboard with KPI cards and spend-over-time charts (Recharts)
- AI-generated monthly spending tips (Pro)
- Stripe billing with customer portal, freemium gating, and trial activation
- CSV import with column mapping and configurable defaults
- Multi-currency and multi-language UI (`next-intl`, English + Spanish today)
- Light / dark theme

## Tech stack

- **Web:** Next.js 16 (App Router) + React 19
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** Better Auth (email + Google OAuth) with the Stripe plugin
- **Payments:** Stripe (subscriptions + customer portal)
- **UI:** shadcn/ui (new-york style) + Tailwind CSS v4
- **Worker:** Node.js + node-cron (reminders, AI tips, cleanup) — planned
- **Email:** Resend
- **Push:** Web Push with VAPID
- **Tooling:** Turborepo, pnpm, Vitest, Playwright

## Monorepo layout

| Path                         | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `apps/web`                   | Next.js App Router — frontend + API routes            |
| `apps/worker`                | Node.js cron worker (reminders, AI tips, cleanup)     |
| `packages/database`          | Drizzle ORM schema + client, shared by web and worker |
| `packages/ui`                | shadcn/ui components and shared primitives            |
| `packages/tailwind-config`   | Single source of Tailwind v4 CSS tokens               |
| `packages/vitest-config`     | Shared Vitest base / UI config                        |
| `packages/eslint-config`     | Shared ESLint config                                  |
| `packages/typescript-config` | Shared `tsconfig` bases                               |

## Getting started

Requires Node.js 20+, pnpm 9+, and a running PostgreSQL instance.

```bash
# 1. Install dependencies
pnpm install

# 2. Build the shared Vitest config (one-time, required before first `pnpm test`)
pnpm build --filter=@repo/vitest-config

# 3. Configure environment variables
cp packages/database/.env.example packages/database/.env   # set DATABASE_URL
cp apps/web/.env.example apps/web/.env                     # set BETTER_AUTH_*, STRIPE_*, etc.

# 4. Push the schema and seed initial data
pnpm db:push
pnpm db:seed

# 5. Run the web app
pnpm dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000).

See the **Environment Variables** table in [`CLAUDE.md`](./CLAUDE.md) for the full list of required keys per package.

## Common scripts

| Command                 | What it does                                 |
| ----------------------- | -------------------------------------------- |
| `pnpm dev`              | Run every app in dev mode                    |
| `pnpm dev --filter=web` | Run only the web app (port 3000)             |
| `pnpm build`            | Build all packages and apps                  |
| `pnpm lint`             | Lint every workspace                         |
| `pnpm check-types`      | Type-check every workspace                   |
| `pnpm test`             | Run all tests via Turborepo (cached)         |
| `pnpm test:projects`    | Run all tests via Vitest projects (no cache) |
| `pnpm db:generate`      | Generate a new Drizzle migration from schema |
| `pnpm db:migrate`       | Apply pending migrations                     |
| `pnpm db:push`          | Push the schema directly (dev shortcut)      |
| `pnpm db:seed`          | Seed development data                        |
| `pnpm db:studio`        | Open Drizzle Studio                          |

## Project status

Phases 1–4 are complete (auth, CRUD, Stripe billing, reminders, dashboard, AI tips, polish). Current focus: shared/family subscription splitting. Bank / Open Banking integration is on the roadmap.

For the full plan, milestones, and progress, see [`docs/implementation-plan.md`](./docs/implementation-plan.md) and [`docs/progress.md`](./docs/progress.md).
