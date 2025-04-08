import { useRef } from "react";
import {
  Form,
  useNavigation,
  useOutletContext,
  redirect,
  Outlet,
} from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { workflows, defaultWorkflowId } from "../config/workflows.config";
import { executeWorkflow } from "../services/workflow/workflow-service";
import dbService from "../services/db/dbService";
import { LoadingSpinnerIcon, MagicWandIcon, RetryIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import { availableTemplates, defaultTemplateId } from "../config/templates";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import { WorkflowSteps } from "~/components/WorkflowSteps";
import { Collapsible } from "~/components/Collapsible";
import type { Route } from "./+types/content";
import text from "~/text";

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

  // Get workflow steps for the specific workflow
  const workflowStepsData = dbService.getWorkflowSteps(
    jobId,
    selectedWorkflowId
  );

  const selectedWorkflow =
    workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
    throw new Error(`Default workflow '${defaultWorkflowId}' not found.`);
  }

  const selectedTemplateConfig =
    availableTemplates[selectedTemplateId] ??
    availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
    throw new Error("Default template config not found.");
  }

  // Check if the workflow is complete and redirect to resume if it is
  const isWorkflowComplete =
    selectedWorkflow.steps.length > 0 &&
    workflowStepsData.length === selectedWorkflow.steps.length &&
    workflowStepsData.every((step) => step.status === "success");

  const isOnResume = url.pathname.includes("/resume");
  if (isWorkflowComplete && !isOnResume) {
    return redirect(
      `/job/${jobId}/resume?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`
    );
  }

  if (!isWorkflowComplete && isOnResume) {
    return redirect(
      `/job/${jobId}/?workflow=${selectedWorkflowId}&template=${selectedTemplateId}`
    );
  }

  return {
    job,
    workflowStepsData,
    isWorkflowComplete,
    currentWorkflowSteps: selectedWorkflow.steps,
    totalSteps: selectedWorkflow.steps.length,
    templateDescription: selectedTemplateConfig.description,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobDescription = formData.get("jobDescription") as string;
  const relevant = formData.get("relevant") as string;
  const workflowId =
    (formData.get("workflowId") as string) || defaultWorkflowId;
  const jobId = Number(params.jobId);

  const url = new URL(request.url);
  const templateId = url.searchParams.get("template") || defaultTemplateId;
  const templateConfig =
    availableTemplates[templateId] ?? availableTemplates[defaultTemplateId];
  if (!templateConfig) {
    return {
      success: false,
      error: `Template config '${templateId}' not found.`,
    };
  }
  const templateDescription = templateConfig.description;

  if (Number.isNaN(jobId)) {
    return {
      success: false,
      error: "Invalid job ID",
    };
  }

  const job = dbService.getJob(jobId);

  if (!job) {
    return {
      success: false,
      error: "Job not found",
    };
  }

  if (!jobDescription) {
    return {
      success: false,
      error: "Please add a job description to generate resume",
    };
  }

  dbService.updateJob({
    ...job,
    jobDescription,
    relevantDescription: relevant || "",
  });

  const selectedWorkflow =
    workflows[workflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
    return {
      success: false,
      error: `Selected workflow '${workflowId}' not found.`,
    };
  }

  try {
    console.log(`Starting workflow execution (${workflowId})...`);

    const { success } = await executeWorkflow(
      jobDescription,
      jobId,
      workflowId,
      templateDescription
    );

    return {
      success: success,
      selectedWorkflowId: workflowId,
      error: success ? undefined : "Workflow execution failed.",
    };
  } catch (error) {
    console.error(`Error in workflow action handler (${workflowId}):`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during workflow execution",
      selectedWorkflowId: workflowId,
    };
  }
}

interface OutletContextType {
  selectedWorkflowId: string;
  selectedTemplateId: string;
  isWorkflowComplete: boolean;
}

export default function JobContent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    job,
    workflowStepsData,
    currentWorkflowSteps,
    isWorkflowComplete,
  } = loaderData;

  const { selectedWorkflowId, selectedTemplateId } =
    useOutletContext<OutletContextType>();
  const jobDescEditorRef = useRef<MDXEditorMethods | null>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const contentHeight = "min-h-[200px]";

  const hasWorkflowSteps = workflowStepsData.length > 0;

  return (
    <>
      <Form method="post" className="py-4">
        <input type="hidden" name="workflowId" value={selectedWorkflowId} />
        <Collapsible
          title="Job Description"
          className="mb-6"
          defaultOpen={true}
        >
          <div className="min-h-[250px]">
            <ClientMarkdownEditor
              name="jobDescription"
              markdown={job.jobDescription || ""}
              editorRef={jobDescEditorRef}
              placeholder="Paste job description here..."
            />
          </div>
        </Collapsible>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 font-semibold"
          >
            {isSubmitting ? (
              <LoadingSpinnerIcon size="md" />
            ) : isWorkflowComplete ? (
              <RetryIcon size="md" />
            ) : (
              <MagicWandIcon size="md" />
            )}
            {isSubmitting
              ? text.ui.generating
              : isWorkflowComplete
              ? text.content.regenerateButton
              : text.content.generateButton}
          </Button>
        </div>
      </Form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Generated Content</h2>

        {actionData?.error && (
          <div className="mb-4 p-4 border rounded bg-red-50 text-red-700">
            Error: {actionData.error}
          </div>
        )}

        {hasWorkflowSteps && (
          <WorkflowSteps
            stepsToRender={currentWorkflowSteps}
            workflowStepsData={workflowStepsData}
            height={contentHeight}
            isComplete={isWorkflowComplete}
          />
        )}
      </div>
      <Outlet
        context={{ selectedWorkflowId, selectedTemplateId, isWorkflowComplete }}
      />
    </>
  );
}
