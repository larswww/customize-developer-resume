import { parseWithZod } from "@conform-to/zod";
import { useRef } from "react";
import React from "react";
import {
	Form,
	Link,
	useFetcher,
	useNavigation,
	useOutletContext,
	useRouteError,
	useSearchParams,
} from "react-router";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	UIMatch,
} from "react-router";
import { FeedbackMessage } from "~/components/FeedbackMessage";
import { CloseIcon, WandSparklesIcon } from "~/components/icons";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
	combineResumeData,
	extractRouteParams,
	getSharedObjects,
	updateEmptySettings,
} from "~/routes/resume/utils";
import { reGenerateWithFeedback } from "~/services/ai/resumeStructuredDataService";
import text from "~/text";
import { availableTemplates } from "../../config/schemas";
import { TEST_IDS } from "../../config/testIds";
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
	const shared = getSharedObjects();
	const resumeData = combineResumeData(savedResume, shared);
	const hasResume = savedResume !== null && savedResume.structuredData !== null;

	return {
		resumeData,
		hasResume,
	};
}

export async function action(args: ActionFunctionArgs) {
	const formData = await args.request.formData();
	const { selectedTemplateConfig, selectedTemplateId, jobId } =
		extractRouteParams(args);
	const { actionType } = Object.fromEntries(formData);
	const schema = selectedTemplateConfig.componentSchema;
	const submission = parseWithZod(formData, {
		schema,
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
		const feedback = formData.get("feedback") as string | undefined;

		if (!feedback) {
			return {
				success: false,
				message: "Feedback is required",
			};
		}

		const structuredData =
			submission.status === "success"
				? (submission.value as any)
				: submission.payload;
		const result = await reGenerateWithFeedback(
			structuredData,
			schema,
			feedback,
		);
		dbService.saveResume({
			jobId,
			templateId: selectedTemplateId,
			structuredData: result as any,
		});

		return {
			success: false,
			message: "Fill out missing fields marked in red.",
		};
	}
}

type FloatingFeedbackBarProps = {
	text: typeof import("~/text").default;
	initialExpanded: boolean;
	isWorkflowComplete: boolean;
	isBusy: boolean;
	formRef: React.RefObject<HTMLFormElement>;
};

function FloatingFeedbackBar({
	text,
	initialExpanded,
	isWorkflowComplete,
	isBusy,
	formRef,
}: FloatingFeedbackBarProps) {
	const [isExpanded, setIsExpanded] = React.useState(initialExpanded);
	const [ignoreHover, setIgnoreHover] = React.useState(false);
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const isDisabled = isBusy || !isWorkflowComplete;

	React.useEffect(() => {
		if (isExpanded && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [isExpanded]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.key === "Enter" || e.keyCode === 13) && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			formRef.current?.requestSubmit();
		}
	};

	if (!isExpanded) {
		return (
			<div className="fixed right-6 bottom-8 z-30 flex items-end pointer-events-none">
				<Button
					type="button"
					size="lg"
					variant="action"
					className="pointer-events-auto shadow-lg rounded-xl border px-4 py-2 min-w-[120px] max-w-[200px] w-full font-medium transition flex items-center gap-2"
					onClick={() => {
						setIsExpanded(true);
						setIgnoreHover(false);
					}}
					onMouseEnter={() => {
						if (!ignoreHover) setIsExpanded(true);
					}}
					onMouseLeave={() => setIgnoreHover(false)}
					data-testid={TEST_IDS.feedbackBarButton}
				>
					<WandSparklesIcon size="sm" />
					{text.resume.generateButton}
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed right-2 bottom-8 z-30 flex items-end pointer-events-auto">
			<div
				className="pointer-events-auto flex flex-col min-w-[380px] max-w-sm w-full relative"
				style={{
					background:
						"linear-gradient(135deg, var(--color-yellow-50), var(--color-yellow-100))",
					borderRadius: "8px",
					boxShadow: "0 8px 32px 0 rgba(0,0,0,0.12)",
				}}
			>
				<div className="flex items-start w-full pt-3 pr-3 pl-3 gap-2">
					<Textarea
						name="feedback"
						placeholder={text.resume.feedbackPlaceholder}
						rows={2}
						disabled={isDisabled}
						className="flex-1 block bg-transparent border-none shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none resize-none text-base !outline-none !ring-0"
						ref={textareaRef}
						onKeyDown={isDisabled ? undefined : handleKeyDown}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							setIsExpanded(false);
							setIgnoreHover(true);
						}}
						aria-label="Collapse feedback bar"
						style={{ pointerEvents: "auto" }}
						className="flex-shrink-0"
						disabled={isDisabled}
					>
						<CloseIcon size="lg" />
					</Button>
				</div>
				<div className="flex justify-end items-center w-full pb-2 pr-3 pt-2">
					<Button
						type="submit"
						name="actionType"
						value="generate"
						variant="ghost"
						size="icon"
						disabled={isDisabled}
						aria-label={text.resume.generateButton}
						tabIndex={0}
						isLoading={isBusy}
					>
						<WandSparklesIcon size="md" />
					</Button>
				</div>
			</div>
		</div>
	);
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
		job?: { id: number };
	}>();
	const { selectedTemplateId, isWorkflowComplete, job } = parentContext;

	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const isGenerating =
		isSubmitting && navigation.formData?.get("actionType") === "generate";

	const [searchParams] = useSearchParams();
	const initialFeedbackBarExpanded =
		searchParams.get("feedbackBar") === "expanded";

	const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
	const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;

	const formId = "resume-form";
	const formRef = React.useRef<HTMLFormElement>(null);

	return (
		<fetcher.Form
			method="post"
			id={formId}
			className="h-full flex flex-col"
			preventScrollReset
			ref={formRef}
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
					{hasResume && CurrentTemplateConfig ? (
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

			{/* Floating Feedback Bar */}
			<FloatingFeedbackBar
				text={text}
				initialExpanded={initialFeedbackBarExpanded}
				isWorkflowComplete={isWorkflowComplete}
				isBusy={isSubmitting || fetcher.state === "submitting"}
				formRef={formRef as React.RefObject<HTMLFormElement>}
			/>
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
