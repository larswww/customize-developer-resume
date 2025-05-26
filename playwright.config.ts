import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	expect: {
		timeout: 1000,
	},
	globalSetup: "./tests/e2e/setup.ts",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 2,
	workers: 3,
	reporter: "html",
	use: {
		baseURL: "http://localhost:4000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		launchOptions: {
			devtools: true,
		},
	},
	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
	],
	webServer: {
		stdout: "pipe",
		command: process.env.CI
			? "./deleteDb.sh e2e && pnpm start:prod:msw"
			: "./deleteDb.sh e2e && pnpm dev:msw",
		url: "http://localhost:4000",
		reuseExistingServer: !process.env.CI,
	},
});
