import { defineConfig, devices } from "@playwright/test";

const port = 4327;

/**
 * End-to-end tests of the built elements (`dist`) in Chromium, Firefox and WebKit, with a
 * canvas stream standing in for the camera.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "node e2e/server.mjs",
    url: `http://localhost:${port}/capture-ui/e2e/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
