import type { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const AUTH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.auth",
);

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

export function uniqueName(base: string): string {
  return `${base}-${uniqueSuffix()}`;
}

/**
 * Sign up a new user via the UI and return their credentials.
 * The caller is responsible for landing on the login page after this.
 */
export async function signUpNewUser(
  page: Page,
  suffix?: string,
): Promise<{ name: string; email: string; password: string }> {
  const id = suffix ?? uniqueSuffix();
  const name = `Test User ${id}`;
  const email = `e2e-${id}@test.local`;
  const password = "Password123!";

  await page.goto("/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/login**");

  return { name, email, password };
}

/**
 * Log in via the UI — assumes the page is already at /login or navigates there.
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**");
}

/** Save test user credentials to a JSON file so specs can read them */
export function saveTestUser(creds: {
  name: string;
  email: string;
  password: string;
}): void {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(AUTH_DIR, "test-user.json"),
    JSON.stringify(creds, null, 2),
  );
}

/** Read test user credentials saved by global-setup */
export function loadTestUser(): {
  name: string;
  email: string;
  password: string;
} {
  const file = path.join(AUTH_DIR, "test-user.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")) as {
    name: string;
    email: string;
    password: string;
  };
}
