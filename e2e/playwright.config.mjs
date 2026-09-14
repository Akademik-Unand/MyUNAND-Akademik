import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: "http://localhost:5199",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: [
    {
      command: "npm run start",
      cwd: path.join(ROOT, "backend"),
      url: "http://localhost:3000/up",
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        ...process.env,
        CORS_ORIGIN:
          "http://localhost:5199,http://localhost:5173,http://localhost:4173,http://localhost:8080",
      },
    },
    {
      command: "npm run dev -- --port 5199 --strictPort",
      cwd: path.join(ROOT, "frontend"),
      url: "http://localhost:5199",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});