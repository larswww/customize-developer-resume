import { useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  useRouteLoaderData,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { parseWithZod } from '@conform-to/zod';
import { Collapsible } from "~/components/Collapsible";
import { ContactInfoForm } from "~/components/ContactInfoForm";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { SourceTextInputs } from "~/components/resume/SourceTextInputs";
import { Button } from "~/components/ui/Button";
import { useResumeGenerator } from "~/hooks/useResumeGenerator";
import type { ResumeRouteContext } from "~/routes/resume/types";
import { extractRouteParams, handleResumeAction } from "~/routes/resume/utils";
import text from "~/text";
import {
  type ContactInfo,
  availableTemplates,
  defaultContactInfo as globalDefaultContactInfo,
} from "../../config/templates";
import type { WorkflowStep } from "../../services/ai/types";
import dbService from "../../services/db/dbService.server";
import { JOB_ROUTE_ID } from "./job";

export async function loader(args: LoaderFunctionArgs) {
  const { jobId, selectedWorkflowId, selectedWorkflow, selectedTemplateId } = extractRouteParams(args);

  const resumeData = dbService.getResume(jobId, selectedTemplateId);
  const resumeSourceSteps = selectedWorkflow.steps.filter(
    (step: WorkflowStep) => step.useInResume
  );
  const sourceTexts: Record<string, string> = {};
  for (const step of resumeSourceSteps) {
    const stepResult = dbService.getWorkflowStep(
      jobId,
      step.id,
      selectedWorkflowId
    );
    sourceTexts[step.id] = stepResult?.result || "";
  }

  const savedContactInfo = dbService.getContactInfo();
  const contactInfo = savedContactInfo || globalDefaultContactInfo;
  const finalContactInfo =
    resumeData?.structuredData?.contactInfo || contactInfo;

  return {
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map(
      (s: { id: string; name: string }) => ({
        id: s.id,
        name: s.name,
      })
    ),
    contactInfo: finalContactInfo,
  };
}

export async function action(args: ActionFunctionArgs) {
	const formData = await args.request.formData();
	const { selectedTemplateConfig } = extractRouteParams(args);
	const {workflowId, templateId, jobId} = args.params;
	const { actionType, ...resumeData } = Object.fromEntries(formData);
	const submission = parseWithZod(formData, { schema: selectedTemplateConfig.componentSchema });

	if (actionType === "save") {

	}

	if (actionType === "generate") {
		return handleResumeAction(args);
	}

	return null;
}

export default function JobResume() {
  const {
    resumeData,
    sourceTexts: initialSourceTexts,
    resumeSourceSteps,
    contactInfo: initialContactInfo,
  } = useLoaderData<{
    resumeData: { structuredData?: any } | null;
    sourceTexts: Record<string, string>;
    resumeSourceSteps: { id: string; name: string }[];
    contactInfo: ContactInfo;
  }>();

  const parentContext = useOutletContext<ResumeRouteContext>();
  const { selectedWorkflowId, selectedTemplateId, isWorkflowComplete, job } =
    parentContext;

  const parentRouteData = useRouteLoaderData(JOB_ROUTE_ID) as any;
  const jobData = job || parentRouteData?.job;

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isGenerating =
    isSubmitting && navigation.formData?.get("actionType") === "generate";
  const actionData = useActionData<typeof handleResumeAction>();

  const {
    error,
    setError,
    resumeRef,
    currentSourceTexts,
    setFormData,
    hasLoadedOrGeneratedData,
    setHasLoadedOrGeneratedData,
    editorRefs,
    handlePrintClick,
    handleDownloadPdfClick,
    handleFormSubmit,
    displayData,
  } = useResumeGenerator({
    jobId: jobData.id,
    jobTitle: jobData.title,
    resumeData,
    initialSourceTexts,
    resumeSourceSteps,
    initialContactInfo,
  });

  const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
  const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;

  useEffect(() => {
    if (actionData?.success && actionData?.resumeData) {
      const { contactInfo: _, ...coreDataFromAction } = actionData.resumeData;
      setFormData(coreDataFromAction);
      setHasLoadedOrGeneratedData(true);
      setError(null);
    }
    if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData, setFormData, setHasLoadedOrGeneratedData, setError]);

  const formId = "resume-form";
  const formActionUrl = `/job/${jobData.id}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`;

  return (
    <Form
      method="post"
      id={formId}
      action={formActionUrl}
      onSubmit={handleFormSubmit}
      className="py-4"
    >
      <div className="grid grid-cols-12 md:grid-cols-[1fr,300px] gap-6">
        <div className="col-span-12 md:col-span-6 px-0">
          {hasLoadedOrGeneratedData ? (
            <ResumePreview
              displayData={displayData}
              resumeRef={resumeRef}
              TemplateComponent={CurrentTemplateComponent}
              isGenerating={isGenerating}
            />
          ) : (
            <div className="text-center text-gray-500 py-10 flex items-center justify-center h-[400px] border rounded bg-gray-50">
              {(navigation.state === "submitting" ||
                navigation.state === "loading") &&
              !actionData?.success ? (
                <p>Loading or generating data...</p>
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
          {hasLoadedOrGeneratedData && (
            <ResumePreviewActions
              onPrint={handlePrintClick}
              onDownloadPdf={handleDownloadPdfClick}
            />
          )}
          <div className="mt-auto pt-4 flex flex-row gap-2">
		  <Button type="submit" name="actionType" value="save">
              Save Changes
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
        </div>
      </div>
    </Form>
  );
}
