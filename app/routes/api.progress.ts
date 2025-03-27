import type { LoaderFunctionArgs } from "react-router";
import { workflowSteps } from "../config/workflow";
import { workHistory } from "../data/workHistory";
import { WorkflowEngine } from "../services/workflow/WorkflowEngine";
import { setWorkflowRunning } from "./api.loading";

// You'll need to set these up in your environment
const API_KEYS = {
	anthropic: process.env.ANTHROPIC_API_KEY || "",
	openai: process.env.OPENAI_API_KEY || "",
	gemini: process.env.GEMINI_API_KEY || "",
};

// Store the workflow promise so we can check its status
let currentWorkflow: Promise<string> | null = null;

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const jobDescription = url.searchParams.get("jobDescription");

	if (!jobDescription) {
		return new Response(
			JSON.stringify({ error: "Job description is required" }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	// Check if a workflow is already running by reading the shared state directly
	const isWorkflowRunning = currentWorkflow !== null;

	if (isWorkflowRunning) {
		return {
			status: "already_running",
			message: "A workflow is already in progress",
		};
	}

	try {
		const engine = new WorkflowEngine(API_KEYS, workflowSteps);

		// Start execution in background
		setWorkflowRunning(true);
		currentWorkflow = engine
			.execute(jobDescription, workHistory)
			.finally(() => {
				setWorkflowRunning(false);
				currentWorkflow = null;
			});

		// Return current state immediately
		return {
			status: "processing",
			message: "Workflow started",
			currentStep: workflowSteps[0].id,
			totalSteps: workflowSteps.length,
			completedSteps: 0,
		};
	} catch (error) {
		setWorkflowRunning(false);
		currentWorkflow = null;
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
