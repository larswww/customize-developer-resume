import { NavLink, Outlet, isRouteErrorResponse } from "react-router";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	UIMatch,
} from "react-router";
import {
	extractRouteParams,
	getWorkflow,
	handleContentAction,
} from "~/routes/resume/utils";
import type { Route } from "./+types/job";

import { parseWithZod } from "@conform-to/zod";
import { useEffect, useState } from "react";
import { JobDetailsForm, JobFormSchema } from "~/components/JobForm";
import { TemplateStatusIcon } from "~/components/TemplateStatusComponents";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import dbService from "~/services/db/dbService.server";
import type { TemplateStatus } from "./templateStatus";
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
	const { request } = args;
	const formData = await request.formData();
	const action = formData.get("action") as string;

	if (action === "update-job") {
		const jobId = Number(formData.get("jobId"));
		const submission = parseWithZod(formData, { schema: JobFormSchema });

		if (submission.status !== "success") {
			return {
				success: false,
				error: "Please check your input and try again",
			};
		}

		const { title, link, jobDescription, relevantDescription } =
			submission.value;

		try {
			dbService.updateJob({
				id: jobId,
				title,
				link: link || null,
				jobDescription: jobDescription || "",
				relevantDescription: relevantDescription || "",
			});

			return {
				success: true,
				message: "Job updated successfully",
			};
		} catch (_e) {
			return {
				success: false,
				error: "Failed to update job",
			};
		}
	}

	return handleContentAction(args);
}

export default function JobLayout({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { job, selectedTemplateId, isWorkflowComplete, templateStatuses } =
		loaderData;

	const hasTemplates =
		templateStatuses &&
		templateStatuses.filter((t) => t.status !== "not-started").length > 0;

	const [openSheet, setOpenSheet] = useState(false);

	// Close sheet on successful update
	useEffect(() => {
		if (actionData?.success && "message" in actionData) {
			setOpenSheet(false);
		}
	}, [actionData]);

	return (
		<div className="flex flex-col lg:flex-row w-full h-[calc(100vh-64px)]">
			<div className="w-full lg:w-1/4 lg:border-r overflow-y-auto p-2 lg:p-3 bg-white relative h-[50vh] lg:h-full">
				{/* Job Description Placeholder */}
				<Sheet open={openSheet} onOpenChange={setOpenSheet}>
					<SheetTitle className="sr-only">Job Details</SheetTitle>
					<SheetTrigger asChild>
						<Button variant="outline" className="w-full mb-3" type="button">
							Edit Job Details
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="w-xl max-w-full min-w-0 p-6 bg-white rounded-r-2xl border-l shadow-2xl overflow-y-auto overflow-x-hidden"
					>
						<JobDetailsForm job={job} onCancel={() => setOpenSheet(false)} />
					</SheetContent>
				</Sheet>

				{/* All Templates Link */}
				<NavLink to={`/job/${job.id}`} viewTransition end>
					{({ isActive }) => (
						<Button
							asChild
							variant="outline"
							isActive={isActive}
							className="w-full mb-2 text-base font-semibold justify-start"
						>
							<span>All Templates</span>
						</Button>
					)}
				</NavLink>

				{/* Template List */}
				<div>
					{hasTemplates ? (
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
					) : (
						<div className="text-center text-gray-400 py-6 border rounded bg-gray-50 mt-2 text-sm">
							No templates available yet
						</div>
					)}
				</div>

				{/* TODO replace with sonner {actionData?.error ? (
					<div className="mt-4 p-3 border rounded bg-red-50 text-red-700 text-sm">
						Error: {actionData.error}
					</div>
				) : null}

				{actionData?.success
					? "message" in actionData &&
						actionData.message && (
							<div className="mt-4 p-3 border rounded bg-green-50 text-green-700 text-sm">
								{actionData.message}
							</div>
						)
					: null} */}
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
		<NavLink to={`/job/${jobId}/${template.templateId}`} viewTransition end>
			{({ isActive }) => (
				<Button
					asChild
					variant="outline"
					isActive={isActive}
					className="flex items-center justify-between px-2 py-1.5 text-base border-b last:border-b-0 transition"
				>
					<span className="flex items-center w-full">
						<TemplateStatusIcon status={template.status} />
						<span className="ml-2">{template.name}</span>
					</span>
				</Button>
			)}
		</NavLink>
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
