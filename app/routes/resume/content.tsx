import { useRef } from "react";
import {
  Form,
  useNavigation,
  useOutletContext,
  Outlet,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { LoadingSpinnerIcon, MagicWandIcon, RetryIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import { WorkflowSteps } from "~/components/WorkflowSteps";
import { Collapsible } from "~/components/Collapsible";
import type { Route } from "./+types/content";
import type { RouteOutletContext } from "~/routes/resume/types";
import text from "~/text";
import { 
  handleContentAction, 
} from "~/routes/resume/utils";

export async function action(args: ActionFunctionArgs) {
  return handleContentAction(args);
}

export default function JobContent({
  actionData,
}: Route.ComponentProps) {
  const parentContext = useOutletContext<RouteOutletContext>();
  const { 
    selectedWorkflowId, 
    isWorkflowComplete, 
    job, 
    currentWorkflowSteps,
    workflowStepsData 
  } = parentContext;
  
  const jobDescEditorRef = useRef<MDXEditorMethods | null>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const contentHeight = "min-h-[200px]";

  const hasWorkflowSteps = workflowStepsData && workflowStepsData.length > 0;

  const nestedOutletContext = {
    ...parentContext,
    isWorkflowComplete,
  };

  return (
    <>
      <Form method="post" className="py-4">
        <input type="hidden" name="workflowId" value={selectedWorkflowId} />
        <Collapsible
          title="Job Description"
          className="mb-6"
          defaultOpen={false}
        >
          <div className="min-h-[250px]">
            <ClientMarkdownEditor
              name="jobDescription"
              markdown={job?.jobDescription || ""}
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
            stepsToRender={currentWorkflowSteps || []}
            workflowStepsData={workflowStepsData || []}
            height={contentHeight}
            isComplete={isWorkflowComplete}
          />
        )}
      </div>
      <Outlet context={nestedOutletContext} />
    </>
  );
}
