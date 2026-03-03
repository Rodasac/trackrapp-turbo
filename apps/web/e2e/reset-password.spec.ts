import { test, expect } from "@playwright/test";
import { uniqueSuffix } from "./fixtures/auth";
import { UNAUTHENTICATED_STORAGE_STATE } from "./fixtures/consent";

// All tests in this file run unauthenticated
test.use({ storageState: UNAUTHENTICATED_STORAGE_STATE });

// const MAILPIT_URL = "http://localhost:8025";

// async function mailpitAvailable(): Promise<boolean> {
//   try {
//     const res = await fetch(`${MAILPIT_URL}/api/v1/info`, {
//       signal: AbortSignal.timeout(2_000),
//     });
//     return res.ok;
//   } catch {
//     return false;
//   }
// }
//
// /**
//  * Fetch the latest email matching `toEmail` from Mailpit.
//  * Returns the full HTML body so we can extract the reset URL.
//  */
// async function getLatestEmailBody(toEmail: string): Promise<string> {
//   const searchRes = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=20`);
//   const data = (await searchRes.json()) as {
//     messages: Array<{
//       ID: string;
//       To: Array<{ Address: string }>;
//       Subject: string;
//     }>;
//   };
//   const message = data.messages.find(
//     (m) =>
//       m.To.some((t) => t.Address === toEmail) &&
//       m.Subject.toLowerCase().includes("reset your trackrapp password"),
//   );
//   if (!message) throw new Error(`No email found for ${toEmail}`);
//
//   const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`);
//   const msgData = (await msgRes.json()) as { HTML: string; Text: string };
//   return msgData.HTML || msgData.Text;
// }
//
// /**
//  * Extract the reset password url from a Better Auth reset email.
//  * The link format is: .../api/auth/reset-password/{token}?callbackURL=...
//  */
// function extractResetToken(emailBody: string): string {
//   const match = emailBody.match(
//     /(\/api\/auth\/reset-password\/[a-zA-Z0-9_-]+\?callbackURL=[^\s"'<>]+)/,
//   );
//   if (!match?.[1]) throw new Error("Could not find reset token in email");
//   return match[1];
// }

// ─────────────────────────────────────────────────────────────────────────────
// UI-only tests (no Mailpit needed)
// ─────────────────────────────────────────────────────────────────────────────

test("forgot-password page renders form and back link", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(
    page.getByRole("heading", { name: /forgot password/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send reset link/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /back to sign in/i }),
  ).toBeVisible();
});

test("forgot-password shows validation error for empty email", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
});

test("forgot-password redirects to check-email-reset on submit", async ({
  page,
}) => {
  const email = `e2e-forgot-${uniqueSuffix()}@test.local`;
  await page.goto("/forgot-password");
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send reset link/i }).click();
  // Better Auth doesn't error for unknown emails (to prevent user enumeration)
  await page.waitForURL("**/check-email-reset**", { timeout: 10_000 });
  await expect(page).toHaveURL(/\/check-email-reset/);
  await expect(page.getByText(email)).toBeVisible();
});

test("check-email-reset page shows email, resend button, and back link", async ({
  page,
}) => {
  const email = "test-reset@example.com";
  await page.goto(`/check-email-reset?email=${encodeURIComponent(email)}`);
  await expect(
    page.getByRole("heading", { name: /check your email/i }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /resend email/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /back to sign in/i }),
  ).toBeVisible();
});

test("reset-password page shows error state when token is missing", async ({
  page,
}) => {
  await page.goto("/reset-password");
  await expect(page.getByText(/invalid link/i)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /request a new reset link/i }),
  ).toBeVisible();
});

test("reset-password page renders form when token is present", async ({
  page,
}) => {
  await page.goto("/reset-password?token=sometoken");
  await expect(
    page.getByRole("heading", { name: /reset your password/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/new password/i)).toBeVisible();
  await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /reset password/i }),
  ).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Full integration flow (requires Mailpit + working app server)
// ─────────────────────────────────────────────────────────────────────────────

// TODO: this test is flaky, needs to be fixed. Mailpit last so long to update.
// test("full reset password flow via Mailpit", async ({ page }) => {
//   const isMailpitUp = await mailpitAvailable();
//   test.skip(!isMailpitUp, "Mailpit not available — skipping integration test");
//
//   // 1. Sign up and verify a real user
//   const creds = await signUpNewUser(page);
//   await signOut(page);
//
//   // 2. Delete any existing emails for this address from Mailpit
//   await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: "DELETE" });
//
//   // 3. Go to forgot-password and request a reset
//   await page.goto("/forgot-password");
//   await page.getByLabel(/email/i).fill(creds.email);
//   await page.getByRole("button", { name: /send reset link/i }).click();
//   await page.waitForURL("**/check-email-reset**", { timeout: 5_000 });
//
//   // 4. Wait for email to arrive in Mailpit (poll for up to 10s)
//   let emailBody = "";
//   for (let i = 0; i < 10; i++) {
//     await page.waitForTimeout(5_000);
//     try {
//       emailBody = await getLatestEmailBody(creds.email);
//       if (emailBody) break;
//     } catch {
//       // not arrived yet
//     }
//   }
//   expect(emailBody).toBeTruthy();
//
//   // 5. Extract the reset token from the email
//   const url = extractResetToken(emailBody);
//   expect(url).toBeTruthy();
//
//   // 6. Navigate to the reset-password page with the token
//   await page.goto(url);
//   await expect(
//     page.getByRole("heading", { name: /reset your password/i }),
//   ).toBeVisible();
//
//   // 7. Enter and submit new password
//   const newPassword = "NewPassword123!";
//   await page.getByLabel(/new password/i).fill(newPassword);
//   await page.getByLabel(/confirm password/i).fill(newPassword);
//   await page.getByRole("button", { name: /reset password/i }).click();
//
//   // 8. Should redirect to /login
//   await page.waitForURL("**/login**", { timeout: 10_000 });
//
//   // 9. Login with new password
//   await page.getByLabel("Email").fill(creds.email);
//   await page.getByLabel("Password").fill(newPassword);
//   await page.getByRole("button", { name: "Sign in", exact: true }).click();
//   await page.waitForURL("**/dashboard**", { timeout: 10_000 });
//   await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
// });
