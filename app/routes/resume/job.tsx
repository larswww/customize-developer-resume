import { Suspense } from "react";
import {
	Await,
	Form,
	NavLink,
	Outlet,
	isRouteErrorResponse,
	useNavigation,
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
import type { Route } from "./+types/job";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useRef } from "react";
import { Collapsible } from "~/components/Collapsible";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import { CheckIcon, FailedIcon, LoadingSpinnerIcon } from "~/components/icons";
import type { PendingTemplate, TemplateStatus } from "./templateStatus";
import { getTemplateStatuses } from "./templateStatus";

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
	const { job, selectedTemplateId, selectedTemplateConfig } =
		await extractRouteParams(args);

	const { selectedWorkflow, isWorkflowComplete, workflowStepsData } =
		getWorkflow(job.id, selectedTemplateConfig.defaultWorkflowId);

	const templateStatuses = await getTemplateStatuses(job.id);

	return {
		job,
		currentWorkflowSteps: selectedWorkflow.steps,
		selectedTemplateId,
		templateDescription: selectedTemplateConfig.description,
		isWorkflowComplete,
		workflowStepsData,
		templateStatuses,
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
		isWorkflowComplete,
		workflowStepsData,
		templateStatuses,
	} = loaderData;

	return (
		<div className="flex flex-col lg:flex-row w-full h-[calc(100vh-64px)]">
			<div className="w-full lg:w-1/4 lg:border-r overflow-y-auto p-4 lg:p-6 bg-white relative h-[50vh] lg:h-full">
				<NavLink
					to={`/job/${job.id}`}
					className="text-blue-600 hover:underline font-medium"
				>
					All Templates
				</NavLink>

				{templateStatuses.length > 0 && (
					<div className="mt-4">
						<h3 className="text-lg font-semibold mb-2">Resume Templates</h3>
						<div className="flex flex-col border rounded overflow-hidden">
							{templateStatuses.map((template) => {
								if (template.status === "not-started") {
									return null;
								}
								return (
									<TemplateStatusItem
										key={template.templateId}
										template={template}
										jobId={job.id}
									/>
								);
							})}
						</div>
					</div>
				)}

				<JobContent
					selectedTemplateId={selectedTemplateId}
					isWorkflowComplete={isWorkflowComplete}
					job={job}
					currentWorkflowSteps={currentWorkflowSteps}
					workflowStepsData={workflowStepsData}
					error={actionData?.error}
				/>
			</div>

			<div className="w-full h-[50vh] lg:h-full bg-transparent flex flex-col overflow-hidden">
				<Outlet
					context={{
						selectedTemplateId,
						isWorkflowComplete,
						templateStatuses,
						job,
					}}
				/>
			</div>
		</div>
	);
}

function TemplateStatusItem({
	template,
	jobId,
}: { template: TemplateStatus; jobId: number }) {
	return (
		<div className="border-b last:border-b-0">
			<NavLink
				to={`/job/${jobId}/${template.templateId}`}
				className={({ isActive }) => `
					py-2 px-4 flex items-center justify-between
					hover:bg-gray-50 
					${isActive ? "bg-blue-50 font-medium text-blue-600 border-l-4 border-l-blue-600" : ""}
				`}
			>
				<span>{template.name}</span>

				{template.status === "completed" ? (
					<StatusCompleted />
				) : template.status === "pending" ? (
					<StatusPending />
				) : null}
			</NavLink>
		</div>
	);
}

function StatusCompleted() {
	return (
		<span className="text-green-600 flex items-center">
			<CheckIcon size="md" />
		</span>
	);
}

function StatusPending() {
	return (
		<span className="text-blue-600">
			<LoadingSpinnerIcon size="md" />
		</span>
		// <Suspense
		// 	fallback={
		// 		<span className="text-blue-600">
		// 			<LoadingSpinnerIcon size="md" />
		// 		</span>
		// 	}
		// >
		// 	<Await
		// 		resolve={promise}
		// 		errorElement={
		// 			<span className="text-red-600">
		// 				<FailedIcon size="md" />
		// 			</span>
		// 		}
		// 	>
		// 		{(result) => <StatusCompleted />}
		// 	</Await>
		// </Suspense>
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
