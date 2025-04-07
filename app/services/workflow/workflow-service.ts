import { workflows, defaultWorkflowId } from "../../config/workflows";
import type { WorkflowStep, WorkflowContext } from "../../services/ai/types";
import { WorkflowEngine, type WorkflowStepUpdate, type DBService } from "./workflow-engine";
import dbService from "../db/dbService";

// DB adapter that implements the WorkflowDBService interface
class DBAdapter implements DBService {
  private jobId: number;
  private workflowId: string;
  
  constructor(jobId: number, workflowId: string) {
    this.jobId = jobId;
    this.workflowId = workflowId;
  }
  
  async updateStepStatus(update: WorkflowStepUpdate): Promise<void> {
    try {
      await dbService.saveWorkflowStep({
        jobId: this.jobId,
        workflowId: this.workflowId,
        stepId: update.id,
        status: update.status,
        result: update.result || ''
      });
      console.log(`Updated step ${update.id} in DB with status ${update.status}`);
    } catch (error) {
      console.error(`Failed to update step ${update.id} in database:`, error);
    }
  }
}

/**
 * Executes the entire workflow on the server side
 * @param jobDescription - The job description text.
 * @param jobId - The job ID.
 * @param workflowId - Optional ID of the workflow to execute (defaults to defaultWorkflowId).
 * @param templateDescription - Optional template description.
 */
export async function executeWorkflow(
  jobDescription: string,
  jobId: number,
  workflowId: string = defaultWorkflowId,
  templateDescription = ""
): Promise<{
  workflowResults: Record<string, string>;
  workflowSteps: WorkflowStep[];
  success: boolean;
}> {
  try {
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
    
    // Create DB adapter for the workflow
    const dbAdapter = new DBAdapter(jobId, workflowId);
    
    // Create workflow engine with the selected steps and DB adapter
    const engine = new WorkflowEngine(
      currentWorkflowSteps,
      dbAdapter
    );

    // Initial context with job description and work history from DB
    const initialContext: WorkflowContext = {
      jobDescription,
      workHistory,
      templateDescription,
      relevant: ' ',
      intermediateResults: {}
    };

    // Execute the workflow and wait for all steps to complete
    const { contextPromise } = await engine.execute(initialContext);
    const finalContext = await contextPromise;
    
    // Extract results from the final context, ensuring they are strings
    const workflowResults: Record<string, string> = Object.entries(
      finalContext.intermediateResults
    ).reduce((acc, [key, value]) => {
      acc[key] = String(value); // Ensure value is a string
      return acc;
    }, {} as Record<string, string>);

    console.log(`Workflow execution completed for job ${jobId}`);

    return {
      workflowResults,
      workflowSteps: currentWorkflowSteps,
      success: true,
    };
  } catch (error) {
    console.error(`Workflow execution failed for job ${jobId}:`, error);
    throw error;
  }
}

