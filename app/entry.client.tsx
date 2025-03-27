import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Initialize MSW in development mode or when explicitly enabled
const isMswEnabled =
	process.env.NODE_ENV === "development" || process.env.MSW_ENABLED === "true";

async function initApp() {
	// Initialize MSW if enabled
	if (isMswEnabled) {
		console.log("Initializing MSW for API mocking...");
		try {
			const { startWorker } = await import("./mocks/browser");
			await startWorker();
		} catch (error) {
			console.error("Error initializing MSW:", error);
		}
	}

	// Hydrate the app
	return true;
}

initApp()
	.then(() => {
		startTransition(() => {
			hydrateRoot(
				document,
				<StrictMode>
					<HydratedRouter />
				</StrictMode>,
			);
		});
	})
	.catch(console.error);

// Start the application
