import { useState } from "react";
import { Outlet, useLoaderData, useSearchParams, useLocation } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Link } from "~/components/ui/Link";
import { JobControlsHeader } from "../components/JobControlsHeader";
import dbService from "../services/db/dbService";
import { workflows, defaultWorkflowId } from "../config/workflows.config";
import { availableTemplates, defaultTemplateId, type ResumeTemplateConfig } from "../config/templates";

export function meta() {
  return [
    { title: "Resume Builder" },
    { name: "description", content: "Generate targeted resume content using AI" },
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
  
  const selectedWorkflow = workflows[selectedWorkflowId] ?? workflows[defaultWorkflowId];
  if (!selectedWorkflow) {
    throw new Error(`Default workflow '${defaultWorkflowId}' not found.`);
  }
  
  const selectedTemplateConfig = availableTemplates[selectedTemplateId] ?? availableTemplates[defaultTemplateId];
  if (!selectedTemplateConfig) {
    throw new Error("Default template config not found.");
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
    selectedWorkflowId,
    currentWorkflowSteps: selectedWorkflow.steps,
    availableWorkflows,
    selectedTemplateId,
    templatesList,
    templateDescription: selectedTemplateConfig.description,
  };
}

export default function JobLayout() {
  const {
    job,
    selectedWorkflowId: initialSelectedWorkflowId,
    availableWorkflows,
    selectedTemplateId: initialSelectedTemplateId,
    templatesList,
  } = useLoaderData<{
    job: { id: number; title: string };
    selectedWorkflowId: string;
    availableWorkflows: Array<{ id: string; label: string }>;
    selectedTemplateId: string;
    templatesList: Array<{ id: string; name: string }>;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialSelectedWorkflowId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialSelectedTemplateId);
  const location = useLocation();

  const isContentRoute = location.pathname.endsWith('/content');
  const isResumeRoute = location.pathname.endsWith('/resume');

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

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">{`${job.title}`}</h1>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                variant="secondary"
                size="md"
              >
                Back to Dashboard
              </Link>
              
      
              
     
            </div>
          </div>
          <div className="mt-4">
            <JobControlsHeader
              availableWorkflows={availableWorkflows}
              currentWorkflowId={selectedWorkflowId}
              onWorkflowChange={handleWorkflowChange}
              workflowLabel="Select Content Generation Workflow"
              availableTemplates={templatesList}
              currentTemplateId={selectedTemplateId}
              onTemplateChange={handleTemplateChange}
              templateLabel="Target Resume Template"
              compact={false}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <Outlet context={{ selectedWorkflowId, selectedTemplateId }} />
      </div>
    </>
  );
} 