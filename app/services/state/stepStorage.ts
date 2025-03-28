import { workflowSteps } from "../../config/workflow";

// In a real app, you would store these results in a database or Redis
// For this example, we'll use a simple in-memory store
const stepResults = new Map<string, unknown>();

/**
 * Stores a step result in memory for later retrieval
 */
export function storeStepResult(stepId: string, result: unknown) {
	stepResults.set(stepId, result);
}

/**
 * Retrieves a step result by ID
 */
export function getStepResult(stepId: string): unknown | undefined {
	return stepResults.get(stepId);
}

/**
 * Checks if a step result exists
 */
export function hasStepResult(stepId: string): boolean {
	return stepResults.has(stepId);
}

/**
 * Gets all step results
 */
export function getAllStepResults(): Record<string, unknown> {
	return Object.fromEntries(stepResults.entries());
}
