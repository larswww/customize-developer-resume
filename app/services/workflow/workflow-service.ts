import { serverLogger } from "~/utils/logger.server";
import {
	type WorkFlowId,
	defaultWorkflowId,
	workflows,
} from "../../config/workflows";
import type { WorkflowContext, WorkflowStep } from "../../services/ai/types";
import dbService from "../db/dbService.server";

import {
	type DBService,
	WorkflowEngine,
	type WorkflowStepUpdate,
} from "./workflow-engine";

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
				result: update.result || "",
			});
			serverLogger.log(
				`Updated step ${update.id} in DB with status ${update.status}`,
			);
		} catch (error) {
			serverLogger.error(
				`Failed to update step ${update.id} in database:`,
				error,
			);
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
	title: string,
	relevantDescription: string,
	jobDescription: string,
	jobId: number,
	workflowId: WorkFlowId = defaultWorkflowId,
	templateDescription = "",
): Promise<{
	workflowResults: Record<string, string>;
	workflowSteps: WorkflowStep[];
	success: boolean;
}> {
	try {
		const workHistory = dbService.getWorkHistory();
		if (!workHistory) {
			throw new Error("Add your Work History before generating a resume.");
		}
		const workHistoryString = JSON.stringify(workHistory);

		const selectedWorkflow = workflows[workflowId];
		if (!selectedWorkflow) {
			throw new Error(`Workflow with ID '${workflowId}' not found.`);
		}
		serverLogger.time(`Workflow ${workflowId} completed in`);

		const currentWorkflowSteps = selectedWorkflow.steps;
		const dbAdapter = new DBAdapter(jobId, workflowId);
		const engine = new WorkflowEngine(currentWorkflowSteps, dbAdapter);

		const initialContext: WorkflowContext = {
			title: title || "",
			relevantDescription: relevantDescription || "",
			jobDescription,
			workHistory: workHistoryString,
			templateDescription,
			relevant: " ",
			intermediateResults: {},
		};

		const { contextPromise } = await engine.execute(initialContext);
		const finalContext = await contextPromise;

		const workflowResults: Record<string, string> = Object.entries(
			finalContext.intermediateResults,
		).reduce(
			(acc, [key, value]) => {
				acc[key] = String(value); // Ensure value is a string
				return acc;
			},
			{} as Record<string, string>,
		);

		serverLogger.log(`Workflow execution completed for job ${jobId}`);
		serverLogger.timeEnd(`Workflow ${workflowId} completed in`);
		return {
			workflowResults,
			workflowSteps: currentWorkflowSteps,
			success: true,
		};
	} catch (error) {
		serverLogger.error(`Workflow execution failed for job ${jobId}:`, error);
		throw error;
	}
}
