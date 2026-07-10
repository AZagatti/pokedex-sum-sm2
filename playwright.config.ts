import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  testDir: "e2e",
  testMatch: /(?<prefix>.+\.)?(?<kind>test|spec)\.[jt]s/u,
  use: {
    baseURL: "http://localhost:4173",
  },
  webServer: {
    command: "npm run preview",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
