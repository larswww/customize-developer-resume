import {
  Form,
  useNavigation,
  useOutletContext,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { parseWithZod } from "@conform-to/zod";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { Button } from "~/components/ui/Button";
import type { ResumeRouteContext } from "~/routes/resume/types";
import { extractRouteParams, handleResumeAction } from "~/routes/resume/utils";
import text from "~/text";
import {
  availableTemplates
} from "../../config/templates";
import dbService from "../../services/db/dbService.server";
import { JOB_ROUTE_ID } from "./job";
import type { Route } from "./+types/resume";
import { downloadResumeAsPdf } from "~/utils/pdf.client";
import { useCallback, useRef, useState } from "react";
import { printResumeElement } from "~/utils/print.client";
import { FeedbackMessage } from "~/components/FeedbackMessage";

export async function loader(args: LoaderFunctionArgs) {
  const { jobId, selectedTemplateId } = extractRouteParams(args);

  const savedResume = dbService.getResume(jobId, selectedTemplateId);
  const education = dbService.getEducation();
  const contactInfo = dbService.getContactInfo();
  const hasResume = savedResume !== null && savedResume.structuredData !== null;

  const resumeData = {
    ...savedResume?.structuredData,
    education,
    contactInfo,
  };

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
  const submission = parseWithZod(formData, {
    schema: selectedTemplateConfig.componentSchema,
  });

  if (actionType === "save") {
    if (submission.status === "success") {
      dbService.saveResume({
        jobId,
        templateId: selectedTemplateId,
        structuredData: submission.value,
      });
    } else {
      return {
        success: false,
        message: 'Fill out missing fields marked in red',
      };
    }
  }

  if (actionType === "generate") {
    return handleResumeAction(args);
  }
}

export default function JobResume({loaderData, actionData}: Route.ComponentProps) {
  const {
    resumeData,
    hasResume,
  } = loaderData;
	const resumeRef = useRef<HTMLDivElement>(null);

  const parentContext = useOutletContext<ResumeRouteContext>();
  const { selectedWorkflowId, selectedTemplateId, isWorkflowComplete, job } =
    parentContext;
    const [error, setError] = useState<string | null>(null);
  const parentRouteData = useRouteLoaderData(JOB_ROUTE_ID) as any;
  const jobData = job || parentRouteData?.job;

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isGenerating =
    isSubmitting && navigation.formData?.get("actionType") === "generate";

	const handlePrintClick = useCallback(() => {
		setError(null);
		printResumeElement("printable-resume", setError);
	}, []);

	const handleDownloadPdfClick = async () => {
		setError(null);
		await downloadResumeAsPdf({
			elementId: "printable-resume",
			onError: setError,
		});
	};
  const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
  const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;


  const formId = "resume-form";
  const formActionUrl = `/job/${jobData.id}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`;

  return (
    <Form
      method="post"
      id={formId}
      action={formActionUrl}
      className="py-4"
    >
      <div className="grid grid-cols-12 md:grid-cols-[1fr,300px] gap-6">
        <div className="col-span-12 md:col-span-6 px-0">
          {hasResume ? (
            <ResumePreview
              displayData={resumeData}
              resumeRef={resumeRef}
              TemplateComponent={CurrentTemplateComponent}
              // isGenerating={isGenerating}
            />
          ) : (
            <div className="text-center text-gray-500 py-10 flex items-center justify-center h-[400px] border rounded bg-gray-50">
              {(navigation.state === "submitting" ||
                navigation.state === "loading") &&
              !actionData?.success ? (
                <p>{text.ui.generating}</p>
              ) : (
                <p>{text.resume.emptyState}</p>
              )}
            </div>
          )}

          {navigation.state === "loading" && actionData === undefined && (
            <div className="my-4 p-4 border rounded bg-blue-50">
              <p>Loading previous results...</p>
            </div>
          )}
          {error && (
            <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}
        </div>
        <div className="col-span-6 space-y-6">
          {hasResume && (
            <ResumePreviewActions
              onPrint={handlePrintClick}
              onDownloadPdf={handleDownloadPdfClick}
            />
          )}
          <div className="mt-auto pt-4 flex flex-row gap-2">
            <Button type="submit" name="actionType" value="save">
              {text.resume.saveChanges}
            </Button>
            <Button
              type="submit"
              name="actionType"
              value="generate"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isSubmitting || !isWorkflowComplete}
            >
              {isGenerating ? text.ui.generating : text.resume.generateButton}
            </Button>

          

            {!isWorkflowComplete && (
              <p className="text-sm text-gray-500">
                This workflow is not complete. Please complete the workflow
                before generating the resume.
              </p>
            )}
          </div>
          {actionData?.success === false && (
        

        <FeedbackMessage
          type="error"
        >
          {actionData.message}
        </FeedbackMessage>
      )}
        </div>
      </div>
    </Form>
  );
}

export function ErrorBoundary() {
  const url = useNavigation();
  const error = useRouteError();
  console.error(error);
  return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}
  
  <Form method="post" action={url.location?.pathname}>
    <input type="hidden" name="actionType" value="generate" />
    <Button type="submit">Regenerate Resume</Button>
  </Form>
  </div>;
}
