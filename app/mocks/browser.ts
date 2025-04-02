import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Export a function to initialize the worker
export async function startWorker() {
	// Use try-catch to avoid TypeScript errors about window not being defined
	try {
		// Use this condition to check if we're in a browser
		// @ts-ignore - Ignore TS errors in Node environment
		if (typeof process !== 'undefined' && process.versions && process.versions.node) {
			return; // We're in Node.js
		}
		
		// Start the worker with default options - MSW will find the service worker
		// at the root (/mockServiceWorker.js) by default
		await worker.start({
			onUnhandledRequest: "bypass", // Don't warn about unhandled requests
		});
		console.log("[MSW] Mock Service Worker started successfully");
	} catch (error) {
		console.error("[MSW] Failed to start Mock Service Worker:", error);
	}
}
