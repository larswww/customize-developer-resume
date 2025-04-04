import { workflows, defaultWorkflowId } from "../../config/workflows";
import type { WorkflowStep, WorkflowContext } from "../../services/ai/types";
import { WorkflowEngine } from "./workflow-engine";
import dbService from "../db/dbService";

/**
 * Executes the entire workflow on the server side
 * @param jobDescription - The job description text.
 * @param workflowId - Optional ID of the workflow to execute (defaults to defaultWorkflowId).
 */
export async function executeWorkflow(
  jobDescription: string,
  workflowId: string = defaultWorkflowId // Add optional workflowId parameter
): Promise<string> {
  // Get work history from DB
  const workHistory = dbService.getWorkHistory();
  if (!workHistory) {
    throw new Error("Work history not found in the database.");
  }

  // Get the selected workflow steps
  const selectedWorkflow = workflows[workflowId];
  if (!selectedWorkflow) {
    throw new Error(`Workflow with ID '${workflowId}' not found.`);
  }
  const currentWorkflowSteps = selectedWorkflow.steps;
  
  // Create workflow engine with the selected steps
  const engine = new WorkflowEngine(
    {
      anthropic: process.env.ANTHROPIC_API_KEY || "",
      openai: process.env.OPENAI_API_KEY || "",
      gemini: process.env.GEMINI_API_KEY || "",
    },
    currentWorkflowSteps // Use dynamically loaded steps
  );

  // Initial context with job description and work history from DB
  const initialContext: WorkflowContext = {
    jobDescription,
    workHistory,
    intermediateResults: {}
  };

  // Execute all steps in sequence
  const context = await engine.execute(initialContext);

  // Return the final resume
  // TODO: Consider making the final step ID ('craft-resume') configurable per workflow
  const finalResume = context.intermediateResults['craft-resume'];
  if (typeof finalResume !== 'string') {
    throw new Error(`Resume generation failed (step 'craft-resume') or returned unexpected type in workflow '${workflowId}'`);
  }
  return finalResume;
}

/**
 * Validates that required API keys are present
 */
export function validateApiKeys(): {
  isValid: boolean;
  missingKeys: string[];
} {
  const requiredKeys = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
