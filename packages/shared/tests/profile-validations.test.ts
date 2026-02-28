import { describe, it, expect } from "vitest";
import { profileFormSchema, changePasswordSchema } from "../src/validations";

describe("profileFormSchema", () => {
  it("accepts a valid name", () => {
    const result = profileFormSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = profileFormSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain("required");
  });

  it("rejects a missing name field", () => {
    const result = profileFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional image field when provided", () => {
    const result = profileFormSchema.safeParse({
      name: "Jane",
      image: "https://example.com/avatar.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts when image is omitted", () => {
    const result = profileFormSchema.safeParse({ name: "Jane" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBeUndefined();
    }
  });
});

describe("changePasswordSchema", () => {
  // Valid password: meets all rules (8+ chars, uppercase, lowercase, number, symbol)
  const validPassword = "OldPass123!";
  const validNewPassword = "NewPass456@";

  it("accepts valid matching passwords meeting all rules", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: validNewPassword,
      confirmPassword: validNewPassword,
    });
    expect(result.success).toBe(true);
  });

  it("rejects when confirmPassword does not match newPassword", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: validNewPassword,
      confirmPassword: "Different456@",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message) ?? [];
    expect(messages.some((m) => m.toLowerCase().includes("match"))).toBe(true);
  });

  it("rejects a newPassword shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: "Ab1!",
      confirmPassword: "Ab1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a newPassword without an uppercase letter", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: "newpass456@",
      confirmPassword: "newpass456@",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a newPassword without a lowercase letter", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: "NEWPASS456@",
      confirmPassword: "NEWPASS456@",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a newPassword without a number", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: "NewPassWord@",
      confirmPassword: "NewPassWord@",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a newPassword without a symbol", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: "NewPass456A",
      confirmPassword: "NewPass456A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when currentPassword is missing", () => {
    const result = changePasswordSchema.safeParse({
      newPassword: validNewPassword,
      confirmPassword: validNewPassword,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when newPassword is missing", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: validPassword,
      confirmPassword: validNewPassword,
    });
    expect(result.success).toBe(false);
  });
});
