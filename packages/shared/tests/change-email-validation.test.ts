import { describe, it, expect } from "vitest";
import { changeEmailSchema } from "../src/validations.js";

describe("changeEmailSchema", () => {
  it("accepts a valid email address", () => {
    const result = changeEmailSchema.safeParse({ newEmail: "new@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = changeEmailSchema.safeParse({ newEmail: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Enter a valid email address",
      );
    }
  });

  it("rejects an invalid email format", () => {
    const result = changeEmailSchema.safeParse({ newEmail: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Enter a valid email address",
      );
    }
  });

  it("rejects email missing domain", () => {
    const result = changeEmailSchema.safeParse({ newEmail: "user@" });
    expect(result.success).toBe(false);
  });

  it("rejects missing newEmail field", () => {
    const result = changeEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts email with subdomain", () => {
    const result = changeEmailSchema.safeParse({
      newEmail: "user@mail.example.co.uk",
    });
    expect(result.success).toBe(true);
  });
});
