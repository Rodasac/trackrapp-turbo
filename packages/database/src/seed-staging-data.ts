import { randomUUID } from "crypto";
import type {
  NewCategory,
  NewTrackedSubscription,
  NewNotification,
  NewNotificationPreferences,
  NewAiTip,
} from "./schema/app.js";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEMO_PRO_EMAIL = "demo@trackrapp.local";
export const DEMO_FREE_EMAIL = "demo-free@trackrapp.local";
export const DEMO_PASSWORD = "Demo1234!";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserInsert = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type AccountInsert = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type StripeSubInsert = {
  id: string;
  plan: string;
  referenceId: string;
  status: string;
  periodStart: Date;
  periodEnd: Date;
};

type PriceHistoryInsert = {
  trackedSubscriptionId: number;
  price: string;
  recordedAt: Date;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a Date offset by `days` from today. */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Returns a Date offset by `days` before today. */
function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

/** Returns a "YYYY-MM-DD" string offset by `days` from today. */
function dateStringFromNow(days: number): string {
  return daysFromNow(days).toISOString().slice(0, 10);
}

// ─── buildDemoUser ─────────────────────────────────────────────────────────────

export function buildDemoUser(
  email: string,
  name: string,
  hashedPassword: string = "hashed",
): { user: UserInsert; account: AccountInsert } {
  const userId = randomUUID();
  const accountId = randomUUID();
  const now = new Date();

  const user: UserInsert = {
    id: userId,
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  };

  const account: AccountInsert = {
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };

  return { user, account };
}

// ─── buildCustomCategories ────────────────────────────────────────────────────

export function buildCustomCategories(userId: string): NewCategory[] {
  return [
    {
      userId,
      name: "Security",
      color: "#64748b",
      icon: "shield",
    },
    {
      userId,
      name: "Fitness",
      color: "#f97316",
      icon: "dumbbell",
    },
  ];
}

// ─── buildStripeSubscription ──────────────────────────────────────────────────

export function buildStripeSubscription(userId: string): StripeSubInsert {
  const periodStart = daysAgo(15);
  const periodEnd = daysFromNow(350); // Next year

  return {
    id: randomUUID(),
    plan: "pro",
    referenceId: userId,
    status: "active",
    periodStart,
    periodEnd,
  };
}

// ─── buildProSubscriptions ────────────────────────────────────────────────────

export function buildProSubscriptions(
  userId: string,
  categoryMap: Map<string, number>,
  catalogMap: Map<string, number>,
): NewTrackedSubscription[] {
  const entertainment = categoryMap.get("Entertainment");
  const music = categoryMap.get("Music");
  const productivity = categoryMap.get("Productivity");
  const gaming = categoryMap.get("Gaming");
  const cloudStorage = categoryMap.get("Cloud Storage");
  const health = categoryMap.get("Health & Fitness");
  const news = categoryMap.get("News & Reading");
  const education = categoryMap.get("Education");
  const finance = categoryMap.get("Finance");
  const security = categoryMap.get("Security");
  const fitness = categoryMap.get("Fitness");

  return [
    // Entertainment
    {
      userId,
      name: "Netflix",
      price: "15.49",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(8),
      startDate: dateStringFromNow(-365),
      categoryId: entertainment,
      serviceCatalogId: catalogMap.get("Netflix"),
      websiteUrl: "https://netflix.com",
      isActive: true,
    },
    {
      userId,
      name: "Disney+",
      price: "95.88",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(45),
      startDate: dateStringFromNow(-270),
      categoryId: entertainment,
      serviceCatalogId: catalogMap.get("Disney+"),
      websiteUrl: "https://disneyplus.com",
      isActive: true,
    },
    // Music
    {
      userId,
      name: "Spotify",
      price: "11.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(5),
      startDate: dateStringFromNow(-730),
      categoryId: music,
      serviceCatalogId: catalogMap.get("Spotify"),
      websiteUrl: "https://spotify.com",
      isActive: true,
    },
    {
      userId,
      name: "Apple Music",
      price: "10.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(3),
      startDate: dateStringFromNow(-180),
      categoryId: music,
      serviceCatalogId: catalogMap.get("Apple Music"),
      websiteUrl: "https://music.apple.com",
      isActive: false,
      deactivatedAt: daysAgo(60),
    },
    // Productivity
    {
      userId,
      name: "Notion",
      price: "16.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(12),
      startDate: dateStringFromNow(-540),
      categoryId: productivity,
      serviceCatalogId: catalogMap.get("Notion"),
      websiteUrl: "https://notion.so",
      isActive: true,
    },
    {
      userId,
      name: "GitHub",
      price: "48.00",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(180),
      startDate: dateStringFromNow(-365),
      categoryId: productivity,
      serviceCatalogId: catalogMap.get("GitHub"),
      websiteUrl: "https://github.com",
      isActive: true,
    },
    {
      userId,
      name: "Figma",
      price: "15.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(20),
      startDate: dateStringFromNow(-240),
      categoryId: productivity,
      serviceCatalogId: catalogMap.get("Figma"),
      websiteUrl: "https://figma.com",
      isActive: true,
    },
    // Gaming
    {
      userId,
      name: "Xbox Game Pass",
      price: "14.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(16),
      startDate: dateStringFromNow(-420),
      categoryId: gaming,
      serviceCatalogId: catalogMap.get("Xbox Game Pass"),
      websiteUrl: "https://xbox.com/game-pass",
      isActive: true,
    },
    // Cloud Storage
    {
      userId,
      name: "iCloud+",
      price: "2.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(25),
      startDate: dateStringFromNow(-900),
      categoryId: cloudStorage,
      serviceCatalogId: catalogMap.get("iCloud+"),
      websiteUrl: "https://icloud.com",
      isActive: true,
    },
    {
      userId,
      name: "Dropbox",
      price: "119.99",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(90),
      startDate: dateStringFromNow(-450),
      categoryId: cloudStorage,
      serviceCatalogId: catalogMap.get("Dropbox"),
      websiteUrl: "https://dropbox.com",
      isActive: false,
      deactivatedAt: daysAgo(30),
    },
    // Health & Fitness
    {
      userId,
      name: "Calm",
      price: "69.99",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(120),
      startDate: dateStringFromNow(-300),
      categoryId: health,
      serviceCatalogId: catalogMap.get("Calm"),
      websiteUrl: "https://calm.com",
      isActive: true,
    },
    // News & Reading
    {
      userId,
      name: "The New York Times",
      price: "17.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(7),
      startDate: dateStringFromNow(-365),
      categoryId: news,
      serviceCatalogId: catalogMap.get("The New York Times"),
      websiteUrl: "https://nytimes.com",
      isActive: true,
    },
    // Education
    {
      userId,
      name: "Duolingo Plus",
      price: "83.99",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(200),
      startDate: dateStringFromNow(-165),
      categoryId: education,
      serviceCatalogId: catalogMap.get("Duolingo Plus"),
      websiteUrl: "https://duolingo.com",
      isActive: true,
    },
    {
      userId,
      name: "Coursera Plus",
      price: "59.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(1),
      startDate: dateStringFromNow(-90),
      categoryId: education,
      serviceCatalogId: catalogMap.get("Coursera Plus"),
      websiteUrl: "https://coursera.org",
      isActive: false,
      deactivatedAt: daysAgo(10),
    },
    // Finance
    {
      userId,
      name: "QuickBooks",
      price: "30.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(14),
      startDate: dateStringFromNow(-600),
      categoryId: finance,
      serviceCatalogId: catalogMap.get("QuickBooks"),
      websiteUrl: "https://quickbooks.intuit.com",
      isActive: true,
    },
    // Custom — no catalog entry
    {
      userId,
      name: "VPN Service",
      price: "59.88",
      currency: "USD",
      billingCycle: "yearly",
      nextRenewalDate: dateStringFromNow(60),
      startDate: dateStringFromNow(-305),
      categoryId: security,
      serviceCatalogId: undefined,
      isActive: true,
      notes: "Annual VPN subscription for privacy",
    },
    {
      userId,
      name: "Gym Membership",
      price: "40.00",
      currency: "EUR",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(4),
      startDate: dateStringFromNow(-730),
      categoryId: fitness,
      serviceCatalogId: undefined,
      isActive: true,
      notes: "Local gym — basic plan",
    },
    {
      userId,
      name: "Adobe Creative Cloud",
      price: "54.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(18),
      startDate: dateStringFromNow(-480),
      categoryId: productivity,
      serviceCatalogId: undefined,
      isActive: true,
    },
  ];
}

// ─── buildFreeSubscriptions ───────────────────────────────────────────────────

export function buildFreeSubscriptions(
  userId: string,
  categoryMap: Map<string, number>,
  catalogMap: Map<string, number>,
): NewTrackedSubscription[] {
  const entertainment = categoryMap.get("Entertainment");
  const music = categoryMap.get("Music");
  const cloudStorage = categoryMap.get("Cloud Storage");
  const productivity = categoryMap.get("Productivity");

  return [
    {
      userId,
      name: "Netflix",
      price: "15.49",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(10),
      startDate: dateStringFromNow(-180),
      categoryId: entertainment,
      serviceCatalogId: catalogMap.get("Netflix"),
      websiteUrl: "https://netflix.com",
      isActive: true,
    },
    {
      userId,
      name: "Spotify",
      price: "11.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(5),
      startDate: dateStringFromNow(-90),
      categoryId: music,
      serviceCatalogId: catalogMap.get("Spotify"),
      websiteUrl: "https://spotify.com",
      isActive: true,
    },
    {
      userId,
      name: "iCloud+",
      price: "2.99",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(22),
      startDate: dateStringFromNow(-365),
      categoryId: cloudStorage,
      serviceCatalogId: catalogMap.get("iCloud+"),
      websiteUrl: "https://icloud.com",
      isActive: true,
    },
    {
      userId,
      name: "Notion",
      price: "16.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(15),
      startDate: dateStringFromNow(-60),
      categoryId: productivity,
      serviceCatalogId: catalogMap.get("Notion"),
      websiteUrl: "https://notion.so",
      isActive: true,
    },
    {
      userId,
      name: "GitHub",
      price: "4.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: dateStringFromNow(30),
      startDate: dateStringFromNow(-120),
      categoryId: productivity,
      serviceCatalogId: catalogMap.get("GitHub"),
      websiteUrl: "https://github.com",
      isActive: true,
    },
  ];
}

// ─── buildPriceHistory ────────────────────────────────────────────────────────

/** Generates 2 historical price records per subscription to simulate price changes. */
export function buildPriceHistory(
  subscriptionIds: number[],
): PriceHistoryInsert[] {
  if (subscriptionIds.length === 0) return [];

  const records: PriceHistoryInsert[] = [];

  for (const id of subscriptionIds) {
    // Older price (further in the past)
    records.push({
      trackedSubscriptionId: id,
      price: (Math.random() * 10 + 5).toFixed(2),
      recordedAt: daysAgo(90 + Math.floor(Math.random() * 90)),
    });
    // More recent previous price
    records.push({
      trackedSubscriptionId: id,
      price: (Math.random() * 10 + 8).toFixed(2),
      recordedAt: daysAgo(15 + Math.floor(Math.random() * 30)),
    });
  }

  return records;
}

// ─── buildNotifications ───────────────────────────────────────────────────────

const NOTIFICATION_TEMPLATES: Array<{
  type: "renewal_reminder" | "price_change" | "tip" | "system";
  title: string;
  message: string;
  isRead: boolean;
  useSubId: boolean;
}> = [
  {
    type: "renewal_reminder",
    title: "Netflix renews in 3 days",
    message:
      "Your Netflix subscription will renew on the 3rd for $15.49. Make sure your payment method is up to date.",
    isRead: false,
    useSubId: true,
  },
  {
    type: "price_change",
    title: "Spotify price increased",
    message:
      "Spotify raised its price from $9.99 to $11.99/month. You can review your subscription or find alternatives.",
    isRead: true,
    useSubId: true,
  },
  {
    type: "tip",
    title: "You could save $83/year",
    message:
      "Switching from monthly to annual billing on Notion and Figma could save you $83 per year.",
    isRead: false,
    useSubId: false,
  },
  {
    type: "system",
    title: "Welcome to TrackrApp Pro!",
    message:
      "Your Pro subscription is active. You now have access to AI insights, unlimited subscriptions, and CSV export.",
    isRead: true,
    useSubId: false,
  },
  {
    type: "renewal_reminder",
    title: "Calm renews in 7 days",
    message:
      "Your Calm annual subscription renews in 7 days for $69.99. No action needed if you want to keep it.",
    isRead: false,
    useSubId: true,
  },
  {
    type: "price_change",
    title: "Figma billing cycle changed",
    message: "Figma updated its pricing. Your plan is now billed at $15/month.",
    isRead: true,
    useSubId: true,
  },
  {
    type: "tip",
    title: "Unused subscription detected",
    message:
      "Apple Music has been deactivated. Consider cancelling to avoid being charged if you re-enable it.",
    isRead: false,
    useSubId: false,
  },
  {
    type: "system",
    title: "Monthly spending report",
    message:
      "Your total subscription spend this month is $167.47 across 12 active services.",
    isRead: true,
    useSubId: false,
  },
  {
    type: "renewal_reminder",
    title: "QuickBooks renews soon",
    message: "Your QuickBooks subscription ($30.00/month) renews in 14 days.",
    isRead: false,
    useSubId: true,
  },
  {
    type: "tip",
    title: "You have 3 yearly subs renewing in 90 days",
    message:
      "GitHub, Dropbox, and Duolingo Plus renew annually. Consider if they all still serve you.",
    isRead: true,
    useSubId: false,
  },
  {
    type: "renewal_reminder",
    title: "Disney+ renews in 45 days",
    message:
      "Your Disney+ annual plan ($95.88) renews in 45 days. That's $7.99/month effectively.",
    isRead: false,
    useSubId: true,
  },
  {
    type: "system",
    title: "AI insights generated",
    message:
      "Your weekly AI spending insights are ready. Visit the Tips section to review personalized recommendations.",
    isRead: false,
    useSubId: false,
  },
];

export function buildNotifications(
  userId: string,
  subIds: number[],
  count: number = 12,
): NewNotification[] {
  const templates = NOTIFICATION_TEMPLATES.slice(0, Math.max(count, 4));
  let subIdIndex = 0;

  return templates.slice(0, count).map((tmpl) => {
    const relatedSubscriptionId =
      tmpl.useSubId && subIds.length > 0
        ? subIds[subIdIndex++ % subIds.length]
        : undefined;

    return {
      userId,
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message,
      isRead: tmpl.isRead,
      relatedSubscriptionId,
    };
  });
}

// ─── buildNotificationPreferences ────────────────────────────────────────────

export function buildNotificationPreferences(
  userId: string,
): NewNotificationPreferences {
  return {
    userId,
    emailEnabled: true,
    pushEnabled: false,
    reminderDaysBefore: [7, 3, 1],
  };
}

// ─── buildAiTips ──────────────────────────────────────────────────────────────

export function buildAiTips(userId: string): NewAiTip[] {
  const generatedAt = new Date();
  const expiresAt = daysFromNow(8);

  return [
    {
      userId,
      title: "Switch to annual billing on Notion",
      message:
        "You're paying $16/month for Notion. Switching to the annual plan at $192/year saves you $0 today but locks in the current rate before potential price increases. Many users find the commitment worthwhile for the stability.",
      category: "savings",
      generatedAt,
      expiresAt,
    },
    {
      userId,
      title: "You have 3 inactive subscriptions",
      message:
        "Apple Music, Dropbox, and Coursera Plus are marked as deactivated but may still be billing. Review each to confirm cancellation — together they could cost up to $190/month if re-activated.",
      category: "warning",
      generatedAt,
      expiresAt,
    },
    {
      userId,
      title: "Your monthly spend is $167/month",
      message:
        "Your 15 active subscriptions total $167.47/month or about $2,009/year. Entertainment and Productivity categories account for 62% of your spending.",
      category: "info",
      generatedAt,
      expiresAt,
    },
    {
      userId,
      title: "Spotify vs Apple Music — you're paying for both",
      message:
        "You have both Spotify (active, $11.99/month) and Apple Music (deactivated). Most streaming services cover similar catalogues. If you prefer Spotify, cancelling Apple Music saves ~$132/year.",
      category: "comparison",
      generatedAt,
      expiresAt,
    },
    {
      userId,
      title: "VPN and Gym are your best-value subs",
      message:
        "At $4.99/month effective rate, your VPN Service is great value. Your Gym Membership at €40/month is your single biggest expense — consider whether you're using it enough to justify it.",
      category: "info",
      generatedAt,
      expiresAt,
    },
  ];
}
