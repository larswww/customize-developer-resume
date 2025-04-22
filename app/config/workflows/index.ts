import type { WorkflowStep } from "../../services/ai/types";
import { workflowSteps as alternativeWorkflowSteps } from "./alternative";
import { workflowSteps as defaultWorkflowSteps } from "./default";
import { workflowSteps as developerWorkflowSteps } from "./developer";
import { workflowSteps as instructionsWorkflowSteps } from "./instructions";
import { workflowSteps as testWorkflowSteps } from "./test";
import { workflowSteps as simpleConsultantWorkflowSteps } from "./simple-consultant";
export type WorkflowConfig = {
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
	instructions: {
		label: "Instructions Workflow",
		steps: instructionsWorkflowSteps,
	},
	simpleConsultant: {
		label: "Simple Consultant Workflow",
		steps: simpleConsultantWorkflowSteps,
	},
};

export const defaultWorkflowId = "default";
