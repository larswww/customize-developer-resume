import { serverLogger } from "~/utils/logger.server";
import queueService, { JobStatus } from "./queueService.server";
import resumeWorker from "./resumeWorker.server";

// Initialize the queue system
export function initializeQueueSystem() {
	try {
		// Start the resume worker
		if (resumeWorker) {
			serverLogger.log("Resume worker initialized.");
		}

		serverLogger.log("Queue system initialized successfully.");
	} catch (error) {
		serverLogger.error("Error initializing queue system:", error);
	}
}

// Export the services
export { queueService, JobStatus };
