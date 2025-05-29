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
import { type Job, JobInputSchema } from "~/services/db/schemas";
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

function useJobForm({
	defaultValue,
	formId,
}: {
	defaultValue: {
		title: string;
		link: string;
		jobDescription: string;
		relevantDescription: string;
	};
	formId: string;
}) {
	const [form, fields] = useForm({
		id: formId,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: JobInputSchema });
		},
		constraint: getZodConstraint(JobInputSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue,
	});
	const isTitleValid =
		fields.title.valid &&
		fields.title.value &&
		fields.title.value.trim().length >= 2;
	return { form, fields, isTitleValid };
}

export function CreateJobForm({ onCancel }: { onCancel: () => void }) {
	const editorRef = useRef(null);
	const relevantEditorRef = useRef(null);
	const { form, fields, isTitleValid } = useJobForm({
		defaultValue: {
			title: "",
			link: "",
			jobDescription: "",
			relevantDescription: "",
		},
		formId: "create-job-form",
	});
	const formAction = "/dashboard";
	const actionValue = "create";
	const submitButtonText = text.dashboard.createJob.confirmButton;
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
						label={text.dashboard.createJob.jobTitle}
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
										hideToolbar
									/>
								</div>
							</div>
						</CollapsibleSection>
						<CollapsibleSection
							buttonContent={
								<span className="flex items-center gap-2">
									<span className="font-medium">About You</span>
									<span className="text-sm text-muted-foreground">
										Do you have an existing resume or other context about you in
										this role? Add it!
									</span>
								</span>
							}
						>
							<div className="p-4 border rounded-lg bg-gray-50">
								<FormMarkdownEditor
									meta={fields.relevantDescription}
									label="Additional Context"
									editorRef={relevantEditorRef}
									hideToolbar
								/>
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

export function JobDetailsForm({
	job,
	onCancel,
}: { job: Job; onCancel: () => void }) {
	const editorRef = useRef(null);
	const relevantEditorRef = useRef(null);
	const { form, fields, isTitleValid } = useJobForm({
		defaultValue: {
			title: job?.title || "",
			link: job?.link || "",
			jobDescription: job?.jobDescription || "",
			relevantDescription: job?.relevantDescription || "",
		},
		formId: `update-job-form`,
	});
	const actionValue = "update-job";
	const submitButtonText = "Update Job";
	return (
		<Form
			method="post"
			{...getFormProps(form)}
			className="flex flex-col h-full"
		>
			<input type="hidden" name="action" value={actionValue} />
			<input type="hidden" name="jobId" value={job.id} />
			<div className="flex-1 min-h-0 overflow-y-auto space-y-6 p-1 pr-2">
				<div>
					<h3 className="text-lg font-semibold mb-4">Job Details</h3>
					<FormGrid columns={1}>
						<FormField
							meta={fields.title}
							label={text.dashboard.createJob.jobTitle}
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
							hideToolbar={false}
							placeholder="Paste the job description here..."
						/>
					</div>
					<div>
						<FormMarkdownEditor
							meta={fields.relevantDescription}
							label="Additional Context"
							editorRef={relevantEditorRef}
							hideToolbar={false}
							placeholder="Any additional relevant information about this role..."
						/>
					</div>
				</div>
			</div>
			<div className="sticky bottom-0 left-0 right-0 bg-white border-t flex gap-2 justify-end p-4 z-10">
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
	);
}
