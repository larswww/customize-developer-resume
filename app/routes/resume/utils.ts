import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { availableTemplates, defaultTemplateId } from "~/config/schemas";
import { type ResumeTemplateConfig } from "~/config/schemas/sharedTypes";
import {
	defaultWorkflowId,
	workflows,
	type WorkflowConfig,
} from "~/config/workflows";
import dbService, { type Job } from "~/services/db/dbService.server";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { executeWorkflow } from "~/services/workflow/workflow-service";
import { serverLogger } from "~/utils/logger.server";

export interface RouteParams {
	jobId: number;
	selectedWorkflowId: string;
	selectedTemplateId: string;
	job: Job;
	selectedWorkflow: WorkflowConfig;
	selectedTemplateConfig: ResumeTemplateConfig;
}

export function extractRouteParams({
	params,
	request,
}: LoaderFunctionArgs): RouteParams {
	const jobId = Number(params.jobId);
	const url = new URL(request.url);
	const selectedWorkflowId =
		url.searchParams.get("workflow") || defaultWorkflowId;
	const selectedTemplateId =
		url.searchParams.get("template") || defaultTemplateId;

	if (Number.isNaN(jobId)) {
		throw new Response("Invalid job ID", { status: 400 });
	}

	const job = dbService.getJob(jobId);
	if (!job) {
		throw new Response("Job not found", { status: 404 });
	}

	const selectedWorkflow =
		workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
	if (!selectedWorkflow) {
		throw new Error(`Workflow '${selectedWorkflowId}' not found.`);
	}

	const selectedTemplateConfig =
		availableTemplates[selectedTemplateId] ??
		availableTemplates[defaultTemplateId];
	if (!selectedTemplateConfig) {
		throw new Error("Template config not found.");
	}

	return {
		jobId,
		selectedWorkflowId,
		selectedTemplateId,
		job,
		selectedWorkflow,
		selectedTemplateConfig,
	};
}

export function getWorkflow(jobId: number, selectedWorkflowId: string) {
	const selectedWorkflow =
		workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
	const workflowStepsData = dbService.getWorkflowSteps(
		jobId,
		selectedWorkflowId,
	);
	const isWorkflowComplete =
		workflowStepsData &&
		selectedWorkflow.steps.every((step) =>
			workflowStepsData.some(
				(workflowStep) =>
					workflowStep.stepId === step.id && workflowStep.status === "success",
			),
		);

	return {
		selectedWorkflow,
		isWorkflowComplete,
		workflowStepsData,
	};
}

export async function handleContentAction(args: ActionFunctionArgs) {
	const { request, params } = args;
	const formData = await request.formData();
	const jobDescription = formData.get("jobDescription") as string;
	const relevant = formData.get("relevant") as string;
	const workflowId =
		(formData.get("workflowId") as string) || defaultWorkflowId;
	const jobId = Number(params.jobId);

	const { job, selectedTemplateConfig } = await extractRouteParams(args);
	const templateDescription = selectedTemplateConfig.description;

	if (!jobDescription) {
		return {
			success: false,
			error: "Please add a job description to generate resume",
		};
	}

	dbService.updateJob({
		...job,
		jobDescription,
		relevantDescription: relevant || "",
	});

	try {
		serverLogger.log(`Starting workflow execution (${workflowId})...`);

		const { success } = await executeWorkflow(
			jobDescription,
			jobId,
			workflowId,
			templateDescription,
		);

		return {
			success: success,
			selectedWorkflowId: workflowId,
			error: success ? undefined : "Workflow execution failed.",
		};
	} catch (error) {
		serverLogger.error(
			`Error in workflow action handler (${workflowId}):`,
			error,
		);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "An unknown error occurred during workflow execution",
			selectedWorkflowId: workflowId,
		};
	}
}

export const getResumeText = (
	jobId: number,
	selectedWorkflowId: string,
	selectedWorkflow: WorkflowConfig,
) => {
	const completedSteps = dbService.getWorkflowSteps(jobId, selectedWorkflowId);
	const resumeSourceSteps = selectedWorkflow.steps
		.filter((step: any) => step.useInResume)
		.map((s: any) => ({ id: s.id, name: s.name }));

	const sourceTexts: Record<string, string> = {};
	for (const step of resumeSourceSteps) {
		sourceTexts[step.id] =
			completedSteps.find((s) => s.stepId === step.id)?.result || "";
	}
	const missingSteps: string[] = [];
	for (const step of resumeSourceSteps) {
		const text = sourceTexts[step.id];
		if (!text || text.trim() === "") {
			missingSteps.push(step.name);
		}
	}

	if (missingSteps.length > 0) {
		throw new Error(
			`Missing required input: Text for ${missingSteps.join(
				", ",
			)} cannot be empty. Please ensure all source text sections are filled.`,
		);
	}

	const combinedSourceText = resumeSourceSteps
		.map((step) => `${step.name.toUpperCase()}:\n${sourceTexts[step.id]}`)
		.join("\n\n---\n\n");

	return combinedSourceText;
};

export async function handleResumeAction(args: ActionFunctionArgs) {
	const { params } = args;
	const jobId = Number(params.jobId);

	const {
		job,
		selectedWorkflow,
		selectedTemplateConfig,
		selectedWorkflowId,
		selectedTemplateId,
	} = await extractRouteParams(args);

	const combinedSourceText = getResumeText(
		jobId,
		selectedWorkflowId,
		selectedWorkflow,
	);

	const outputSchema = selectedTemplateConfig.outputSchema;
	const result = await generateAndSaveResume(
		combinedSourceText,
		job.jobDescription,
		outputSchema,
	);

	if (result.success) {
		dbService.saveResume({
			jobId,
			templateId: selectedTemplateId,
			structuredData: result.structuredData as any,
			resumeText: combinedSourceText,
		});
	}
}
