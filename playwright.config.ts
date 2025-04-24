import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1, // TODO suite fails on ci with multiple workers
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
		command: "pnpm dev:msw",
		url: "http://localhost:4000",
		reuseExistingServer: true,
	},
});
