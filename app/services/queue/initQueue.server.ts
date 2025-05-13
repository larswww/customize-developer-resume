import { serverLogger } from "~/utils/logger.server";
import { initializeQueueSystem } from "./index.server";

// Check if we're in a server environment
const isServer = typeof window === "undefined";

// Initialize the queue system if this is a server environment
if (isServer) {
	try {
		serverLogger.log("Initializing BullMQ queue system...");
		initializeQueueSystem();
		serverLogger.log("BullMQ queue system initialized successfully.");
	} catch (error) {
		serverLogger.error("Failed to initialize BullMQ queue system:", error);
	}
}
