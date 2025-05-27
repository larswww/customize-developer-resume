import { Worker } from "bullmq";
import { availableTemplates } from "~/config/schemas";
import { workflows } from "~/config/workflows";
import type { WorkflowStep } from "~/services/ai/types";
import { serverLogger } from "~/utils/logger.server";
import dbService from "../db/dbService.server";
import { generateAndSaveResume } from "../resume/resumeDataService";
import { executeWorkflow } from "../workflow/workflow-service";
import { JOB_TYPES, QUEUE_NAMES } from "./queueService.server";

const isMswEnabled = process.env.MSW_ENABLED === "true";

if (isMswEnabled) {
	serverLogger.log("Initializing MSW for worker...");
	try {
		const { startServer } = await import("../../mocks/server");
		startServer();
	} catch (error) {
		serverLogger.error("Error initializing MSW for worker:", error);
	}
}
// Redis connection configuration
const connection = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

// Type for step with simple properties
interface SimpleStep {
	id: string;
	name: string;
}

const resumeWorker = new Worker(
	QUEUE_NAMES.RESUME_GENERATION,
	async (job) => {
		if (job.name !== JOB_TYPES.GENERATE_RESUME) {
			throw new Error(`Unsupported job type: ${job.name}`);
		}

		const { jobId, templateId, workflowId } = job.data;
		serverLogger.log(
			`Processing resume generation job ${job.id} for job ${jobId}, template ${templateId}`,
		);

		try {
			console.log(typeof jobId);
			console.log(jobId);
			const jobData = dbService.getJob(jobId);
			if (!jobData) {
				throw new Error(`Job ${jobId} not found`);
			}

			const templateConfig = availableTemplates[templateId];
			if (!templateConfig) {
				throw new Error(`Template ${templateId} not found`);
			}

			const selectedWorkflow = workflows[workflowId as keyof typeof workflows];
			if (!selectedWorkflow) {
				throw new Error(`Workflow ${workflowId} not found`);
			}

			const { jobDescription, title, relevantDescription } = jobData;
			const templateDescription = templateConfig.description;

			const workflowResult = await executeWorkflow(
				title,
				relevantDescription || "",
				jobDescription,
				jobId,
				workflowId,
				templateDescription,
			);

			if (!workflowResult.success) {
				throw new Error("Workflow execution failed");
			}

			const workflowStepsData = dbService.getWorkflowSteps(jobId, workflowId);
			const resumeSourceSteps = selectedWorkflow.steps
				.filter((step: WorkflowStep) => step.useInResume)
				.map((s: WorkflowStep): SimpleStep => ({ id: s.id, name: s.name }));

			const sourceTexts: Record<string, string> = {};
			for (const step of resumeSourceSteps) {
				sourceTexts[step.id] =
					workflowStepsData.find((s) => s.stepId === step.id)?.result || "";
			}

			const combinedSourceText = resumeSourceSteps
				.map(
					(step: SimpleStep) =>
						`${step.name.toUpperCase()}:\n${sourceTexts[step.id]}`,
				)
				.join("\n\n---\n\n");

			const outputSchema = templateConfig.outputSchema;
			const result = await generateAndSaveResume(
				combinedSourceText,
				outputSchema,
			);

			if (!result.success) {
				throw new Error(result.error || "Resume generation failed");
			}

			dbService.saveResume({
				jobId,
				templateId,
				structuredData: result.structuredData as any,
				resumeText: combinedSourceText,
			});

			serverLogger.log(
				`Resume generation job ${job.id} completed successfully`,
			);

			return { success: true };
		} catch (error) {
			serverLogger.error(
				`Error processing resume generation job ${job.id}:`,
				error,
			);
			throw error;
		}
	},
	{ connection, concurrency: 50 },
);

resumeWorker.on("failed", (job, error) => {
	serverLogger.error(`Resume generation job ${job?.id} failed:`, error);
});

resumeWorker.on("completed", (job) => {
	serverLogger.log(`Resume generation job ${job.id} completed`);
});

const gracefulShutdown = async () => {
	// Prevent running twice
	// @ts-ignore  allow dynamic property
	if ((gracefulShutdown as any).called) return;
	// @ts-ignore
	(gracefulShutdown as any).called = true;

	serverLogger.log("Gracefully shutting down resumeWorker…");

	try {
		await resumeWorker.close();
		serverLogger.log("resumeWorker closed");
	} catch (err) {
		serverLogger.error("Error during worker shutdown:", err);
	} finally {
		process.exit(0);
	}
};

process.once("SIGINT", gracefulShutdown);
process.once("SIGTERM", gracefulShutdown);
process.once("beforeExit", gracefulShutdown);

process.on("message", (msg) => {
	if (msg === "shutdown") gracefulShutdown();
});

export default resumeWorker;
