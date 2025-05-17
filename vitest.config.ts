import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [viteTsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		include: ["**/*.test.{ts,tsx}"],
		exclude: ["node_modules", "dist", ".git", ".cache", "playwright-report"],
		setupFiles: [],
		forceRerunTriggers: ["**/dbService.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["**/node_modules/**", "**/dist/**", "**/playwright/**"],
		},
	},
});
