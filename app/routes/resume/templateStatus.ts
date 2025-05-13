import { availableTemplates } from "~/config/schemas";
import dbService from "~/services/db/dbService.server";
import { queueService } from "~/services/queue/index.server";

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

export async function getTemplateStatuses(
	jobId: number,
): Promise<TemplateStatus[]> {
	const templates = Object.values(availableTemplates);
	const statuses: TemplateStatus[] = [];

	// Get all generated resumes
	const generatedResumes = new Set(
		dbService.getResumes(jobId).map(({ templateId }) => templateId),
	);

	// Check status for each template
	await Promise.all(
		templates.map(async (template) => {
			const baseTemplate = {
				templateId: template.id,
				name: template.name,
				description: template.description,
			};

			// Already completed
			if (generatedResumes.has(template.id)) {
				statuses.push({
					...baseTemplate,
					status: "completed",
				});
				return;
			}

			// Check if pending
			const pendingJobs = await queueService.searchJobsByData({
				jobId,
				templateId: template.id,
			});

			if (pendingJobs.length > 0) {
				const pendingJobId = pendingJobs[0].id;
				statuses.push({
					...baseTemplate,
					status: "pending",
					pendingJobId,
					completionPromise: queueService.waitForJobCompletion(pendingJobId),
				});
				return;
			}

			// Not started
			statuses.push({
				...baseTemplate,
				status: "not-started",
			});
		}),
	);

	return statuses;
}
