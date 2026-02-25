export { db } from "./client";
export * as schema from "./schema/index";

// Auth types
export type {
  User,
  Session,
  Account,
  Subscription,
  Verification,
} from "./schema/auth";

// App types
export type {
  Category,
  NewCategory,
  ServiceCatalogEntry,
  TrackedSubscription,
  NewTrackedSubscription,
  Notification,
  NewNotification,
  NotificationPreferences,
  NewNotificationPreferences,
  PushSubscription,
  NewPushSubscription,
  PriceHistory,
} from "./schema/app";
