import { workflowSteps } from "../../config/workflow";
import { workHistory } from "../../data/workHistory";
import { WorkflowEngine } from "./WorkflowEngine";

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
export async function executeWorkflow(jobDescription: string) {
	const engine = new WorkflowEngine(API_KEYS, workflowSteps);
	return await engine.execute(jobDescription, workHistory);
}
