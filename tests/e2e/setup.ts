import type { FullConfig } from "@playwright/test";
import { spawn, ChildProcess } from "node:child_process";

let worker: ChildProcess;
async function globalSetup(config: FullConfig) {
	// 2. cross-platform way to invoke pnpm
	const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

	// 3. launch the worker via the script declared in package.json:
	//    "scripts": { "worker": "ts-node src/worker.ts" }
	worker = spawn(pnpmCmd, ["run", "worker"], {
		env: { ...process.env },
		stdio: "inherit", // stream worker logs into the test output
	});
}

export default globalSetup;
