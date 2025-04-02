import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers);

// Export a function to start the server
export function startServer() {
	// Start the server
	server.listen({
		onUnhandledRequest: (request, print) => {
			// Only log warnings for the API domains we're trying to mock
			const url = request.url.toString();
			const shouldPrintWarning = [
				"api.anthropic.com",
				"api.openai.com",
				"generativelanguage.googleapis.com",
			].some((domain) => url.includes(domain));

			if (shouldPrintWarning) {
				print.warning();
				console.log(
					`[MSW] Warning: Unhandled ${request.method} request to ${url}`,
				);
			}
		},
	});

	console.log("[MSW] Server started for node environment");

	// Add listeners for request events
	server.events.on("request:start", ({ request }) => {
		console.log(`[MSW] Request started: ${request.method} ${request.url}`);
	});

	server.events.on("request:match", ({ request }) => {
		console.log(`[MSW] Request matched: ${request.method} ${request.url}`);
	});

	server.events.on("request:unhandled", ({ request }) => {
		console.log(`[MSW] Request unhandled: ${request.method} ${request.url}`);
	});

	server.events.on("request:end", ({ request, requestId }) => {
		console.log(
			`[MSW] Request ended: ${request.method} ${request.url}`,
		);
	});

	// Clean up
	process.on("SIGINT", () => {
		server.close();
		console.log("[MSW] Server stopped");
		process.exit();
	});

	process.on("SIGTERM", () => {
		server.close();
		console.log("[MSW] Server stopped");
		process.exit();
	});
}
