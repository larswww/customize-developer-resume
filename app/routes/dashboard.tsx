import { parseWithZod } from "@conform-to/zod";
import { format } from "date-fns";
import { Form, redirect, useNavigate, useSearchParams } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { CreateJobForm, JobFormSchema } from "~/components/JobForm";
import { ResumeIcon } from "~/components/icons";
import { TemplatePreview } from "~/components/resume/TemplatePreview";
import { Link } from "~/components/ui/Link";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { combineResumeData, getSharedObjects } from "~/routes/resume/utils";
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
	const resumesRaw = dbService.getResumes(undefined).slice(0, 10);
	const shared = getSharedObjects();
	const resumes = resumesRaw.map((resume) => ({
		...resume,
		structuredData: combineResumeData(resume, shared),
	}));
	return { jobs, resumes };
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const action = formData.get("action") as string;

	if (action === "create") {
		const submission = parseWithZod(formData, { schema: JobFormSchema });

		if (submission.status !== "success") {
			return {
				success: false,
				error: "Please check your input and try again",
			};
		}

		const { title, jobDescription, link, relevantDescription } =
			submission.value;

		// Create a new job with the provided fields
		const job = dbService.createJob({
			title,
			jobDescription: jobDescription || "",
			link: link || null,
			relevantDescription: relevantDescription || "",
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

export const handle = {
	title: () => "Your Resumes",
};

function PostItNoteBox({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="relative p-6 md:p-8 rounded-xl shadow-2xl overflow-hidden"
			style={{
				background:
					"linear-gradient(135deg, var(--color-yellow-100) 70%, var(--color-yellow-200) 100%)",
				boxShadow: "0 8px 32px 0 rgba(204, 180, 60, 0.18)",
				border: "1.5px solid var(--color-yellow-200)",
			}}
		>
			<div className="absolute bottom-2 right-4 opacity-10 pointer-events-none select-none z-0">
				<ResumeIcon size="xl" className="w-32 h-32" />
			</div>
			<div className="relative z-10">{children}</div>
		</div>
	);
}

function CreateJobSection({
	showCreateForm,
	onOpen,
	onCancel,
}: { showCreateForm: boolean; onOpen: () => void; onCancel: () => void }) {
	return (
		<section className="mb-8">
			<div
				className="relative rounded-2xl overflow-hidden shadow-xl px-6 py-10 flex flex-col items-center justify-center text-center"
				style={{
					background:
						"linear-gradient(135deg, var(--color-yellow-100) 70%, var(--color-yellow-200) 100%)",
					boxShadow: "0 8px 32px 0 rgba(204, 180, 60, 0.18)",
					border: "1.5px solid var(--color-yellow-200)",
				}}
			>
				<div className="absolute bottom-0 right-0 opacity-10 pointer-events-none select-none z-0">
					<ResumeIcon size="xl" className="w-48 h-48" />
				</div>
				<div className="relative z-10 flex flex-col items-center w-full max-w-xl">
					<h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-yellow-900">
						{text.dashboard.sections.createJob}
					</h1>
					<p className="text-md md:text-lg text-yellow-900/80 mb-6">
						{text.dashboard.sections.createPrompt}
					</p>
					<div
						className={`transition-all duration-300 ease-in-out w-full max-w-lg  ${showCreateForm ? " max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-3 pointer-events-none"}`}
						style={{ willChange: "max-height, opacity, transform" }}
					>
						{showCreateForm && <CreateJobForm onCancel={onCancel} />}
					</div>
					{!showCreateForm && (
						<Button
							type="button"
							variant="action"
							size="lg"
							className="text-lg px-8 py-4 font-bold shadow-md"
							onClick={onOpen}
						>
							{text.dashboard.createJob.ctaButton}
						</Button>
					)}
				</div>
			</div>
		</section>
	);
}

function LatestResumesSection({ resumes }: { resumes: any[] }) {
	const navigate = useNavigate();
	return (
		<section>
			<h2 className="text-xl font-semibold mb-4">
				{text.dashboard.sections.starred}
			</h2>
			{resumes.length === 0 ? (
				<div className="text-center p-8 bg-card border rounded">
					<p className="text-muted-foreground mb-4">
						{text.dashboard.sections.starredEmpty}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
					{resumes.map((resume) => (
						<button
							key={resume.id}
							onClick={() =>
								navigate(`/job/${resume.jobId}/${resume.templateId}`)
							}
							className="flex flex-col items-center bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 overflow-hidden cursor-pointer"
							style={{ width: 290, height: 200 }}
							tabIndex={0}
							type="button"
						>
							<TemplatePreview
								fixedWidth={250}
								templateId={resume.templateId}
								data={resume.structuredData}
								className="w-full h-full text-left"
							/>
						</button>
					))}
				</div>
			)}
		</section>
	);
}

function JobsTable({ jobs }: { jobs: Job[] }) {
	const navigate = useNavigate();
	if (jobs.length === 0) {
		return (
			<div className="text-center p-8 bg-card border rounded">
				<p className="text-muted-foreground mb-4">
					{text.dashboard.sections.allEmpty}
				</p>
			</div>
		);
	}
	return (
		<Table className="mt-8">
			<TableBody>
				{jobs.map((job) => {
					const updated = job.updatedAt
						? format(new Date(job.updatedAt), "MMM d, yyyy")
						: "—";
					return (
						<TableRow
							key={job.id}
							className="group cursor-pointer"
							onClick={(e) => {
								// Prevent navigation if clicking the delete button or job link
								if ((e.target as HTMLElement).closest("button, a")) return;
								navigate(`/job/${job.id}`);
							}}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ")
									navigate(`/job/${job.id}`);
							}}
						>
							<TableCell className="font-medium text-accent-foreground group-hover:underline">
								{job.title}
							</TableCell>
							<TableCell className="group-hover:underline">{updated}</TableCell>
							<TableCell className="group-hover:underline">
								{job.link && (
									<a
										href={job.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
										onClick={(e) => e.stopPropagation()}
									>
										{job.link}
									</a>
								)}
							</TableCell>
							<TableCell className="text-right">
								<Form method="post">
									<input type="hidden" name="action" value="delete" />
									<input type="hidden" name="jobId" value={job.id} />
									<Button
										type="submit"
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-destructive px-2"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										{text.dashboard.jobsTable.delete}
									</Button>
								</Form>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

export default function Dashboard({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { jobs, resumes } = loaderData;
	const [searchParams, setSearchParams] = useSearchParams();
	const showCreateForm = searchParams.get("createJob") === "yes";
	const openCreateForm = () => {
		searchParams.set("createJob", "yes");
		setSearchParams(searchParams);
	};
	const closeCreateForm = () => {
		searchParams.delete("createJob");
		setSearchParams(searchParams);
	};

	if (jobs.length === 0) {
		return (
			<div className="max-w-full min-h-[100vh] bg-card flex items-start justify-center pt-16 md:pt-24">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch justify-center w-full px-2 md:px-8 gap-0 md:gap-16">
					<div className="flex-1 flex flex-col justify-center items-center md:items-start px-4 py-8 md:py-0 bg-card min-w-[320px] md:max-w-md">
						<h2 className="text-3xl font-bold mb-4 text-center md:text-left">
							Your first resume
							<br />
							in 1 minute
						</h2>
						<p className="text-muted-foreground text-lg mb-6 text-center md:text-left">
							Just pick a job title to get started.
							<br />
							You can add more details now or come back and refine it later.
						</p>
					</div>
					<div className="flex-[1.3] flex items-center justify-center relative min-h-[400px] md:pl-8">
						<PostItNoteBox>
							<CreateJobForm onCancel={closeCreateForm} />
						</PostItNoteBox>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-8xl mx-auto p-6">
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

			<CreateJobSection
				showCreateForm={showCreateForm}
				onOpen={openCreateForm}
				onCancel={closeCreateForm}
			/>
			<LatestResumesSection resumes={resumes} />
			<h2 className="text-xl font-semibold mt-12 mb-4">
				{text.dashboard.sections.all}
			</h2>
			<JobsTable jobs={jobs} />
		</div>
	);
}
