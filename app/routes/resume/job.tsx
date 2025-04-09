import {
  Outlet,
  redirect,
  useSearchParams,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Link } from "~/components/ui/Link";
import { JobControlsHeader } from "../../components/JobControlsHeader";
import { workflows } from "../../config/workflows";
import {
  availableTemplates,
  type ResumeTemplateConfig,
} from "../../config/templates";
import type { Route } from "./+types/job";
import type { RouteOutletContext } from "~/routes/resume/types";
import { extractRouteParams, getWorkflow } from "~/routes/resume/utils";

export function meta() {
  return [
    { title: "Resume Builder" },
    {
      name: "description",
      content: "Generate targeted resume content using AI",
    },
  ];
}

// Define a route ID for child routes to access data
export const JOB_ROUTE_ID = "routes/job";

export async function loader(args: LoaderFunctionArgs) {
  // Extract common parameters
  const {
    job,
    jobId,
    selectedWorkflowId,
    selectedTemplateId,
    selectedTemplateConfig
  } = await extractRouteParams(args);

  const { selectedWorkflow, isWorkflowComplete, workflowStepsData } = await getWorkflow(job.id, selectedWorkflowId);

  const url = new URL(args.request.url);
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

  // Additional job-specific data processing
  const availableWorkflows = Object.entries(workflows).map(
    ([id, config]: [string, { label: string }]) => ({
      id,
      label: config.label,
    })
  );

  const templatesList = Object.values(availableTemplates).map(
    (config: ResumeTemplateConfig) => ({
      id: config.id,
      name: config.name,
    })
  );

  return {
    job,
    selectedWorkflowId,
    currentWorkflowSteps: selectedWorkflow.steps,
    availableWorkflows,
    selectedTemplateId,
    templatesList,
    templateDescription: selectedTemplateConfig.description,
    isWorkflowComplete,
    workflowStepsData,
  };
}

export default function JobLayout({ loaderData }: Route.ComponentProps) {
  const {
    job,
    selectedWorkflowId,
    currentWorkflowSteps,
    availableWorkflows,
    selectedTemplateId,
    templatesList,
    templateDescription,
    isWorkflowComplete,
    workflowStepsData,
  } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams((prev) => {
      prev.set(event.target.name, event.target.value);
      return prev;
    });
  };

  // Enhanced context with more shared data
  const outletContext: RouteOutletContext = {
    selectedWorkflowId,
    selectedTemplateId,
    isWorkflowComplete,
    currentWorkflowSteps,
    templateDescription,
    job,
    workflowStepsData,
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{`${job.title}`}</h1>
            <div className="flex gap-3">
              <Link to="/dashboard" variant="secondary" size="md">
                Back to Dashboard
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <JobControlsHeader
              availableWorkflows={availableWorkflows}
              currentWorkflowId={selectedWorkflowId}
              onWorkflowChange={handleChange}
              workflowLabel="Select Content Generation Workflow"
              availableTemplates={templatesList}
              currentTemplateId={selectedTemplateId}
              onTemplateChange={handleChange}
              templateLabel="Target Resume Template"
              compact={false}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <Outlet context={outletContext} />
      </div>
    </>
  );
}
