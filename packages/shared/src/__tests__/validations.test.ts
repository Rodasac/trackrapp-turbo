import { describe, it, expect } from "vitest";
import {
  subscriptionFormSchema,
  categoryFormSchema,
  csvImportRowSchema,
  createSubscriptionFormSchema,
  createChangePasswordSchema,
} from "../validations";

const validSubscription = {
  name: "Netflix",
  price: "15.99",
  currency: "USD",
  billingCycle: "monthly" as const,
  nextRenewalDate: "2026-03-15",
};

describe("subscriptionFormSchema", () => {
  it("accepts valid full data", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      startDate: "2026-01-01",
      categoryId: 1,
      logoUrl: "https://example.com/logo.png",
      notes: "My notes",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid minimal data (only required fields)", () => {
    const result = subscriptionFormSchema.safeParse(validSubscription);
    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(
        true,
      );
    }
  });

  it("fails when price is empty", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      price: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails on invalid price format (letters)", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      price: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("fails on invalid price format (too many decimals)", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      price: "9.999",
    });
    expect(result.success).toBe(false);
  });

  it("fails when billingCycle is invalid enum value", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      billingCycle: "biennial",
    });
    expect(result.success).toBe(false);
  });

  it("fails when nextRenewalDate is empty", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validSubscription,
      nextRenewalDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("optional fields can be omitted", () => {
    const result = subscriptionFormSchema.safeParse(validSubscription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });
});

describe("csvImportRowSchema", () => {
  const validRow = {
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-15",
  };

  it("accepts a valid row", () => {
    const result = csvImportRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const result = csvImportRowSchema.safeParse({ ...validRow, name: "" });
    expect(result.success).toBe(false);
  });

  it("fails when price is not a valid decimal", () => {
    const result = csvImportRowSchema.safeParse({ ...validRow, price: "abc" });
    expect(result.success).toBe(false);
  });

  it("normalizes billing cycle aliases (month → monthly)", () => {
    const result = csvImportRowSchema.safeParse({
      ...validRow,
      billingCycle: "month",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.billingCycle).toBe("monthly");
    }
  });

  it("normalizes billing cycle aliases (annual → yearly)", () => {
    const result = csvImportRowSchema.safeParse({
      ...validRow,
      billingCycle: "annual",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.billingCycle).toBe("yearly");
    }
  });

  it("is case-insensitive for billing cycle (Monthly → monthly)", () => {
    const result = csvImportRowSchema.safeParse({
      ...validRow,
      billingCycle: "Monthly",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.billingCycle).toBe("monthly");
    }
  });

  it("defaults currency to USD when not provided", () => {
    const { currency, ...withoutCurrency } = validRow;
    const result = csvImportRowSchema.safeParse(withoutCurrency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
    }
  });
});

describe("createSubscriptionFormSchema with custom messages", () => {
  it("uses custom nameRequired message", () => {
    const schema = createSubscriptionFormSchema({ nameRequired: "Nombre requerido" });
    const result = schema.safeParse({ name: "", price: "9.99", currency: "USD", billingCycle: "monthly" as const, nextRenewalDate: "2026-03-15" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameIssue?.message).toBe("Nombre requerido");
    }
  });
});

describe("createChangePasswordSchema with custom messages", () => {
  it("uses custom passwordsMustMatch message", () => {
    const schema = createChangePasswordSchema({ passwordsMustMatch: "Las contraseñas deben coincidir" });
    const result = schema.safeParse({ currentPassword: "OldPass1!", newPassword: "NewPass1!", confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const matchIssue = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(matchIssue?.message).toBe("Las contraseñas deben coincidir");
    }
  });
});

describe("categoryFormSchema", () => {
  it("accepts name only", () => {
    const result = categoryFormSchema.safeParse({ name: "Entertainment" });
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = categoryFormSchema.safeParse({
      name: "Work",
      color: "#6366f1",
      icon: "briefcase",
    });
    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = categoryFormSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(
        true,
      );
    }
  });

  it("allows color and icon to be optional", () => {
    const result = categoryFormSchema.safeParse({ name: "Health" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBeUndefined();
      expect(result.data.icon).toBeUndefined();
    }
  });
});
