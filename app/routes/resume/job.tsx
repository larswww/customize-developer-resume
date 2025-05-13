import {
	Form,
	Outlet,
	isRouteErrorResponse,
	redirect,
	useNavigation,
	useSearchParams,
} from "react-router";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	UIMatch,
} from "react-router";
import { WorkflowSteps } from "~/components/WorkflowSteps";
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
import type { Route } from "./+types/job";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useRef } from "react";
import { Collapsible } from "~/components/Collapsible";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import {
	LoadingSpinnerIcon,
	MagicWandIcon,
	RetryIcon,
} from "~/components/icons";
import { Button } from "~/components/ui/button";
import text from "~/text";

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

export const handle = {
	title: (match: UIMatch<{ job: { title: string } }>) => {
		return match.data.job.title;
	},
	rightSection: <></>,
};

export async function loader(args: LoaderFunctionArgs) {
	const { job, jobId, selectedTemplateId, selectedTemplateConfig } =
		await extractRouteParams(args);

	const { selectedWorkflow, isWorkflowComplete, workflowStepsData } =
		getWorkflow(job.id, selectedTemplateConfig.defaultWorkflowId);

	const url = new URL(args.request.url);
	const isOnResume = url.pathname.includes("/resume");
	if (isWorkflowComplete && !isOnResume) {
		return redirect(`/job/${jobId}/resume?template=${selectedTemplateId}`);
	}

	if (!isWorkflowComplete && isOnResume) {
		return redirect(`/job/${jobId}/?template=${selectedTemplateId}`);
	}

	const templatesList = Object.values(availableTemplates).map(
		(config: ResumeTemplateConfig) => ({
			id: config.id,
			name: config.name,
		}),
	);

	return {
		job,
		currentWorkflowSteps: selectedWorkflow.steps,
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
		currentWorkflowSteps,
		selectedTemplateId,
		templatesList,
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
		<div className="flex flex-col lg:flex-row w-full h-[calc(100vh-64px)]">
			<div className="w-full lg:w-1/4 lg:border-r overflow-y-auto p-4 lg:p-6 bg-white relative h-[50vh] lg:h-full">
				<JobControlsHeader
					availableTemplates={templatesList}
					currentTemplateId={selectedTemplateId}
					onTemplateChange={handleChange}
					templateLabel="Target Resume Template"
					compact={false}
				/>

				<JobContent
					selectedTemplateId={selectedTemplateId}
					isWorkflowComplete={isWorkflowComplete}
					job={job}
					currentWorkflowSteps={currentWorkflowSteps}
					workflowStepsData={workflowStepsData}
					error={actionData?.error}
				/>
			</div>

			<div className="w-full  h-[50vh] lg:h-full bg-transparent flex flex-col overflow-hidden">
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
			<div className="mt-8">
				{error && (
					<div className="mb-4 p-4 border rounded bg-red-50 text-red-700">
						Error: {error}
					</div>
				)}
			</div>

			<Form method="post" className="py-4">
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

				{hasWorkflowSteps && (
					<WorkflowSteps
						stepsToRender={currentWorkflowSteps || []}
						workflowStepsData={workflowStepsData || []}
						height={contentHeight}
						isComplete={isWorkflowComplete}
					/>
				)}
				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting}
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
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>{error.status}</h1>
				<p>{error.data}</p>
			</div>
		);
	}

	return (
		<div>
			Error:{" "}
			{error instanceof Error ? error.message : "An unknown error occurred"}
		</div>
	);
}
