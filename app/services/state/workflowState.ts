import { workflowSteps } from "../../config/workflow";
import { getAllStepResults, hasStepResult } from "./stepStorage";

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
 * Checks if a workflow is currently running
 */
export function isWorkflowActive(): boolean {
  return isWorkflowRunning;
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

/**
 * Gets the current workflow progress status
 */
export async function getWorkflowStatus() {
  // Get the status of each step
  const stepIds = workflowSteps.map((step) => step.id);
  const stepStatuses = stepIds.map((stepId) => {
    if (hasStepResult(stepId)) {
      return { status: "complete", stepId };
    }
    return { status: "pending", stepId };
  });

  // Count completed steps
  const completedSteps = stepStatuses.filter(
    (status) => status.status === "complete"
  ).length;

  // Determine current step (first pending step)
  const currentStepIndex = stepStatuses.findIndex(
    (status) => status.status === "pending"
  );

  const isComplete = completedSteps === stepIds.length;
  const currentStep =
    currentStepIndex >= 0
      ? stepIds[currentStepIndex]
      : isComplete
        ? stepIds[stepIds.length - 1]
        : stepIds[0];

  return {
    status: isComplete ? "complete" : "in_progress",
    currentStep,
    totalSteps: stepIds.length,
    completedSteps,
    stepStatuses,
    results: getAllStepResults(),
    isLoading: isWorkflowRunning
  };
} 