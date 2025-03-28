import { workflowSteps } from "../../config/workflow";
import { workHistory } from "../../data/workHistory";
import { setCurrentWorkflow, setWorkflowRunning } from "../state/workflowState";
import { WorkflowEngine } from "./WorkflowEngine";

// You'll need to set these up in your environment
const API_KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY || "",
  openai: process.env.OPENAI_API_KEY || "",
  gemini: process.env.GEMINI_API_KEY || "",
};

/**
 * Starts a workflow execution with the provided job description
 * Returns immediate status, while the workflow continues in the background
 */
export async function startWorkflow(jobDescription: string) {
  // Validate input
  if (!jobDescription) {
    throw new Error("Job description is required");
  }

  // Check if a workflow is already running
  const isWorkflowRunning = Boolean(getCurrentWorkflow());

  if (isWorkflowRunning) {
    return {
      status: "already_running",
      message: "A workflow is already in progress",
    };
  }

  try {
    const engine = new WorkflowEngine(API_KEYS, workflowSteps);

    // Start execution in background
    setWorkflowRunning(true);
    const workflow = engine
      .execute(jobDescription, workHistory)
      .finally(() => {
        setWorkflowRunning(false);
        setCurrentWorkflow(null);
      });
    
    setCurrentWorkflow(workflow);

    // Return current state immediately
    return {
      status: "processing",
      message: "Workflow started",
      currentStep: workflowSteps[0].id,
      totalSteps: workflowSteps.length,
      completedSteps: 0,
    };
  } catch (error) {
    setWorkflowRunning(false);
    setCurrentWorkflow(null);
    throw error;
  }
}

/**
 * Gets current workflow
 */
function getCurrentWorkflow() {
  return import("../state/workflowState").then(
    (module) => module.getCurrentWorkflow()
  );
}

/**
 * Validate API keys and return missing ones
 */
export function validateApiKeys() {
  const missingKeys = [];
  if (!API_KEYS.anthropic) missingKeys.push("ANTHROPIC_API_KEY");
  if (!API_KEYS.openai) missingKeys.push("OPENAI_API_KEY");
  if (!API_KEYS.gemini) missingKeys.push("GEMINI_API_KEY");
  
  return {
    missingKeys,
    isValid: missingKeys.length === 0,
    apiKeyStatus: {
      anthropic: API_KEYS.anthropic ? "Present" : "Missing",
      openai: API_KEYS.openai ? "Present" : "Missing",
      gemini: API_KEYS.gemini ? "Present" : "Missing",
    }
  };
}

/**
 * Execute a workflow synchronously and return the final result
 */
export async function executeWorkflow(jobDescription: string) {
  const engine = new WorkflowEngine(API_KEYS, workflowSteps);
  return await engine.execute(jobDescription, workHistory);
} 