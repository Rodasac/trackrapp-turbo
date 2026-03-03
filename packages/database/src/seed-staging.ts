/**
 * Staging seed runner — inserts two demo users with realistic subscription data.
 *
 * Pro user  : demo@trackrapp.local  / Demo1234!  (18 subs, AI tips, Stripe plan)
 * Free user : demo-free@trackrapp.local / Demo1234! (5 subs, no AI tips)
 *
 * Idempotent: deletes both demo users before re-inserting so you can run it
 * multiple times without duplicate-key errors.
 */

import argon2 from "argon2";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { inArray, isNull } from "drizzle-orm";
import * as schema from "./schema/index.js";
import {
  buildDemoUser,
  buildAdminUser,
  buildCustomCategories,
  buildStripeSubscription,
  buildProSubscriptions,
  buildFreeSubscriptions,
  buildPriceHistory,
  buildNotifications,
  buildNotificationPreferences,
  buildUserPreferences,
  buildAiTips,
  DEMO_PRO_EMAIL,
  DEMO_FREE_EMAIL,
  DEMO_ADMIN_EMAIL,
  DEMO_PASSWORD,
} from "./seed-staging-data.js";

async function seedStaging() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🌱  Starting staging seed...\n");

  // ── 1. Seed system categories & service catalog (same as seed.ts) ────────────

  await db
    .insert(schema.categories)
    .values([
      { name: "Entertainment", color: "#ef4444", icon: "tv" },
      { name: "Music", color: "#8b5cf6", icon: "music" },
      { name: "Productivity", color: "#3b82f6", icon: "briefcase" },
      { name: "Gaming", color: "#10b981", icon: "gamepad-2" },
      { name: "Cloud Storage", color: "#f59e0b", icon: "cloud" },
      { name: "Health & Fitness", color: "#ec4899", icon: "heart-pulse" },
      { name: "News & Reading", color: "#6366f1", icon: "newspaper" },
      { name: "Education", color: "#14b8a6", icon: "graduation-cap" },
      { name: "Finance", color: "#84cc16", icon: "landmark" },
      { name: "Other", color: "#6b7280", icon: "package" },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.serviceCatalog)
    .values([
      {
        name: "Netflix",
        websiteUrl: "https://netflix.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "15.49",
      },
      {
        name: "Disney+",
        websiteUrl: "https://disneyplus.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "7.99",
      },
      {
        name: "Hulu",
        websiteUrl: "https://hulu.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "7.99",
      },
      {
        name: "HBO Max",
        websiteUrl: "https://max.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "9.99",
      },
      {
        name: "Amazon Prime Video",
        websiteUrl: "https://primevideo.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "8.99",
      },
      {
        name: "Apple TV+",
        websiteUrl: "https://tv.apple.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "9.99",
      },
      {
        name: "Peacock",
        websiteUrl: "https://peacocktv.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "5.99",
      },
      {
        name: "Spotify",
        websiteUrl: "https://spotify.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "11.99",
        typicalYearlyPrice: "99.99",
      },
      {
        name: "Apple Music",
        websiteUrl: "https://music.apple.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      {
        name: "YouTube Music",
        websiteUrl: "https://music.youtube.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      {
        name: "Tidal",
        websiteUrl: "https://tidal.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      {
        name: "Notion",
        websiteUrl: "https://notion.so",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "16.00",
        typicalYearlyPrice: "192.00",
      },
      {
        name: "Figma",
        websiteUrl: "https://figma.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "15.00",
      },
      {
        name: "GitHub",
        websiteUrl: "https://github.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "4.00",
        typicalYearlyPrice: "48.00",
      },
      {
        name: "Linear",
        websiteUrl: "https://linear.app",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "8.00",
      },
      {
        name: "Slack",
        websiteUrl: "https://slack.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "7.25",
      },
      {
        name: "Xbox Game Pass",
        websiteUrl: "https://xbox.com/game-pass",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "14.99",
      },
      {
        name: "PlayStation Plus",
        websiteUrl: "https://playstation.com",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "17.99",
      },
      {
        name: "Nintendo Switch Online",
        websiteUrl: "https://nintendo.com",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "3.99",
        typicalYearlyPrice: "19.99",
      },
      {
        name: "iCloud+",
        websiteUrl: "https://icloud.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "2.99",
      },
      {
        name: "Google One",
        websiteUrl: "https://one.google.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "2.99",
      },
      {
        name: "Dropbox",
        websiteUrl: "https://dropbox.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "11.99",
        typicalYearlyPrice: "119.99",
      },
      {
        name: "Calm",
        websiteUrl: "https://calm.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "14.99",
        typicalYearlyPrice: "69.99",
      },
      {
        name: "Headspace",
        websiteUrl: "https://headspace.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "12.99",
        typicalYearlyPrice: "69.99",
      },
      {
        name: "Peloton",
        websiteUrl: "https://onepeloton.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "12.99",
      },
      {
        name: "The New York Times",
        websiteUrl: "https://nytimes.com",
        defaultCategory: "News & Reading",
        typicalMonthlyPrice: "17.00",
      },
      {
        name: "Medium",
        websiteUrl: "https://medium.com",
        defaultCategory: "News & Reading",
        typicalMonthlyPrice: "5.00",
        typicalYearlyPrice: "50.00",
      },
      {
        name: "QuickBooks",
        websiteUrl: "https://quickbooks.intuit.com",
        defaultCategory: "Finance",
        typicalMonthlyPrice: "30.00",
      },
      {
        name: "Duolingo Plus",
        websiteUrl: "https://duolingo.com",
        defaultCategory: "Education",
        typicalMonthlyPrice: "14.99",
        typicalYearlyPrice: "83.99",
      },
      {
        name: "Coursera Plus",
        websiteUrl: "https://coursera.org",
        defaultCategory: "Education",
        typicalMonthlyPrice: "59.00",
        typicalYearlyPrice: "399.00",
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓  System categories and service catalog seeded");

  // ── 2. Build lookup maps ──────────────────────────────────────────────────────

  const systemCategories = await db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories)
    .where(isNull(schema.categories.userId));

  const catalogEntries = await db
    .select({ id: schema.serviceCatalog.id, name: schema.serviceCatalog.name })
    .from(schema.serviceCatalog);

  const systemCategoryMap = new Map<string, number>(
    systemCategories.map((c) => [c.name, c.id]),
  );
  const catalogMap = new Map<string, number>(
    catalogEntries.map((c) => [c.name, c.id]),
  );

  // ── 3. Idempotency — delete demo users if they exist ─────────────────────────

  const existingUsers = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(inArray(schema.users.email, [DEMO_PRO_EMAIL, DEMO_FREE_EMAIL, DEMO_ADMIN_EMAIL]));

  if (existingUsers.length > 0) {
    const ids = existingUsers.map((u) => u.id);
    await db.delete(schema.users).where(inArray(schema.users.id, ids));
    console.log(`  ✓  Deleted ${ids.length} existing demo user(s)`);
  }

  // ── 4. Hash password (shared) ─────────────────────────────────────────────────

  const hashed = await argon2.hash(DEMO_PASSWORD);

  // ── 5. Pro user ───────────────────────────────────────────────────────────────

  console.log("\n  [Pro user]");

  const { user: proUser, account: proAccount } = buildDemoUser(
    DEMO_PRO_EMAIL,
    "Demo User",
    hashed,
  );

  await db.insert(schema.users).values(proUser);
  await db.insert(schema.accounts).values(proAccount);

  // Custom categories for pro user
  const customCats = buildCustomCategories(proUser.id);
  const insertedCustomCats = await db
    .insert(schema.categories)
    .values(customCats)
    .returning({ id: schema.categories.id, name: schema.categories.name });

  const proCategoryMap = new Map<string, number>([
    ...systemCategoryMap,
    ...insertedCustomCats.map<[string, number]>((c) => [c.name, c.id]),
  ]);

  console.log(`    ✓  User created: ${DEMO_PRO_EMAIL}`);
  console.log(
    `    ✓  Custom categories: ${insertedCustomCats.map((c) => c.name).join(", ")}`,
  );

  // Stripe subscription (Pro plan)
  const stripeSubData = buildStripeSubscription(proUser.id);
  await db.insert(schema.subscriptions).values(stripeSubData);
  console.log(`    ✓  Stripe pro subscription inserted`);

  // Tracked subscriptions
  const proSubData = buildProSubscriptions(
    proUser.id,
    proCategoryMap,
    catalogMap,
  );
  const insertedProSubs = await db
    .insert(schema.trackedSubscriptions)
    .values(proSubData)
    .returning({ id: schema.trackedSubscriptions.id });

  const proSubIds = insertedProSubs.map((s) => s.id);
  console.log(`    ✓  ${proSubIds.length} tracked subscriptions inserted`);

  // Price history
  const priceHistoryData = buildPriceHistory(proSubIds);
  await db.insert(schema.priceHistory).values(priceHistoryData);
  console.log(
    `    ✓  ${priceHistoryData.length} price history records inserted`,
  );

  // Notifications
  const proNotifications = buildNotifications(proUser.id, proSubIds, 12);
  await db.insert(schema.notifications).values(proNotifications);
  console.log(`    ✓  ${proNotifications.length} notifications inserted`);

  // Preferences
  const proPrefs = buildNotificationPreferences(proUser.id);
  await db.insert(schema.notificationPreferences).values(proPrefs);
  console.log(`    ✓  Notification preferences inserted`);

  // AI tips
  const aiTipsData = buildAiTips(proUser.id);
  await db.insert(schema.aiTips).values(aiTipsData);
  console.log(`    ✓  ${aiTipsData.length} AI tips inserted`);

  // User preferences (auto-renew global default: true)
  const proUserPrefs = buildUserPreferences(proUser.id, true);
  await db.insert(schema.userPreferences).values(proUserPrefs);
  console.log(`    ✓  User preferences inserted (autoRenewDefault: true)`);

  // ── 6. Free user ──────────────────────────────────────────────────────────────

  console.log("\n  [Free user]");

  const { user: freeUser, account: freeAccount } = buildDemoUser(
    DEMO_FREE_EMAIL,
    "Demo Free User",
    hashed,
  );

  await db.insert(schema.users).values(freeUser);
  await db.insert(schema.accounts).values(freeAccount);
  console.log(`    ✓  User created: ${DEMO_FREE_EMAIL}`);

  const freeSubData = buildFreeSubscriptions(
    freeUser.id,
    systemCategoryMap,
    catalogMap,
  );
  const insertedFreeSubs = await db
    .insert(schema.trackedSubscriptions)
    .values(freeSubData)
    .returning({ id: schema.trackedSubscriptions.id });

  const freeSubIds = insertedFreeSubs.map((s) => s.id);
  console.log(`    ✓  ${freeSubIds.length} tracked subscriptions inserted`);

  const freeNotifications = buildNotifications(freeUser.id, freeSubIds, 4);
  await db.insert(schema.notifications).values(freeNotifications);
  console.log(`    ✓  ${freeNotifications.length} notifications inserted`);

  const freePrefs = buildNotificationPreferences(freeUser.id);
  await db.insert(schema.notificationPreferences).values(freePrefs);
  console.log(`    ✓  Notification preferences inserted`);

  // User preferences (auto-renew global default: false — for variety in demo)
  const freeUserPrefs = buildUserPreferences(freeUser.id, false);
  await db.insert(schema.userPreferences).values(freeUserPrefs);
  console.log(`    ✓  User preferences inserted (autoRenewDefault: false)`);

  // ── 7. Admin user ─────────────────────────────────────────────────────────────

  console.log("\n  [Admin user]");

  const { user: adminUser, account: adminAccount } = buildAdminUser(hashed);
  await db.insert(schema.users).values(adminUser);
  await db.insert(schema.accounts).values(adminAccount);
  console.log(`    ✓  User created: ${DEMO_ADMIN_EMAIL} (role: admin)`);

  // ── Done ──────────────────────────────────────────────────────────────────────

  await client.end();

  console.log("\n✅  Staging seed complete!\n");
  console.log("  Demo credentials:");
  console.log(`    Pro   : ${DEMO_PRO_EMAIL}  /  Demo1234!`);
  console.log(`    Free  : ${DEMO_FREE_EMAIL}  /  Demo1234!`);
  console.log(`    Admin : ${DEMO_ADMIN_EMAIL}  /  Demo1234!\n`);
}

seedStaging().catch((err) => {
  console.error("❌  Staging seed failed:", err);
  process.exit(1);
});
