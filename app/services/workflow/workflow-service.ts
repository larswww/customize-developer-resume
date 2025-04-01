import { workflowSteps } from "../../config/workflow";
import { workHistory } from "../../data/workHistory";
import type { WorkflowContext } from "../ai/types";
import { WorkflowEngine } from "./workflow-engine";

// You'll need to set these up in your environment
const API_KEYS = {
	anthropic: process.env.ANTHROPIC_API_KEY || "",
	openai: process.env.OPENAI_API_KEY || "",
	gemini: process.env.GEMINI_API_KEY || "",
};

/**
 * Validate API keys and return missing ones
 */
export function validateApiKeys() {
	const missingKeys = [];
	if (!API_KEYS.anthropic) missingKeys.push("ANTHROPIC_API_KEY");
	if (!API_KEYS.openai) missingKeys.push("OPENAI_API_KEY");
	if (!API_KEYS.gemini) missingKeys.push("GEMINI_API_KEY");

	return {
		missingKeys,
		isValid: missingKeys.length === 0,
		apiKeyStatus: {
			anthropic: API_KEYS.anthropic ? "Present" : "Missing",
			openai: API_KEYS.openai ? "Present" : "Missing",
			gemini: API_KEYS.gemini ? "Present" : "Missing",
		},
	};
}

/**
 * Execute a workflow synchronously and return the final result
 */
export async function executeWorkflow(jobDescription: string, relevant?: string) {
	const engine = new WorkflowEngine(API_KEYS, workflowSteps);
	
	// Create initial context with all needed fields
	const initialContext: Partial<WorkflowContext> = {
		jobDescription,
		workHistory,
		relevant: relevant || "",
		experience: workHistory,
		workExperience: workHistory,
	};
	
	// Execute the workflow with custom context and return the result from the craft-resume step
	const stepPromises = engine.createCustomStepPromises(initialContext);
	const results = await Promise.all(stepPromises.map(step => step()));
	
	// Find the index of the craft-resume step
	const resumeStepIndex = workflowSteps.findIndex(step => step.id === "craft-resume");
	
	// Return the result from the craft-resume step, or the last step if not found
	return results[resumeStepIndex >= 0 ? resumeStepIndex : results.length - 1] as string;
}
