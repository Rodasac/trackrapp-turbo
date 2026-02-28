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

| Phase     | Description                          | Status         |
| --------- | ------------------------------------ | -------------- |
| MVP (1+2) | Auth + CRUD + Stripe + Notifications | ✅ Complete    |
| Phase 3   | Dashboard & Insights                 | ✅ Complete    |
| Phase 4   | AI Tips + Polish                     | ✅ Complete    |

---

---

## Phase 4: AI Tips + Polish

> **Depends on:** Phase 3 complete

| Step | Description                | Status        |
| ---- | -------------------------- |---------------|
| 4.1  | Dark mode                  | ✅ Complete    |
| 4.2  | Landing/marketing page     | ✅ Complete    |
| 4.3  | CSV import                 | ✅ Complete    |
| 4.4  | AI tips (worker + web)     | ✅ Complete    |

---

#### Step 4.1: Dark Mode

> Three-state theme toggle (Light / Dark / System) using `next-themes`. CSS dark tokens already exist.

**Dependencies:** `pnpm add --filter=web next-themes`

**Files to modify:**
- `apps/web/app/layout.tsx` — add `suppressHydrationWarning` to `<html>`
- `apps/web/components/providers.tsx` — wrap children with `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`)
- `packages/tailwind-config/tailwind.css` — remove `@media (prefers-color-scheme: dark)` block (lines 103-129); conflicts with class-based toggling via `next-themes`
- `apps/web/app/globals.css` — remove `color-scheme: dark` media query if present

**Files to create:**
- `apps/web/components/theme-toggle.tsx` — dropdown with `Sun`/`Moon`/`Monitor` icons using `DropdownMenu` from `@repo/ui/dropdown-menu`. Handles mounted state to avoid hydration mismatch.

**Integration:** Add `ThemeToggle` to the header/navbar (alongside notification bell).

**Reuse:**
- Dark token definitions: `packages/tailwind-config/tailwind.css` (lines 76-100, `.dark` class block)
- `@repo/ui/dropdown-menu` (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem)
- `@repo/ui/button` for trigger

**TDD sequence:**
1. Tests first:
   - `apps/web/tests/components/theme-toggle.test.tsx` — mock `next-themes`, test dropdown renders, each option calls `setTheme()` correctly, active theme indicated (~5 tests)
2. Implementation: install dep → create component → wire provider → modify layout + CSS
3. E2E: `apps/web/e2e/dark-mode.spec.ts` — toggle visible, selecting Dark adds `.dark` class, selecting Light removes it, preference persists after reload (~5 tests)

---

#### Step 4.2: Landing/Marketing Page

> Full marketing page at `/` — navbar, hero, feature cards, pricing section, footer. Supports dark mode from step 4.1.

**Files to create:**
- `apps/web/components/landing/navbar.tsx` — client component (`useSession` for auth-conditional CTAs + `ThemeToggle`)
- `apps/web/components/landing/hero-section.tsx` — headline, subheadline, CTA buttons (`/signup`, `#features`)
- `apps/web/components/landing/feature-cards.tsx` — 4 cards: Renewal Reminders, Spending Analytics, AI Tips, CSV Import
- `apps/web/components/landing/pricing-section.tsx` — simplified Free vs Pro comparison (reuses pricing data from `apps/web/app/pricing/page.tsx`)
- `apps/web/components/landing/footer.tsx` — logo, nav links, copyright

**Files to modify:**
- `apps/web/app/page.tsx` — replace placeholder with composed landing page (server component with client islands)

**Reuse:**
- `@repo/ui/card`, `@repo/ui/button`, `@repo/ui/badge`, `@repo/ui/separator`
- `lucide-react` icons for feature cards
- `useSession` from `apps/web/lib/auth-client.ts`
- Pricing data/structure from `apps/web/app/pricing/page.tsx`

**TDD sequence:**
1. Tests first:
   - `apps/web/tests/components/landing/hero-section.test.tsx` — renders headline, CTA links present (~2 tests)
   - `apps/web/tests/components/landing/feature-cards.test.tsx` — renders 4 cards with titles (~2 tests)
   - `apps/web/tests/components/landing/navbar.test.tsx` — shows Sign in/Get started when unauthenticated, shows Dashboard when authenticated (~3 tests)
   - `apps/web/tests/components/landing/footer.test.tsx` — renders copyright and logo (~2 tests)
2. Implementation: create component files → compose in `app/page.tsx`
3. E2E: `apps/web/e2e/landing.spec.ts` — page loads, hero visible, feature cards visible, CTAs navigate correctly, navbar theme toggle works (~7 tests)

---

#### Step 4.3: CSV Import

> Upload CSV, fuzzy-match names against service catalog, preview table for confirmation, bulk-create subscriptions.

**Dependencies:** None (no external libraries — Levenshtein implemented inline in shared package)

##### 4.3a: Shared utilities

**Files to modify:**
- `packages/shared/src/csv.ts` — add `parseCsv(csvString): { headers: string[]; rows: string[][] }` (RFC 4180, BOM stripping, Windows line endings)
- `packages/shared/src/validations.ts` — add `csvImportRowSchema` (name, price, currency, billingCycle, nextRenewalDate, category)

**Files to create:**
- `packages/shared/src/fuzzy-match.ts` — `fuzzyMatchService(name, catalog)` returns `{ matchId, confidence: "exact" | "fuzzy" | "none" }`. Strategy: normalize → exact match → includes check → Levenshtein threshold.

**Export updates:**
- `packages/shared/package.json` — add `"./fuzzy-match"` export

**TDD sequence:**
1. `packages/shared/src/__tests__/csv-parse.test.ts` — simple CSV, quoted fields, commas in quotes, embedded quotes, BOM, whitespace trim, empty rows, Windows CRLF (~9 tests)
2. `packages/shared/src/__tests__/fuzzy-match.test.ts` — exact, case-insensitive, partial, Levenshtein-close, no match, empty catalog, suffix stripping (~7 tests)
3. Extend `packages/shared/src/__tests__/validations.test.ts` — csvImportRowSchema accepts valid, rejects invalid (~4 tests)

##### 4.3b: API routes

**Files to create:**
- `apps/web/app/api/subscriptions/import/preview/route.ts` — `POST`: parse CSV → validate rows → fuzzy-match against `serviceCatalog` → return `{ valid: CsvImportPreviewRow[], errors: [...] }`
- `apps/web/app/api/subscriptions/import/route.ts` — `POST`: accept confirmed rows → resolve categories → bulk insert `trackedSubscriptions` + `priceHistory` → return `{ imported: number }`

**Files to modify:**
- `apps/web/lib/types/api.ts` — add `CsvImportPreviewRow`, `CsvImportPreviewResponse`, `CsvImportResult` types

**Reuse:**
- `requireSession` from `apps/web/lib/api/helpers.ts`
- Insert pattern from `apps/web/app/api/subscriptions/route.ts`
- `subscriptionFormSchema` from `@repo/shared/validations`

**TDD sequence:**
1. `apps/web/tests/api/subscriptions-import-preview.test.ts` — auth check, parse + preview, validation errors, fuzzy matching (~4 tests)
2. `apps/web/tests/api/subscriptions-import.test.ts` — auth check, bulk insert, category resolution, import count (~4 tests)

##### 4.3c: UI components

**Files to create:**
- `apps/web/hooks/use-csv-import.ts` — `usePreviewCsvImport()` mutation + `useConfirmCsvImport()` mutation (invalidates `queryKeys.subscriptions.all` + `queryKeys.dashboard.stats`)
- `apps/web/components/csv-import-button.tsx` — trigger button (mirrors `csv-export-button.tsx`)
- `apps/web/components/csv-import-dialog.tsx` — multi-step dialog: Upload → Preview (table with match confidence badges: green=exact, yellow=fuzzy, gray=none; checkbox per row; inline validation errors) → Confirm → Result

**Files to modify:**
- `apps/web/app/(dashboard)/subscriptions/page.tsx` — add `CsvImportButton` next to export button

**Reuse:**
- `@repo/ui/dialog`, `@repo/ui/table`, `@repo/ui/badge`, `@repo/ui/button`, `@repo/ui/input`
- `CsvExportButton` pattern from `apps/web/components/csv-export-button.tsx`
- `queryKeys` from `apps/web/lib/query-keys.ts`
- `toast` from `sonner`

**TDD sequence:**
1. `apps/web/tests/components/csv-import-dialog.test.tsx` — renders upload step, file triggers preview, preview shows rows, validation errors visible, confirm triggers import, success message (~6 tests)
2. E2E: `apps/web/e2e/csv-import.spec.ts` — button visible, dialog opens, valid CSV shows preview, confirm creates subscriptions, errors displayed (~5 tests)

---

#### Step 4.4: AI Tips (Worker + Web)

> Weekly batch job generates 3-5 personalized LLM tips per Pro user. Weekly replace strategy (delete old, insert fresh).

**Dependencies:**
- `pnpm add --filter=worker ai @ai-sdk/anthropic @ai-sdk/openai`

##### 4.4a: Database schema

**Files to modify:**
- `packages/database/src/schema/app.ts` — add `aiTips` table:
  ```
  ai_tips: id (serial PK), userId (FK→users, cascade), title (text),
  message (text), category (text: "savings"|"warning"|"info"|"comparison"),
  generatedAt (timestamp, default now), expiresAt (timestamp)
  ```
  Add `aiTipsRelations` (one→users). Add index on `userId`. Export `AiTip`/`NewAiTip` types.
- `packages/database/src/schema/index.ts` — re-export `aiTips`

**Migration:** `pnpm db:generate` → `pnpm db:migrate`

##### 4.4b: Worker AI service + job

**Files to modify:**
- `apps/worker/src/env.ts` — add `validateAiEnv()` function (separate from main `validateEnv`) with `AI_PROVIDER` (enum: anthropic/openai, default anthropic) + provider-specific API key. Validated lazily inside the job, not at startup.

**Files to create:**
- `apps/worker/src/services/ai.ts` — `getAiModel(provider)` returns configured model via AI SDK; `generateTipsForUser(model, params)` builds prompt with subscription data + total monthly spend, calls `generateText`, parses JSON response. `buildPrompt()` creates system prompt (financial advisor persona) + user prompt (sub list, categories, prices). `parseTipsResponse()` extracts JSON from potential markdown code blocks, validates with Zod, caps at 5 tips.

**Files to modify:**
- `apps/worker/src/jobs/generate-ai-tips.ts` — replace stub with full implementation:
  1. Validate AI env (return early with warning if no key)
  2. Query Pro users (join `schema.subscriptions` where status IN active/trialing)
  3. For each Pro user: query active trackedSubscriptions → skip if 0 subs → delete old `aiTips` → call `generateTipsForUser` → insert new tips (expiresAt = now + 8 days) → create notification (type: "tip")
  4. Error handling: per-user try/catch, log + continue on failure
  5. Log summary

**Reuse:**
- Worker job pattern from `apps/worker/src/jobs/send-reminders.ts`
- `createNotification` from `apps/worker/src/services/notification.ts`
- Notification type `"tip"` already exists in DB enum

**TDD sequence:**
1. `apps/worker/tests/services/ai.test.ts` — mock `ai` module; test prompt building includes sub names/prices/total; test JSON parsing from markdown-wrapped response; test malformed JSON returns []; test 5-tip cap; test model provider selection (~7 tests)
2. `apps/worker/tests/jobs/generate-ai-tips.test.ts` — mock DB + AI service + notification; test skips without API key; test queries Pro users; test skips users with 0 subs; test deletes old + inserts new; test creates notification; test continues on per-user failure; test returns early with no Pro users (~8 tests)

##### 4.4c: Web API + UI

**Files to create:**
- `apps/web/app/api/tips/route.ts` — `GET`: requireSession → check Pro status → query `aiTips` where `expiresAt > now` ordered by `generatedAt DESC` → return array (403 for non-Pro)
- `apps/web/hooks/use-ai-tips.ts` — `useAiTips({ enabled? })` TanStack Query hook, returns `[]` on 403
- `apps/web/components/ai-tip-card.tsx` — card with category icon (savings=TrendingDown, warning=AlertTriangle, info=Info, comparison=Scale), badge, title, message, "Generated [date]" footer

**Files to modify:**
- `apps/web/lib/types/api.ts` — add `AiTipItem` type (id, title, message, category, generatedAt, expiresAt)
- `apps/web/lib/query-keys.ts` — add `aiTips: { all: ["ai-tips"] }`
- `apps/web/app/(dashboard)/tips/page.tsx` — expand Pro section: use `useAiTips`, render card list when tips exist, keep empty state and loading skeleton

**Reuse:**
- `static-tips-list.tsx` typeConfig for icon/badge/color mapping
- `useSubscriptionPlan` / `useIsPro` for Pro gating
- `requireSession` from `apps/web/lib/api/helpers.ts`
- Pro check pattern from `apps/web/app/api/subscription-plan/route.ts`

**TDD sequence:**
1. `apps/web/tests/api/tips.test.ts` — 401 unauth, 403 free, returns tips for Pro, only non-expired, empty array when none (~5 tests)
2. `apps/web/tests/components/ai-tip-card.test.tsx` — renders title/message, correct icon per category, badge (~3 tests)
3. Update `apps/web/tests/components/tips-page.test.tsx` — add: renders tip cards when Pro with tips, shows "Generated on" timestamp (~2 tests extending existing)
4. E2E: `apps/web/e2e/tips.spec.ts` — free user sees upgrade, tips page renders Pro badge (~2 tests; full AI generation covered by worker unit tests)

---

### Verification

After all steps complete:

```bash
pnpm check-types          # zero errors
pnpm lint                 # zero warnings
pnpm test                 # all existing + ~55 new unit tests pass
pnpm --filter=web e2e     # all existing + ~19 new E2E tests pass
pnpm build                # all packages/apps build
```

Manual smoke tests:
- Toggle dark mode → all pages render in both themes
- Visit `/` → landing page with all sections, CTAs work, dark mode works
- Upload CSV → preview table shows matches → confirm imports subscriptions
- Check `/tips` as Pro user → tips display (requires AI API key or seeded data)

Update `docs/progress.md` after each step completion.

---

## Future Features (not planned)

- Add default values or select one by item on import (e.g. default category, expiration date, renewal date, recurring)
- Shared/family subscription splitting
- Payment method tracking (which card each sub bills to)
- Bank connection via Plaid for automatic detection
