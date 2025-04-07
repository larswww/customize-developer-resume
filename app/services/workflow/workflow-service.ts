import { workflows, defaultWorkflowId } from "../../config/workflows";
import type { WorkflowStep, WorkflowContext } from "../../services/ai/types";
import { WorkflowEngine } from "./workflow-engine";
import dbService from "../db/dbService";

/**
 * Executes the entire workflow on the server side
 * @param jobDescription - The job description text.
 * @param jobId - The job ID.
 * @param workflowId - Optional ID of the workflow to execute (defaults to defaultWorkflowId).
 * @param templateDescription - Optional template description.
 */
export function executeWorkflow(
  jobDescription: string,
  jobId: number,
  workflowId: string = defaultWorkflowId,
  templateDescription = ""
): Promise<{
  workflowResults: Record<string, string>;
  workflowSteps: WorkflowStep[];
  success: boolean;
}> {
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
    currentWorkflowSteps
  );

  // Initial context with job description and work history from DB
  const initialContext: WorkflowContext = {
    jobDescription,
    workHistory,
    templateDescription,
    relevant: ' ',
    intermediateResults: {}
  };

  return new Promise((resolve, reject) => {
    engine.execute(initialContext)
      .then(({ contextPromise, stepPromises }) => {
        // Initialize all steps as "processing" in the database
        for (const step of currentWorkflowSteps) {
          dbService.saveWorkflowStep({
            jobId,
            stepId: step.id,
            workflowId,
            result: "",
            status: "processing"
          });
        }

        // Attach status updates to individual step promises
        // but don't wait for them here for the final result.
        for (const [stepId, stepPromise] of stepPromises.entries()) {
          stepPromise
            .then(({ result }) => {
              // Save completed status
              dbService.saveWorkflowStep({
                jobId,
                stepId,
                workflowId,
                result,
                status: "completed",
              });
            })
            .catch((error) => {
              console.error(`Step ${stepId} failed:`, error);
              // Save error status
              dbService.saveWorkflowStep({
                jobId,
                stepId,
                workflowId,
                result: error.message,
                status: "error",
              });
              // Don't re-throw here, let contextPromise handle overall failure
            });
        }

        // Wait for the entire workflow context to resolve
        return contextPromise;
      })
      .then((finalContext) => {
        // Extract results from the final context, ensuring they are strings
        const workflowResults: Record<string, string> = Object.entries(
          finalContext.intermediateResults
        ).reduce((acc, [key, value]) => {
          acc[key] = String(value); // Ensure value is a string
          return acc;
        }, {} as Record<string, string>);

        console.log(`Workflow execution completed for job ${jobId}`);

        // Resolve with the workflow results and steps
        resolve({
          workflowResults,
          workflowSteps: currentWorkflowSteps,
          success: true,
        });
      })
      .catch((error) => {
        // Catch errors from engine.execute() or contextPromise
        console.error(`Workflow execution failed overall for job ${jobId}:`, error);
        // Ensure all steps that might have been running are marked as error if not completed
        // Note: This might overwrite specific step errors, but provides a consistent final state
        const currentStepsState = dbService.getWorkflowSteps(jobId, workflowId);
        for (const step of currentWorkflowSteps) {
          const stepState = currentStepsState.find(s => s.stepId === step.id);
          if (stepState?.status === "processing") {
            dbService.saveWorkflowStep({
              jobId,
              stepId: step.id,
              workflowId,
              result: "Workflow failed",
              status: "error",
            });
          }
        }
        reject(error); // Reject the main promise
      });
  });
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
