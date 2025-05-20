import { Suspense } from "react";
import {
	Await,
	Form,
	useActionData,
	useNavigation,
	useOutletContext,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { CheckIcon, FailedIcon, LoadingSpinnerIcon } from "~/components/icons";
import { availableTemplates } from "~/config/schemas";
import dbService from "~/services/db/dbService.server";
import { queueService } from "~/services/queue/queueService.server";
import text from "~/text";
import type { PendingTemplate, TemplateStatus } from "./templateStatus";

export const handle = {
	title: () => text.template.title,
};

interface TemplatesOutletContext {
	templateStatuses: TemplateStatus[];
	job: {
		id: number;
		title: string;
		jobDescription?: string;
	};
	selectedTemplateId?: string;
	isWorkflowComplete?: boolean;
}

interface ActionData {
	success: boolean;
	error?: string;
	queueJobId?: string;
	templateId?: string;
	jobId?: number;
	completionPromise?: Promise<any>;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const jobId = Number(formData.get("jobId"));
	const templateId = formData.get("templateId") as string;

	if (!jobId || Number.isNaN(jobId) || !templateId) {
		return { success: false, error: "Invalid input" };
	}

	const job = dbService.getJob(jobId);
	if (!job) {
		return { success: false, error: "Job not found" };
	}

	const templateConfig = availableTemplates[templateId];
	if (!templateConfig) {
		return { success: false, error: "Template not found" };
	}

	// Check if job description exists
	if (!job.jobDescription) {
		return {
			success: false,
			error: "Please add a job description before generating a resume",
		};
	}

	try {
		// Add job directly to BullMQ queue
		const queueJobId = await queueService.addResumeGenerationJob({
			jobId,
			templateId,
			workflowId: templateConfig.defaultWorkflowId,
		});

		if (!queueJobId) {
			throw new Error("Failed to create queue job");
		}

		// Create a promise that will resolve when the job completes
		const jobCompletionPromise = queueService.waitForJobCompletion(
			queueJobId.toString(),
		);

		// Return with job completion promise directly
		return {
			success: true,
			queueJobId: queueJobId.toString(),
			templateId,
			jobId,
			completionPromise: jobCompletionPromise,
		} as ActionData;
	} catch (error) {
		console.error("Error queuing resume generation:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to queue resume generation",
		};
	}
}

export default function Templates() {
	const { templateStatuses, job } = useOutletContext<TemplatesOutletContext>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="p-6">
			<p className="mb-6">
				Select a template to generate a tailored resume for job #{job.id}:{" "}
				{job.title}
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{templateStatuses.map((template) => {
					const wasJustSubmitted =
						actionData?.success &&
						actionData.templateId === template.templateId;

					return (
						<div
							key={template.templateId}
							className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="p-4">
								<h3 className="text-lg font-semibold">{template.name}</h3>
								<p className="text-gray-600 mb-4">{template.description}</p>

								<div className="flex items-center justify-between">
									{/* Show status based on template state */}
									{template.status === "pending" ? (
										<TemplateStatusDisplay />
									) : wasJustSubmitted && actionData.completionPromise ? (
										<TemplateStatusDisplay />
									) : template.status === "completed" ? (
										<CompletedStatus />
									) : null}

									{template.status !== "pending" && !wasJustSubmitted && (
										<Form method="post">
											<input type="hidden" name="jobId" value={job.id} />
											<input
												type="hidden"
												name="templateId"
												value={template.templateId}
											/>

											<button
												type="submit"
												disabled={isSubmitting}
												className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
											>
												{template.status === "completed"
													? text.resume.regenerateButton
													: text.content.generateButton}
											</button>
										</Form>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{actionData?.error && (
				<div className="mt-6 p-4 border rounded bg-red-50 text-red-700">
					{actionData.error}
				</div>
			)}
		</div>
	);
}

// Component for displaying template status with loading/error/success states
function TemplateStatusDisplay() {
	return (
		<GeneratingFallback />
		// <Suspense fallback={<GeneratingFallback />}>
		// 	<Await resolve={promise} errorElement={<GenerationError />}>
		// 		{(result) => <CompletedStatus />}
		// 	</Await>
		// </Suspense>
	);
}

// Simple loading state component
function GeneratingFallback() {
	return (
		<div className="text-blue-600 flex items-center">
			<LoadingSpinnerIcon size="md" className="mr-1" />
			{text.ui.generating}
		</div>
	);
}

// Error component
function GenerationError() {
	return (
		<div className="text-red-600 flex items-center">
			<FailedIcon size="md" className="mr-1" />
			{text.ui.failed}
		</div>
	);
}

// Success component
function CompletedStatus() {
	return (
		<div className="text-green-600 flex items-center">
			<CheckIcon size="md" className="mr-1" />
			{text.ui.complete}
		</div>
	);
}
