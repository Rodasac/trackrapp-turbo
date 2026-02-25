import { z } from "zod";

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 9.99)"),
  currency: z.string().min(1, "Currency is required"),
  billingCycle: z.enum(["monthly", "yearly", "weekly", "quarterly"]),
  nextRenewalDate: z.string().min(1, "Renewal date is required"),
  startDate: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  serviceCatalogId: z.number().int().positive().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const notificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  reminderDaysBefore: z
    .array(z.number().int().min(1).max(30))
    .min(1, "Select at least one reminder day"),
});

export type NotificationPreferencesValues = z.infer<
  typeof notificationPreferencesSchema
>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
