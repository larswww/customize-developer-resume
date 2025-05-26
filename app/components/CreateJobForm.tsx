import { useForm } from "@conform-to/react";
import { getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import { useRef, useState } from "react";
import { Form } from "react-router";
import { z } from "zod";
import { ExternalLinkIcon } from "~/components/icons";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import {
	FormField,
	FormFieldWithLinkButton,
	FormMarkdownEditor,
} from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { AddRemoveButton, Button } from "~/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~/components/ui/collapsible";
import text from "~/text";

const CreateJobSchema = z.object({
	title: z
		.string()
		.min(2, "Job title must be at least 2 characters")
		.max(255, "Job title cannot exceed 255 characters"),
	link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
	jobDescription: z.string().optional().or(z.literal("")),
});

interface CreateJobFormProps {
	onCancel: () => void;
}

export function CreateJobForm({ onCancel }: CreateJobFormProps) {
	const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
	const [aboutYouOpen, setAboutYouOpen] = useState(false);
	const editorRef = useRef(null);

	const [form, fields] = useForm({
		id: "create-job-form",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreateJobSchema });
		},
		constraint: getZodConstraint(CreateJobSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		defaultValue: {
			title: "",
			link: "",
			jobDescription: "",
		},
	});

	const isTitleValid =
		fields.title.valid &&
		fields.title.value &&
		fields.title.value.trim().length >= 2;
	const isLinkValid = fields.link.value?.trim() && fields.link.valid;

	return (
		<div className="mb-8">
			<Form method="post" action="/dashboard" {...getFormProps(form)}>
				<input type="hidden" name="action" value="create" />

				<FieldsetSection title="Create Custom Resume" description="">
					<FormGrid columns={1}>
						<FormField
							meta={fields.title}
							label="Job Title"
							type="text"
							placeholder="What title or role do you need a resume for?"
						/>
					</FormGrid>

					<div className="space-y-4 mt-6">
						<Collapsible open={jobDetailsOpen} onOpenChange={setJobDetailsOpen}>
							<CollapsibleTrigger asChild>
								<AddRemoveButton
									type={jobDetailsOpen ? "remove" : "add"}
									className="w-full justify-between text-left"
									onClick={() => setJobDetailsOpen((open) => !open)}
								>
									<span className="flex text-left gap-2">
										<span className="font-medium">Job Details</span>
										<span className="text-sm text-muted-foreground">
											Do you have context from a particular job posting? Add it!
										</span>
									</span>
								</AddRemoveButton>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-4">
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
											placeholder={`Add a job description, job posting, or any other context about a particular job for which you need a resume.`}
										/>
									</div>
								</div>
							</CollapsibleContent>
						</Collapsible>

						<Collapsible open={aboutYouOpen} onOpenChange={setAboutYouOpen}>
							<CollapsibleTrigger asChild>
								<AddRemoveButton
									type={aboutYouOpen ? "remove" : "add"}
									className="w-full justify-between text-left"
									onClick={() => setAboutYouOpen((open) => !open)}
								>
									<span className="flex items-center gap-2">
										<span className="font-medium">About You</span>
										<span className="text-sm text-muted-foreground">
											Do you have an existing resume or other context about you
											in this role? Add it!
										</span>
									</span>
								</AddRemoveButton>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-4">
								<div className="p-4 border rounded-lg bg-gray-50">
									<p className="text-sm text-muted-foreground">
										Additional context options will be available here in the
										future.
									</p>
								</div>
							</CollapsibleContent>
						</Collapsible>
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
							{text.dashboard.createJob.confirmButton}
						</Button>
					</div>
				</FieldsetSection>
			</Form>
		</div>
	);
}
