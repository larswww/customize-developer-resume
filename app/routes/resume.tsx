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
import dbService from "../services/db/dbService";
import { type ContactInfo, availableTemplates } from "../config/templates";
import type { WorkflowStep } from "../services/ai/types";
import { ContactInfoForm } from "~/components/ContactInfoForm";
import { useResumeGenerator } from "~/hooks/useResumeGenerator";
import { Collapsible } from "~/components/Collapsible";
import { SourceTextInputs } from "~/components/resume/SourceTextInputs";
import { ResumeGenerationControls } from "~/components/resume/ResumeGenerationControls";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { Button } from "~/components/ui/Button";
import text from "~/text";
import { type RouteOutletContext, type ResumeRouteContext } from "~/routes/resume/types";
import { JOB_ROUTE_ID } from "./resume/job";
import { 
  extractRouteParams, 
  handleResumeAction,
} from "~/routes/resume/utils";
import type { Route } from "./resume/+types/resume";

export async function loader(args: LoaderFunctionArgs) {
  const {
    jobId,
    selectedWorkflowId,
    selectedWorkflow,
    selectedTemplateConfig,
  } = await extractRouteParams(args);

  const resumeData = dbService.getResume(jobId);

  // Get resume source steps
  const resumeSourceSteps = selectedWorkflow.steps.filter(
    (step: WorkflowStep) => step.useInResume
  );

  // Get source texts
  const sourceTexts: Record<string, string> = {};
  for (const step of resumeSourceSteps) {
    const stepResult = dbService.getWorkflowStep(
      jobId,
      step.id,
      selectedWorkflowId
    );
    sourceTexts[step.id] = stepResult?.result || "";
  }

  // Get contact info from DB, use default as fallback
  const contactInfo = dbService.getContactInfo();
  console.log("contactInfo", contactInfo);

  return {
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map((s: { id: string; name: string }) => ({
      id: s.id,
      name: s.name,
    })),
    contactInfo,
  };
}

export async function action(args: ActionFunctionArgs) {
  return handleResumeAction(args);
}

export default function JobResume({loaderData}: Route.ComponentProps) {
  const navigation = useNavigation();
  const {
    resumeData,
    sourceTexts: initialSourceTexts,
    resumeSourceSteps,
    contactInfo,
  } = loaderData;
  const parentContext = useOutletContext<ResumeRouteContext>();
  const { selectedWorkflowId, selectedTemplateId, isWorkflowComplete, job } = parentContext || {};

  const parentRouteData = useRouteLoaderData(JOB_ROUTE_ID);
  const jobData = job || parentRouteData?.job;

  // Ensure jobData is available before proceeding
  if (!jobData) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: Job data not available.
      </div>
    );
  }
  
  const isSubmitting = navigation.state === "submitting";
  const isGenerating =
    isSubmitting && navigation.formData?.get("actionType") === "generate";
  const actionData = useActionData<{
    success?: boolean;
    resumeData?: any;
    error?: string;
  }>();

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
    templateConfig,
  } = useResumeGenerator({
    jobId: jobData.id,
    jobTitle: jobData.title,
    resumeData,
    initialSourceTexts,
    resumeSourceSteps,
    initialContactInfo: contactInfo,
    templateId: selectedTemplateId,
  });

  const CurrentTemplateConfig = selectedTemplateId ? availableTemplates[selectedTemplateId] : null;
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
        <div className="col-span-6 ">
          {hasLoadedOrGeneratedData ? (
            <ResumePreview
              displayData={displayData}
              resumeRef={resumeRef}
              TemplateComponent={CurrentTemplateComponent}
              isGenerating={isGenerating}
              templateConfig={templateConfig}
            />
          ) : (
            <div className="text-center text-gray-500 py-10 flex items-center justify-center h-[400px] border rounded bg-gray-50">
              {/* Display simple loading text if no data yet and not submitting */} 
              {navigation.state !== 'submitting' ? (
                <p>{text.resume.emptyState}</p> 
              ) : (
                 <p>Loading or generating data...</p>
              )}
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
          <div className="mt-auto pt-4">
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
          <Collapsible title="Contact Information" defaultOpen={false}>
            <ContactInfoForm contactInfo={contactInfo} />
          </Collapsible>

          <Collapsible title={text.resume.headings.edit} defaultOpen={true}>
            <SourceTextInputs
              sourceSteps={resumeSourceSteps}
              sourceTexts={currentSourceTexts}
              editorRefs={editorRefs}
            />
          </Collapsible>
        </div>
      </div>
    </Form>
  );
}
