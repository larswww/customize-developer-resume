import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { availableTemplates, defaultTemplateId } from "~/config/templates";
import { ContactInfoSchema } from "~/config/templates/sharedTypes";
import { defaultWorkflowId, workflows } from "~/config/workflows";
import dbService from "~/services/db/dbService.server";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { executeWorkflow } from "~/services/workflow/workflow-service";
import { serverLogger } from "~/utils/logger.server";
export interface RouteParams {
	jobId: number;
	selectedWorkflowId: string;
	selectedTemplateId: string;
	job: any;
	selectedWorkflow: any;
	selectedTemplateConfig: any;
	isWorkflowComplete: boolean;
	workflowStepsData: any[];
}

export function extractRouteParams({
	params,
	request,
}: LoaderFunctionArgs) {
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
		workflowStepsData.length === selectedWorkflow.steps.length &&
		workflowStepsData.every((step) => step.status === "success");

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

export async function handleResumeAction(args: ActionFunctionArgs) {
	const { request, params } = args;
	const formData = await request.formData();
	const jobId = Number(params.jobId);

	const { job, selectedWorkflow, selectedTemplateConfig, selectedWorkflowId, selectedTemplateId } =
		await extractRouteParams(args);

	const resumeSourceSteps = selectedWorkflow.steps
		.filter((step: any) => step.useInResume)
		.map((s: any) => ({ id: s.id, name: s.name }));

	const contactInfoData = {
		name: formData.get("name") as string,
		title: formData.get("title") as string,
		location: formData.get("location") as string,
		phone: formData.get("phone") as string,
		email: formData.get("email") as string,
		linkedin: formData.get("linkedin") as string,
		portfolio: formData.get("portfolio") as string,
		imageUrl: formData.get("imageUrl") as string,
	};

	const parsedContactInfo = ContactInfoSchema.safeParse(contactInfoData);
	if (parsedContactInfo.success) {
		dbService.saveContactInfo(parsedContactInfo.data);
		serverLogger.log("   info");
	} else {
		serverLogger.error(
			"Failed to parse contact info:",
			parsedContactInfo.error,
		);
		return { success: false, error: "Invalid contact information provided." };
	}

	const saveStepsPromises = [];
	const sourceTexts: Record<string, string> = {};
	for (const step of resumeSourceSteps) {
		sourceTexts[step.id] = (formData.get(step.id) as string) || "";
		saveStepsPromises.push(
			dbService.saveWorkflowStep({
				jobId,
				workflowId: selectedWorkflowId,
				stepId: step.id,
				status: "success",
				result: sourceTexts[step.id],
			}),
		);
	}
	await Promise.all(saveStepsPromises);
	serverLogger.log("Saved updated steps");

	const outputSchema = selectedTemplateConfig.outputSchema;

	return await generateAndSaveResume(
		jobId,
		parsedContactInfo.data,
		sourceTexts,
		resumeSourceSteps,
		job.jobDescription,
		outputSchema,
		selectedTemplateId,
	);
}
