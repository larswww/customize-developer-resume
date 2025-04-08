import { useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import dbService from "../services/db/dbService";
import {
  availableTemplates,
  defaultTemplateId,
  type ContactInfo,
} from "../config/templates";
import { workflows, defaultWorkflowId } from "../config/workflows.config";
import type { WorkflowStep } from "../services/ai/types";
import { ContactInfoForm } from "~/components/ContactInfoForm";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { useResumeGenerator } from "~/hooks/useResumeGenerator";
import { Collapsible } from "~/components/Collapsible";

import { SourceTextInputs } from "~/components/resume/SourceTextInputs";
import { ResumeGenerationControls } from "~/components/resume/ResumeGenerationControls";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { ResumePreview } from "~/components/resume/ResumePreview";
import { Button } from "~/components/ui/Button";
import text from "~/text";

interface OutletContextType {
  selectedWorkflowId: string;
  selectedTemplateId: string;
  isWorkflowComplete: boolean;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  const url = new URL(request.url);
  const selectedWorkflowId =
    url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId =
    url.searchParams.get("template") || defaultTemplateId;

  if (Number.isNaN(jobId)) {
    throw new Response("Invalid job ID", { status: 400 });
  }

  const job = dbService.getJob(jobId);
  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  const resumeData = dbService.getResume(jobId);

  const selectedWorkflow: { steps: WorkflowStep[] } | undefined =
    workflows[selectedWorkflowId];
  if (!selectedWorkflow) {
    throw new Error(`Workflow '${selectedWorkflowId}' not found.`);
  }

  const selectedTemplateConfig =
    availableTemplates[selectedTemplateId] ??
    availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
    throw new Error("Default template config not found.");
  }

  const resumeSourceSteps = selectedWorkflow.steps.filter(
    (step) => step.useInResume
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

  const contactInfo =
    resumeData?.structuredData?.contactInfo ||
    selectedTemplateConfig.defaultContactInfo;

  return {
    job,
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map((s) => ({
      id: s.id,
      name: s.name,
    })),
    contactInfo,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobId = Number(params.jobId);

  if (Number.isNaN(jobId)) {
    return { success: false, error: "Invalid job ID" };
  }

  const job = dbService.getJob(jobId);
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  const url = new URL(request.url);
  const selectedWorkflowId =
    url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId =
    url.searchParams.get("template") || defaultTemplateId;

  const selectedWorkflow =
    workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
    return {
      success: false,
      error: `Workflow config not found for ID: ${selectedWorkflowId}`,
    };
  }

  const resumeSourceSteps = selectedWorkflow.steps
    .filter((step) => step.useInResume)
    .map((s) => ({ id: s.id, name: s.name }));

  const contactInfo: ContactInfo = {
    name: formData.get("name") as string,
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    linkedin: formData.get("linkedin") as string,
    portfolio: formData.get("portfolio") as string,
  };

  const sourceTexts: Record<string, string> = {};
  for (const step of resumeSourceSteps) {
    sourceTexts[step.id] = (formData.get(step.id) as string) || "";
  }

  const templateConfig =
    availableTemplates[selectedTemplateId] ??
    availableTemplates[defaultTemplateId];
  const outputSchema = templateConfig.outputSchema;

  return await generateAndSaveResume(
    jobId,
    contactInfo,
    sourceTexts,
    resumeSourceSteps,
    job.jobDescription,
    outputSchema
  );
}

export default function JobResume() {
  const {
    job,
    resumeData,
    sourceTexts: initialSourceTexts,
    resumeSourceSteps,
    contactInfo: initialContactInfo,
  } = useLoaderData<{
    job: { id: number; title: string; jobDescription: string };
    resumeData: { structuredData?: any } | null;
    sourceTexts: Record<string, string>;
    resumeSourceSteps: { id: string; name: string }[];
    contactInfo: ContactInfo;
  }>();

  const { selectedWorkflowId, selectedTemplateId, isWorkflowComplete } =
    useOutletContext<OutletContextType>();

  const navigation = useNavigation();
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
  } = useResumeGenerator({
    jobId: job.id,
    jobTitle: job.title,
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
  const formActionUrl = `/job/${job.id}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`;

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
            <ContactInfoForm contactInfo={initialContactInfo} />
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

      {navigation.state === "loading" && actionData === undefined && (
        <div className="my-4 p-4 border rounded bg-blue-50">
          <p>Loading previous results...</p>
        </div>
      )}
    </Form>
  );
}
