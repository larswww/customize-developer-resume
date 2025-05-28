import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import type * as z from "zod";
import { availableTemplates, defaultTemplateId } from "~/config/schemas";
import type { ResumeTemplateConfig } from "~/config/schemas/sharedTypes";
import {
	type WorkFlowId,
	type WorkflowConfig,
	defaultWorkflowId,
	workflows,
} from "~/config/workflows";
import dbService, { type Job } from "~/services/db/dbService.server";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { executeWorkflow } from "~/services/workflow/workflow-service";
import { serverLogger } from "~/utils/logger.server";

export interface RouteParams {
	jobId: number;
	selectedTemplateId: string;
	job: Job;
	selectedTemplateConfig: ResumeTemplateConfig;
}

export function extractRouteParams({
	params,
}: LoaderFunctionArgs): RouteParams {
	const jobId = Number(params.jobId);
	if (Number.isNaN(jobId)) {
		throw data(
			"Invalid job ID, did you edit it yourself there buddy? Don't :)",
			{ status: 400 },
		);
	}
	const job = dbService.getJob(jobId);
	if (!job) {
		throw data("Could not find this job. Did you delete it?", { status: 404 });
	}

	const selectedTemplateId = params.templateId ?? defaultTemplateId;

	const selectedTemplateConfig =
		availableTemplates[selectedTemplateId] ??
		availableTemplates[defaultTemplateId];
	if (!selectedTemplateConfig) {
		throw data("Couldn't find this template, did you use an old link?", {
			status: 422,
		});
	}

	return {
		jobId,
		selectedTemplateId,
		job,
		selectedTemplateConfig,
	};
}

export function getWorkflow(jobId: number, selectedWorkflowId: WorkFlowId) {
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

// Internal utility function to handle resume generation and saving
async function _generateAndSaveResumeInternal<T extends z.ZodTypeAny>({
	jobId,
	selectedWorkflowId,
	selectedWorkflow,
	selectedTemplateId,
	selectedTemplateConfig,
}: {
	jobId: number;
	selectedWorkflowId: string;
	selectedWorkflow: WorkflowConfig;
	selectedTemplateId: string;
	selectedTemplateConfig: ResumeTemplateConfig;
	jobDescription: string;
	feedback?: string;
}) {
	try {
		const combinedSourceText = getResumeText(
			jobId,
			selectedWorkflowId,
			selectedWorkflow,
		);

		const outputSchema = selectedTemplateConfig.outputSchema;
		const result = await generateAndSaveResume(
			combinedSourceText,
			outputSchema,
		);

		if (!result.success) {
			serverLogger.error("Resume generation failed:", result.error);
			return {
				success: false,
				error: result.error || "Resume generation failed.",
			};
		}

		dbService.saveResume({
			jobId,
			templateId: selectedTemplateId,
			structuredData: result.structuredData as any,
			resumeText: combinedSourceText,
		});

		serverLogger.log(
			`Resume generated and saved successfully for job ${jobId}, template ${selectedTemplateId}`,
		);
		return { success: true };
	} catch (error) {
		serverLogger.error(
			`Error during internal resume generation/saving for job ${jobId}:`,
			error,
		);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "An unknown error occurred during resume generation/saving",
		};
	}
}

export async function handleContentAction(args: ActionFunctionArgs) {
	const { request, params } = args;
	const formData = await request.formData();
	const jobDescription = formData.get("jobDescription") as string;
	const relevant = formData.get("relevant") as string;
	const jobId = Number(params.jobId);

	const { job, selectedTemplateConfig, selectedTemplateId } =
		await extractRouteParams(args);
	const templateDescription = selectedTemplateConfig.description;
	const workflowId = selectedTemplateConfig.defaultWorkflowId;
	const selectedWorkflow = workflows[workflowId];

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

		const workflowResult = await executeWorkflow(
			job.title,
			job.relevantDescription || "",
			jobDescription,
			jobId,
			workflowId,
			templateDescription,
		);

		if (!workflowResult.success) {
			return {
				success: false,
				selectedWorkflowId: workflowId,
				error: "Workflow execution failed.",
			};
		}

		serverLogger.log(
			`Workflow (${workflowId}) successful, proceeding to generate resume...`,
		);

		const generationSaveResult = await _generateAndSaveResumeInternal({
			jobId,
			selectedWorkflowId: workflowId,
			selectedWorkflow,
			selectedTemplateId,
			selectedTemplateConfig,
			jobDescription: job.jobDescription,
			// feedback: undefined, // No feedback source in this action yet
		});

		if (!generationSaveResult.success) {
			return {
				success: false,
				selectedWorkflowId: workflowId,
				error:
					generationSaveResult.error ||
					"Resume generation/saving failed after successful workflow.",
			};
		}

		// If generation and saving succeeded
		return {
			success: true,
			selectedWorkflowId: workflowId,
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

export function getSharedObjects() {
	const education = dbService.getEducation();
	const contactInfo = dbService.getContactInfo();
	const other = dbService.getSetting("other");
	const projects = dbService.getSetting("projects");

	const hasEmptyContactInfo = Object.values(contactInfo).some(
		(value) => !value,
	);

	const hasEducation = education?.educations?.length;

	return {
		education,
		contactInfo,
		hasEmptyContactInfo,
		hasEducation,
		other: other?.structuredData,
		projects: projects?.structuredData,
	};
}

import pickBy from "lodash/pickBy";

export function updateEmptySettings(payload: any) {
	const { education, contactInfo } = getSharedObjects();
	const predicate = (v: any) => v != null && v !== "";
	const filteredContactInfo = pickBy(payload.contactInfo, predicate);
	const filteredExistingContactInfo = pickBy(contactInfo, predicate);

	const updatedContacts = {
		...filteredContactInfo,
		...filteredExistingContactInfo,
	};

	const filteredExistingEducations = education.educations.map((edu: any) =>
		pickBy(edu, predicate),
	);

	const filteredNewEducations = (payload.education?.educations || []).map(
		(edu: any) => pickBy(edu, predicate),
	);

	const mergedEducations = filteredExistingEducations.map(
		(edu: any, idx: number) => ({
			...edu,
			...filteredNewEducations[idx],
		}),
	);

	const updatedEducation = {
		...education,
		educations: mergedEducations,
	};

	if (Object.keys(filteredContactInfo).length > 0) {
		dbService.saveSetting({
			key: "contactInfo",
			structuredData: updatedContacts,
			value: null,
		});
	}

	const hasNonEmptyEducation = filteredNewEducations.some(
		(edu: any) => Object.keys(edu).length > 0,
	);

	if (hasNonEmptyEducation) {
		dbService.saveSetting({
			key: "education",
			structuredData: updatedEducation,
			value: null,
		});
	}
}

export function combineResumeData(
	savedResume: any,
	shared: ReturnType<typeof getSharedObjects>,
) {
	const {
		education,
		contactInfo,
		hasEmptyContactInfo,
		hasEducation,
		other,
		projects,
	} = shared;
	return {
		hasEmptyContactInfo,
		hasEducation,
		...savedResume?.structuredData,
		contactInfo: {
			...contactInfo,
			...savedResume?.structuredData?.contactInfo,
		},
		education: {
			...education,
			...savedResume?.structuredData?.education,
		},
		other: {
			...other,
			...savedResume?.structuredData?.other,
		},
		projects: {
			...projects,
			...savedResume?.structuredData?.projects,
		},
	};
}
