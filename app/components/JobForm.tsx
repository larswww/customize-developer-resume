import { useForm } from "@conform-to/react";
import { getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import { useRef } from "react";
import { Form } from "react-router";
import { z } from "zod";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import {
	FormField,
	FormFieldWithLinkButton,
	FormMarkdownEditor,
} from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { Button } from "~/components/ui/button";
import type { Job } from "~/services/db/dbService.server";
import text from "~/text";
import CollapsibleSection from "./ui/CollapsibleSection";

export const JobFormSchema = z.object({
	title: z
		.string()
		.min(2, "Job title must be at least 2 characters")
		.max(255, "Job title cannot exceed 255 characters"),
	link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
	jobDescription: z.string().optional().or(z.literal("")),
	relevantDescription: z.string().optional().or(z.literal("")),
});

interface BaseJobFormProps {
	onCancel: () => void;
}

interface CreateJobFormProps extends BaseJobFormProps {
	mode: "create";
}

interface UpdateJobFormProps extends BaseJobFormProps {
	mode: "update";
	job: Job;
}

type JobFormProps = CreateJobFormProps | UpdateJobFormProps;

function JobForm(props: JobFormProps) {
	const { onCancel, mode } = props;
	const job = mode === "update" ? props.job : null;

	const editorRef = useRef(null);
	const relevantEditorRef = useRef(null);

	const [form, fields] = useForm({
		id: `${mode}-job-form`,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: JobFormSchema });
		},
		constraint: getZodConstraint(JobFormSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			title: job?.title || "",
			link: job?.link || "",
			jobDescription: job?.jobDescription || "",
			relevantDescription: job?.relevantDescription || "",
		},
	});

	const isTitleValid =
		fields.title.valid &&
		fields.title.value &&
		fields.title.value.trim().length >= 2;

	const isCreateMode = mode === "create";
	const formAction = isCreateMode ? "/dashboard" : undefined;
	const actionValue = isCreateMode ? "create" : "update-job";
	const title = isCreateMode ? "Create Custom Resume" : "Job Details";
	const submitButtonText = isCreateMode
		? text.dashboard.createJob.confirmButton
		: "Update Job";

	if (isCreateMode) {
		return (
			<div className="mb-8">
				<Form
					method="post"
					action={formAction}
					{...getFormProps(form)}
					className="text-left"
				>
					<input type="hidden" name="action" value={actionValue} />

					<FieldsetSection title="" description="context">
						<FormField
							meta={fields.title}
							type="text"
							placeholder="What title or role do you need a resume for?"
						/>

						<div className="space-y-4 mt-6">
							<CollapsibleSection
								buttonContent={
									<span className="flex text-left gap-2">
										<span className="font-medium">Job Details</span>
										<span className="text-sm text-muted-foreground">
											Do you have context from a particular job posting? Add it!
										</span>
									</span>
								}
							>
								<div className="p-4 border rounded-lg bg-gray-50 space-y-4">
									<div className="flex gap-2 items-center">
										<FormFieldWithLinkButton
											meta={fields.link}
											type="url"
											placeholder="Adding a link will help you find it later."
										/>
									</div>

									<div className="space-y-2">
										<FormMarkdownEditor
											meta={fields.jobDescription}
											label="Job Description"
											editorRef={editorRef}
										/>
									</div>
								</div>
							</CollapsibleSection>

							<CollapsibleSection
								buttonContent={
									<span className="flex items-center gap-2">
										<span className="font-medium">About You</span>
										<span className="text-sm text-muted-foreground">
											Do you have an existing resume or other context about you
											in this role? Add it!
										</span>
									</span>
								}
							>
								<div className="p-4 border rounded-lg bg-gray-50">
									<p className="text-sm text-muted-foreground">
										Additional context options will be available here in the
										future.
									</p>
								</div>
							</CollapsibleSection>
						</div>

						<div className="flex gap-2 justify-end pt-6">
							<Button type="button" variant="secondary" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!isTitleValid}
								className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{submitButtonText}
							</Button>
						</div>
					</FieldsetSection>
				</Form>
			</div>
		);
	}

	// Update mode - designed for sheet
	return (
		<div className="h-full flex flex-col">
			<Form
				method="post"
				{...getFormProps(form)}
				className="flex-1 overflow-y-auto"
			>
				<input type="hidden" name="action" value={actionValue} />
				{job && <input type="hidden" name="jobId" value={job.id} />}

				<div className="space-y-6 p-1">
					<div>
						<h3 className="text-lg font-semibold mb-4">{title}</h3>

						<FormGrid columns={1}>
							<FormField
								meta={fields.title}
								label="Job Title"
								type="text"
								placeholder="What title or role do you need a resume for?"
							/>
						</FormGrid>

						<div className="mt-4">
							<FormFieldWithLinkButton
								meta={fields.link}
								type="url"
								placeholder="Job posting URL (optional)"
								label="Job Link"
							/>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<FormMarkdownEditor
								meta={fields.jobDescription}
								label="Job Description"
								editorRef={editorRef}
								placeholder="Paste the job description here..."
							/>
						</div>

						<div>
							<FormMarkdownEditor
								meta={fields.relevantDescription}
								label="Additional Context"
								editorRef={relevantEditorRef}
								placeholder="Any additional relevant information about this role..."
							/>
						</div>
					</div>
				</div>

				<div className="flex gap-2 justify-end p-4 border-t bg-white">
					<Button type="button" variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!isTitleValid}
						className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{submitButtonText}
					</Button>
				</div>
			</Form>
		</div>
	);
}

// Export specific variants
export function CreateJobForm({ onCancel }: { onCancel: () => void }) {
	return <JobForm mode="create" onCancel={onCancel} />;
}

export function JobDetailsForm({
	job,
	onCancel,
}: { job: Job; onCancel: () => void }) {
	return <JobForm mode="update" job={job} onCancel={onCancel} />;
}
