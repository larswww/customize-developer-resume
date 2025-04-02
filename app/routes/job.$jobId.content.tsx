import { useState } from "react";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Await, useAsyncError } from "react-router";
import { StepErrorBoundary } from "../components/StepErrorBoundary";
import { workflowSteps } from "../config/workflow";
import type { WorkflowContext, WorkflowStep } from "../services/ai/types";
import { workHistory } from "../data/workHistory";
import { validateApiKeys } from "../services/workflow/workflow-service";
import { WorkflowEngine } from "../services/workflow/workflow-engine";
import dbService from "../services/db/dbService";

export function meta() {
  return [
    { title: "Generate Content" },
    { name: "description", content: "Generate targeted resume content using AI" },
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
  
  // Get workflow steps for this job
  const workflowStepsData = dbService.getWorkflowSteps(jobId);
  
  return { 
    job,
    workflowStepsData,
    totalSteps: workflowSteps.length
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobDescription = formData.get("jobDescription") as string;
  const relevant = formData.get("relevant") as string;

  const jobId = Number(params.jobId);

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
      error: `Missing required API keys: ${missingKeys.join(", ")}. Please check your environment configuration.`,
    };
  }

  try {
    // Always execute the full workflow on the server
    const engine = new WorkflowEngine(
      {
        anthropic: process.env.ANTHROPIC_API_KEY || "",
        openai: process.env.OPENAI_API_KEY || "",
        gemini: process.env.GEMINI_API_KEY || "",
      },
      workflowSteps as WorkflowStep[],
    );

    // Create initial context matching the WorkflowContext from ai/types
    const initialContext: WorkflowContext = {
      jobDescription,
      workHistory: JSON.stringify(workHistory),
      relevant: relevant || "",
      experience: JSON.stringify(workHistory),
      workExperience: JSON.stringify(workHistory),
      resume: "",
      intermediateResults: {},
    };

    // Execute all steps sequentially
    console.log("Starting workflow execution...");
    const finalContext = await engine.execute(initialContext);
    console.log("Workflow execution completed.", finalContext);

    // Save results of each completed step to the database
    console.log("Saving workflow step results to database...");
    for (const step of workflowSteps) {
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

    // Return the final context containing all results
    return {
      success: true,
      results: finalContext.intermediateResults,
      totalSteps: workflowSteps.length,
    };

  } catch (error) {
    console.error("Error in workflow action handler:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred during workflow execution",
    };
  }
}

export default function JobContent() {
  const { job, workflowStepsData } = useLoaderData<{
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
    totalSteps: number;
  }>();
  
  const [jobDescription, setJobDescription] = useState(job.jobDescription || "");
  const [relevantDescription, setRelevantDescription] = useState(job.relevantDescription || "");

  const actionData = useActionData<{
    success?: boolean;
    results?: Record<string, unknown>;
    error?: string;
    totalSteps?: number;
  }>();
  
  const navigation = useNavigation();

  // Use React Router's navigation state to determine if form is submitting
  const isSubmitting = navigation.state === "submitting";

  // Get the step name for display
  const getStepName = (stepId: string): string => {
    switch (stepId) {
      case "job-description-analysis":
        return "Analyze Description";
      case "extract-experience":
        return "Extract Experience";
      case "craft-resume":
        return "Craft Resume";
      case "background-info":
        return "Background Info";
      case "5-qualities-and-5-expertise":
        return "5 Qualities and 5 Expertise";
      case "write-cover-letter":
        return "Write Cover Letter";
      default:
        return stepId;
    }
  };

  // Updated function to render workflow steps based on actionData.results
  const renderWorkflowSteps = () => {
    // Display results from actionData if available, otherwise fallback to loader data (initial load)
    const resultsToShow = actionData?.results 
      ? actionData.results 
      : workflowStepsData.reduce((acc, step) => {
          acc[step.stepId] = step.result;
          return acc;
        }, {} as Record<string, unknown>);
        
    const statusesToShow = actionData?.results
      ? workflowSteps.reduce((acc, step) => {
          acc[step.id] = actionData.results?.[step.id] ? 'completed' : 'pending';
          return acc;
        }, {} as Record<string, string>)
      : workflowStepsData.reduce((acc, step) => {
          acc[step.stepId] = step.status;
          return acc;
        }, {} as Record<string, string>); 

    // Don't render anything if there are no results from action or loader
    if (Object.keys(resultsToShow).length === 0 && workflowStepsData.length === 0 && !actionData?.error) {
        if (navigation.state === "submitting" || navigation.state === "loading") {
             return (
                <div className="mb-8 grid grid-cols-2 gap-4">
                    {workflowSteps.map((step, index) => (
                        <div key={step.id} className="mb-4 border rounded p-4">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                                    {index + 1}
                                </div>
                                <h3 className="font-medium">{getStepName(step.id)}</h3>
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
                                    Processing {getStepName(step.id)}...
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null; // Nothing to show yet
    }

    return (
      <div className="mb-8 grid grid-cols-2 gap-4">
        {workflowSteps.map((step, index) => {
          const stepResult = resultsToShow[step.id];
          const stepStatus = statusesToShow[step.id] || 'pending'; 

          const isResultString = typeof stepResult === 'string';

          return (
            <div key={step.id} className="mb-4 border rounded p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                  {index + 1}
                </div>
                <h3 className="font-medium">{getStepName(step.id)}</h3>
              </div>

              {stepStatus === 'completed' && stepResult ? (
                <div className="p-3 rounded bg-green-50">
                  <div className="flex items-center text-green-700 mb-2">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Complete</span>
                  </div>
                  <div className="markdown-content max-h-64 overflow-y-auto">
                    {isResultString && (
                       <ReactMarkdown className="prose max-w-none">
                         {stepResult as string /* Cast to string after check */}
                       </ReactMarkdown>
                    )}
                    {!isResultString && (
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(stepResult, null, 2) as string}
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
                   { (navigation.state === "submitting" || navigation.state === "loading") && actionData === undefined ? (
                     <div className="animate-pulse flex space-x-4">
                       <div className="flex-1 space-y-4 py-1">
                         <div className="h-4 bg-gray-200 rounded w-3/4" />
                         <div className="space-y-2">
                           <div className="h-4 bg-gray-200 rounded" />
                           <div className="h-4 bg-gray-200 rounded w-5/6" />
                         </div>
                       </div>
                     </div>
                   ) : ( <p className="text-gray-500">Not yet processed</p> ) }
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generate Content for {job.title}</h1>
        <div className="flex gap-2">
          <Link 
            to="/dashboard" 
            className="px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <Link
            to={`/job/${job.id}/resume`}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Create Resume
          </Link>
        </div>
      </div>

      <Form method="post" className="mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="jobDescription" className="block mb-2 font-medium">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-48 p-2 border rounded"
              placeholder="Paste the job description here..."
            />
          </div>

          <div>
            <label htmlFor="relevant" className="block mb-2 font-medium">
              Relevant Description (Optional)
            </label>
            <textarea
              id="relevant"
              name="relevant"
              value={relevantDescription}
              onChange={(e) => setRelevantDescription(e.target.value)}
              className="w-full h-48 p-2 border rounded"
              placeholder="What kind of experience is relevant for this role? (Optional)"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Generate All Sections"}
          </button>
        </div>
      </Form>

      {renderWorkflowSteps()}

      {actionData?.error && (
        <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
          {actionData.error}
        </div>
      )}

      {actionData?.success && actionData.results?.['craft-resume'] && (
         <div className="mt-4 flex justify-end">
            <Link
              to={`/job/${job.id}/resume`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Resume from Content
            </Link>
          </div>
      )}
    </div>
  );
} 