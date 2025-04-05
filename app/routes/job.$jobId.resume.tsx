import { useState, useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import dbService from "../services/db/dbService";
import {
  availableTemplates,
  defaultTemplateId,
  type ContactInfo,
  type ResumeTemplateConfig,
} from "../templates";
import { workflows, defaultWorkflowId } from "../config/workflows";
import type { WorkflowStep } from "../services/ai/types";
import { ContactInfoForm } from "~/components/ContactInfoForm";
import { generateAndSaveResume } from "~/services/resume/resumeDataService";
import { useResumeGenerator } from "~/hooks/useResumeGenerator";
import { Link } from "~/components/ui/Link";

// Import the extracted components
import { SourceTextInputs } from "~/components/resume/SourceTextInputs";
import { ResumeGenerationControls } from "~/components/resume/ResumeGenerationControls";
import { ResumePreviewActions } from "~/components/resume/ResumePreviewActions";
import { ResumePreview } from "~/components/resume/ResumePreview";

export function meta() {
  return [
    { title: "Resume Builder" },
    { name: "description", content: "Create a structured resume using AI" },
  ];
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

  const availableWorkflows = Object.entries(workflows).map(([id, config]: [string, { label: string }]) => ({
	id,
	label: config.label,
  }));

  const templatesList = Object.values(availableTemplates).map((config: ResumeTemplateConfig) => ({
    id: config.id,
    name: config.name,
  }));

  // Get saved contact info from resumeData or use template default
  const contactInfo = resumeData?.structuredData?.contactInfo || selectedTemplateConfig.defaultContactInfo;

  return {
    job,
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map(s => ({ id: s.id, name: s.name })),
    selectedWorkflowId,
    availableWorkflows,
    selectedTemplateId,
    templatesList,
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
    selectedWorkflowId: initialSelectedWorkflowId,
    availableWorkflows,
    selectedTemplateId: initialSelectedTemplateId,
    templatesList,
    contactInfo: initialContactInfo,
  } = useLoaderData<{
    job: { id: number; title: string; jobDescription: string };
    resumeData: { structuredData?: any } | null;
    sourceTexts: Record<string, string>;
    resumeSourceSteps: { id: string; name: string }[];
    selectedWorkflowId: string;
    availableWorkflows: Array<{ id: string; label: string }>;
    selectedTemplateId: string;
    templatesList: Array<{ id: string; name: string }>;
    contactInfo: ContactInfo;
  }>();

  const [, setSearchParams] = useSearchParams();
  const [selectedWorkflowId] = useState(initialSelectedWorkflowId);
  const [selectedTemplateId] = useState(initialSelectedTemplateId);
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

  // Handle workflow selection change
  const handleWorkflowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkflowId = event.target.value;
    setSearchParams({ workflow: newWorkflowId, template: selectedTemplateId }, { replace: true });
  };

  // Handle template selection change
  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = event.target.value;
    setSearchParams({ workflow: selectedWorkflowId, template: newTemplateId }, { replace: true });
  };

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
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{`Resume Builder for ${job.title}`}</h1>
              <div className="text-sm text-gray-500 flex flex-wrap gap-4 mt-1">
                <span className="inline-flex items-center">
                  <span className="font-medium mr-1">Workflow:</span> 
                  {workflows[selectedWorkflowId]?.label || 'Unknown'}
                </span>
                <span className="inline-flex items-center">
                  <span className="font-medium mr-1">Template:</span> 
                  {CurrentTemplateConfig?.name || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 self-start">
              <Link
                to="/dashboard"
                variant="secondary"
                size="md"
              >
                Back to Dashboard
              </Link>
              <Link
                to={`/job/${job.id}/content?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`}
                variant="primary"
                size="md"
              >
                View/Edit Source Content
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Form method="post" id={formId} action={formActionUrl} onSubmit={handleFormSubmit}>
        <div className="max-w-6xl mx-auto px-6 pt-0">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workflow-select" className="block text-base font-medium text-gray-700 mb-2">
                  Select Resume Generation Workflow
                </label>
                <select
                  id="workflow-select"
                  value={selectedWorkflowId}
                  onChange={handleWorkflowChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableWorkflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="template-select" className="block text-base font-medium text-gray-700 mb-2">
                  Select Resume Template
                </label>
                <select
                  id="template-select"
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {templatesList.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-8 order-2 lg:order-1">
              <SourceTextInputs
                sourceSteps={resumeSourceSteps}
                sourceTexts={currentSourceTexts}
                editorRefs={editorRefs}
              />
            </div>
            
            <div className="lg:col-span-4 order-1 lg:order-2">
              <ContactInfoForm contactInfo={initialContactInfo} />
            </div>
          </div>

          {error && (
             <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
               {error}
             </div>
           )}

           <ResumeGenerationControls
             isSubmitting={navigation.state === "submitting"}
             isGenerating={isGenerating}
             sourceSteps={resumeSourceSteps}
             sourceTexts={currentSourceTexts}
           />

           {hasLoadedOrGeneratedData && (
             <ResumePreviewActions
               onPrint={handlePrintClick}
               onDownloadPdf={handleDownloadPdfClick}
             />
           )}

          {navigation.state === "loading" && actionData === undefined && (
            <div className="my-4 p-4 border rounded bg-blue-50">
              <p>Loading previous results...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto px-6">
          <div className="p-1 flex flex-col">
            {hasLoadedOrGeneratedData ? (
              <div className="flex flex-col flex-grow">
                 {resumeSourceSteps.map(step => (
                     <input
                         key={`${step.id}-hidden`}
                         type="hidden"
                         name={step.id}
                         defaultValue={currentSourceTexts[step.id] || ''}
                     />
                 ))}
                 <div className="flex-grow overflow-auto">
                   <ResumePreview
                     displayData={displayData}
                     resumeRef={resumeRef}
                     TemplateComponent={CurrentTemplateComponent}
                     isGenerating={isGenerating}
                   />
                 </div>
               </div>
            ) : (
              <div className="text-center text-gray-500 py-10 flex-grow flex items-center justify-center h-full border rounded bg-gray-50">
                 {(navigation.state === "submitting" || navigation.state === "loading") && !actionData?.success ? (
                   <p>Loading or generating data...</p>
                 ) : (
                   <p>
                     Generate the resume sections using the button above to see a preview and edit the structured data.
                   </p>
                 )}
              </div>
            )}
          </div>
        </div>
      </Form>
    </>
  );
}
