import { spawn } from "node:child_process";

async function globalSetup() {
	const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

	const worker = spawn(pnpmCmd, ["run", "worker"], {
		env: { ...process.env },
		stdio: "inherit",
	});

	return async () => {
		console.log("globalTeardown: stopping worker …");
		worker.kill("SIGTERM");

		const forceKill = setTimeout(() => {
			if (!worker.killed) worker.kill("SIGKILL");
		}, 5000);

		await new Promise((res) => worker.once("exit", res));
		clearTimeout(forceKill);
	};
}

export default globalSetup;
