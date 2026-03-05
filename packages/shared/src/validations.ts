import { dynamicIconImports } from "lucide-react/dynamic";
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
  icon: z
    .enum(Array.from([...Object.keys(dynamicIconImports), "none"]), {
      error: "Invalid icon name",
    })
    .optional(),
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

const billingCycleAliases: Record<
  string,
  "monthly" | "yearly" | "weekly" | "quarterly"
> = {
  month: "monthly",
  monthly: "monthly",
  mo: "monthly",
  year: "yearly",
  yearly: "yearly",
  annual: "yearly",
  annually: "yearly",
  yr: "yearly",
  week: "weekly",
  weekly: "weekly",
  wk: "weekly",
  quarter: "quarterly",
  quarterly: "quarterly",
  qtr: "quarterly",
};

export const csvImportRowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 9.99)"),
  currency: z
    .string()
    .optional()
    .transform((v) => v ?? "USD"),
  billingCycle: z
    .string()
    .min(1, "Billing cycle is required")
    .transform((v, ctx) => {
      const alias = billingCycleAliases[v.toLowerCase().trim()];
      if (!alias) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown billing cycle: ${v}`,
        });
        return z.NEVER;
      }
      return alias;
    }),
  nextRenewalDate: z.string().min(1, "Next renewal date is required"),
  startDate: z.string().optional(),
  categoryName: z.string().optional(),
});

export type CsvImportRowValues = z.infer<typeof csvImportRowSchema>;

export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one symbol");

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Enter a valid email address"),
});

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

// ─── i18n-aware factory functions ────────────────────────────────────────────

export interface SubscriptionValidationMessages {
  nameRequired?: string;
  priceRequired?: string;
  priceInvalid?: string;
  currencyRequired?: string;
  renewalDateRequired?: string;
}

const D_SUB: Required<SubscriptionValidationMessages> = {
  nameRequired: "Name is required",
  priceRequired: "Price is required",
  priceInvalid: "Enter a valid price (e.g. 9.99)",
  currencyRequired: "Currency is required",
  renewalDateRequired: "Renewal date is required",
};

export function createSubscriptionFormSchema(
  msgs?: SubscriptionValidationMessages,
) {
  const m = { ...D_SUB, ...msgs };
  return z.object({
    name: z.string().min(1, m.nameRequired),
    price: z
      .string()
      .min(1, m.priceRequired)
      .regex(/^\d+(\.\d{1,2})?$/, m.priceInvalid),
    currency: z.string().min(1, m.currencyRequired),
    billingCycle: z.enum(["monthly", "yearly", "weekly", "quarterly"]),
    nextRenewalDate: z.string().min(1, m.renewalDateRequired),
    startDate: z.string().optional(),
    categoryId: z.number().int().positive().optional(),
    serviceCatalogId: z.number().int().positive().optional(),
    logoUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
  });
}

export interface CategoryValidationMessages {
  nameRequired?: string;
  iconInvalid?: string;
}

const D_CAT: Required<CategoryValidationMessages> = {
  nameRequired: "Name is required",
  iconInvalid: "Invalid icon name",
};

export function createCategoryFormSchema(msgs?: CategoryValidationMessages) {
  const m = { ...D_CAT, ...msgs };
  return z.object({
    name: z.string().min(1, m.nameRequired),
    color: z.string().optional(),
    icon: z
      .enum(Array.from([...Object.keys(dynamicIconImports), "none"]), {
        error: m.iconInvalid,
      })
      .optional(),
  });
}

export interface PasswordValidationMessages {
  minLength?: string;
  uppercase?: string;
  lowercase?: string;
  number?: string;
  symbol?: string;
}

const D_PWD: Required<PasswordValidationMessages> = {
  minLength: "Password must be at least 8 characters",
  uppercase: "Must contain at least one uppercase letter",
  lowercase: "Must contain at least one lowercase letter",
  number: "Must contain at least one number",
  symbol: "Must contain at least one symbol",
};

export function createStrongPasswordSchema(msgs?: PasswordValidationMessages) {
  const m = { ...D_PWD, ...msgs };
  return z
    .string()
    .min(8, m.minLength)
    .regex(/[A-Z]/, m.uppercase)
    .regex(/[a-z]/, m.lowercase)
    .regex(/[0-9]/, m.number)
    .regex(/[^A-Za-z0-9]/, m.symbol);
}

export interface ChangePasswordValidationMessages extends PasswordValidationMessages {
  currentPasswordMin?: string;
  passwordsMustMatch?: string;
}

const D_CHANGE_PWD: Required<ChangePasswordValidationMessages> = {
  ...D_PWD,
  currentPasswordMin: "Password must be at least 8 characters",
  passwordsMustMatch: "Passwords must match",
};

export function createChangePasswordSchema(
  msgs?: ChangePasswordValidationMessages,
) {
  const m = { ...D_CHANGE_PWD, ...msgs };
  const strong = createStrongPasswordSchema(m);
  return z
    .object({
      currentPassword: z.string().min(8, m.currentPasswordMin),
      newPassword: strong,
      confirmPassword: strong,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: m.passwordsMustMatch,
      path: ["confirmPassword"],
    });
}

export interface NotificationValidationMessages {
  reminderDaysMin?: string;
}

const D_NOTIF: Required<NotificationValidationMessages> = {
  reminderDaysMin: "Select at least one reminder day",
};

export function createNotificationPreferencesSchema(
  msgs?: NotificationValidationMessages,
) {
  const m = { ...D_NOTIF, ...msgs };
  return z.object({
    emailEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    reminderDaysBefore: z
      .array(z.number().int().min(1).max(30))
      .min(1, m.reminderDaysMin),
  });
}

export interface ProfileValidationMessages {
  nameRequired?: string;
}

const D_PROFILE: Required<ProfileValidationMessages> = {
  nameRequired: "Name is required",
};

export function createProfileFormSchema(msgs?: ProfileValidationMessages) {
  const m = { ...D_PROFILE, ...msgs };
  return z.object({
    name: z.string().min(1, m.nameRequired),
    image: z.string().optional(),
  });
}

export interface EmailValidationMessages {
  emailInvalid?: string;
}

const D_EMAIL: Required<EmailValidationMessages> = {
  emailInvalid: "Enter a valid email address",
};

export function createChangeEmailSchema(msgs?: EmailValidationMessages) {
  const m = { ...D_EMAIL, ...msgs };
  return z.object({
    newEmail: z.string().email(m.emailInvalid),
  });
}
