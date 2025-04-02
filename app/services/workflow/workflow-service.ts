import { workflowSteps } from "../../config/workflow";
import type { WorkflowStep, WorkflowContext } from "../../services/ai/types";
import { WorkflowEngine } from "./workflow-engine";
import dbService from "../db/dbService";

/**
 * Executes the entire workflow on the server side
 */
export async function executeWorkflow(jobDescription: string): Promise<string> {
  // Get work history from DB
  const workHistory = dbService.getWorkHistory();
  if (!workHistory) {
    throw new Error("Work history not found in the database.");
  }
  
  // Create workflow engine
  const engine = new WorkflowEngine(
    {
      anthropic: process.env.ANTHROPIC_API_KEY || "",
      openai: process.env.OPENAI_API_KEY || "",
      gemini: process.env.GEMINI_API_KEY || "",
    },
    workflowSteps as unknown as WorkflowStep[]
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
  const finalResume = context.intermediateResults['craft-resume'];
  if (typeof finalResume !== 'string') {
    throw new Error("Resume generation failed or returned unexpected type");
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
