import { describe, it, expect } from "vitest";
import { subscriptionFormSchema, categoryFormSchema } from "../validations";

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
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
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
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
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
