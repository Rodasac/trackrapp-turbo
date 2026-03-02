# TrackrApp — Subscription Tracker Implementation Plan

> **Status:** Phase 4 complete — next: Payment method tracking (Priority 2)
> **Last updated:** 2026-03-02
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
| Phase 5   | Future Features (see below)          | 🔄 In progress |

---

## Future Features (Prioritized)

| Priority | Feature                      | Status      | Est. Time   | Difficulty  | Rationale                                                                                                                                                                                                           |
|----------| ---------------------------- | ----------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Default values on import     | ✅ Complete | —           | —           | ImportDefaultsPanel in MappingStep; only name+price required from CSV; billingCycle/nextRenewalDate/currency/category/startDate defaultable. Shipped 2026-03-02.                                                    |
| 2        | Shared/family splitting      | ⬜          | 5–8 days    | Medium-High | New `subscription_splits` table. UX design decisions needed. KPIs/charts need "your share" toggle.                                                                                                                  |
| 3        | Bank/Open Banking connection | ⬜          | 10–15+ days | High        | External APIs, PSD2/Open Banking compliance. EU-first: Tink, Salt Edge, or GoCardless Bank Account Data (Nordigen) for Spain/Europe; Plaid as US fallback. Automatic subscription detection from bank transactions. |

### Feature Details

#### 1. Default values on import ✅ (shipped 2026-03-02)

Extended the CSV import flow (Step 4.3) with a collapsible "Default Values" panel in the Map Columns step. Only `name` and `price` are mandatory CSV columns; `billingCycle`, `nextRenewalDate`, `currency`, `category`, and `startDate` can be satisfied by either a mapped CSV column or a pre-set default. CSV column value takes priority over default. No schema changes — purely UI + fallback injection in `handleContinue`.

#### 2. Shared/family subscription splitting

New `subscription_splits` table (id, subscriptionId, userId, sharePercent, shareAmount). Allows assigning a subscription cost across multiple family members or roommates. Dashboard KPIs and charts get a toggle for "total cost" vs "your share". Requires invite or link mechanism for non-registered members.

#### 3. Bank/Open Banking connection

Connect bank accounts to automatically detect subscription transactions. EU-first approach using PSD2-compliant providers:

- **Spain/Europe**: GoCardless Bank Account Data (formerly Nordigen), Tink, or Salt Edge
- **US fallback**: Plaid

Transaction matching uses merchant name + recurring amount patterns to suggest new subscriptions. Requires OAuth bank authorization flow, webhook handling for new transactions, and a review queue for suggested subscriptions.
