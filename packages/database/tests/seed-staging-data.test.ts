import { describe, expect, it, beforeEach } from "vitest";
import {
  buildDemoUser,
  buildCustomCategories,
  buildStripeSubscription,
  buildProSubscriptions,
  buildFreeSubscriptions,
  buildPriceHistory,
  buildNotifications,
  buildNotificationPreferences,
  buildAiTips,
  DEMO_PRO_EMAIL,
  DEMO_FREE_EMAIL,
  DEMO_PASSWORD,
} from "../src/seed-staging-data.js";

const userId = "test-user-123";

const categoryMap = new Map<string, number>([
  ["Entertainment", 1],
  ["Music", 2],
  ["Productivity", 3],
  ["Gaming", 4],
  ["Cloud Storage", 5],
  ["Health & Fitness", 6],
  ["News & Reading", 7],
  ["Education", 8],
  ["Finance", 9],
  ["Other", 10],
  ["Security", 11],
  ["Fitness", 12],
]);

const catalogMap = new Map<string, number>([
  ["Netflix", 1],
  ["Disney+", 2],
  ["Spotify", 3],
  ["Apple Music", 4],
  ["Notion", 5],
  ["GitHub", 6],
  ["Figma", 7],
  ["Xbox Game Pass", 8],
  ["iCloud+", 9],
  ["Dropbox", 10],
  ["Calm", 11],
  ["The New York Times", 12],
  ["Duolingo Plus", 13],
  ["Coursera Plus", 14],
  ["QuickBooks", 15],
]);

// ─── buildDemoUser ─────────────────────────────────────────────────────────────

describe("buildDemoUser", () => {
  it("returns user with matching email and name", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.name).toBe("Test User");
  });

  it("user is marked as emailVerified", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(result.user.emailVerified).toBe(true);
  });

  it("user has a non-empty string id", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(typeof result.user.id).toBe("string");
    expect(result.user.id.length).toBeGreaterThan(0);
  });

  it("account has credential providerId", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(result.account.providerId).toBe("credential");
  });

  it("account userId matches user id", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(result.account.userId).toBe(result.user.id);
  });

  it("account has non-empty id", () => {
    const result = buildDemoUser("test@example.com", "Test User");
    expect(typeof result.account.id).toBe("string");
    expect(result.account.id.length).toBeGreaterThan(0);
  });

  it("generates a unique user id on each call", () => {
    const r1 = buildDemoUser("a@example.com", "A");
    const r2 = buildDemoUser("b@example.com", "B");
    expect(r1.user.id).not.toBe(r2.user.id);
  });
});

// ─── buildCustomCategories ────────────────────────────────────────────────────

describe("buildCustomCategories", () => {
  it("returns exactly 2 categories", () => {
    const cats = buildCustomCategories(userId);
    expect(cats).toHaveLength(2);
  });

  it("all categories have the provided userId", () => {
    const cats = buildCustomCategories(userId);
    cats.forEach((cat) => {
      expect(cat.userId).toBe(userId);
    });
  });

  it("includes Security and Fitness category names", () => {
    const cats = buildCustomCategories(userId);
    const names = cats.map((c) => c.name);
    expect(names).toContain("Security");
    expect(names).toContain("Fitness");
  });
});

// ─── buildStripeSubscription ──────────────────────────────────────────────────

describe("buildStripeSubscription", () => {
  it("returns a pro subscription with active status", () => {
    const sub = buildStripeSubscription(userId);
    expect(sub.plan).toBe("pro");
    expect(sub.status).toBe("active");
  });

  it("referenceId matches userId", () => {
    const sub = buildStripeSubscription(userId);
    expect(sub.referenceId).toBe(userId);
  });

  it("has non-null periodStart and periodEnd as Date instances", () => {
    const sub = buildStripeSubscription(userId);
    expect(sub.periodStart).toBeInstanceOf(Date);
    expect(sub.periodEnd).toBeInstanceOf(Date);
  });

  it("periodEnd is after periodStart", () => {
    const sub = buildStripeSubscription(userId);
    expect(sub.periodEnd!.getTime()).toBeGreaterThan(
      sub.periodStart!.getTime(),
    );
  });

  it("has a non-empty string id", () => {
    const sub = buildStripeSubscription(userId);
    expect(typeof sub.id).toBe("string");
    expect(sub.id.length).toBeGreaterThan(0);
  });
});

// ─── buildProSubscriptions ────────────────────────────────────────────────────

describe("buildProSubscriptions", () => {
  let subs: ReturnType<typeof buildProSubscriptions>;

  beforeEach(() => {
    subs = buildProSubscriptions(userId, categoryMap, catalogMap);
  });

  it("returns exactly 18 subscriptions", () => {
    expect(subs).toHaveLength(18);
  });

  it("all subscriptions have the provided userId", () => {
    subs.forEach((s) => {
      expect(s.userId).toBe(userId);
    });
  });

  it("includes a mix of active and deactivated subscriptions", () => {
    const active = subs.filter((s) => s.isActive !== false);
    const inactive = subs.filter((s) => s.isActive === false);
    expect(active.length).toBeGreaterThan(0);
    expect(inactive.length).toBeGreaterThan(0);
  });

  it("includes both monthly and yearly billing cycles", () => {
    const cycles = new Set(subs.map((s) => s.billingCycle));
    expect(cycles).toContain("monthly");
    expect(cycles).toContain("yearly");
  });

  it("all subscriptions have required fields", () => {
    subs.forEach((s) => {
      expect(s.name).toBeTruthy();
      expect(s.price).toBeTruthy();
      expect(s.billingCycle).toBeTruthy();
      expect(s.nextRenewalDate).toBeTruthy();
    });
  });

  it("includes custom subscriptions without a catalogId", () => {
    const withoutCatalog = subs.filter((s) => !s.serviceCatalogId);
    expect(withoutCatalog.length).toBeGreaterThan(0);
  });
});

// ─── buildFreeSubscriptions ───────────────────────────────────────────────────

describe("buildFreeSubscriptions", () => {
  let subs: ReturnType<typeof buildFreeSubscriptions>;

  beforeEach(() => {
    subs = buildFreeSubscriptions(userId, categoryMap, catalogMap);
  });

  it("returns exactly 5 subscriptions", () => {
    expect(subs).toHaveLength(5);
  });

  it("all subscriptions have the provided userId", () => {
    subs.forEach((s) => {
      expect(s.userId).toBe(userId);
    });
  });

  it("all subscriptions have required fields", () => {
    subs.forEach((s) => {
      expect(s.name).toBeTruthy();
      expect(s.price).toBeTruthy();
      expect(s.billingCycle).toBeTruthy();
      expect(s.nextRenewalDate).toBeTruthy();
    });
  });
});

// ─── buildPriceHistory ────────────────────────────────────────────────────────

describe("buildPriceHistory", () => {
  it("returns records covering all provided subscription IDs", () => {
    const subIds = [1, 2, 3];
    const history = buildPriceHistory(subIds);
    const idsInHistory = new Set(history.map((h) => h.trackedSubscriptionId));
    subIds.forEach((id) => expect(idsInHistory).toContain(id));
  });

  it("all recordedAt dates are in the past", () => {
    const now = new Date();
    const history = buildPriceHistory([1, 2]);
    history.forEach((h) => {
      expect((h.recordedAt as Date).getTime()).toBeLessThan(now.getTime());
    });
  });

  it("returns multiple price records per subscription to show history", () => {
    const history = buildPriceHistory([1]);
    const subHistory = history.filter((h) => h.trackedSubscriptionId === 1);
    expect(subHistory.length).toBeGreaterThanOrEqual(1);
  });

  it("price records for the same subscription have different prices", () => {
    const history = buildPriceHistory([1]);
    const subHistory = history.filter((h) => h.trackedSubscriptionId === 1);
    if (subHistory.length > 1) {
      const prices = new Set(subHistory.map((h) => h.price));
      expect(prices.size).toBeGreaterThan(1);
    }
  });

  it("returns empty array for empty input", () => {
    expect(buildPriceHistory([])).toHaveLength(0);
  });
});

// ─── buildNotifications ───────────────────────────────────────────────────────

describe("buildNotifications", () => {
  const proSubIds = Array.from({ length: 18 }, (_, i) => i + 1);
  const freeSubIds = Array.from({ length: 5 }, (_, i) => i + 1);

  it("returns 12 notifications when count=12 (Pro)", () => {
    const notifs = buildNotifications(userId, proSubIds, 12);
    expect(notifs).toHaveLength(12);
  });

  it("returns 4 notifications when count=4 (Free)", () => {
    const notifs = buildNotifications(userId, freeSubIds, 4);
    expect(notifs).toHaveLength(4);
  });

  it("all notifications have the correct userId", () => {
    const notifs = buildNotifications(userId, proSubIds, 12);
    notifs.forEach((n) => expect(n.userId).toBe(userId));
  });

  it("includes all four notification types (Pro set)", () => {
    const notifs = buildNotifications(userId, proSubIds, 12);
    const types = new Set(notifs.map((n) => n.type));
    expect(types).toContain("renewal_reminder");
    expect(types).toContain("price_change");
    expect(types).toContain("tip");
    expect(types).toContain("system");
  });

  it("has a mix of read and unread notifications", () => {
    const notifs = buildNotifications(userId, proSubIds, 12);
    const readCount = notifs.filter((n) => n.isRead).length;
    const unreadCount = notifs.filter((n) => !n.isRead).length;
    expect(readCount).toBeGreaterThan(0);
    expect(unreadCount).toBeGreaterThan(0);
  });

  it("all notifications have title and message", () => {
    const notifs = buildNotifications(userId, proSubIds, 12);
    notifs.forEach((n) => {
      expect(n.title).toBeTruthy();
      expect(n.message).toBeTruthy();
    });
  });
});

// ─── buildNotificationPreferences ────────────────────────────────────────────

describe("buildNotificationPreferences", () => {
  it("returns preferences with userId set", () => {
    const prefs = buildNotificationPreferences(userId);
    expect(prefs.userId).toBe(userId);
  });

  it("emailEnabled is true by default", () => {
    const prefs = buildNotificationPreferences(userId);
    expect(prefs.emailEnabled).toBe(true);
  });

  it("reminderDaysBefore is a non-empty array", () => {
    const prefs = buildNotificationPreferences(userId);
    expect(Array.isArray(prefs.reminderDaysBefore)).toBe(true);
    expect((prefs.reminderDaysBefore as number[]).length).toBeGreaterThan(0);
  });
});

// ─── buildAiTips ──────────────────────────────────────────────────────────────

describe("buildAiTips", () => {
  it("returns exactly 5 tips", () => {
    const tips = buildAiTips(userId);
    expect(tips).toHaveLength(5);
  });

  it("all tips have the correct userId", () => {
    const tips = buildAiTips(userId);
    tips.forEach((t) => expect(t.userId).toBe(userId));
  });

  it("covers all 4 tip categories", () => {
    const tips = buildAiTips(userId);
    const categories = new Set(tips.map((t) => t.category));
    expect(categories).toContain("savings");
    expect(categories).toContain("warning");
    expect(categories).toContain("info");
    expect(categories).toContain("comparison");
  });

  it("expiresAt is in the future for every tip", () => {
    const now = new Date();
    const tips = buildAiTips(userId);
    tips.forEach((t) => {
      expect(t.expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  it("all tips have non-empty title and message", () => {
    const tips = buildAiTips(userId);
    tips.forEach((t) => {
      expect(t.title).toBeTruthy();
      expect(t.message).toBeTruthy();
    });
  });
});

// ─── Exported constants ───────────────────────────────────────────────────────

describe("exported constants", () => {
  it("DEMO_PRO_EMAIL is demo@trackrapp.local", () => {
    expect(DEMO_PRO_EMAIL).toBe("demo@trackrapp.local");
  });

  it("DEMO_FREE_EMAIL is demo-free@trackrapp.local", () => {
    expect(DEMO_FREE_EMAIL).toBe("demo-free@trackrapp.local");
  });

  it("DEMO_PASSWORD is Demo1234!", () => {
    expect(DEMO_PASSWORD).toBe("Demo1234!");
  });
});
