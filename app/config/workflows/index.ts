import type { WorkflowStep } from "../../services/ai/types";
import { workflowSteps as alternativeWorkflowSteps } from "./alternative";
import { workflowSteps as defaultWorkflowSteps } from "./default";
import { workflowSteps as defaultAltWorkflowSteps } from "./default-alt";
import { workflowSteps as developerWorkflowSteps } from "./developer";
import { workflowSteps as instructionsWorkflowSteps } from "./instructions";
import { workflowSteps as onePagerWorkflowSteps } from "./one-pager";
import { workflowSteps as simpleResumeWorkflowSteps } from "./simple-resume";
import { workflowSteps as standardResumeWorkflowSteps } from "./standardResume";
import { workflowSteps as testWorkflowSteps } from "./test";
import { workflowSteps as documentWorkflowSteps } from "./document";

export type WorkflowConfig = {
	label: string;
	steps: WorkflowStep[];
};

export type WorkFlowId =
	| "default"
	| "alternative"
	| "developer"
	| "test"
	| "instructions"
	| "defaultAlt"
	| "onePager"
	| "simpleResume"
	| "standardResume"
	| "document";

export const workflows: Record<WorkFlowId, WorkflowConfig> = {
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
	defaultAlt: {
		label: "Default Workflow Alt",
		steps: defaultAltWorkflowSteps,
	},
	onePager: {
		label: "One Pager Workflow",
		steps: onePagerWorkflowSteps,
	},
	simpleResume: {
		label: "Simple Resume Workflow",
		steps: simpleResumeWorkflowSteps,
	},
	standardResume: {
		label: "Standard Resume Workflow",
		steps: standardResumeWorkflowSteps,
	},
	document: {
		label: "Document Workflow",
		steps: documentWorkflowSteps,
	},
};

export const defaultWorkflowId = "default";
