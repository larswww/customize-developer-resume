import { useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import dbService from "../services/db/dbService";
import {
  availableTemplates,
  defaultTemplateId,
  type ContactInfo,
} from "../templates";
import { workflows, defaultWorkflowId } from "../config/workflows";
import type { WorkflowStep } from "../services/ai/types";
import { ContactInfoForm } from "~/components/ContactInfoForm";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { useResumeGenerator } from "~/hooks/useResumeGenerator";
import { Collapsible } from "~/components/Collapsible";

// Import the extracted components
import { SourceTextInputs } from "~/components/resume/SourceTextInputs";
import { ResumeGenerationControls } from "~/components/resume/ResumeGenerationControls";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { ResumePreview } from "~/components/resume/ResumePreview";

// Define the outlet context type for TypeScript
interface OutletContextType {
  selectedWorkflowId: string;
  selectedTemplateId: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  const url = new URL(request.url);
  const selectedWorkflowId = url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId = url.searchParams.get("template") || defaultTemplateId;

  if (Number.isNaN(jobId)) {
    throw new Response("Invalid job ID", { status: 400 });
  }

  const job = dbService.getJob(jobId);
  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  const resumeData = dbService.getResume(jobId);

  const selectedWorkflow: { steps: WorkflowStep[] } | undefined = workflows[selectedWorkflowId];
  if (!selectedWorkflow) {
    throw new Error(`Workflow '${selectedWorkflowId}' not found.`);
  }

  const selectedTemplateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
    throw new Error('Default template config not found.');
  }

  const resumeSourceSteps = selectedWorkflow.steps.filter(step => step.useInResume);

  const sourceTexts: Record<string, string> = {};
  for (const step of resumeSourceSteps) {
    const stepResult = dbService.getWorkflowStep(jobId, step.id);
    sourceTexts[step.id] = stepResult?.result || "";
  }

  // Get saved contact info from resumeData or use template default
  const contactInfo = resumeData?.structuredData?.contactInfo || selectedTemplateConfig.defaultContactInfo;

  return {
    job,
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map(s => ({ id: s.id, name: s.name })),
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
  const selectedWorkflowId = url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId = url.searchParams.get("template") || defaultTemplateId;

  const selectedWorkflow = workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
    return { success: false, error: `Workflow config not found for ID: ${selectedWorkflowId}` };
  }
  
  const resumeSourceSteps = selectedWorkflow.steps
    .filter(step => step.useInResume)
    .map(s => ({ id: s.id, name: s.name }));

  // Extract contact info directly from the form data
  const contactInfo: ContactInfo = {
    name: formData.get("name") as string,
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    linkedin: formData.get("linkedin") as string,
    portfolio: formData.get("portfolio") as string,
  };

  // Extract source texts from form data
  const sourceTexts: Record<string, string> = {};
  for (const step of resumeSourceSteps) {
    sourceTexts[step.id] = formData.get(step.id) as string || '';
  }

  const templateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  const outputSchema = templateConfig.outputSchema;

  // Use the service to generate and save the resume
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

  // Get selected workflow and template from parent layout
  const { selectedWorkflowId, selectedTemplateId } = useOutletContext<OutletContextType>();
  
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isGenerating = isSubmitting && navigation.formData?.get("actionType") === "generate";
  const actionData = useActionData<{ success?: boolean; resumeData?: any; error?: string }>();

  // Use the custom hook for resume functionality
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

  // Get current template configuration and component
  const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
  const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;

  // Update state when action data changes
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
    <Form method="post" id={formId} action={formActionUrl} onSubmit={handleFormSubmit} className="py-4">
      <div className="grid grid-cols-12 md:grid-cols-[1fr,300px] gap-6">
        {/* Main Content Area */}
        <div className="col-span-6 ">
          {/* Resume Preview */}
          {hasLoadedOrGeneratedData ? (
            <>
              {resumeSourceSteps.map(step => (
                <input
                  key={`${step.id}-hidden`}
                  type="hidden"
                  name={step.id}
                  defaultValue={currentSourceTexts[step.id] || ''}
                />
              ))}
              <ResumePreview
                displayData={displayData}
                resumeRef={resumeRef}
                TemplateComponent={CurrentTemplateComponent}
                isGenerating={isGenerating}
              />
            </>
          ) : (
            <div className="text-center text-gray-500 py-10 flex items-center justify-center h-[400px] border rounded bg-gray-50">
              {(navigation.state === "submitting" || navigation.state === "loading") && !actionData?.success ? (
                <p>Loading or generating data...</p>
              ) : (
                <p>
                  Generate the resume sections using the button to see a preview and edit the structured data.
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}

         
        </div>

        {/* Side Column */}
        <div className="col-span-6 space-y-6">
          {/* Action Buttons */}
          {hasLoadedOrGeneratedData && (
            <ResumePreviewActions
              onPrint={handlePrintClick}
              onDownloadPdf={handleDownloadPdfClick}
            />
          )}
          
          {/* Contact Information (in side column) */}
          <Collapsible title="Contact Information" defaultOpen={false}>
            <ContactInfoForm contactInfo={initialContactInfo} />
          </Collapsible>

           {/* Edit Resume Section */}
           <Collapsible title="Edit Resume" defaultOpen={false}>
            <SourceTextInputs
              sourceSteps={resumeSourceSteps}
              sourceTexts={currentSourceTexts}
              editorRefs={editorRefs}
            />
          </Collapsible>

          {/* Generate Button */}
          <div className="mt-auto pt-4">
            <button
              type="submit"
              name="actionType"
              value="generate"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold"
              disabled={isSubmitting}
            >
              {isGenerating ? "Generating..." : "Generate Resume"}
            </button>
          </div>
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
