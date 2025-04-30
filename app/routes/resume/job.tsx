import {
	Outlet,
	redirect,
	useSearchParams,
	useRouteError,
	useNavigation,
	Form,
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Link } from "~/components/ui/Link";
import type { RouteOutletContext } from "~/routes/resume/types";
import {
	extractRouteParams,
	getWorkflow,
	handleContentAction,
} from "~/routes/resume/utils";
import { JobControlsHeader } from "../../components/JobControlsHeader";
import {
	type ResumeTemplateConfig,
	availableTemplates,
} from "../../config/schemas";
import { workflows } from "../../config/workflows";
import type { Route } from "./+types/job";
import { WorkflowSteps } from "~/components/WorkflowSteps";

import text from "~/text";
import { useRef } from "react";
import { Collapsible } from "~/components/Collapsible";
import { Button } from "~/components/ui/Button";
import {
	LoadingSpinnerIcon,
	RetryIcon,
	MagicWandIcon,
} from "~/components/Icons";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import type { MDXEditorMethods } from "@mdxeditor/editor";

export function meta() {
	return [
		{ title: "Resume Builder" },
		{
			name: "description",
			content: "Generate targeted resume content using AI",
		},
	];
}

export const JOB_ROUTE_ID = "routes/job";

export async function loader(args: LoaderFunctionArgs) {
	const {
		job,
		jobId,
		selectedWorkflowId,
		selectedTemplateId,
		selectedTemplateConfig,
	} = await extractRouteParams(args);

	const { selectedWorkflow, isWorkflowComplete, workflowStepsData } =
		getWorkflow(job.id, selectedWorkflowId);

	const url = new URL(args.request.url);
	const isOnResume = url.pathname.includes("/resume");
	if (isWorkflowComplete && !isOnResume) {
		return redirect(
			`/job/${jobId}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`,
		);
	}

	if (!isWorkflowComplete && isOnResume) {
		return redirect(
			`/job/${jobId}/?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`,
		);
	}

	// Additional job-specific data processing
	const availableWorkflows = Object.entries(workflows).map(
		([id, config]: [string, { label: string }]) => ({
			id,
			label: config.label,
		}),
	);

	const templatesList = Object.values(availableTemplates).map(
		(config: ResumeTemplateConfig) => ({
			id: config.id,
			name: config.name,
		}),
	);

	return {
		job,
		selectedWorkflowId,
		currentWorkflowSteps: selectedWorkflow.steps,
		availableWorkflows,
		selectedTemplateId,
		templatesList,
		templateDescription: selectedTemplateConfig.description,
		isWorkflowComplete,
		workflowStepsData,
	};
}

export async function action(args: ActionFunctionArgs) {
	return handleContentAction(args);
}

export default function JobLayout({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const {
		job,
		selectedWorkflowId,
		currentWorkflowSteps,
		availableWorkflows,
		selectedTemplateId,
		templatesList,
		templateDescription,
		isWorkflowComplete,
		workflowStepsData,
	} = loaderData;
	const [, setSearchParams] = useSearchParams();
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchParams((prev) => {
			prev.set(event.target.name, event.target.value);
			return prev;
		});
	};

	return (
		<div className="grid grid-cols-12">
			<div className="col-span-12 md:col-span-6">
				<div className="bg-white border-b border-gray-200 shadow-sm mb-6">
					<div className="max-w-6xl mx-auto px-6 py-4">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-gray-800">{`${job.title}`}</h1>
							<div className="flex gap-3">
								<Link to="/dashboard" variant="secondary" size="md">
									Back to Dashboard
								</Link>
							</div>
						</div>
						<div className="mt-4">
							<JobControlsHeader
								availableWorkflows={availableWorkflows}
								currentWorkflowId={selectedWorkflowId}
								onWorkflowChange={handleChange}
								workflowLabel="Select Content Generation Workflow"
								availableTemplates={templatesList}
								currentTemplateId={selectedTemplateId}
								onTemplateChange={handleChange}
								templateLabel="Target Resume Template"
								compact={false}
							/>
						</div>
					</div>
				</div>

				<div className="max-w-6xl mx-auto px-6">
					<JobContent
						selectedTemplateId={selectedTemplateId}
						selectedWorkflowId={selectedWorkflowId}
						isWorkflowComplete={isWorkflowComplete}
						job={job}
						currentWorkflowSteps={currentWorkflowSteps}
						workflowStepsData={workflowStepsData}
						error={actionData?.error}
					/>
				</div>
			</div>
			<div className="col-span-12 md:col-span-6">
				<Outlet
					context={{
						selectedTemplateId,
						isWorkflowComplete,
					}}
				/>
			</div>
		</div>
	);
}

function JobContent({
	selectedWorkflowId,
	isWorkflowComplete,
	job,
	currentWorkflowSteps,
	workflowStepsData,
	error,
}: RouteOutletContext) {
	const jobDescEditorRef = useRef<MDXEditorMethods | null>(null);
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const contentHeight = "min-h-[200px]";

	const hasWorkflowSteps = workflowStepsData && workflowStepsData.length > 0;

	return (
		<>
			<Form method="post" className="py-4">
				<input type="hidden" name="workflowId" value={selectedWorkflowId} />
				<Collapsible
					title="Job Description"
					className="mb-6"
					defaultOpen={false}
				>
					<div className="min-h-[250px]">
						<ClientMarkdownEditor
							name="jobDescription"
							markdown={job?.jobDescription || ""}
							editorRef={jobDescEditorRef}
							placeholder="Paste job description here..."
						/>
					</div>
				</Collapsible>

				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting}
						variant="primary"
						size="lg"
						className="flex items-center bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 font-semibold"
					>
						{isSubmitting ? (
							<LoadingSpinnerIcon size="md" />
						) : isWorkflowComplete ? (
							<RetryIcon size="md" />
						) : (
							<MagicWandIcon size="md" />
						)}
						{isSubmitting
							? text.ui.generating
							: isWorkflowComplete
								? text.content.regenerateButton
								: text.content.generateButton}
					</Button>
				</div>
			</Form>

			<div className="mt-8">
				{error && (
					<div className="mb-4 p-4 border rounded bg-red-50 text-red-700">
						Error: {error}
					</div>
				)}

				{hasWorkflowSteps && (
					<WorkflowSteps
						stepsToRender={currentWorkflowSteps || []}
						workflowStepsData={workflowStepsData || []}
						height={contentHeight}
						isComplete={isWorkflowComplete}
					/>
				)}
			</div>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	console.error(error);
	return (
		<div>
			Error:{" "}
			{error instanceof Error ? error.message : "An unknown error occurred"}
		</div>
	);
}
