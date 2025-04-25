import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
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
			teardown: "cleanup",
		},
		{
			name: "cleanup",
			testMatch: /global\.teardown\.ts/,
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
	],
	webServer: {
		stdout: "pipe",
		command: process.env.CI ? "pnpm start:prod:msw" : "pnpm dev:msw",
		url: "http://localhost:4000",
		reuseExistingServer: !process.env.CI,
	},
});
