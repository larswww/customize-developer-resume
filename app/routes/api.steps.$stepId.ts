import { type LoaderFunctionArgs } from "react-router";
import { workflowSteps } from "../config/workflow";

// In a real app, you would store these results in a database or Redis
// For this example, we'll use a simple in-memory store
const stepResults = new Map<string, any>();

// Function to store a step result (to be called from WorkflowEngine)
export function storeStepResult(stepId: string, result: any) {
  stepResults.set(stepId, result);
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { stepId } = params;
  
  if (!stepId) {
    return new Response(
      JSON.stringify({ error: "Step ID is required" }), 
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Check if the step exists in the workflow
  const stepExists = workflowSteps.some(step => step.id === stepId);
  if (!stepExists) {
    return new Response(
      JSON.stringify({ error: "Invalid step ID" }), 
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Check if we have a result for this step
  if (!stepResults.has(stepId)) {
    return { 
      status: "pending",
      message: "Step result not available yet" 
    };
  }
  
  // Return the step result
  return {
    status: "complete",
    result: stepResults.get(stepId)
  };
} 