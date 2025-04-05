import {  useRef } from "react";
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, redirect, Outlet } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { workflows, defaultWorkflowId } from "../config/workflows";
import type { WorkflowContext, WorkflowStep } from "../services/ai/types";
import { validateApiKeys } from "../services/workflow/workflow-service";
import { WorkflowEngine } from "../services/workflow/workflow-engine";
import dbService from "../services/db/dbService";
import { LoadingSpinnerIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import { availableTemplates, defaultTemplateId } from "../templates";
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import { WorkflowSteps } from "~/components/WorkflowSteps";
import { Collapsible } from "~/components/Collapsible";

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

  const workflowStepsData = dbService.getWorkflowSteps(jobId);
  
  const selectedWorkflow = workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
	throw new Error(`Default workflow '${defaultWorkflowId}' not found.`);
  }
  
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
      relevant: ' ',
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

  const { selectedWorkflowId, selectedTemplateId } = useOutletContext<OutletContextType>();
  const jobDescEditorRef = useRef<MDXEditorMethods | null>(null);

  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

  const getWorkflowData = () => {
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

    const showSteps = !(Object.keys(resultsToShow).length === 0 && 
                      workflowStepsData.length === 0 && 
                      !actionData?.error && 
                      navigation.state !== "submitting" && 
                      navigation.state !== "loading");

    return {
      stepsToRender,
      resultsToShow,
      statusesToShow,
      showSteps,
      isLoading: navigation.state === "submitting" || navigation.state === "loading"
    };
  };

  return (
    <>
      <Form method="post" className="py-4" onSubmit={handleFormSubmit}>
         <input type="hidden" name="workflowId" value={selectedWorkflowId} />
         <input type="hidden" name="jobDescription" id="jobDescription" />

         <Collapsible title="Job Description" className="mb-6" defaultOpen={true}>
           <div className="min-h-[250px]">
             <ClientMarkdownEditor
               markdown={job.jobDescription || ""}
               editorRef={jobDescEditorRef}
               placeholder="Paste job description here..."
             />
           </div>
         </Collapsible>

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
             {getWorkflowData().showSteps && (
               <WorkflowSteps
                 stepsToRender={getWorkflowData().stepsToRender}
                 resultsToShow={getWorkflowData().resultsToShow}
                 statusesToShow={getWorkflowData().statusesToShow}
                 isLoading={getWorkflowData().isLoading}
               />
             )}
           </div>
         )}
      </div>
      <Outlet context={{ selectedWorkflowId, selectedTemplateId }} />
    </>
  );
} 