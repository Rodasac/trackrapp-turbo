import { describe, it, expect, beforeEach } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  setCookieConsent,
  hasConsented,
} from "../cookie-consent";

function clearConsentCookie() {
  document.cookie = `${COOKIE_CONSENT_KEY}=; max-age=0; path=/`;
}

describe("cookie-consent", () => {
  beforeEach(() => {
    clearConsentCookie();
  });

  describe("getCookieConsent", () => {
    it("returns null when no consent cookie is set", () => {
      expect(getCookieConsent()).toBeNull();
    });

    it("returns parsed consent object when cookie exists", () => {
      const consent = {
        necessary: true,
        functional: true,
        analytics: false,
        consentedAt: "2026-01-01T00:00:00.000Z",
      };
      document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consent))}; path=/`;

      const result = getCookieConsent();
      expect(result).not.toBeNull();
      expect(result?.necessary).toBe(true);
      expect(result?.functional).toBe(true);
      expect(result?.analytics).toBe(false);
      expect(result?.consentedAt).toBe("2026-01-01T00:00:00.000Z");
    });

    it("returns null for invalid JSON in cookie", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=not-valid-json; path=/`;
      expect(getCookieConsent()).toBeNull();
    });

    it("returns null for JSON missing required fields", () => {
      const partial = { necessary: true };
      document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(partial))}; path=/`;
      expect(getCookieConsent()).toBeNull();
    });
  });

  describe("setCookieConsent", () => {
    it("always sets necessary=true", () => {
      setCookieConsent({ functional: false, analytics: false });
      const result = getCookieConsent();
      expect(result?.necessary).toBe(true);
    });

    it("stores functional and analytics preferences", () => {
      setCookieConsent({ functional: true, analytics: false });
      const result = getCookieConsent();
      expect(result?.functional).toBe(true);
      expect(result?.analytics).toBe(false);
    });

    it("stores consentedAt as ISO string", () => {
      const before = new Date().toISOString();
      setCookieConsent({ functional: true, analytics: true });
      const result = getCookieConsent();
      expect(result?.consentedAt).toBeDefined();
      expect(new Date(result!.consentedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
    });

    it("overwrites existing consent with new preferences", () => {
      setCookieConsent({ functional: true, analytics: true });
      setCookieConsent({ functional: false, analytics: false });
      const result = getCookieConsent();
      expect(result?.functional).toBe(false);
      expect(result?.analytics).toBe(false);
    });
  });

  describe("hasConsented", () => {
    it("returns false when no cookie is set", () => {
      expect(hasConsented()).toBe(false);
    });

    it("returns true when valid consent cookie exists", () => {
      setCookieConsent({ functional: true, analytics: true });
      expect(hasConsented()).toBe(true);
    });

    it("returns false when cookie has invalid JSON", () => {
      document.cookie = `${COOKIE_CONSENT_KEY}=garbage; path=/`;
      expect(hasConsented()).toBe(false);
    });
  });
});
