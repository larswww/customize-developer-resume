import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { DocumentIcon, ExternalLinkIcon, TrashIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import { Link } from "~/components/ui/Link";
import text from "~/text";
import dbService, { type Job } from "../services/db/dbService.server";

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

function CreateJobForm({ onCancel }: { onCancel: () => void }) {
	return (
		<div className="mb-8 p-6 bg-gray-50 border rounded">
			<h2 className="text-xl font-semibold mb-4">
				{text.dashboard.createJob.ctaButton}
			</h2>
			<Form method="post">
				<input type="hidden" name="action" value="create" />
				<div className="mb-4">
					<label htmlFor="title" className="block mb-2 font-medium">
						Job Title
					</label>
					<input
						type="text"
						id="title"
						name="title"
						className="w-full px-3 py-2 border rounded"
						placeholder="Enter a title for this job"
						required
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="link" className="block mb-2 font-medium">
						Job Link (Optional)
					</label>
					<input
						type="url"
						id="link"
						name="link"
						className="w-full px-3 py-2 border rounded"
						placeholder="https://example.com/job-posting"
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="jobDescription" className="block mb-2 font-medium">
						Job Description
					</label>
					<textarea
						id="jobDescription"
						name="jobDescription"
						rows={5}
						className="w-full px-3 py-2 border rounded"
						placeholder="Paste the job description here"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						type="submit"
						variant="primary"
						size="md"
						className="bg-green-600 hover:bg-green-700 text-white"
					>
						{text.dashboard.createJob.confirmButton}
					</Button>
					<Button
						type="button"
						variant="secondary"
						size="md"
						className="bg-gray-500 hover:bg-gray-600 text-white"
						onClick={onCancel}
					>
						Cancel
					</Button>
				</div>
			</Form>
		</div>
	);
}

function JobCard({ job }: { job: Job }) {
	return (
		<div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			<div className="p-4">
				<h3 className="font-bold text-lg mb-2 truncate">{job.title}</h3>
				<p className="text-sm text-gray-500 mb-2">
					Created:{" "}
					{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
				</p>
				<p className="text-sm text-gray-500 mb-4">
					Updated:{" "}
					{job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "—"}
				</p>

				<div className="flex flex-wrap gap-2">
					<Link
						to={`/job/${job.id}`}
						variant="primary"
						size="sm"
						className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center"
					>
						<DocumentIcon />
						{text.dashboard.viewJob.resumeButton}
					</Link>

					{job.link && (
						<a
							href={job.link}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
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

export default function Dashboard() {
	const { jobs } = useLoaderData<{ jobs: Job[] }>();
	const actionData = useActionData<{
		success?: boolean;
		error?: string;
		message?: string;
		jobId?: number;
	}>();

	const [showCreateForm, setShowCreateForm] = useState(false);

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Resume Generator Dashboard</h1>
				<div className="flex gap-2">
					<Link to="/settings/work-history" variant="secondary" size="md">
						Edit Work History
					</Link>
					<Button
						type="button"
						variant="primary"
						size="md"
						className="bg-blue-600 text-white hover:bg-blue-700"
						onClick={() => setShowCreateForm(!showCreateForm)}
					>
						{showCreateForm
							? text.ui.cancel
							: text.dashboard.createJob.ctaButton}
					</Button>
				</div>
			</div>

			{actionData?.error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
					{actionData.error}
				</div>
			)}

			{actionData?.success && actionData.message && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded">
					{actionData.message}
				</div>
			)}

			{showCreateForm && (
				<CreateJobForm onCancel={() => setShowCreateForm(false)} />
			)}

			<div>
				<h2 className="text-xl font-semibold mb-4">Your Resume Jobs</h2>

				{jobs.length === 0 ? (
					<div className="text-center p-8 bg-gray-50 border rounded">
						<p className="text-gray-600 mb-4">
							You don't have any resume jobs yet.
						</p>
						<Button
							type="button"
							variant="primary"
							size="md"
							className="bg-blue-600 hover:bg-blue-700 text-white"
							onClick={() => setShowCreateForm(true)}
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
