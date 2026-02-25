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

## Phase 3: Dashboard & Insights

> **Depends on:** MVP complete
> **Execution order:** 3.1 → 3.3 → 3.2 → 3.4 → 3.5

### Step 3.1: Enhanced KPIs + Dashboard Charts

**Goal:** Add 2 new KPI cards (cost/day, remaining this month) and 3 charts (spending trend, category breakdown, top 5 subscriptions).

**API changes:**
- `GET /api/dashboard/stats` — add `costPerDay` and `remainingThisMonth` fields
- `GET /api/dashboard/charts` — returns `{ spendingTrend, categoryBreakdown, topSubscriptions }`

**New components:** `SpendingTrendChart`, `CategoryBreakdownChart`, `TopSubscriptionsChart`, `DashboardCharts`

**Updated:** `dashboard-kpis.tsx` (6 cards), `dashboard/page.tsx`

**Dependencies:** Add `recharts` to `apps/web` — `@repo/ui` already has `recharts` + the `ChartContainer`/tooltip wrappers, but `apps/web` components need to import chart primitives (`LineChart`, `BarChart`, `PieChart`, etc.) directly, so it must be a direct dep there too.

---

### Step 3.2: Renewal Calendar Widget

**Goal:** Calendar highlighting upcoming renewal dates in next 30 days, with details on selection.

**API:** `GET /api/dashboard/renewals` — active subs with `nextRenewalDate` between today and today+30

**New:** `useRenewalCalendar` hook, `RenewalCalendar` component (shadcn Calendar with modifiers)

---

### Step 3.3: Price History Chart

**Goal:** Replace plain-text price history list with a line chart when >= 2 data points exist.

**No new API** — uses existing `priceHistory[]` from `GET /api/subscriptions/[id]`

**New:** `PriceHistoryChart` component; conditional rendering in `subscription-detail.tsx`

---

### Step 3.4: CSV Export

**Goal:** Download all subscriptions as a CSV file.

**API:** `GET /api/subscriptions/export` — returns `text/csv` with `Content-Disposition: attachment`

**New:** `@repo/shared/csv.ts` (generateCsv utility), `CsvExportButton` component

---

### Step 3.5: Static Tips

**Goal:** Rule-based spending tips computed from user's subscription data.

**API:** `GET /api/dashboard/tips` — returns `StaticTip[]`

**Rules:** annual savings, overlapping services, high-spend category, forgotten subscription, daily cost awareness

**New:** `apps/web/lib/tips.ts` (pure logic), `useStaticTips` hook, `StaticTipsList` component

---

### Dashboard Page Layout (after all steps)

```
[KPI Grid — 6 cards, 2/3/6 cols responsive]
[Two-column layout:]
  Left (2/3): Spending Trend | Category Breakdown + Top 5
  Right (1/3): Renewal Calendar | Static Tips
```

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
