import type { WorkflowStep } from "../services/ai/types";
import { workflowSteps as defaultWorkflowSteps } from "./workflows/workflow-default";
import { workflowSteps as alternativeWorkflowSteps } from "./workflows/workflow-alternative";
import { workflowSteps as developerWorkflowSteps } from "./workflows/workflow-developer";
import { workflowSteps as testWorkflowSteps } from "./workflows/workflow-test";
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
  test: {
    label: "Test Parallel Workflow",
    steps: testWorkflowSteps,
  },
};

export const defaultWorkflowId = 'default'; 