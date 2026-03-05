import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/logger.js", () => {
  const noop = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
  });
  return {
    autoRenewLog: noop(),
    workerLog: noop(),
    remindersLog: noop(),
    cleanupLog: noop(),
    aiTipsLog: noop(),
    runJobLog: noop(),
    aiServiceLog: noop(),
  };
});

vi.mock("../../src/services/notification.js", () => ({
  createNotification: vi.fn().mockResolvedValue(1),
  hasExistingReminder: vi.fn().mockResolvedValue(false),
}));

vi.mock("../../src/services/email.js", () => ({
  createTransporter: vi.fn(() => ({})),
  sendRenewalReminder: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/services/push.js", () => ({
  sendPushNotification: vi.fn().mockResolvedValue(undefined),
}));

// Mock DB: trackedSubscriptions.findMany returns subscriptions with embedded user.
// Separate select() calls return prefs and push subs.
vi.mock("@repo/database", () => {
  const mockSelectResult = vi.fn();
  const mockWhere = vi.fn(() => mockSelectResult);
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  return {
    db: {
      query: {
        trackedSubscriptions: { findMany: vi.fn() },
      },
      select: mockSelect,
    },
    schema: {
      trackedSubscriptions: {
        nextRenewalDate: "nextRenewalDate",
        isActive: "isActive",
        userId: "userId",
      },
      notificationPreferences: { userId: "userId" },
      userPreferences: { userId: "userId" },
      pushSubscriptions: { userId: "userId" },
    },
  };
});

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...a: unknown[]) => ({ and: a })),
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: [a, b] })),
}));

vi.mock("../../src/env.js", () => ({
  validateEnv: vi.fn(() => ({
    SMTP_HOST: "localhost",
    SMTP_PORT: 1025,
    SMTP_SECURE: false,
    SMTP_FROM: "noreply@trackrapp.local",
    SMTP_USER: undefined,
    SMTP_PASS: undefined,
    VAPID_PUBLIC_KEY: "pub",
    VAPID_PRIVATE_KEY: "priv",
    VAPID_SUBJECT: "mailto:test@example.com",
  })),
}));

// @ts-expect-error: mocking drizzle-orm types
import { db } from "@repo/database";
import {
  createNotification,
  hasExistingReminder,
} from "../../src/services/notification.js";
import { sendRenewalReminder } from "../../src/services/email.js";
import { sendPushNotification } from "../../src/services/push.js";
import { runSendReminders } from "../../src/jobs/send-reminders.js";

const TODAY = new Date("2026-02-25T00:00:00.000Z");
const TOMORROW = "2026-02-26";

function setupDbMocks(options: {
  subscriptions?: unknown[];
  prefs?: unknown[];
  userPrefs?: unknown[];
  pushSubs?: unknown[];
}) {
  const subs = options.subscriptions ?? [
    {
      id: 1,
      userId: "user-1",
      name: "Netflix",
      price: "15.99",
      currency: "USD",
      nextRenewalDate: TOMORROW,
      isActive: true,
      user: { id: "user-1", email: "alice@example.com", name: "Alice" },
    },
  ];
  const prefs = options.prefs ?? [
    {
      userId: "user-1",
      emailEnabled: true,
      pushEnabled: false,
      reminderDaysBefore: [7, 3, 1],
    },
  ];
  const userPrefs = options.userPrefs ?? [
    { userId: "user-1", locale: "en" },
  ];
  const pushSubs = options.pushSubs ?? [];

  vi.mocked(db.query.trackedSubscriptions.findMany).mockResolvedValue(
    subs as never,
  );

  // select().from().where() — the where() call itself is awaited in the impl.
  // Order: 1) notificationPreferences, 2) userPreferences, 3) pushSubscriptions
  const mockWhere = vi
    .fn()
    .mockResolvedValueOnce(prefs)     // notificationPreferences
    .mockResolvedValueOnce(userPrefs) // userPreferences
    .mockResolvedValueOnce(pushSubs); // pushSubscriptions
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<
    typeof db.select
  >);
}

describe("send-reminders job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY);

    vi.mocked(hasExistingReminder).mockResolvedValue(false);
    vi.mocked(createNotification).mockResolvedValue(1);
    vi.mocked(sendRenewalReminder).mockResolvedValue(undefined);

    setupDbMocks({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates an in-app notification for a matching subscription", async () => {
    await runSendReminders();
    expect(createNotification).toHaveBeenCalledOnce();
    const call = vi.mocked(createNotification).mock.calls[0][0];
    expect(call.userId).toBe("user-1");
    expect(call.type).toBe("renewal_reminder");
    expect(call.relatedSubscriptionId).toBe(1);
  });

  it("sends email when emailEnabled is true", async () => {
    await runSendReminders();
    expect(sendRenewalReminder).toHaveBeenCalledOnce();
    const [, params] = vi.mocked(sendRenewalReminder).mock.calls[0];
    expect(params.to).toBe("alice@example.com");
    expect(params.subscriptionName).toBe("Netflix");
    expect(params.daysUntilRenewal).toBe(1);
  });

  it("does not send push when pushEnabled is false", async () => {
    await runSendReminders();
    expect(sendPushNotification).not.toHaveBeenCalled();
  });

  it("sends push notifications when pushEnabled is true and subscriptions exist", async () => {
    setupDbMocks({
      subscriptions: [
        {
          id: 2,
          userId: "user-2",
          name: "Spotify",
          price: "9.99",
          currency: "USD",
          nextRenewalDate: TOMORROW,
          isActive: true,
          user: { id: "user-2", email: "bob@example.com", name: "Bob" },
        },
      ],
      prefs: [
        {
          userId: "user-2",
          emailEnabled: false,
          pushEnabled: true,
          reminderDaysBefore: [1],
        },
      ],
      pushSubs: [
        {
          userId: "user-2",
          endpoint: "https://push.example.com/1",
          p256dh: "k1",
          auth: "a1",
        },
      ],
    });

    await runSendReminders();
    expect(sendPushNotification).toHaveBeenCalledOnce();
    const [sub, payload] = vi.mocked(sendPushNotification).mock.calls[0];
    expect(sub.endpoint).toBe("https://push.example.com/1");
    expect(payload.title).toContain("Spotify");
  });

  it("skips subscription when hasExistingReminder returns true", async () => {
    vi.mocked(hasExistingReminder).mockResolvedValue(true);
    await runSendReminders();
    expect(createNotification).not.toHaveBeenCalled();
    expect(sendRenewalReminder).not.toHaveBeenCalled();
  });

  it("skips when renewal day is not in reminderDaysBefore", async () => {
    // Renews in 5 days, but user configured [7,3,1]
    const fiveDaysOut = new Date(TODAY);
    fiveDaysOut.setDate(fiveDaysOut.getDate() + 5);

    setupDbMocks({
      subscriptions: [
        {
          id: 3,
          userId: "user-3",
          name: "Hulu",
          price: "12.99",
          currency: "USD",
          nextRenewalDate: fiveDaysOut.toISOString().slice(0, 10),
          isActive: true,
          user: { id: "user-3", email: "carol@example.com", name: "Carol" },
        },
      ],
      prefs: [
        {
          userId: "user-3",
          emailEnabled: true,
          pushEnabled: false,
          reminderDaysBefore: [7, 3, 1],
        },
      ],
    });

    await runSendReminders();
    expect(createNotification).not.toHaveBeenCalled();
  });

  it("uses default [7,3,1] when no prefs row exists for user", async () => {
    setupDbMocks({
      prefs: [], // no prefs row → defaults apply
    });

    await runSendReminders();
    // 1 day is in default [7,3,1] so should create notification
    expect(createNotification).toHaveBeenCalledOnce();
  });

  it("returns early when no subscriptions match", async () => {
    vi.mocked(db.query.trackedSubscriptions.findMany).mockResolvedValue(
      [] as never,
    );
    await runSendReminders();
    expect(createNotification).not.toHaveBeenCalled();
  });
});
