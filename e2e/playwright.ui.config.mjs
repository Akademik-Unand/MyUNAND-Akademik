import { defineConfig, devices } from "@playwright/test";

// Pengujian UI terisolasi: API diintersep per test; tidak menjalankan resetSandbox.
export default defineConfig({
  testDir: "./ui",
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:5199",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 5199 --strictPort",
    cwd: "../frontend",
    url: "http://localhost:5199",
    reuseExistingServer: !process.env.CI,
    env: { VITE_API_BASE_URL: "http://localhost:3000/api/v1" },
  },
});