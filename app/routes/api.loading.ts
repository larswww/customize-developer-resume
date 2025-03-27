import { type LoaderFunctionArgs } from "react-router";

// Import the isWorkflowRunning variable from the progress API
// In a real app, you would use a database or Redis to store this state
let isWorkflowRunning = false;

// Export a function to update the loading state
export function setWorkflowRunning(running: boolean) {
  isWorkflowRunning = running;
}

export async function loader() {
  return {
    isLoading: isWorkflowRunning
  };
} 