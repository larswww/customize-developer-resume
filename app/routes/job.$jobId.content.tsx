import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { workflows, defaultWorkflowId } from "../config/workflows";
import type { WorkflowContext, WorkflowStep } from "../services/ai/types";
import { validateApiKeys } from "../services/workflow/workflow-service";
import { WorkflowEngine } from "../services/workflow/workflow-engine";
import dbService from "../services/db/dbService";
import { JobControlsHeader } from "../components/JobControlsHeader";

// --- NEW: Template Imports --- 
import {
  availableTemplates,
  defaultTemplateId,
  type ResumeTemplateConfig // Import interface
} from "../templates";
// --- End NEW --- 

export function meta() {
  return [
    { title: "Generate Content" },
    { name: "description", content: "Generate targeted resume content using AI" },
  ];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  const url = new URL(request.url);
  const selectedWorkflowId = url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId = url.searchParams.get("template") || defaultTemplateId; // <-- Get template ID

  if (Number.isNaN(jobId)) {
    throw new Response("Invalid job ID", { status: 400 });
  }
  
  // Get job from database
  const job = dbService.getJob(jobId);
  
  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }
  
  // Get workflow steps for this job
  const workflowStepsData = dbService.getWorkflowSteps(jobId);
  
  // Get the selected workflow configuration
  const selectedWorkflow = workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
	throw new Error(`Default workflow '${defaultWorkflowId}' not found.`);
  }
  
  // --- NEW: Get Template Config --- 
  const selectedTemplateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
      // This case should ideally not happen if defaultTemplateId is valid
      throw new Error("Default template config not found.");
  }
  // --- End NEW ---
  
  // Prepare list of available workflows for dropdown
  const availableWorkflows = Object.entries(workflows).map(([id, config]: [string, { label: string }]) => ({
	id,
	label: config.label,
  }));

  // --- NEW: Get Template List --- 
  const templatesList = Object.values(availableTemplates).map((config: ResumeTemplateConfig) => ({
    id: config.id,
    name: config.name,
  }));
  // --- End NEW ---

  return {
    job,
    workflowStepsData,
	selectedWorkflowId: selectedWorkflowId,
	currentWorkflowSteps: selectedWorkflow.steps,
    totalSteps: selectedWorkflow.steps.length,
	availableWorkflows,
    selectedTemplateId, // <-- Pass template ID
    templatesList,      // <-- Pass template list
    templateDescription: selectedTemplateConfig.description, // <-- Pass template description
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobDescription = formData.get("jobDescription") as string;
  const relevant = formData.get("relevant") as string;
  const workflowId = (formData.get("workflowId") as string) || defaultWorkflowId;
  const jobId = Number(params.jobId);

  // --- NEW: Get Selected Template ID and Description --- 
  // Template selection is controlled by URL param, read it here for context
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template") || defaultTemplateId;
  const templateConfig = availableTemplates[templateId] ?? availableTemplates[defaultTemplateId];
  if (!templateConfig) {
    // Handle error: Template config not found
    return { success: false, error: `Template config '${templateId}' not found.` };
  }
  const templateDescription = templateConfig.description;
  // --- End NEW ---

  if (Number.isNaN(jobId)) {
    return {
      success: false,
      error: "Invalid job ID"
    };
  }

  const job = dbService.getJob(jobId);

  if (!job) {
    return {
      success: false,
      error: "Job not found"
    };
  }

  // Update the job with the new job description and relevant text
  dbService.updateJob({
    ...job,
    jobDescription,
    relevantDescription: relevant || ""
  });

  // Validate API keys
  const { missingKeys, isValid } = validateApiKeys();

  if (!isValid) {
    return {
      success: false,
      error: `Missing required API keys: ${missingKeys.join(", ")}. Please check your environment configuration.` ,
    };
  }
  
  // Get the selected workflow steps
  const selectedWorkflow = workflows[workflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
	return {
      success: false,
	  error: `Selected workflow '${workflowId}' not found.`,
	};
  }
  const currentWorkflowSteps = selectedWorkflow.steps;


  try {
    // Always execute the full workflow on the server
    const engine = new WorkflowEngine(
      {
        anthropic: process.env.ANTHROPIC_API_KEY || "",
        openai: process.env.OPENAI_API_KEY || "",
        gemini: process.env.GEMINI_API_KEY || "",
      },
      currentWorkflowSteps,
    );

    const workHistory = dbService.getWorkHistory();

    // Create initial context matching the WorkflowContext from ai/types
    const initialContext: WorkflowContext = {
      jobDescription,
      workHistory: JSON.stringify(workHistory),
      templateDescription: templateDescription,
      relevant: relevant,
      intermediateResults: {},
    };

    // Execute all steps sequentially
    console.log(`Starting workflow execution (${workflowId})...`);
    const finalContext = await engine.execute(initialContext);
    console.log(`Workflow execution completed (${workflowId}).`, finalContext);

    // Save results of each completed step to the database
    console.log("Saving workflow step results to database...");
    for (const step of currentWorkflowSteps) {
      const result = finalContext.intermediateResults[step.id];
      if (result !== undefined) {
        try {
          dbService.saveWorkflowStep({
            jobId,
            stepId: step.id,
            result: String(result),
            status: "completed"
          });
          console.log(`Saved result for step: ${step.id}`);
        } catch (dbError) {
          console.error(`Failed to save result for step ${step.id}:`, dbError);
        }
      } else {
		// Optionally save a 'pending' or 'skipped' status if needed
		// console.log(`No result found for step: ${step.id}, skipping save.`);
	  }
    }
    console.log("Finished saving workflow step results.");

    // Return the final context containing all results
    return {
      success: true,
      results: finalContext.intermediateResults,
      totalSteps: currentWorkflowSteps.length,
	  selectedWorkflowId: workflowId,
    };

  } catch (error) {
    console.error(`Error in workflow action handler (${workflowId}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred during workflow execution",
	  selectedWorkflowId: workflowId,
    };
  }
}

interface LoaderData {
  job: {
    id: number;
    title: string;
    jobDescription: string;
    relevantDescription: string;
  };
  workflowStepsData: Array<{
    stepId: string;
    result: string;
    status: string;
  }>;
  selectedWorkflowId: string;
  currentWorkflowSteps: WorkflowStep[];
  totalSteps: number;
  availableWorkflows: Array<{ id: string; label: string }>;
  selectedTemplateId: string;
  templatesList: Array<{ id: string; name: string }>;
  templateDescription: string;
}

interface ActionData {
  success?: boolean;
  results?: Record<string, unknown>;
  error?: string;
  totalSteps?: number;
  selectedWorkflowId?: string;
}


export default function JobContent() {
  const {
	job,
	workflowStepsData,
	selectedWorkflowId: initialSelectedWorkflowId,
	currentWorkflowSteps,
	totalSteps,
	availableWorkflows,
    selectedTemplateId: initialSelectedTemplateId,
    templatesList,
    templateDescription
  } = useLoaderData<LoaderData>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialSelectedWorkflowId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialSelectedTemplateId);

  const [jobDescription, setJobDescription] = useState(job.jobDescription || "");
  const [relevantDescription, setRelevantDescription] = useState(job.relevantDescription || "");

  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleWorkflowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkflowId = event.target.value;
    setSelectedWorkflowId(newWorkflowId);
    setSearchParams({ workflow: newWorkflowId, template: selectedTemplateId }, { replace: true });
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = event.target.value;
    setSelectedTemplateId(newTemplateId);
    setSearchParams({ workflow: selectedWorkflowId, template: newTemplateId }, { replace: true });
  };

  const getStepName = (stepId: string): string => {
    const step = (workflows[selectedWorkflowId]?.steps ?? currentWorkflowSteps).find(s => s.id === stepId);
    return step?.name || stepId;
  };

  const renderWorkflowSteps = () => {
    const relevantWorkflowId = actionData?.selectedWorkflowId ?? selectedWorkflowId;
    const stepsToRender = workflows[relevantWorkflowId]?.steps ?? currentWorkflowSteps;

    const resultsToShow = actionData?.results
      ? actionData.results
      : workflowStepsData.reduce((acc, step) => {
          acc[step.stepId] = step.result;
          return acc;
        }, {} as Record<string, unknown>);

    const statusesToShow = actionData?.results
      ? stepsToRender.reduce((acc, step) => {
          acc[step.id] = actionData.results?.[step.id] !== undefined ? 'completed' : 'pending';
          return acc;
        }, {} as Record<string, string>)
      : workflowStepsData.reduce((acc, step) => {
          acc[step.stepId] = step.status;
          return acc;
        }, {} as Record<string, string>);

    if (Object.keys(resultsToShow).length === 0 && workflowStepsData.length === 0 && !actionData?.error && navigation.state !== "submitting" && navigation.state !== "loading") {
        return null;
    }

	if (navigation.state === "submitting" || navigation.state === "loading") {
		return (
		   <div className="mb-8 grid grid-cols-2 gap-4">
			   {stepsToRender.map((step, index) => (
				   <div key={step.id} className="mb-4 border rounded p-4">
					   <div className="flex items-center mb-2">
						   <div className={`w-8 h-8 flex items-center justify-center rounded-full ${navigation.formData?.get('workflowId') === step.id ? 'bg-blue-200 animate-spin' : 'bg-blue-100'} mr-2`}>
							   {index + 1}
						   </div>
						   <h3 className="font-medium">{step.name}</h3>
					   </div>
					   <div className="p-3 rounded bg-gray-50">
						   <div className="animate-pulse flex space-x-4">
							   <div className="flex-1 space-y-4 py-1">
								   <div className="h-4 bg-gray-200 rounded w-3/4" />
								   <div className="space-y-2">
									   <div className="h-4 bg-gray-200 rounded" />
									   <div className="h-4 bg-gray-200 rounded w-5/6" />
								   </div>
							   </div>
						   </div>
						   <div className="mt-2 text-sm text-gray-500">
							   Processing {step.name}...
						   </div>
					   </div>
				   </div>
			   ))}
		   </div>
	   );
   }

    return (
      <div className="mb-8 grid grid-cols-2 gap-4">
        {stepsToRender.map((step, index) => {
          const stepResult = resultsToShow[step.id];
          const stepStatus = statusesToShow[step.id] || 'pending';

          const isResultString = typeof stepResult === 'string';

          return (
            <div key={step.id} className="mb-4 border rounded p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                  {index + 1}
                </div>
                <h3 className="font-medium">{step.name}</h3>
              </div>

              {stepStatus === 'completed' && stepResult !== undefined ? (
                <div className="p-3 rounded bg-green-50">
                  <div className="flex items-center text-green-700 mb-2">
                    <span>Complete</span>
                  </div>
                  <div className="markdown-content">
                    {isResultString ? (
                       <ReactMarkdown className="prose max-w-none">
                         {stepResult as string}
                       </ReactMarkdown>
                    ) : (
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(stepResult, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ) : stepStatus === 'error' ? (
                 <div className="p-3 rounded bg-red-50">
                   <p className="text-red-600">Error processing step.</p>
                 </div>
              ) : (
                <div className="p-3 rounded bg-gray-50">
                   <p className="text-gray-500">Not yet processed</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-6 mb-6 flex justify-between items-start">
         <div>
           <h1 className="text-2xl font-bold">{`Content Generation for ${job.title}`}</h1>
           <div className="text-sm text-gray-500 flex gap-4">
             <span>Workflow: {workflows[selectedWorkflowId]?.label || 'Unknown'}</span>
             <span>Template: {availableTemplates[selectedTemplateId]?.name || 'Unknown'}</span>
           </div>
         </div>
         <div className="flex gap-2 flex-shrink-0">
            <Link
              to={`/job/${job.id}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              View/Edit Resume
            </Link>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
            >
              Back to Dashboard
            </Link>
         </div>
      </div>

      <Form method="post" className="max-w-6xl mx-auto px-6">
         <input type="hidden" name="workflowId" value={selectedWorkflowId} />

         <JobControlsHeader
           availableWorkflows={availableWorkflows}
           currentWorkflowId={selectedWorkflowId}
           onWorkflowChange={handleWorkflowChange}
           workflowLabel="Select Content Generation Workflow"
           availableTemplates={templatesList}
           currentTemplateId={selectedTemplateId}
           onTemplateChange={handleTemplateChange}
           templateLabel="Target Resume Template"
         />

         <div className="mb-4">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea id="jobDescription" name="jobDescription" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={10} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
         </div>
         <div className="mb-6">
             <label htmlFor="relevant" className="block text-sm font-medium text-gray-700">Customization instructions</label>
             <textarea id="relevant" name="relevant" value={relevantDescription} onChange={(e) => setRelevantDescription(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Optionally add specific details, keywords, or experiences to highlight..." />
         </div>
         
         <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center">
             {isSubmitting ? 'Generating...' : 'Generate Content Steps'}
             {isSubmitting && 
               <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                 <title>Loading spinner</title>
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
               </svg>
             }
         </button>
      </Form>

      <div className="max-w-6xl mx-auto px-6 mt-8">
         <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
         {actionData?.error && (
             <div className="mb-4 p-4 border rounded bg-red-50 text-red-700">
                 Error: {actionData.error}
             </div>
         )}
         {isSubmitting && (
            <p>Generating content for {totalSteps} steps...</p>
         )}
         {!isSubmitting && (
           <div className="space-y-6">
             {renderWorkflowSteps()}
           </div>
         )}
      </div>
    </>
  );
} 