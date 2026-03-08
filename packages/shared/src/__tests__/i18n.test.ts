import { describe, it, expect } from "vitest";
import { getTranslator } from "../i18n";

describe("getTranslator — email domain", () => {
  it("returns English text by default / for en locale", () => {
    const t = getTranslator("en", "email");
    expect(t("renewal.heading")).toBe("Renewal Reminder");
    expect(t("renewal.cta")).toBe("View in TrackrApp");
  });

  it("returns Spanish text for es locale", () => {
    const t = getTranslator("es", "email");
    expect(t("renewal.heading")).toBe("Recordatorio de renovación");
    expect(t("renewal.cta")).toBe("Ver en TrackrApp");
  });

  it("interpolates {name} param in subject", () => {
    const t = getTranslator("en", "email");
    expect(t("renewal.subjectTomorrow", { name: "Netflix" })).toBe(
      "Reminder: Netflix renews tomorrow",
    );
  });

  it("interpolates {name} and {days} params in subject", () => {
    const t = getTranslator("en", "email");
    expect(t("renewal.subjectDays", { name: "Spotify", days: 7 })).toBe(
      "Reminder: Spotify renews in 7 days",
    );
  });

  it("interpolates params in Spanish subject", () => {
    const t = getTranslator("es", "email");
    expect(t("renewal.subjectDays", { name: "Netflix", days: 3 })).toBe(
      "Recordatorio: Netflix se renueva en 3 días",
    );
  });

  it("falls back to English for unsupported locale", () => {
    const t = getTranslator("fr", "email");
    expect(t("renewal.heading")).toBe("Renewal Reminder");
  });

  it("returns key for unknown key path", () => {
    const t = getTranslator("en", "email");
    expect(t("renewal.nonexistent")).toBe("renewal.nonexistent");
  });
});

describe("getTranslator — notification domain", () => {
  it("returns English notification title for tomorrow", () => {
    const t = getTranslator("en", "notification");
    expect(t("renewal.titleTomorrow", { name: "Hulu" })).toBe(
      "Hulu renews tomorrow",
    );
  });

  it("returns Spanish notification title for tomorrow", () => {
    const t = getTranslator("es", "notification");
    expect(t("renewal.titleTomorrow", { name: "Hulu" })).toBe(
      "Hulu se renueva mañana",
    );
  });

  it("returns English notification message with interpolation", () => {
    const t = getTranslator("en", "notification");
    expect(
      t("renewal.messageDays", {
        name: "Netflix",
        currency: "USD",
        price: "15.99",
        days: 7,
      }),
    ).toBe("Your Netflix subscription (USD 15.99) renews in 7 days.");
  });

  it("returns Spanish notification message with interpolation", () => {
    const t = getTranslator("es", "notification");
    expect(
      t("renewal.messageDays", {
        name: "Netflix",
        currency: "USD",
        price: "15.99",
        days: 7,
      }),
    ).toBe("Tu suscripción a Netflix (USD 15.99) se renueva en 7 días.");
  });

  it("returns English aiTips title", () => {
    const t = getTranslator("en", "notification");
    expect(t("aiTips.title")).toBe("New AI Tips Available");
  });

  it("returns Spanish aiTips title", () => {
    const t = getTranslator("es", "notification");
    expect(t("aiTips.title")).toBe("Nuevos consejos de IA disponibles");
  });

  it("returns English aiTips singular message", () => {
    const t = getTranslator("en", "notification");
    expect(t("aiTips.messageSingular")).toBe(
      "1 new personalized spending tip generated for you.",
    );
  });

  it("returns English aiTips plural message with count interpolation", () => {
    const t = getTranslator("en", "notification");
    expect(t("aiTips.messagePlural", { count: 3 })).toBe(
      "3 new personalized spending tips generated for you.",
    );
  });

  it("returns Spanish aiTips singular message", () => {
    const t = getTranslator("es", "notification");
    expect(t("aiTips.messageSingular")).toBe(
      "1 nuevo consejo de gasto personalizado generado para ti.",
    );
  });

  it("returns Spanish aiTips plural message with count interpolation", () => {
    const t = getTranslator("es", "notification");
    expect(t("aiTips.messagePlural", { count: 4 })).toBe(
      "4 nuevos consejos de gasto personalizados generados para ti.",
    );
  });
});
