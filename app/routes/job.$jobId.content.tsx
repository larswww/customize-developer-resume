import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, redirect, Outlet } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { workflows, defaultWorkflowId } from "../config/workflows.config";
import type { WorkflowContext, WorkflowStep } from "../services/ai/types";
import { validateApiKeys } from "../services/workflow/workflow-service";
import { WorkflowEngine } from "../services/workflow/workflow-engine";
import dbService from "../services/db/dbService";
import { LoadingSpinnerIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import { availableTemplates, defaultTemplateId } from "../config/templates";
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MarkdownEditor } from "~/components/MarkdownEditor";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  const url = new URL(request.url);
  const selectedWorkflowId = url.searchParams.get("workflow") || defaultWorkflowId;
  const selectedTemplateId = url.searchParams.get("template") || defaultTemplateId;

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
  
  // Get Template Config 
  const selectedTemplateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
      throw new Error("Default template config not found.");
  }

  return {
    job,
    workflowStepsData,
    currentWorkflowSteps: selectedWorkflow.steps,
    totalSteps: selectedWorkflow.steps.length,
    templateDescription: selectedTemplateConfig.description,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobDescription = formData.get("jobDescription") as string;
  const relevant = formData.get("relevant") as string;
  const workflowId = (formData.get("workflowId") as string) || defaultWorkflowId;
  const jobId = Number(params.jobId);

  // Get Selected Template ID and Description 
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template") || defaultTemplateId;
  const templateConfig = availableTemplates[templateId] ?? availableTemplates[defaultTemplateId];
  if (!templateConfig) {
    return { success: false, error: `Template config '${templateId}' not found.` };
  }
  const templateDescription = templateConfig.description;

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
      }
    }
    console.log("Finished saving workflow step results.");

    // Redirect to the resume page after successful generation
    return redirect(`/job/${jobId}/resume?workflow=${workflowId}&template=${templateId}`);

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
  currentWorkflowSteps: WorkflowStep[];
  totalSteps: number;
  templateDescription: string;
}

interface ActionData {
  success?: boolean;
  results?: Record<string, unknown>;
  error?: string;
  totalSteps?: number;
  selectedWorkflowId?: string;
}

interface OutletContextType {
  selectedWorkflowId: string;
  selectedTemplateId: string;
}

export default function JobContent() {
  const {
    job,
    workflowStepsData,
    currentWorkflowSteps,
    totalSteps,
  } = useLoaderData<LoaderData>();

  // Get context from parent layout
  const { selectedWorkflowId, selectedTemplateId } = useOutletContext<OutletContextType>();

  const [jobDescription, setJobDescription] = useState(job.jobDescription || "");
  const [relevantDescription, setRelevantDescription] = useState(job.relevantDescription || "");
  const [isClient, setIsClient] = useState(false);
  
  // Create ref for the markdown editor
  const jobDescEditorRef = useRef<MDXEditorMethods | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const getStepName = (stepId: string): string => {
    const step = (workflows[selectedWorkflowId]?.steps ?? currentWorkflowSteps).find(s => s.id === stepId);
    return step?.name || stepId;
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Get editor content and update form data before submission
    if (jobDescEditorRef.current) {
      const markdown = jobDescEditorRef.current.getMarkdown();
      const jobDescInput = event.currentTarget.elements.namedItem("jobDescription") as HTMLInputElement;
      if (jobDescInput) {
        jobDescInput.value = markdown;
      }
    }
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
      <Form method="post" className="py-4" onSubmit={handleFormSubmit}>
         <input type="hidden" name="workflowId" value={selectedWorkflowId} />
         <input type="hidden" name="jobDescription" id="jobDescription" />

         <div className="mb-4">
            <label htmlFor="jobEditor" className="block text-sm font-medium text-gray-700">Job Description</label>
            <div className="mt-1 min-h-[250px]">
              <MarkdownEditor
                markdown={jobDescription}
                onChange={(markdown: string) => setJobDescription(markdown)}
                editorRef={jobDescEditorRef}
                isClient={isClient}
                placeholder="Paste job description here..."
              />
            </div>
         </div>
         <div className="mb-6">
             <label htmlFor="relevant" className="block text-sm font-medium text-gray-700">Customization instructions</label>
             <textarea id="relevant" name="relevant" value={relevantDescription} onChange={(e) => setRelevantDescription(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Optionally add specific details, keywords, or experiences to highlight..." />
         </div>
         
         <Button 
           type="submit" 
           disabled={isSubmitting} 
           variant="primary"
           size="md"
           className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
         >
           {isSubmitting ? 'Generating...' : 'Generate Content Steps'}
           {isSubmitting && <LoadingSpinnerIcon />}
         </Button>
      </Form>

      <div className="mt-8">
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
      <Outlet context={{ selectedWorkflowId, selectedTemplateId }} />
    </>
  );
} 