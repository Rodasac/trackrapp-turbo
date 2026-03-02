/** Shared consent cookie — pre-accepted so the blocking overlay never appears in E2E tests. */
export const CONSENT_COOKIE = {
  name: "trackr_cookie_consent",
  value: encodeURIComponent(
    JSON.stringify({
      necessary: true,
      functional: true,
      analytics: true,
      consentedAt: new Date().toISOString(),
    }),
  ),
  domain: "localhost",
  path: "/",
};

/**
 * Storage state for unauthenticated tests.
 * Includes the consent cookie so the blocking banner doesn't intercept clicks,
 * but contains no auth cookies so the user is treated as a logged-out visitor.
 */
export const UNAUTHENTICATED_STORAGE_STATE = {
  cookies: [CONSENT_COOKIE],
  origins: [],
};
