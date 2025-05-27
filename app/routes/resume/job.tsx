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
import { ChevronRightIcon, PanelRightIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import dbService from "~/services/db/dbService.server";
import text from "~/text";
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
			<div className="w-full lg:w-1/4 lg:border-r overflow-y-auto bg-white relative h-[50vh] lg:h-full">
				{/* Top Action Area */}
				<div className="flex items-center justify-between px-4 py-4 border-b bg-white">
					<Sheet open={openSheet} onOpenChange={setOpenSheet}>
						<SheetTitle className="sr-only">Job Details</SheetTitle>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								className=" gap-2 font-medium"
								type="button"
							>
								<PanelRightIcon size="sm" />
								<span>{text.dashboard.contextButton}</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-xl max-w-full min-w-0 p-6 bg-white rounded-r-2xl border-l shadow-2xl overflow-y-auto overflow-x-hidden"
						>
							<JobDetailsForm job={job} onCancel={() => setOpenSheet(false)} />
						</SheetContent>
					</Sheet>

					<NavLink to={`/job/${job.id}`} viewTransition end>
						{({ isActive }) => (
							<Button
								asChild
								variant="ghost"
								isActive={isActive}
								className="flex items-center gap-2 font-medium"
							>
								<span>All Templates</span>
								<ChevronRightIcon size="sm" />
							</Button>
						)}
					</NavLink>
				</div>

				<div className="text-xs font-semibold text-muted-foreground my-2 p-2">
					Created Versions
				</div>
				{hasTemplates ? (
					<ul className="flex flex-col gap-1">
						{templateStatuses.map((template) => {
							if (template.status === "not-started") {
								return null;
							}
							return (
								<li key={template.templateId}>
									<NavLink
										to={`/job/${job.id}/${template.templateId}`}
										viewTransition
										end
									>
										{({ isActive }) => (
											<Button
												asChild
												variant="outline"
												isActive={isActive}
												className={`w-full flex items-center px-3 py-2 text-base transition justify-start rounded-none border-0 border-r-0 ${isActive ? "bg-white text-primary font-bold shadow-none z-10 border-r-4 border-r-[var(--color-yellow-500)]" : "text-muted-foreground bg-transparent hover:bg-gray-50"}`}
											>
												<span className="flex items-center w-full">
													<TemplateStatusIcon status={template.status} />
													<span className="ml-2">{template.name}</span>
												</span>
											</Button>
										)}
									</NavLink>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="text-center text-gray-400 py-6 border rounded bg-gray-50 mt-2 text-sm">
						No templates available yet
					</div>
				)}
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
