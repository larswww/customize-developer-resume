import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { generateStructuredResume } from "../services/ai/resumeStructuredDataService";
import { printResumeElement } from "../utils/print.client";
import { downloadResumeAsPdf } from "../utils/pdf.client";
import dbService from "../services/db/dbService";
import {
  defaultTemplateConfig,
  ResumeCoreDataSchema,
} from "../config/resumeTemplates.config";
import type {
  ResumeData,
  ContactInfo,
  ResumeCoreData,
} from "../config/resumeTemplates.config";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonForms } from "@jsonforms/react";
import { vanillaCells, vanillaRenderers } from "@jsonforms/vanilla-renderers";
import type { JsonSchema } from "@jsonforms/core";
import { PageLayout } from "~/components/PageLayout";
const outputSchema = zodToJsonSchema(ResumeCoreDataSchema);

// Default/Fallback Contact Info (from image)
const defaultContactInfo: ContactInfo = {
  name: "LARS WÖLDERN",
  title: "Product Engineer",
  location: "Amsterdam & Remote",
  phone: "+31 6 2526 6752",
  email: "lars@productworks.nl",
  linkedin: "linkedin.com/in/larswo",
  portfolio: "productworks.nl",
};

// Use the config for the component
const CurrentResumeTemplate = defaultTemplateConfig.component;

export function meta() {
  return [
    { title: "Resume Builder" },
    { name: "description", content: "Create a structured resume using AI" },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);

  if (Number.isNaN(jobId)) {
    throw new Response("Invalid job ID", { status: 400 });
  }

  // Get job from database
  const job = dbService.getJob(jobId);

  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  // Get resume data if exists (this contains the full structure including contactInfo)
  const resumeData = dbService.getResume(jobId);

  // Get relevant workflow step results
  const skillsStep = dbService.getWorkflowStep(jobId, "extract-skills");
  const workExperienceStep = dbService.getWorkflowStep(
    jobId,
    "craft-work-experience"
  );

  const skillsText = skillsStep?.result || "";
  const workExperienceText = workExperienceStep?.result || "";

  return {
    job,
    resumeData, // Contains previously generated structuredData (incl. contactInfo) if available
    skillsText, // Pass the raw texts needed for generation
    workExperienceText,
  };
}

// --- Helper function to extract contact info --- (New)
function getContactInfoFromFormData(formData: FormData): ContactInfo {
  return {
    name:
      (formData.get("name") as string) ||
      defaultTemplateConfig.defaultContactInfo.name,
    title:
      (formData.get("title") as string) ||
      defaultTemplateConfig.defaultContactInfo.title,
    location:
      (formData.get("location") as string) ||
      defaultTemplateConfig.defaultContactInfo.location,
    phone:
      (formData.get("phone") as string) ||
      defaultTemplateConfig.defaultContactInfo.phone,
    email:
      (formData.get("email") as string) ||
      defaultTemplateConfig.defaultContactInfo.email,
    linkedin:
      (formData.get("linkedin") as string) ||
      defaultTemplateConfig.defaultContactInfo.linkedin,
    portfolio:
      (formData.get("portfolio") as string) ||
      defaultTemplateConfig.defaultContactInfo.portfolio,
  };
}

// --- NEW Helper function to save resume and format response ---
async function saveAndFormatResumeResponse(
  jobId: number,
  contactInfo: ContactInfo,
  coreData: ResumeCoreData,
  actionType: "generate" | "save"
) {
  // Combine contact info and core data
  const finalResumeData: ResumeData = {
    contactInfo,
    ...coreData,
  };

  // Save to the database
  dbService.saveResume({
    jobId: jobId,
    structuredData: finalResumeData,
  });

  // Return success response
  return {
    success: true,
    resumeData: finalResumeData,
    actionType: actionType,
  };
}

// --- Helper function for the 'generate' action --- (Refactored)
async function handleGenerateResume(
  formData: FormData,
  job: { id: number; title: string; jobDescription: string },
  contactInfo: ContactInfo
) {
  // Get Text Inputs from Form Data
  const skillsText = (formData.get("skillsText") as string) || "";
  const workExperienceText = (formData.get("workExperienceText") as string) || "";
  const jobDescription = job.jobDescription;

  if (!skillsText || !workExperienceText) {
    return {
      success: false,
      error:
        "Missing required input: Skills or Work Experience text cannot be empty.",
    };
  }

  // Generate structured data
  const generatedCoreData: ResumeCoreData = await generateStructuredResume(
    `SKILLS: ${skillsText}\n\nWORK EXPERIENCE: ${workExperienceText}`,
    jobDescription,
    defaultTemplateConfig.outputSchema
  );

  // Save and format response using the new helper
  return await saveAndFormatResumeResponse(
    job.id,
    contactInfo,
    generatedCoreData,
    "generate"
  );
}

// --- Helper function for the 'save' action --- (Refactored)
async function handleSaveResume(
  formData: FormData,
  jobId: number,
  contactInfo: ContactInfo
) {
  // Get Edited Core Data from Form Data
  const formDataJson = formData.get("formData") as string | null;
  let editedCoreData: ResumeCoreData | null = null;

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

  // Create a validated core data structure
  const validatedCoreData: ResumeCoreData = {
    workExperience: editedCoreData.workExperience || [],
    education: editedCoreData.education || [],
    skills: editedCoreData.skills || [],
  };

  // Save and format response using the new helper
  return await saveAndFormatResumeResponse(
    jobId,
    contactInfo,
    validatedCoreData, // Use the validated data
    "save"
  );
}

// --- Main Action Function (Refactored) ---
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as "generate" | "save";
  const jobId = Number(params.jobId);

  if (Number.isNaN(jobId)) {
    return {
      success: false,
      error: "Invalid job ID",
    };
  }

  // Get job from database
  const job = dbService.getJob(jobId);
  if (!job) {
    return {
      success: false,
      error: "Job not found",
    };
  }

  // Extract contact info once
  const contactInfo = getContactInfoFromFormData(formData);

  try {
    // Delegate to helper functions based on actionType
    if (actionType === "generate") {
      return await handleGenerateResume(formData, job, contactInfo);
    }

    if (actionType === "save") {
      return await handleSaveResume(formData, jobId, contactInfo);
    }

    // Invalid action type
    return {
      success: false,
      error: "Invalid action type specified",
    };
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

// --- NEW: ContactInfoForm Component ---
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
            name="name" // Ensure name attribute matches state key
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

// --- NEW: SourceTextInputs Component ---
interface SourceTextInputsProps {
  skillsText: string;
  onSkillsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  workExperienceText: string;
  onWorkExperienceChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function SourceTextInputs({
  skillsText,
  onSkillsChange,
  workExperienceText,
  onWorkExperienceChange,
}: SourceTextInputsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <label
          htmlFor="skillsText"
          className="block text-lg font-semibold mb-2 text-gray-700"
        >
          Skills Text
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Edit the AI-generated skills list below before generating the final
          resume sections.
        </p>
        <textarea
          id="skillsText"
          name="skillsText"
          value={skillsText}
          onChange={onSkillsChange}
          className="w-full h-60 p-2 border rounded font-mono text-sm bg-gray-50"
          placeholder="Skills text generated from previous step..."
        />
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <label
          htmlFor="workExperienceText"
          className="block text-lg font-semibold mb-2 text-gray-700"
        >
          Work Experience Text
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Edit the AI-generated work experience below before generating the final
          resume sections.
        </p>
        <textarea
          id="workExperienceText"
          name="workExperienceText"
          value={workExperienceText}
          onChange={onWorkExperienceChange}
          className="w-full h-60 p-2 border rounded font-mono text-sm bg-gray-50"
          placeholder="Work experience text generated from previous step..."
        />
      </div>
    </div>
  );
}

// --- NEW: ResumeGenerationControls Component ---
interface ResumeGenerationControlsProps {
  isSubmitting: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  skillsText: string;
  workExperienceText: string;
  formDataExists: boolean; // Pass whether formData is non-null
}

function ResumeGenerationControls({
  isSubmitting,
  isGenerating,
  isSaving,
  skillsText,
  workExperienceText,
  formDataExists,
}: ResumeGenerationControlsProps) {
  const generateDisabled = isSubmitting || !skillsText || !workExperienceText;
  const saveDisabled = isSubmitting || !formDataExists;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
      <p className="mb-4 text-gray-600">
        Confirm your details and text inputs above, then use the buttons below
        to generate or save the structured resume sections.
      </p>

      {/* Action Buttons: Generate and Save */}
      <div className="flex items-center gap-4 mt-4">
        {/* Generate Button */}
        <button
          type="submit"
          name="actionType"
          value="generate"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          disabled={generateDisabled}
          title={
            !skillsText || !workExperienceText
              ? "Skills or Work Experience text is empty"
              : "Generate structured resume sections"
          }
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>Generate Resume Sections</>
          )}
        </button>

        {/* Save Changes Button */}
        <button
          type="submit"
          name="actionType"
          value="save"
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center"
          disabled={saveDisabled}
          title={
            !formDataExists
              ? "Generate resume first or load existing data"
              : "Save current edits"
          }
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>Save Changes</>
          )}
        </button>
      </div>
      {(!skillsText || !workExperienceText) && (
        <p className="mt-2 text-sm text-yellow-700">
          Skills or Work Experience text cannot be empty.
        </p>
      )}
    </div>
  );
}

// --- NEW: ResumePreviewActions Component ---
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Print</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print
        </button>
        <button
          type="button"
          onClick={onDownloadPdf}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Download as PDF</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download as PDF
        </button>
      </div>
    </div>
  );
}

// --- NEW: ResumePreview Component ---
interface ResumePreviewProps {
  displayData: ResumeData | null;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  TemplateComponent: React.ComponentType<{ data: ResumeData }>;
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
          {displayData ? (
            <TemplateComponent data={displayData} />
          ) : isGenerating ? (
            <p className="p-8 text-center text-gray-500">Generating preview...</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Default export: The main React component for this route
export default function JobResume() {
  const {
    job,
    resumeData,
    skillsText: initialSkillsText,
    workExperienceText: initialWorkExperienceText,
  } = useLoaderData<{
    job: {
      id: number;
      title: string;
      jobDescription: string;
    };
    resumeData: {
      structuredData?: ResumeData; // Full data structure from DB
    } | null;
    skillsText: string;
    workExperienceText: string;
  }>();

  const [error, setError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();

  // --- State for Editable Contact Info (Consolidated) ---
  const initialContactInfo =
    resumeData?.structuredData?.contactInfo || defaultContactInfo;
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);

  // --- Single handler for contact info changes --- (New)
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value, // Use input name attribute to update the correct key
    }));
  };

  // --- State for Editable Text Inputs ---
  const [currentSkillsText, setCurrentSkillsText] = useState(
    initialSkillsText || ""
  );
  const [currentWorkExperienceText, setCurrentWorkExperienceText] = useState(
    initialWorkExperienceText || ""
  );

  // --- State for JsonForms Data ---
  // Ensure formData is initialized with a valid structure, even if empty
  const initialCoreData: ResumeCoreData = resumeData?.structuredData
    ? {
        workExperience: resumeData.structuredData.workExperience || [],
        education: resumeData.structuredData.education || [],
        skills: resumeData.structuredData.skills || [],
      }
    : {
        workExperience: [],
        education: [],
        skills: [],
      };
  const [formData, setFormData] = useState<ResumeCoreData>(initialCoreData);

  // NEW: State to track if data exists (loaded or generated)
  const [hasLoadedOrGeneratedData, setHasLoadedOrGeneratedData] = useState(
    !!resumeData?.structuredData // Initialize based on loader data
  );

  const actionData = useActionData<{
    success?: boolean;
    resumeData?: ResumeData; // Action returns the full ResumeData now
    actionType?: "generate" | "save";
    error?: string;
  }>();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isGenerating =
    isSubmitting &&
    navigation.formData?.get("actionType") === "generate";
  const isSaving =
    isSubmitting && navigation.formData?.get("actionType") === "save";

  // Use formData state for the live preview of core data
  const currentCoreData = formData;

  // This structure will be passed to the template
  // Combine live contact info (state), live core data (formData state),
  // and optional sections from the last full data load/generation.
  const latestFullData = actionData?.resumeData || resumeData?.structuredData;
  const displayData: ResumeData | null = currentCoreData
    ? {
        contactInfo: contactInfo, // Use the contactInfo state directly
        ...currentCoreData, // Use the live edited data from formData state
        // Get optional sections from the most recent full data source
        otherInfo: latestFullData?.otherInfo,
        languages: latestFullData?.languages,
      }
    : null;

  // Update state if action returns new data (Updated for consolidated state)
  useEffect(() => {
    if (actionData?.success && actionData?.resumeData?.contactInfo) {
      // Update contact info state directly
      setContactInfo(actionData.resumeData.contactInfo);
    }
    // Update formData state (remains the same)
    if (actionData?.success && actionData?.resumeData) {
      const { contactInfo, ...coreData } = actionData.resumeData;
      setFormData({
        workExperience: coreData.workExperience || [],
        education: coreData.education || [],
        skills: coreData.skills || [],
      });
      setHasLoadedOrGeneratedData(true); // Mark data as available upon successful action
    }
    // Handle error (remains the same)
    if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

  // Initialize formData state from loader data (remains the same)
  useEffect(() => {
    if (formData === null && resumeData?.structuredData) {
      const { contactInfo, ...coreData } = resumeData.structuredData;
      setFormData({
        workExperience: coreData.workExperience || [],
        education: coreData.education || [],
        skills: coreData.skills || [],
      });
    }
  }, [resumeData, formData]);

  // --- Define handlers for preview actions ---
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

  const formId = "resume-form"; // Added formId for PageLayout

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{`Resume Builder for ${job.title}`}</h1>
          <p className="text-sm text-gray-500">
            Preview the generated resume on the left and edit the structured data on the right.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to="/dashboard"
            className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
          >
            Back to Dashboard
          </Link>
          <Link
            to={`/job/${job.id}/content`}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            View Generated Content
          </Link>
        </div>
      </div>

      <Form method="post" id={formId}>
        <div className="max-w-6xl mx-auto px-6 pt-0">
          <ContactInfoForm contactInfo={contactInfo} onChange={handleContactChange} />
          <SourceTextInputs
            skillsText={currentSkillsText}
            onSkillsChange={(e) => setCurrentSkillsText(e.target.value)}
            workExperienceText={currentWorkExperienceText}
            onWorkExperienceChange={(e) => setCurrentWorkExperienceText(e.target.value)}
          />

          {error && (
            <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}
          <ResumeGenerationControls
            isSubmitting={isSubmitting}
            isGenerating={isGenerating}
            isSaving={isSaving}
            skillsText={currentSkillsText}
            workExperienceText={currentWorkExperienceText}
            formDataExists={!!formData}
          />
          {/* Render actions only if data is loaded/generated */}
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

        {/* NEW: Container for Preview and Editor columns */}
        <div className="grid grid-cols-1  gap-6 max-w-6xl mx-auto px-6">
          {/* Left Column: Preview */}
          <div className="p-1 h-full flex flex-col">
            {/* Conditionally render the preview section */}
            {hasLoadedOrGeneratedData ? (
              <div className="flex flex-col flex-grow">
                <div className="flex-grow overflow-auto">
                  <ResumePreview
                    displayData={displayData}
                    resumeRef={resumeRef}
                    TemplateComponent={CurrentResumeTemplate}
                    isGenerating={isGenerating}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10 flex-grow flex items-center justify-center h-full border rounded bg-gray-50">
                {navigation.state !== "submitting" &&
                  navigation.state !== "loading" && (
                    <p>
                      Generate the resume sections using the button above to see a
                      preview and edit the structured data.
                    </p>
                  )}
                {(navigation.state === "submitting" ||
                  navigation.state === "loading") &&
                  !actionData?.success && (
                    <p>Loading or generating data...</p>
                  )}
              </div>
            )}

            <style>
              {`
                @page {
                  size: A4; /* Or Letter */
                  margin: 0;
                }
                @media print {
                  html, body {
                    /* Ensure html/body take up full print page height */
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box; /* Include padding/border in height */
                  }
                  body * {
                    visibility: hidden;
                  }
                  #printable-resume, #printable-resume * {
                    visibility: visible;
                  }
                  #printable-resume {
                    /* position: absolute;  REMOVED */
                    left: 0; 
                    top: 0;
                    width: 100%;
                    height: 100%; /* Make it fill the body height */
                    min-height: 100%; /* Ensure it at least fills */
                    box-shadow: none !important;
                    box-sizing: border-box;
                  }
                  /* Target the direct child (ResumeContainer) */
                  #printable-resume > .resume-container {
                      box-shadow: none !important;
                      height: auto !important; /* Override fixed screen height */
                      min-height: 100%; /* Fill the parent (#printable-resume) */
                      display: flex !important; /* Maintain flex */
                      flex-direction: column !important; /* Maintain flex direction */
                      width: 100% !important; /* Ensure full width */
                      box-sizing: border-box;
                  }
                  /* Target the inner flex container (holds sidebar and content) */
                  #printable-resume > .resume-container > .flex-row {
                      flex-grow: 1 !important; /* Allow inner container to grow */
                      height: 100% !important; /* Make this fill its flex parent */
                      box-sizing: border-box;
                  }
                   /* Target the right content area specifically */
                  #printable-resume .w-\[70\%\] {
                       flex-grow: 1 !important; /* Ensure right panel grows */
                       overflow: visible !important; /* Remove potential scrollbars for print */
                       /* Add page break avoidance if needed later */
                       /* page-break-inside: avoid; */
                   }
                  .page-layout-header, .page-layout-sidebar, .page-layout-bottom-bar {
                    display: none;
                   }
                   .page-layout-main {
                     width: 100%;
                     padding: 0;
                     margin: 0;
                   }
                   /* Ensure no shadow on nested divs either */
                   #printable-resume > div > div {
                      box-shadow: none !important;
                   }
                }
              `}
            </style>
          </div>

          {/* Right Column: Editor */}
          <div className="p-1 h-full flex flex-col">
            {/* Conditionally render the editor section */}
            {hasLoadedOrGeneratedData ? (
              <>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Edit Structured Data
                </h3>
                <input
                  type="hidden"
                  name="formData"
                  value={JSON.stringify(formData)}
                />
                <div className="jsonforms-wrapper overflow-y-auto flex-grow">
                  <JsonForms
                    schema={outputSchema as JsonSchema}
                    renderers={vanillaRenderers}
                    cells={vanillaCells}
                    data={formData}
                    onChange={({ data }) => setFormData(data)}
                  />
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
