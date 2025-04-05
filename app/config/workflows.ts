import type { WorkflowStep } from "../services/ai/types";
import { workflowSteps as defaultWorkflowSteps } from "./workflow-default";
import { workflowSteps as alternativeWorkflowSteps } from "./workflow-alternative";
import { workflowSteps as developerWorkflowSteps } from "./workflow-developer";
interface WorkflowConfig {
  label: string;
  steps: WorkflowStep[];
}

export const workflows: Record<string, WorkflowConfig> = {
  default: {
    label: "Default Workflow",
    steps: defaultWorkflowSteps,
  },
  alternative: {
    label: "Alternative Workflow",
    steps: alternativeWorkflowSteps,
  },
  developer: {
    label: "Developer Workflow",
    steps: developerWorkflowSteps,
  },
};

export const defaultWorkflowId = 'default'; 