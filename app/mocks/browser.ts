import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { clientLogger } from "../utils/logger.client";

export const worker = setupWorker(...handlers);

export async function startWorker() {
	try {
		const isNodeJs = typeof process !== 'undefined' && process.versions && process.versions.node;
		if (isNodeJs) {
			return;
		}
		await worker.start({
			onUnhandledRequest: "bypass",
		});
		clientLogger.log("[MSW] Mock Service Worker started successfully");
	} catch (error) {
		clientLogger.error("[MSW] Failed to start Mock Service Worker:", error);
	}
}
