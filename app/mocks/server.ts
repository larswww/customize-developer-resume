import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { serverLogger } from "../utils/logger.server";

export const server = setupServer(...handlers);

export function startServer() {
	server.listen({
		onUnhandledRequest: (request, print) => {
			const url = request.url.toString();
			const shouldPrintWarning = [
				"api.anthropic.com",
				"api.openai.com",
				"generativelanguage.googleapis.com",
			].some((domain) => url.includes(domain));

			if (shouldPrintWarning) {
				print.warning();
				serverLogger.warn(
					`[MSW] Warning: Unhandled ${request.method} request to ${url}`,
				);
			}
		},
	});

	serverLogger.log("[MSW] Server started for node environment");

	server.events.on("request:start", ({ request }) => {
		serverLogger.log(`[MSW] Request started: ${request.method} ${request.url}`);
	});

	server.events.on("request:match", ({ request }) => {
		serverLogger.log(`[MSW] Request matched: ${request.method} ${request.url}`);
	});

	server.events.on("request:unhandled", ({ request }) => {
		serverLogger.log(`[MSW] Request unhandled: ${request.method} ${request.url}`);
	});

	server.events.on("request:end", ({ request, requestId }) => {
		serverLogger.log(
			`[MSW] Request ended: ${request.method} ${request.url}`,
		);
	});

	process.on("SIGINT", () => {
		server.close();
		serverLogger.log("[MSW] Server interrupted");
		process.exit();
	});

	process.on("SIGTERM", () => {
		server.close();
		serverLogger.log("[MSW] Server terminated");
		process.exit();
	});
}
