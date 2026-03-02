export const COOKIE_CONSENT_KEY = "trackr_cookie_consent";

export interface CookieConsent {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  consentedAt: string;
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === COOKIE_CONSENT_KEY) {
      try {
        const value = decodeURIComponent(rest.join("="));
        const parsed = JSON.parse(value) as unknown;
        if (
          parsed !== null &&
          typeof parsed === "object" &&
          "necessary" in parsed &&
          "functional" in parsed &&
          "analytics" in parsed &&
          "consentedAt" in parsed
        ) {
          return parsed as CookieConsent;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function setCookieConsent({
  functional,
  analytics,
}: {
  functional: boolean;
  analytics: boolean;
}): void {
  const consent: CookieConsent = {
    necessary: true,
    functional,
    analytics,
    consentedAt: new Date().toISOString(),
  };
  const encoded = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_CONSENT_KEY}=${encoded}; max-age=31536000; path=/; SameSite=Lax`;
}

export function hasConsented(): boolean {
  return getCookieConsent() !== null;
}
