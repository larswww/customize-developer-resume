import { availableTemplates } from "~/config/schemas";
import dbService from "~/services/db/dbService.server";
import { queueService } from "~/services/queue/queueService.server";

export interface TemplateBase {
	templateId: string;
	name: string;
	description?: string;
}

export interface CompletedTemplate extends TemplateBase {
	status: "completed";
}

export interface NotStartedTemplate extends TemplateBase {
	status: "not-started";
}

export interface PendingTemplate extends TemplateBase {
	status: "pending";
	pendingJobId: string;
	completionPromise: Promise<any>;
}

export type TemplateStatus =
	| CompletedTemplate
	| PendingTemplate
	| NotStartedTemplate;

export function getTemplateStatuses(jobId: number): TemplateStatus[] {
	const templates = Object.values(availableTemplates);

	// Get all generated resumes
	const generatedResumes = new Set(
		dbService.getResumes(jobId).map(({ templateId }) => templateId),
	);

	// Prepare statuses without awaiting async operations
	return templates.map((template) => {
		const baseTemplate = {
			templateId: template.id,
			name: template.name,
			description: template.description,
		};

		// Already completed
		if (generatedResumes.has(template.id)) {
			return {
				...baseTemplate,
				status: "completed",
			};
		}

		// For pending templates, create async status but don't await it
		// This will allow the UI to handle the promise resolution
		const pendingStatus: PendingTemplate = {
			...baseTemplate,
			status: "pending",
			pendingJobId: "", // Will be populated asynchronously
			completionPromise: getPendingJobStatus(jobId, template.id),
		};

		// Not started (default)
		const notStartedStatus: NotStartedTemplate = {
			...baseTemplate,
			status: "not-started",
		};

		// Create a promise that resolves to either pending or not-started status
		// This function will return immediately, and the promise will be handled by React Suspense
		return checkIfPending(jobId, template.id, pendingStatus, notStartedStatus);
	});
}

// Helper function to get pending job status without blocking
async function getPendingJobStatus(jobId: number, templateId: string) {
	try {
		const pendingJobs = await queueService.searchJobsByData({
			jobId,
			templateId,
		});

		if (pendingJobs.length > 0) {
			const pendingJobId = pendingJobs[0].id;
			return queueService.waitForJobCompletion(pendingJobId);
		}

		return { status: "not-started" };
	} catch (error) {
		console.error("Error getting pending job status:", error);
		return { status: "failed", error };
	}
}

// Helper function to check if a template is pending without blocking
function checkIfPending(
	jobId: number,
	templateId: string,
	pendingStatus: PendingTemplate,
	notStartedStatus: NotStartedTemplate,
): TemplateStatus {
	// Create a non-blocking promise that checks for pending jobs
	queueService
		.searchJobsByData({
			jobId,
			templateId,
		})
		.then((pendingJobs) => {
			if (pendingJobs.length > 0) {
				const pendingJobId = pendingJobs[0].id;
				pendingStatus.pendingJobId = pendingJobId;
				pendingStatus.completionPromise =
					queueService.waitForJobCompletion(pendingJobId);
			}
		})
		.catch((error) => {
			console.error("Error checking pending status:", error);
		});

	// Return immediately with the not-started status as default
	// The UI will use Suspense to handle pending state if found
	return notStartedStatus;
}
