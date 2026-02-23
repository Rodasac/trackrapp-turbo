# TrackrApp — Subscription Tracker Implementation Plan

> **Status:** Not started
> **Last updated:** 2026-02-23
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

| Phase | Description | Status |
|-------|-------------|--------|
| MVP (1+2) | Auth + CRUD + Stripe + Notifications | ⬜ Not started |
| Phase 3 | Dashboard & Insights | ⬜ Not started |
| Phase 4 | AI Tips + Polish | ⬜ Not started |

---

## MVP Implementation Steps

### Step 1: Database Schema

**File:** `packages/database/src/schema/index.ts`

Add these tables alongside the existing `users` table:

```
tracked_subscriptions:
  - id (serial PK)
  - userId (FK -> users)
  - name (text, required)
  - description (text, optional)
  - price (numeric, required)
  - currency (text, default "USD")
  - billingCycle (enum: monthly, yearly, weekly, quarterly)
  - nextRenewalDate (date, required)
  - startDate (date, optional)
  - categoryId (FK -> categories, optional)
  - serviceCatalogId (FK -> service_catalog, optional)
  - logoUrl (text, optional)
  - websiteUrl (text, optional)
  - isActive (boolean, default true)
  - notes (text, optional)
  - createdAt, updatedAt (timestamps)

categories:
  - id (serial PK)
  - userId (FK -> users, nullable — null = system default)
  - name (text, required)
  - color (text, optional — for chart colors)
  - icon (text, optional — Lucide icon name)
  - createdAt (timestamp)

service_catalog:
  - id (serial PK)
  - name (text, required, unique)
  - logoUrl (text, optional)
  - websiteUrl (text, optional)
  - defaultCategory (text, optional)
  - typicalMonthlyPrice (numeric, optional)
  - typicalYearlyPrice (numeric, optional)
  - currency (text, default "USD")
  - lastVerifiedAt (timestamp, optional)

notifications:
  - id (serial PK)
  - userId (FK -> users)
  - type (enum: renewal_reminder, price_change, tip, system)
  - title (text)
  - message (text)
  - relatedSubscriptionId (FK -> tracked_subscriptions, nullable)
  - isRead (boolean, default false)
  - createdAt (timestamp)

push_subscriptions:
  - id (serial PK)
  - userId (FK -> users)
  - endpoint (text, unique)
  - p256dh (text)
  - auth (text)
  - createdAt (timestamp)

notification_preferences:
  - id (serial PK)
  - userId (FK -> users, unique)
  - emailEnabled (boolean, default true)
  - pushEnabled (boolean, default false)
  - reminderDaysBefore (integer array, default [7, 3, 1])
  - createdAt, updatedAt (timestamps)

price_history:
  - id (serial PK)
  - trackedSubscriptionId (FK -> tracked_subscriptions)
  - price (numeric)
  - recordedAt (timestamp, default now)
```

**Commands to run:**
```bash
npx @better-auth/cli@latest generate  # generates auth tables
drizzle-kit generate && drizzle-kit migrate
```

**Seed data:**
- `service_catalog`: ~30 popular services
- `categories` (system defaults): Entertainment, Productivity, Music, Gaming, Cloud Storage, Health & Fitness, News & Reading, Education, Finance, Other

---

### Step 2: Better Auth Setup

**New files:**
- `apps/web/lib/auth.ts` — Server-side Better Auth config
- `apps/web/lib/auth-client.ts` — Client-side auth hooks
- `apps/web/app/api/auth/[...all]/route.ts` — Catch-all auth API route
- `apps/web/middleware.ts` — Protect authenticated routes

**Config details:**
- Adapter: `drizzleAdapter(db, { provider: "pg", usePlural: true })`
- Providers: email/password + Google OAuth
- Stripe plugin: `createCustomerOnSignUp: true`
- Plans: `free` and `pro` (with 14-day trial)

**Required env vars:**
```
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

**Packages to add to `packages/database/package.json`:**
```
better-auth
@better-auth/stripe
stripe
```

---

### Step 3: App Layout & Navigation

**New pages:**
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/signup/page.tsx`
- `apps/web/app/(auth)/layout.tsx` — centered layout
- `apps/web/app/(dashboard)/layout.tsx` — sidebar + header
- `apps/web/app/(dashboard)/dashboard/page.tsx`
- `apps/web/app/(dashboard)/subscriptions/page.tsx`
- `apps/web/app/(dashboard)/subscriptions/new/page.tsx`
- `apps/web/app/(dashboard)/subscriptions/[id]/page.tsx`
- `apps/web/app/(dashboard)/notifications/page.tsx`
- `apps/web/app/(dashboard)/tips/page.tsx`
- `apps/web/app/(dashboard)/settings/page.tsx`
- `apps/web/app/pricing/page.tsx` — public pricing page

**New UI components (`packages/ui`):**
- Sidebar navigation component
- KPI card component
- Subscription card component
- Notification item component

**shadcn components to add:**
```bash
shadcn add input form dialog dropdown-menu select separator avatar toast table tabs calendar popover chart label textarea switch
```
(badge already exists)

---

### Step 4: Subscription CRUD

**API routes:**
- `apps/web/app/api/subscriptions/route.ts` — GET (list), POST (create)
- `apps/web/app/api/subscriptions/[id]/route.ts` — GET, PUT, DELETE
- `apps/web/app/api/categories/route.ts` — GET, POST
- `apps/web/app/api/service-catalog/route.ts` — GET (search/list)

**Features:**
- Add: search service catalog (autocomplete) or manual entry
- Auto-fill from catalog: name, logo, typical price, default category
- Edit: any field; price changes recorded in `price_history`
- Delete: soft delete (set `isActive=false`) or hard delete with confirmation
- List: filterable by category, sortable by price/renewal date/name, searchable
- Display: logo, name, price, next renewal date, category badge

---

### Step 5: Worker App

**New package:** `apps/worker/`

**Structure:**
```
apps/worker/
  package.json         (deps: node-cron, @repo/database, resend, web-push)
  tsconfig.json
  src/
    index.ts           (cron scheduler entry point)
    jobs/
      send-reminders.ts
      generate-ai-tips.ts   (Phase 4 — Pro users only)
      cleanup.ts
    services/
      email.ts              (Resend wrapper)
      push.ts               (web-push wrapper)
```

**Cron schedule:**
- Every hour: `send-reminders` — find subscriptions renewing within user's reminder window, send notifications (dedup: check if notification already sent for this renewal)
- Daily at 3am: `cleanup` — delete read notifications older than 30 days
- Weekly Sunday 2am (Phase 4): `generate-ai-tips` — batch process Pro users

**Required env vars:**
```
DATABASE_URL
RESEND_API_KEY
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

**Update `turbo.json`:** Add worker scripts.

---

### Step 6: Notification System

**Email (via Resend):**
- Use React Email templates
- Renewal reminder: "Your [Service] subscription ($X/mo) renews in [N] days"

**Web Push:**
- Service worker: `apps/web/public/sw.js`
- `PushNotificationManager` component for subscribe/unsubscribe
- Store push subscriptions in DB
- Worker sends via `web-push` library

**In-app notifications:**
- Notification bell in header with unread count badge
- Notification center page: mark-as-read, mark-all-read
- Real-time: poll every 60s or SSE

**Preferences (in settings page):**
- Toggle email on/off
- Toggle push on/off
- Configure reminder timing: choose from [30, 14, 7, 3, 1] days before

---

### Step 7: Stripe Integration

**Plans:**
- Free: unlimited subscriptions, basic dashboard, email reminders
- Pro: AI tips, advanced analytics, push notifications, CSV import/export, priority support
- Pro includes 14-day free trial
- Stripe Checkout for upgrade, Stripe Billing Portal for management

**Pages:**
- `/pricing` — public plan comparison
- `/settings` billing tab — current plan + manage link

**Webhook:** Handled by Better Auth Stripe plugin at `/api/auth/stripe/webhook`

---

## Phase 3: Dashboard & Insights

> **Depends on:** MVP complete

- KPI cards: total monthly spend, total yearly, active count, cost per day, remaining cost this month
- Spending trend: line chart (last 12 months) using shadcn/ui ChartContainer + Recharts
- Category breakdown: donut/pie chart
- Calendar widget: highlight renewal dates in next 30 days
- Most expensive subscriptions: horizontal bar chart (top 5)
- Price history per subscription: line chart on detail page
- CSV export: download all subscriptions as CSV
- Static tips: "Switch to annual plan to save X%", "You have N overlapping streaming services"

---

## Phase 4: AI Tips + Polish

> **Depends on:** Phase 3 complete

- Claude API integration in worker (`@anthropic-ai/sdk`)
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

---

## Key Files to Modify

| File | Change |
|------|--------|
| `packages/database/src/schema/index.ts` | Add all new tables |
| `packages/database/src/seed.ts` | Seed categories + service catalog |
| `packages/database/src/index.ts` | Export new schema types |
| `packages/database/package.json` | Add `better-auth`, `@better-auth/stripe`, `stripe` |
| `packages/ui/` | Add shadcn components |
| `apps/web/package.json` | Add `better-auth`, `resend`, `web-push` |
| `apps/web/app/` | All new pages and API routes |
| `apps/web/lib/auth.ts` | New: Better Auth server config |
| `apps/web/lib/auth-client.ts` | New: Better Auth client |
| `apps/web/middleware.ts` | New: route protection |
| `apps/web/public/sw.js` | New: service worker for push |
| `apps/worker/` | New: entire worker app |
| `turbo.json` | Add worker scripts |

---

## Verification Checklist

- [ ] **Auth flow:** Register, log in, log out, OAuth with Google
- [ ] **Subscription CRUD:** Add from catalog, add manually, edit price (check price_history), delete
- [ ] **Stripe:** Upgrade to Pro via Checkout, verify webhook creates subscription record, downgrade via portal
- [ ] **Notifications:** Set subscription to renew tomorrow, run worker, verify email via Resend, verify in-app notification, verify push (if subscribed)
- [ ] **Settings:** Toggle email/push preferences, change reminder timing
- [ ] **Worker:** Run `pnpm --filter worker dev`, verify cron jobs execute on schedule
- [ ] **Tests:** Run `pnpm test` — unit tests for DB queries, API routes, notification logic
