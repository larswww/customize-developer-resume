import { type LoaderFunctionArgs } from "react-router";
import { workflowSteps } from "../config/workflow";

// Function to determine current workflow progress
export async function loader() {
  // Get the status of each step
  const stepIds = workflowSteps.map(step => step.id);
  const stepStatuses = await Promise.all(
    stepIds.map(async (stepId) => {
      try {
        // Use slash notation for route paths, matching the URL pattern in routes.ts
        const response = await fetch(`/api/steps/${stepId}`);
        return await response.json();
      } catch (error) {
        return { status: "error", stepId };
      }
    })
  );
  
  // Count completed steps
  const completedSteps = stepStatuses.filter(
    status => status.status === "complete"
  ).length;
  
  // Determine current step (first pending step)
  const currentStepIndex = stepStatuses.findIndex(
    status => status.status === "pending"
  );
  
  const isComplete = completedSteps === stepIds.length;
  const currentStep = currentStepIndex >= 0 
    ? stepIds[currentStepIndex] 
    : isComplete 
      ? stepIds[stepIds.length - 1] 
      : stepIds[0];
  
  return {
    status: isComplete ? "complete" : "in_progress",
    currentStep,
    totalSteps: stepIds.length,
    completedSteps,
    stepStatuses
  };
} 