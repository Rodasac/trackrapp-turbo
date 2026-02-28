# TrackrApp — Subscription Tracker Implementation Plan

> **Status:** Phase 4 in progress
> **Last updated:** 2026-02-27
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

| Phase     | Description                          | Status      |
| --------- | ------------------------------------ | ----------- |
| MVP (1+2) | Auth + CRUD + Stripe + Notifications | ✅ Complete |
| Phase 3   | Dashboard & Insights                 | ✅ Complete |
| Phase 4   | AI Tips + Polish                     | ✅ Complete |

---

## Future Features (Prioritized)

| Priority | Feature                      | Est. Time   | Difficulty  | Rationale                                                                                                                                                                                                           |
| -------- | ---------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Default values on import     | 1–2 days    | Low         | Extends existing CSV import (Step 4.3). UI defaults + fallback logic only. No new tables or APIs.                                                                                                                   |
| 2        | Payment method tracking      | 3–5 days    | Medium      | New `payment_methods` table + FK on `tracked_subscriptions`. Standard CRUD pattern, self-contained.                                                                                                                 |
| 3        | Shared/family splitting      | 5–8 days    | Medium-High | New `subscription_splits` table. UX design decisions needed. KPIs/charts need "your share" toggle.                                                                                                                  |
| 4        | Bank/Open Banking connection | 10–15+ days | High        | External APIs, PSD2/Open Banking compliance. EU-first: Tink, Salt Edge, or GoCardless Bank Account Data (Nordigen) for Spain/Europe; Plaid as US fallback. Automatic subscription detection from bank transactions. |

### Feature Details

#### 1. Default values on import

Extends the CSV import flow (Step 4.3) with a defaults step: users can pre-set category, billing cycle, and currency before mapping columns. When a column isn't mapped, the default fills in. No schema changes required — purely UI logic + fallback in the parse/validate step.

#### 2. Payment method tracking

New `payment_methods` table (id, userId, label, last4, brand, expiryMonth, expiryYear). Add optional `paymentMethodId` FK to `tracked_subscriptions`. CRUD in Settings → Payment Methods. Filter subscriptions by card in the list view. Aggregate "per card" spending in analytics.

#### 3. Shared/family subscription splitting

New `subscription_splits` table (id, subscriptionId, userId, sharePercent, shareAmount). Allows assigning a subscription cost across multiple family members or roommates. Dashboard KPIs and charts get a toggle for "total cost" vs "your share". Requires invite or link mechanism for non-registered members.

#### 4. Bank/Open Banking connection

Connect bank accounts to automatically detect subscription transactions. EU-first approach using PSD2-compliant providers:

- **Spain/Europe**: GoCardless Bank Account Data (formerly Nordigen), Tink, or Salt Edge
- **US fallback**: Plaid

Transaction matching uses merchant name + recurring amount patterns to suggest new subscriptions. Requires OAuth bank authorization flow, webhook handling for new transactions, and a review queue for suggested subscriptions.
