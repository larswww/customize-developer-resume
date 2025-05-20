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
}

export type TemplateStatus =
	| CompletedTemplate
	| PendingTemplate
	| NotStartedTemplate;

export async function getTemplateStatuses(
	jobId: number,
): Promise<TemplateStatus[]> {
	const templates = Object.values(availableTemplates);

	// Get all generated resumes
	const generatedResumes = new Set(
		dbService.getResumes(jobId).map(({ templateId }) => templateId),
	);

	const pendingJobs = await queueService.searchJobsByData(
		{
			jobId,
		},
		["waiting", "active", "delayed"],
	);

	// Prepare statuses without awaiting async operations
	return templates.map((template) => {
		const baseTemplate = {
			templateId: template.id,
			name: template.name,
			description: template.description,
		};

		const foundPendingJob = pendingJobs.find(
			(job) => job.data.templateId === template.id,
		);
		if (foundPendingJob) {
			return {
				...baseTemplate,
				status: "pending",
				pendingJobId: foundPendingJob.id,
			};
		}

		if (generatedResumes.has(template.id)) {
			return {
				...baseTemplate,
				status: "completed",
			};
		}

		const notStartedStatus: NotStartedTemplate = {
			...baseTemplate,
			status: "not-started",
		};

		return notStartedStatus;
	});
}
