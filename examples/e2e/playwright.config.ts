import { defineConfig, devices } from "@playwright/test";
import { EXAMPLES } from "./examples";

/**
 * Runs every web example's production build (`vite preview`, built by
 * `turbo run test:e2e` first) in Chromium, Firefox and WebKit.
 */
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: EXAMPLES.map(({ name, port }) => ({
    command: "pnpm preview",
    cwd: `../${name}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
