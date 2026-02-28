import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "yearly",
  "weekly",
  "quarterly",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "renewal_reminder",
  "price_change",
  "tip",
  "system",
]);

// ─── Categories ─────────────────────────────────────────────────────────────────
// userId = null means a system-default category visible to all users.

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Service Catalog ────────────────────────────────────────────────────────────
// Pre-populated well-known services (Netflix, Spotify, etc.) for quick add.

export const serviceCatalog = pgTable("service_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  defaultCategory: text("default_category"),
  typicalMonthlyPrice: numeric("typical_monthly_price", {
    precision: 10,
    scale: 2,
  }),
  typicalYearlyPrice: numeric("typical_yearly_price", {
    precision: 10,
    scale: 2,
  }),
  currency: text("currency").notNull().default("USD"),
  lastVerifiedAt: timestamp("last_verified_at"),
});

// ─── Tracked Subscriptions ──────────────────────────────────────────────────────

export const trackedSubscriptions = pgTable(
  "tracked_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    billingCycle: billingCycleEnum("billing_cycle").notNull(),
    nextRenewalDate: date("next_renewal_date").notNull(),
    startDate: date("start_date"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    serviceCatalogId: integer("service_catalog_id").references(
      () => serviceCatalog.id,
      { onDelete: "set null" },
    ),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    isActive: boolean("is_active").notNull().default(true),
    deactivatedAt: timestamp("deactivated_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("tracked_subscriptions_userId_idx").on(table.userId)],
);

// ─── Notifications ──────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    relatedSubscriptionId: integer("related_subscription_id").references(
      () => trackedSubscriptions.id,
      { onDelete: "set null" },
    ),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("notifications_userId_idx").on(table.userId)],
);

// ─── Push Subscriptions ─────────────────────────────────────────────────────────

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notification Preferences ───────────────────────────────────────────────────

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(false),
  reminderDaysBefore: integer("reminder_days_before")
    .array()
    .notNull()
    .default(sql`ARRAY[7,3,1]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Price History ──────────────────────────────────────────────────────────────

export const priceHistory = pgTable(
  "price_history",
  {
    id: serial("id").primaryKey(),
    trackedSubscriptionId: integer("tracked_subscription_id")
      .notNull()
      .references(() => trackedSubscriptions.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("price_history_subscriptionId_idx").on(table.trackedSubscriptionId),
  ],
);

// ─── AI Tips ──────────────────────────────────────────────────────────────────

export const aiTipCategoryEnum = pgEnum("ai_tip_category", [
  "savings",
  "warning",
  "info",
  "comparison",
]);

export const aiTips = pgTable(
  "ai_tips",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    category: aiTipCategoryEnum("category").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("ai_tips_userId_idx").on(table.userId)],
);

// ─── Relations ──────────────────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  trackedSubscriptions: many(trackedSubscriptions),
}));

export const serviceCatalogRelations = relations(
  serviceCatalog,
  ({ many }) => ({
    trackedSubscriptions: many(trackedSubscriptions),
  }),
);

export const trackedSubscriptionsRelations = relations(
  trackedSubscriptions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [trackedSubscriptions.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [trackedSubscriptions.categoryId],
      references: [categories.id],
    }),
    serviceCatalog: one(serviceCatalog, {
      fields: [trackedSubscriptions.serviceCatalogId],
      references: [serviceCatalog.id],
    }),
    notifications: many(notifications),
    priceHistory: many(priceHistory),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  trackedSubscription: one(trackedSubscriptions, {
    fields: [notifications.relatedSubscriptionId],
    references: [trackedSubscriptions.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  trackedSubscription: one(trackedSubscriptions, {
    fields: [priceHistory.trackedSubscriptionId],
    references: [trackedSubscriptions.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
);

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const aiTipsRelations = relations(aiTips, ({ one }) => ({
  user: one(users, {
    fields: [aiTips.userId],
    references: [users.id],
  }),
}));

// Extend usersRelations with app-specific relations (merged by Drizzle at init).
export const usersAppRelations = relations(users, ({ one, many }) => ({
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  pushSubscriptions: many(pushSubscriptions),
  trackedSubscriptions: many(trackedSubscriptions),
  aiTips: many(aiTips),
}));

// ─── Types ──────────────────────────────────────────────────────────────────────

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type ServiceCatalogEntry = typeof serviceCatalog.$inferSelect;
export type TrackedSubscription = typeof trackedSubscriptions.$inferSelect;
export type NewTrackedSubscription = typeof trackedSubscriptions.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreferences =
  typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences =
  typeof notificationPreferences.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type AiTip = typeof aiTips.$inferSelect;
export type NewAiTip = typeof aiTips.$inferInsert;
