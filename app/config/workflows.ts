import type { WorkflowStep } from "../services/ai/types";
import { workflowSteps as defaultWorkflowSteps } from "./workflow-default";
import { workflowSteps as alternativeWorkflowSteps } from "./workflow-alternative";

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
};

export const defaultWorkflowId = 'default'; 