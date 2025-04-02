import { workflowSteps } from "../../config/workflow";
import type { WorkflowStep } from "../../config/workflow";
import { WorkflowEngine } from "./workflow-engine";
import { workHistory } from "../../data/workHistory";

/**
 * Executes the entire workflow on the server side
 */
export async function executeWorkflow(jobDescription: string): Promise<string> {
	// Create workflow engine
	const engine = new WorkflowEngine(
		{
			anthropic: process.env.ANTHROPIC_API_KEY || "",
			openai: process.env.OPENAI_API_KEY || "",
			gemini: process.env.GEMINI_API_KEY || "",
		},
		workflowSteps as unknown as WorkflowStep[]
	);

	// Initial context with job description and work history
	const initialContext: Record<string, unknown> = {
		jobDescription,
		workHistory,
		relevant: "",
		experience: workHistory,
		workExperience: workHistory,
	};

	// Execute all steps in sequence
	const context = await engine.execute(initialContext);

	// Return the final resume
	if (!context["craft-resume"]) {
		throw new Error("Resume generation failed");
	}
	return String(context["craft-resume"]);
}

/**
 * Validates that required API keys are present
 */
export function validateApiKeys(): { 
	isValid: boolean; 
	missingKeys: string[];
} {
	const requiredKeys = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"];
	const missingKeys = requiredKeys.filter(key => !process.env[key]);
	
	return {
		isValid: missingKeys.length === 0,
		missingKeys
	};
}
