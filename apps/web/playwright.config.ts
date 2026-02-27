import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /* Run tests sequentially — shared database requires no parallelism */
  workers: 1,
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  retries: process.env.CI ? 1 : 0,
  /* Collect trace on first retry; screenshot on failure */
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  /* Playwright projects */
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /* Re-use authenticated session saved by global-setup */
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  /* Start the Next.js dev server automatically */
  webServer: {
    command: "pnpm --filter=web dev",
    cwd: "../../",
    port: 3000,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
