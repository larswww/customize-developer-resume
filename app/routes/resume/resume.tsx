import { parseWithZod } from "@conform-to/zod";
import { useRef } from "react";
import {
	Form,
	Link,
	useFetcher,
	useNavigation,
	useOutletContext,
	useRouteError,
} from "react-router";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	UIMatch,
} from "react-router";
import { FeedbackMessage } from "~/components/FeedbackMessage";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { InputGroup } from "~/components/ui/InputGroup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { extractRouteParams } from "~/routes/resume/utils";
import { reGenerateWithFeedback } from "~/services/ai/resumeStructuredDataService";
import text from "~/text";
import { EducationSchema, availableTemplates } from "../../config/schemas";
import dbService, { type Job } from "../../services/db/dbService.server";
import type { Route } from "./+types/resume";

export const handle = {
	title: (_match: UIMatch, matches: UIMatch[]) => {
		const jobMatch = matches[matches.length - 2] as UIMatch<{ job: Job }>;
		const job = jobMatch?.data?.job;
		return `${job?.title} - Edit Resume`;
	},
	rightSection: <ResumePreviewActions />,
};

export async function loader(args: LoaderFunctionArgs) {
	const { jobId, selectedTemplateId } = extractRouteParams(args);

	const savedResume = dbService.getResume(jobId, selectedTemplateId);
	const { education, contactInfo, hasEmptyContactInfo, hasEducation } =
		getSharedObjects();
	const hasResume = savedResume !== null && savedResume.structuredData !== null;

	const resumeData = {
		education,
		contactInfo,
		hasEmptyContactInfo,
		hasEducation,
		...savedResume?.structuredData,
	};

	return {
		resumeData,
		hasResume,
	};
}

import pickBy from "lodash/pickBy";

function updateEmptySettings(payload: any) {
	const { education, contactInfo } = getSharedObjects();
	const predicate = (v: any) => v != null && v !== "";
	const filteredContactInfo = pickBy(payload.contactInfo, predicate);
	const filteredExistingContactInfo = pickBy(contactInfo, predicate);

	const updatedContacts = {
		...filteredContactInfo,
		...filteredExistingContactInfo,
	};

	const filteredExistingEducations = education.educations.map((edu) =>
		pickBy(edu, predicate),
	);

	const filteredNewEducations = (payload.education?.educations || []).map(
		(edu: any) => pickBy(edu, predicate),
	);

	// Merge each education object by index, only filling empty fields
	const mergedEducations = filteredExistingEducations.map((edu, idx) => ({
		...edu,
		...filteredNewEducations[idx],
	}));

	const updatedEducation = {
		...education,
		educations: mergedEducations,
	};
	dbService.saveSetting({
		key: "contactInfo",
		structuredData: updatedContacts,
		value: null,
	});

	dbService.saveSetting({
		key: "education",
		structuredData: updatedEducation,
		value: null,
	});
}
export async function action(args: ActionFunctionArgs) {
	const formData = await args.request.formData();
	const { selectedTemplateConfig, selectedTemplateId, jobId } =
		extractRouteParams(args);
	const { actionType } = Object.fromEntries(formData);
	const submission = parseWithZod(formData, {
		schema: selectedTemplateConfig.componentSchema,
	});

	updateEmptySettings(submission.payload);

	if (actionType === "save") {
		if (submission.status === "success") {
			dbService.saveResume({
				jobId,
				templateId: selectedTemplateId,
				structuredData: submission.value as any,
			});
		} else if (submission.status === "error") {
			return {
				success: false,
				message: "Fill out missing fields marked in red.",
			};
		}
	}

	if (actionType === "generate") {
		const savedResume = dbService.getResume(jobId, selectedTemplateId);
		if (!savedResume || !savedResume.structuredData) {
			return {
				success: false,
				message: "Resume not found",
			};
		}

		const { outputSchema } = selectedTemplateConfig;
		const { structuredData } = savedResume;
		const feedback = formData.get("feedback") as string | undefined;

		if (!feedback) {
			return {
				success: false,
				message: "Feedback is required",
			};
		}

		const currentData = outputSchema.safeParse(structuredData);
		if (!currentData.success) {
			return {
				success: false,
				message: "Invalid resume data",
			};
		}

		const result = await reGenerateWithFeedback(
			currentData.data,
			outputSchema,
			feedback,
		);
		dbService.saveResume({
			jobId,
			templateId: selectedTemplateId,
			structuredData: result as any,
		});
	}
}

function getSharedObjects() {
	const education = dbService.getEducation();
	const contactInfo = dbService.getContactInfo();

	const hasEmptyContactInfo = Object.values(contactInfo).some(
		(value) => !value,
	);

	const hasEducation = education?.educations?.length;

	return {
		education,
		contactInfo,
		hasEmptyContactInfo,
		hasEducation,
	};
}

export default function JobResume({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { resumeData, hasResume } = loaderData;
	const resumeRef = useRef<HTMLDivElement>(null);
	const fetcher = useFetcher();
	const parentContext = useOutletContext<{
		selectedTemplateId: string;
		isWorkflowComplete: boolean;
	}>();
	const { selectedTemplateId, isWorkflowComplete } = parentContext;

	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const isGenerating =
		isSubmitting && navigation.formData?.get("actionType") === "generate";

	const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
	const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;

	const formId = "resume-form";

	return (
		<fetcher.Form
			method="post"
			id={formId}
			className="h-full flex flex-col"
			preventScrollReset
		>
			<div className="flex-1 flex flex-col overflow-hidden bg-transparent">
				<div className="space-y-4 bg-transparent">
					{resumeData.hasEmptyContactInfo ? (
						<FeedbackMessage type="info">
							Your contact information is incomplete. Please add your details in
							the{" "}
							<Link to="/settings" className="underline font-medium">
								Contact Info settings
							</Link>
							.
						</FeedbackMessage>
					) : null}

					{!resumeData.hasEducation ? (
						<FeedbackMessage type="info">
							Your education information is incomplete. Please add your
							education details in the{" "}
							<Link to="/settings/education" className="underline font-medium">
								Education settings
							</Link>
							.
						</FeedbackMessage>
					) : null}
				</div>

				<div className="flex-1 w-full">
					{hasResume ? (
						<ResumePreview
							displayData={resumeData as any}
							resumeRef={resumeRef}
							TemplateComponent={CurrentTemplateComponent}
							isGenerating={isGenerating}
							templateConfig={CurrentTemplateConfig}
						/>
					) : (
						<div className="text-center text-gray-500 py-10 flex items-center justify-center h-[400px] border rounded bg-gray-50 mx-4">
							{(navigation.state === "submitting" ||
								navigation.state === "loading") &&
							!actionData?.success ? (
								<p>{text.ui.generating}</p>
							) : (
								<p>{text.resume.emptyState}</p>
							)}
						</div>
					)}
				</div>

				{/* <div className="p-4 space-y-4"> */}
				{navigation.state === "loading" && actionData === undefined && (
					<div className="p-4 border rounded bg-blue-50">
						<p>Loading previous results...</p>
					</div>
				)}

				{/* {error && (
					<div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
						{error}
					</div>
				)} */}

				{/* </div> */}
			</div>

			<div className="p-4 bg-white border-t">
				<InputGroup>
					<Input
						type="text"
						placeholder={text.resume.feedbackPlaceholder}
						name="feedback"
						disabled={isSubmitting || !isWorkflowComplete}
					/>
					<Button
						type="submit"
						name="actionType"
						value="generate"
						className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
						disabled={isSubmitting || !isWorkflowComplete}
					>
						{isGenerating ? text.ui.generating : text.resume.generateButton}
					</Button>
				</InputGroup>

				{!isWorkflowComplete && (
					<p className="text-sm text-gray-500 mt-2">
						This workflow is not complete. Please complete the workflow before
						generating the resume.
					</p>
				)}

				{actionData?.success === false && (
					<FeedbackMessage type="error">
						{
							("error" in actionData
								? actionData.error
								: "message" in actionData
									? actionData.message
									: "An error occurred.") as React.ReactNode
						}
					</FeedbackMessage>
				)}
			</div>
		</fetcher.Form>
	);
}

export function ErrorBoundary() {
	const url = useNavigation();
	const error = useRouteError();
	console.error(error);
	return (
		<div>
			Error:{" "}
			{error instanceof Error ? error.message : "An unknown error occurred"}
			<Form method="post" action={url.location?.pathname}>
				<input type="hidden" name="actionType" value="generate" />
				<Button type="submit">Regenerate Resume</Button>
			</Form>
		</div>
	);
}
