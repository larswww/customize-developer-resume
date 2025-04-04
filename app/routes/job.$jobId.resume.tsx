import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useSearchParams,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { generateStructuredResume } from "../services/ai/resumeStructuredDataService";
import { printResumeElement } from "../utils/print.client";
import { downloadResumeAsPdf } from "../utils/pdf.client";
import dbService from "../services/db/dbService";
import {
  availableTemplates,
  defaultTemplateId,
  type ContactInfo,
  type ResumeTemplateConfig,
  globalResumeConstants
} from "../templates";
import type { DefaultResumeData } from "../templates/default";
import type { SimpleConsultantData } from "../templates/simpleConsultant";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonForms } from "@jsonforms/react";
import { vanillaCells, vanillaRenderers } from "@jsonforms/vanilla-renderers";
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import type { JsonSchema } from "@jsonforms/core";
import { workflows, defaultWorkflowId } from "../config/workflows";
import type { WorkflowStep } from "../services/ai/types";
import { JobControlsHeader } from "../components/JobControlsHeader";

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
      throw new Error(`Default template config not found.`);
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

  return {
    job,
    resumeData,
    sourceTexts,
    resumeSourceSteps: resumeSourceSteps.map(s => ({ id: s.id, name: s.name })),
    selectedWorkflowId,
    availableWorkflows,
    selectedTemplateId,
    templatesList,
    currentDefaultContactInfo: selectedTemplateConfig.defaultContactInfo,
  };
}

function getContactInfoFromFormData(
  formData: FormData,
  currentDefaults: ContactInfo
): ContactInfo {
  return {
    name: (formData.get("name") as string) || currentDefaults.name,
    title: (formData.get("title") as string) || currentDefaults.title,
    location: (formData.get("location") as string) || currentDefaults.location,
    phone: (formData.get("phone") as string) || currentDefaults.phone,
    email: (formData.get("email") as string) || currentDefaults.email,
    linkedin: (formData.get("linkedin") as string) || currentDefaults.linkedin,
    portfolio: (formData.get("portfolio") as string) || currentDefaults.portfolio,
  };
}

async function saveAndFormatResumeResponse(
  jobId: number,
  contactInfo: ContactInfo,
  coreData: any,
  actionType: "generate" | "save"
) {
  const finalResumeData: any = {
    contactInfo,
    ...coreData,
  };

  dbService.saveResume({
    jobId: jobId,
    structuredData: finalResumeData,
  });

  return {
    success: true,
    resumeData: finalResumeData,
    actionType: actionType,
  };
}

async function handleGenerateResume(
  formData: FormData,
  job: { id: number; title: string; jobDescription: string },
  contactInfo: ContactInfo,
  resumeSourceSteps: { id: string; name: string }[],
  selectedTemplateId: string
) {
  const sourceTexts: Record<string, string> = {};
  let missingSteps: string[] = [];

  for (const step of resumeSourceSteps) {
    const text = formData.get(step.id) as string | null;
    if (!text || text.trim() === '') {
        missingSteps.push(step.name);
    }
    sourceTexts[step.id] = text || '';
  }

  if (missingSteps.length > 0) {
    return {
      success: false,
      error: `Missing required input: Text for ${missingSteps.join(', ')} cannot be empty. Please ensure all source text sections are filled.`,
    };
  }

  const combinedSourceText = resumeSourceSteps
    .map(step => `${step.name.toUpperCase()}:\n${sourceTexts[step.id]}`)
    .join('\n\n---\n\n');

  const jobDescription = job.jobDescription;

  const templateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  const outputSchemaForGeneration = templateConfig.outputSchema;

  const generatedCoreData: any = await generateStructuredResume(
    combinedSourceText,
    jobDescription,
    outputSchemaForGeneration
  );

  return await saveAndFormatResumeResponse(
    job.id,
    contactInfo,
    generatedCoreData,
    "generate"
  );
}

async function handleSaveResume(
  formData: FormData,
  jobId: number,
  contactInfo: ContactInfo
) {
  const formDataJson = formData.get("formData") as string | null;
  let editedCoreData: any = null;

  if (!formDataJson) {
    return {
      success: false,
      error: "Missing edited resume data.",
    };
  }

  try {
    editedCoreData = JSON.parse(formDataJson);
  } catch (parseError) {
    console.error("Error parsing edited form data:", parseError);
    return {
      success: false,
      error: "Failed to parse edited resume data.",
    };
  }

  if (!editedCoreData) {
    return {
      success: false,
      error: "Missing or invalid edited resume data.",
    };
  }

  const validatedCoreData = editedCoreData;

  return await saveAndFormatResumeResponse(
    jobId,
    contactInfo,
    validatedCoreData,
    "save"
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as "generate" | "save";
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

  const templateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  const currentDefaults = templateConfig.defaultContactInfo;
  const contactInfo = getContactInfoFromFormData(formData, currentDefaults);

  try {
    if (actionType === "generate") {
      return await handleGenerateResume(formData, job, contactInfo, resumeSourceSteps, selectedTemplateId);
    }

    if (actionType === "save") {
      return await handleSaveResume(formData, jobId, contactInfo);
    }

    return { success: false, error: "Invalid action type specified" };
  } catch (error) {
    console.error(`Error in resume action handler (${actionType}):`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during resume processing",
    };
  }
}

interface ContactInfoFormProps {
  contactInfo: ContactInfo;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ContactInfoForm({ contactInfo, onChange }: ContactInfoFormProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={contactInfo.name}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={contactInfo.title}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={contactInfo.location}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={contactInfo.phone}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={contactInfo.email}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            LinkedIn (handle or URL)
          </label>
          <input
            type="text"
            id="linkedin"
            name="linkedin"
            value={contactInfo.linkedin}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="portfolio"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Portfolio (URL)
          </label>
          <input
            type="text"
            id="portfolio"
            name="portfolio"
            value={contactInfo.portfolio ?? ''}
            onChange={onChange}
            className="w-full p-2 border rounded shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

interface SourceTextInputsProps {
  sourceSteps: { id: string; name: string }[];
  sourceTexts: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function SourceTextInputs({ sourceSteps, sourceTexts, onChange }: SourceTextInputsProps) {
  if (!sourceSteps || sourceSteps.length === 0) {
      return (
          <div className="mb-6 p-4 border rounded bg-yellow-50 text-yellow-700">
              No source text sections configured for this workflow in the resume step.
          </div>
      );
  }

  return (
    <div className={`grid grid-cols-1 ${sourceSteps.length > 1 ? 'md:grid-cols-2' : ''} gap-6 mb-6`}>
      {sourceSteps.map((step) => (
        <div key={step.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
          <label
            htmlFor={step.id}
            className="block text-lg font-semibold mb-2 text-gray-700"
          >
            {step.name} Text
          </label>
          <p className="text-sm text-gray-500 mb-2">
            Edit the AI-generated {step.name.toLowerCase()} below before generating the final
            resume sections.
          </p>
          <textarea
            id={step.id}
            name={step.id}
            value={sourceTexts[step.id] || ''}
            onChange={onChange}
            className="w-full h-60 p-2 border rounded font-mono text-sm bg-gray-50"
            placeholder={`${step.name} text generated from previous step...`}
          />
        </div>
      ))}
    </div>
  );
}

interface ResumeGenerationControlsProps {
  isSubmitting: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  sourceSteps: { id: string; name: string }[];
  sourceTexts: Record<string, string>;
  formDataExists: boolean;
}

function ResumeGenerationControls({
  isSubmitting,
  isGenerating,
  isSaving,
  sourceSteps,
  sourceTexts,
  formDataExists,
}: ResumeGenerationControlsProps) {

  const allSourceTextsPresent = sourceSteps.every(step => sourceTexts[step.id] && sourceTexts[step.id].trim() !== '');
  const generateDisabled = isSubmitting || !allSourceTextsPresent;
  const saveDisabled = isSubmitting || !formDataExists;
  const missingTexts = sourceSteps
    .filter(step => !sourceTexts[step.id] || sourceTexts[step.id].trim() === '')
    .map(step => step.name)
    .join(', ');

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
      <p className="mb-4 text-gray-600">
        Confirm your details and text inputs above, then use the buttons below
        to generate or save the structured resume sections.
      </p>

      <div className="flex items-center gap-4 mt-4">
        <button
          type="submit"
          name="actionType"
          value="generate"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          disabled={generateDisabled}
          title={
            generateDisabled
              ? `Cannot generate: Required text missing for: ${missingTexts || 'Unknown sections'}`
              : "Generate structured resume sections"
          }
        >
           {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Generating...
            </>
          ) : (
            <>Generate Resume Sections</>
          )}
        </button>

        <button
          type="submit"
          name="actionType"
          value="save"
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
          disabled={saveDisabled}
          title={
            saveDisabled
              ? "Generate resume first or load existing data before saving"
              : "Save current edits"
          }
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Saving...
            </>
          ) : (
            <>Save Changes</>
          )}
        </button>
      </div>
      {!allSourceTextsPresent && (
        <p className="mt-2 text-sm text-yellow-700">
          Required text missing for: {missingTexts || 'Unknown sections'}. Please fill all sections before generating.
        </p>
      )}
    </div>
  );
}

interface ResumePreviewActionsProps {
  onPrint: () => void;
  onDownloadPdf: () => Promise<void>;
}

function ResumePreviewActions({ onPrint, onDownloadPdf }: ResumePreviewActionsProps) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <h2 className="text-xl font-bold">Generated Resume Preview</h2>
      <div className="flex gap-3">
         <button
          type="button"
          onClick={onPrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><title>Print</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print
        </button>
        <button
          type="button"
          onClick={onDownloadPdf}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><title>Download as PDF</title><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Download as PDF
        </button>
      </div>
    </div>
  );
}

interface ResumePreviewProps {
  displayData: DefaultResumeData | SimpleConsultantData | null;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  TemplateComponent: React.ComponentType<{ 
    data: DefaultResumeData | SimpleConsultantData;
  }> | null;
  isGenerating: boolean;
}

function ResumePreview({ 
  displayData, 
  resumeRef, 
  TemplateComponent, 
  isGenerating,
}: ResumePreviewProps) {
  return (
    <div className="mb-20">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div ref={resumeRef} id="printable-resume">
          {TemplateComponent && displayData ? (
            <TemplateComponent 
              data={displayData} 
            />
          ) : isGenerating ? (
            <p className="p-8 text-center text-gray-500">Generating preview...</p>
          ) : !TemplateComponent ? (
            <p className="p-8 text-center text-red-500">Selected template component not found.</p>
          ) : null}
        </div>
      </div>
    </div>
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
    currentDefaultContactInfo,
  } = useLoaderData<{
    job: { id: number; title: string; jobDescription: string };
    resumeData: { structuredData?: any } | null;
    sourceTexts: Record<string, string>;
    resumeSourceSteps: { id: string; name: string }[];
    selectedWorkflowId: string;
    availableWorkflows: Array<{ id: string; label: string }>;
    selectedTemplateId: string;
    templatesList: Array<{ id: string; name: string }>;
    currentDefaultContactInfo: ContactInfo;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialSelectedWorkflowId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialSelectedTemplateId);

  const handleWorkflowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkflowId = event.target.value;
    setSearchParams({ workflow: newWorkflowId, template: selectedTemplateId }, { replace: true });
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = event.target.value;
    setSearchParams({ workflow: selectedWorkflowId, template: newTemplateId }, { replace: true });
  };

  const [error, setError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();

  const [contactInfo, setContactInfo] = useState<ContactInfo>(currentDefaultContactInfo);
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev: ContactInfo) => ({ ...prev, [name]: value }));
  };

  const [currentSourceTexts, setCurrentSourceTexts] = useState<Record<string, string>>(
    initialSourceTexts || {}
  );
  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSourceTexts((prev) => ({ ...prev, [name]: value }));
  };

  const [formData, setFormData] = useState<any>({});
  const [hasLoadedOrGeneratedData, setHasLoadedOrGeneratedData] = useState(false);

  const actionData = useActionData<{ success?: boolean; resumeData?: any; error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isGenerating = isSubmitting && navigation.formData?.get("actionType") === "generate";
  const isSaving = isSubmitting && navigation.formData?.get("actionType") === "save";

  const CurrentTemplateConfig = availableTemplates[selectedTemplateId] ?? null;
  const CurrentTemplateComponent = CurrentTemplateConfig?.component ?? null;

  const displayData: DefaultResumeData | SimpleConsultantData | null = 
    formData && Object.keys(formData).length > 0
      ? {
          education: globalResumeConstants.education,
          contactInfo: contactInfo,
          ...formData,
        } as DefaultResumeData | SimpleConsultantData
      : null;

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
  }, [actionData]);

  useEffect(() => {
    const loadedCoreData = resumeData?.structuredData 
        ? (({ contactInfo, education, ...core }) => core)(resumeData.structuredData)
        : {};
    setFormData(loadedCoreData);
    
    const initialContact = resumeData?.structuredData?.contactInfo || currentDefaultContactInfo;
    setContactInfo(initialContact);
    
    setCurrentSourceTexts(initialSourceTexts || {});
    
    setHasLoadedOrGeneratedData(!!resumeData?.structuredData);
  }, [resumeData, currentDefaultContactInfo, initialSourceTexts]);

  const handlePrintClick = () => {
    setError(null);
    printResumeElement("printable-resume", setError);
  };

  const handleDownloadPdfClick = async () => {
    setError(null);
    if (!displayData) {
      setError("No resume data available to download.");
      return;
    }
    await downloadResumeAsPdf({
      elementId: "printable-resume",
      contactInfo: displayData.contactInfo,
      jobTitle: job.title,
      onError: setError,
    });
  };

  const formId = "resume-form";
  const formActionUrl = `/job/${job.id}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{`Resume Builder for ${job.title}`}</h1>
          <div className="text-sm text-gray-500 flex gap-4">
            <span>Workflow: {workflows[selectedWorkflowId]?.label || 'Unknown'}</span>
            <span>Template: {CurrentTemplateConfig?.name || 'Unknown'}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to="/dashboard"
            className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
          >
            Back to Dashboard
          </Link>
          <Link
            to={`/job/${job.id}/content?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            View/Edit Source Content
          </Link>
        </div>
      </div>

      <Form method="post" id={formId} action={formActionUrl}>
        <div className="max-w-6xl mx-auto px-6 pt-0">
          <JobControlsHeader
            availableWorkflows={availableWorkflows}
            currentWorkflowId={selectedWorkflowId}
            onWorkflowChange={handleWorkflowChange}
            workflowLabel="Select Resume Generation Workflow"
            availableTemplates={templatesList}
            currentTemplateId={selectedTemplateId}
            onTemplateChange={handleTemplateChange}
            templateLabel="Select Resume Template"
          />
          
          <ContactInfoForm contactInfo={contactInfo} onChange={handleContactChange} />

          <SourceTextInputs
            sourceSteps={resumeSourceSteps}
            sourceTexts={currentSourceTexts}
            onChange={handleSourceTextChange}
          />

          {error && (
             <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
               {error}
             </div>
           )}

           <div className="flex justify-between items-center mb-6">
               <ResumeGenerationControls
                 isSubmitting={navigation.state === "submitting"}
                 isGenerating={isGenerating}
                 isSaving={isSaving}
                 sourceSteps={resumeSourceSteps}
                 sourceTexts={currentSourceTexts}
                 formDataExists={!!formData && Object.keys(formData).length > 0} 
               />
           </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-6">
          <div className="p-1 h-full flex flex-col">
            {hasLoadedOrGeneratedData ? (
              <div className="flex flex-col flex-grow">
                 {resumeSourceSteps.map(step => (
                     <input
                         key={`${step.id}-hidden`}
                         type="hidden"
                         name={step.id}
                         value={currentSourceTexts[step.id] || ''}
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
            <style>
              {`
                @page {
                  size: A4;
                  margin: 0;
                }
                @media print {
                  html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  body * {
                    visibility: hidden;
                  }
                  #printable-resume, #printable-resume * {
                    visibility: visible;
                  }
                  #printable-resume {
                    left: 0; 
                    top: 0;
                    width: 100%;
                    height: 100%;
                    min-height: 100%;
                    box-shadow: none !important;
                    box-sizing: border-box;
                  }
                  #printable-resume > .resume-container {
                      box-shadow: none !important;
                      height: auto !important;
                      min-height: 100%;
                      display: flex !important;
                      flex-direction: column !important;
                      width: 100% !important;
                      box-sizing: border-box;
                  }
                  #printable-resume > .resume-container > .flex-row {
                      flex-grow: 1 !important;
                      height: 100% !important;
                      box-sizing: border-box;
                  }
                  #printable-resume .w-\[70\%\] {
                       flex-grow: 1 !important;
                       overflow: visible !important;
                   }
                  .page-layout-header, .page-layout-sidebar, .page-layout-bottom-bar {
                    display: none;
                   }
                   .page-layout-main {
                     width: 100%;
                     padding: 0;
                     margin: 0;
                   }
                   #printable-resume > div > div {
                      box-shadow: none !important;
                   }
                }
              `}
            </style>
          </div>

          <div className="p-1 h-full flex flex-col">
            {hasLoadedOrGeneratedData ? (
              <>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Edit Structured Data ({CurrentTemplateConfig?.name || 'Unknown'} Schema)
                </h3>
                <input
                  type="hidden"
                  name="formData"
                  value={JSON.stringify(formData)}
                />
                <div className="jsonforms-wrapper overflow-y-auto flex-grow">
                  {CurrentTemplateConfig ? (
                    <JsonForms
                      schema={zodToJsonSchema(CurrentTemplateConfig.outputSchema) as JsonSchema}
                      renderers={materialRenderers}
                      cells={materialCells}
                      data={formData}
                      onChange={({ data }) => setFormData(data)}
                    />
                  ) : (
                    <p className="text-red-500">Error: Could not load schema for the selected template.</p>
                  )}
                </div>
              </>
            ) : (
               <div className="text-center text-gray-400 py-10 flex-grow flex items-center justify-center h-full border rounded bg-gray-50">
                  <p>Edit form will appear here after generation.</p>
               </div>
            )}
          </div>
        </div>
      </Form>
    </>
  );
}
