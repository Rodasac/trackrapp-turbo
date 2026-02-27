# TrackrApp — Subscription Tracker Implementation Plan

> **Status:** Phase 3 in progress
> **Last updated:** 2026-02-25
> **Resume instructions:** Read this file, check `docs/progress.md` for current status, then continue from the next incomplete phase/step.

---

## Context

Build a multi-user subscription tracker with automatic renewal reminders, expense analytics, and AI-powered spending insights. The app helps users make better financial decisions by tracking recurring expenses, visualizing spending patterns, and providing personalized tips. It includes a freemium model (Stripe billing from day one) where AI-generated insights are a paid feature.

## Architecture Overview

- **`apps/web`** — Next.js 16 App Router (frontend + API routes)
- **`apps/worker`** — Node.js process with node-cron (reminders, AI tips, cleanup)
- **`packages/database`** — Drizzle ORM + PostgreSQL (shared between web + worker)
- **`packages/ui`** — shadcn/ui components + Recharts

## Implementation Phases

| Phase     | Description                          | Status         |
| --------- | ------------------------------------ | -------------- |
| MVP (1+2) | Auth + CRUD + Stripe + Notifications | ✅ Complete    |
| Phase 3   | Dashboard & Insights                 | 🔄 In progress |
| Phase 4   | AI Tips + Polish                     | ⬜ Not started |

---

---

## Phase 4: AI Tips + Polish

> **Depends on:** Phase 3 complete

- Claude/OpenAI API integration in worker (`pnpm add --filter worker ai @ai-sdk/openai @ai-sdk/anthropic`)
- Weekly batch job: analyze subscriptions, generate 3-5 personalized tips per Pro user
- Tips stored in `ai_tips` table with expiration
- Example tips:
  - "Your entertainment spending is 40% of total — 3 streaming services overlap in content"
  - "Spotify raised prices — consider YouTube Music at $X/mo"
- CSV import: parse CSV, match to service catalog, bulk-create subscriptions
- Landing/marketing page
- Dark mode (already wired in Tailwind config)

---

## Future Features (not planned)

- Shared/family subscription splitting
- Payment method tracking (which card each sub bills to)
- Bank connection via Plaid for automatic detection
