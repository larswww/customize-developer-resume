import "./templates.css";
import {
	Form,
	useActionData,
	useNavigation,
	useOutletContext,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { TemplateStatusIcon } from "~/components/TemplateStatusComponents";
import { FailedIcon, LoadingSpinnerIcon } from "~/components/icons";
import { TemplatePreview } from "~/components/resume/TemplatePreview";
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

	if (!job.jobDescription) {
		return {
			success: false,
			error: "Please add a job description before generating a resume",
		};
	}

	try {
		const queueJobId = await queueService.addResumeGenerationJob({
			jobId,
			templateId,
			workflowId: templateConfig.defaultWorkflowId,
		});

		if (!queueJobId) {
			throw new Error("Failed to create queue job");
		}

		const jobCompletionPromise = queueService.waitForJobCompletion(
			queueJobId.toString(),
		);

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
		<div className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<div className="text-center">
						<h1 className="text-3xl font-semibold text-gray-900 mb-2">
							Choose a Template
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Select a template to generate a tailored resume for{" "}
							<span className="font-medium text-gray-900">
								Job #{job.id}: {job.title}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* Templates Grid */}
			<div className="preview-grid py-6">
				{templateStatuses.map((template) => {
					const wasJustSubmitted =
						actionData?.success &&
						actionData.templateId === template.templateId;
					const isGenerating =
						template.status === "pending" ||
						(wasJustSubmitted && !!actionData.completionPromise);

					return (
						<Form key={template.templateId} method="post">
							<input type="hidden" name="jobId" value={job.id} />
							<input
								type="hidden"
								name="templateId"
								value={template.templateId}
							/>

							<button
								type="submit"
								disabled={isSubmitting || isGenerating}
								className="group text-left"
							>
								<div className="preview-wrapper">
									<TemplatePreview
										templateId={template.templateId}
										className="mx-auto"
									/>
									{/* Loading overlay */}
									<div
										className={`pointer-events-none absolute inset-0 bg-transparent flex items-center justify-center ${isGenerating ? "bg-white/80" : "bg-transparent"}`}
									>
										{isGenerating && (
											<div className="flex items-center space-x-2 text-blue-600">
												<LoadingSpinnerIcon size="md" />
												<span className="font-medium">
													{text.ui.generating}
												</span>
											</div>
										)}
									</div>
									{/* Hover overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
								</div>
								{/* Title */}
								<div className="p-6">
									<h3 className="text-xl font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
										<TemplateStatusIcon status={template.status} />
										{template.name}
									</h3>
								</div>
							</button>
						</Form>
					);
				})}
			</div>

			{/* Error Message */}
			{actionData?.error && (
				<div className="mt-8 max-w-2xl mx-auto">
					<div className="bg-red-50 border border-red-200 rounded-xl p-4">
						<div className="flex items-center">
							<FailedIcon
								size="md"
								className="text-red-500 mr-3 flex-shrink-0"
							/>
							<p className="text-red-800 font-medium">{actionData.error}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
