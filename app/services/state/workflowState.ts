import { workflowSteps } from "../../config/workflow";

// Workflow execution tracking
let isWorkflowRunning = false;
let currentWorkflow: Promise<string> | null = null;

/**
 * Sets the workflow running state
 */
export function setWorkflowRunning(running: boolean): void {
	isWorkflowRunning = running;
}

/**
 * Sets the current workflow promise
 */
export function setCurrentWorkflow(workflow: Promise<string> | null): void {
	currentWorkflow = workflow;
}

/**
 * Gets the current workflow promise
 */
export function getCurrentWorkflow(): Promise<string> | null {
	return currentWorkflow;
}
