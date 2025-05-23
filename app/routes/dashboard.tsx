import { Form, redirect, useSearchParams } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { CreateJobForm } from "~/components/CreateJobForm";
import { DocumentIcon, ExternalLinkIcon, TrashIcon } from "~/components/icons";
import { Link } from "~/components/ui/Link";
import { Button } from "~/components/ui/button";
import text from "~/text";
import dbService, { type Job } from "../services/db/dbService.server";
import type { Route } from "./+types/dashboard";

export function meta() {
	return [
		{ title: "Resume Generator Dashboard" },
		{ name: "description", content: "Manage your resume generation jobs" },
	];
}

export async function loader() {
	const jobs = dbService.getAllJobs();
	return { jobs };
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const action = formData.get("action") as string;

	if (action === "create") {
		const title = formData.get("title") as string;
		const jobDescription = (formData.get("jobDescription") as string) || "";
		const link = (formData.get("link") as string) || "";

		if (!title.trim()) {
			return {
				success: false,
				error: "Job title is required",
			};
		}

		// Create a new job with the provided fields
		const job = dbService.createJob({
			title,
			jobDescription,
			link,
		});

		return redirect(`/job/${job.id}`);
	}

	if (action === "delete") {
		const jobIdString = formData.get("jobId") as string;
		const jobId = Number(jobIdString);

		if (Number.isNaN(jobId)) {
			return {
				success: false,
				error: "Invalid job ID",
			};
		}

		const success = dbService.deleteJob(jobId);

		return {
			success,
			message: success ? "Job deleted successfully" : "Failed to delete job",
		};
	}

	return {
		success: false,
		error: "Invalid action",
	};
}

function JobCard({ job }: { job: Job }) {
	return (
		<div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card">
			<div className="p-4">
				<h3 className="font-bold text-lg mb-2 truncate">{job.title}</h3>
				<p className="text-sm text-muted-foreground mb-2">
					Created:{" "}
					{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
				</p>
				<p className="text-sm text-muted-foreground mb-4">
					Updated:{" "}
					{job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "—"}
				</p>

				<div className="flex flex-wrap gap-2">
					<Link
						to={`/job/${job.id}`}
						variant="primary"
						size="sm"
						className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center"
					>
						<DocumentIcon />
						{text.dashboard.viewJob.resumeButton}
					</Link>

					{job.link && (
						<a
							href={job.link}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center px-3 py-1 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
						>
							<ExternalLinkIcon />
							{text.dashboard.viewJob.viewJobButton}
						</a>
					)}

					<Form method="post">
						<input type="hidden" name="action" value="delete" />
						<input type="hidden" name="jobId" value={job.id} />
						<Button
							type="submit"
							variant="destructive"
							size="sm"
							className="flex items-center"
							onClick={(e) => {
								if (!confirm("Are you sure you want to delete this job?")) {
									e.preventDefault();
								}
							}}
						>
							<TrashIcon />
							{text.ui.delete}
						</Button>
					</Form>
				</div>
			</div>
		</div>
	);
}

function DashboardHeaderRightSection() {
	const [searchParams, setSearchParams] = useSearchParams();
	const showCreateForm = searchParams.get("createJob") === "yes";
	const toggleCreateForm = () => {
		showCreateForm
			? searchParams.delete("createJob")
			: searchParams.set("createJob", "yes");
		setSearchParams(searchParams);
	};
	return (
		<div className="flex gap-2">
			<Link to="/settings/work-history" variant="secondary" size="md">
				Edit Work History
			</Link>
			<Button
				type="button"
				className="bg-primary text-primary-foreground hover:bg-primary/90"
				onClick={toggleCreateForm}
			>
				{showCreateForm ? text.ui.cancel : text.dashboard.createJob.ctaButton}
			</Button>
		</div>
	);
}

export const handle = {
	title: () => "Resume Generator Dashboard",
	rightSection: <DashboardHeaderRightSection />,
};

export default function Dashboard({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { jobs } = loaderData;
	const [searchParams, setSearchParams] = useSearchParams();
	const showCreateForm = searchParams.get("createJob") === "yes";
	const toggleCreateForm = () => {
		showCreateForm
			? searchParams.delete("createJob")
			: searchParams.set("createJob", "yes");
		setSearchParams(searchParams);
	};

	return (
		<div className="max-w-6xl mx-auto p-6">
			{/* Header moved to MainHeader via handle.title and handle.rightSection */}

			{actionData?.error && (
				<div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded">
					{actionData.error}
				</div>
			)}

			{actionData?.success && actionData.message && (
				<div className="mb-4 p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded">
					{actionData.message}
				</div>
			)}

			{showCreateForm && <CreateJobForm onCancel={toggleCreateForm} />}

			<div>
				<h2 className="text-xl font-semibold mb-4">Your Resume Jobs</h2>

				{jobs.length === 0 ? (
					<div className="text-center p-8 bg-card border rounded">
						<p className="text-muted-foreground mb-4">
							You don't have any resume jobs yet.
						</p>
						<Button
							type="button"
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
							onClick={toggleCreateForm}
						>
							Create Your First Job
						</Button>
					</div>
				) : (
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{jobs.map((job) => (
							<JobCard key={job.id} job={job} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
