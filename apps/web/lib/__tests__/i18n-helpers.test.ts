import { describe, expect, it } from "vitest";
import { translateApiError } from "../i18n-helpers";

// Simulate a Spanish translator for apiError namespace
const tEs = (key: string): string => {
  const msgs: Record<string, string> = {
    unauthorized: "No autorizado",
    proRequired: "Se requiere suscripción Pro",
    validationFailed: "Error de validación",
    notFound: "No encontrado",
    generic: "Algo salió mal",
  };
  return msgs[key] ?? key;
};

// Simulate English translator (keys = values)
const tEn = (key: string): string => {
  const msgs: Record<string, string> = {
    unauthorized: "Unauthorized",
    proRequired: "Pro subscription required",
    validationFailed: "Validation failed",
    notFound: "Not found",
    generic: "Something went wrong",
  };
  return msgs[key] ?? key;
};

describe("translateApiError", () => {
  it("translates Unauthorized", () => {
    expect(translateApiError("Unauthorized", tEs)).toBe("No autorizado");
  });

  it("translates Pro subscription required", () => {
    expect(translateApiError("Pro subscription required", tEs)).toBe(
      "Se requiere suscripción Pro",
    );
  });

  it("translates Validation failed", () => {
    expect(translateApiError("Validation failed", tEs)).toBe(
      "Error de validación",
    );
  });

  it("translates Not found", () => {
    expect(translateApiError("Not found", tEs)).toBe("No encontrado");
  });

  it("falls back to generic for unknown errors", () => {
    expect(translateApiError("Failed to update", tEs)).toBe("Algo salió mal");
    expect(translateApiError("Some unexpected error", tEs)).toBe(
      "Algo salió mal",
    );
    expect(translateApiError("", tEs)).toBe("Algo salió mal");
  });

  it("returns English strings when using English translator", () => {
    expect(translateApiError("Unauthorized", tEn)).toBe("Unauthorized");
    expect(translateApiError("Unknown error", tEn)).toBe("Something went wrong");
  });
});
