import { storeStepResult } from "../state/stepStorage";
import { AnthropicClient } from "../ai/anthropic";
import { GeminiClient } from "../ai/gemini";
import { OpenAIClient } from "../ai/openai";
import type {
	AIClient,
	AIResponse,
	WorkflowContext,
	WorkflowStep,
} from "../ai/types";
// Import other AI clients when implemented

export interface StepResult {
	stepId: string;
	result: unknown;
	isComplete: boolean;
}

export interface WorkflowProgress {
	currentStep: string;
	totalSteps: number;
	completedSteps: number;
	results: Record<string, unknown>;
	isComplete: boolean;
}

export type ProgressCallback = (progress: WorkflowProgress) => void;

// Define a StepPromise type
export type StepPromise = () => Promise<unknown>;

// Enhanced logging function for debugging
function logDebug(message: string, data?: unknown) {
	console.log(`[WorkflowEngine] ${message}`);
	if (data) {
		console.log(JSON.stringify(data, null, 2));
	}
}

export class WorkflowEngine {
	private clients: Record<string, AIClient>;
	private steps: WorkflowStep[];

	constructor(apiKeys: Record<string, string>, steps: WorkflowStep[]) {
		this.steps = steps;

		// Log API key status (not the actual keys)
		logDebug("API Key Status:", {
			anthropic: apiKeys.anthropic ? "Present" : "Missing",
			openai: apiKeys.openai ? "Present" : "Missing",
			gemini: apiKeys.gemini ? "Present" : "Missing",
		});

		// Initialize clients with error handling
		this.clients = {};

		try {
			this.clients.anthropic = new AnthropicClient(apiKeys.anthropic);
			logDebug("Anthropic client initialized");
		} catch (error) {
			logDebug("Error initializing Anthropic client", {
				error: error instanceof Error ? error.message : String(error),
			});
		}

		try {
			this.clients.openai = new OpenAIClient(apiKeys.openai);
			logDebug("OpenAI client initialized");
		} catch (error) {
			logDebug("Error initializing OpenAI client", {
				error: error instanceof Error ? error.message : String(error),
			});
		}

		try {
			this.clients.gemini = new GeminiClient(apiKeys.gemini);
			logDebug("Gemini client initialized");
		} catch (error) {
			logDebug("Error initializing Gemini client", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	// Get an AI client by provider name
	getClient(provider: string): AIClient {
		const client = this.clients[provider];
		if (!client) {
			const error = `No client found for provider: ${provider}`;
			logDebug(error);
			throw new Error(error);
		}
		return client;
	}

	// Create an array of step promises that can be awaited sequentially
	createStepPromises(
		jobDescription: string,
		workHistory: string,
		onStepComplete?: (stepId: string, result: unknown) => void,
	): StepPromise[] {
		const initialContext: WorkflowContext = {
			jobDescription,
			workHistory,
			intermediateResults: {},
		};

		// Create a shared context object that will be passed between steps
		const context: WorkflowContext = { ...initialContext };

		// Create a map to store dependency promises
		const promises: Record<string, Promise<unknown>> = {};

		// First, create all promise generators
		const stepPromises = this.steps.map((step, index) => {
			return async () => {
				logDebug(`Starting execution of step: ${step.id}`);
				try {
					// If this isn't the first step, wait for the previous step to complete
					if (index > 0) {
						const prevStep = this.steps[index - 1];
						logDebug(`Waiting for previous step to complete: ${prevStep.id}`);
						// Make sure we have the result from the previous step before continuing
						await promises[prevStep.id];

						// Log the current context state for debugging
						logDebug("Context after previous step:", {
							hasIntermediateResults:
								Object.keys(context.intermediateResults).length > 0,
							availableKeys: Object.keys(context.intermediateResults),
							previousStepResult: context.intermediateResults[prevStep.id]
								? "Present"
								: "Missing",
						});
					}

					logDebug(`Getting client for provider: ${step.provider}`);
					const client = this.getClient(step.provider);

					// Generate the prompt using the context
					let prompt: string;
					try {
						prompt =
							typeof step.prompt === "function"
								? step.prompt(context)
								: step.prompt;
						logDebug(
							`Generated prompt for step ${step.id} (length: ${prompt.length} chars)`,
						);
					} catch (error) {
						logDebug(`Error generating prompt for step ${step.id}`, {
							error: error instanceof Error ? error.message : String(error),
						});
						throw error;
					}

					// Call the AI provider
					logDebug(`Calling AI provider: ${step.provider} for step ${step.id}`);
					let response: AIResponse;
					try {
						response = await client.generate(prompt, step.options);
						logDebug(
							`Received response from ${step.provider} for step ${step.id}`,
						);
					} catch (error) {
						logDebug(
							`Error from AI provider ${step.provider} for step ${step.id}`,
							{
								error: error instanceof Error ? error.message : String(error),
								stack: error instanceof Error ? error.stack : undefined,
							},
						);
						throw error;
					}

					// Transform the response
					let result: unknown;
					try {
						result = step.transform
							? step.transform(response, context)
							: response.text;
						logDebug(`Transformed result for step ${step.id}`);
					} catch (error) {
						logDebug(`Error transforming result for step ${step.id}`, {
							error: error instanceof Error ? error.message : String(error),
							responseText:
								response.text.substring(0, 200) +
								(response.text.length > 200 ? "..." : ""),
						});
						throw error;
					}

					// Update the context with the result
					context.intermediateResults[step.id] = result;
					logDebug(`Updated context with result for step ${step.id}`);

					// Store the result for API access if that function exists
					try {
						storeStepResult(step.id, result);
						logDebug(`Stored result for API access: ${step.id}`);
					} catch (e) {
						logDebug(
							`Note: Could not store step result for API access (might be expected): ${step.id}`,
						);
						// Ignore errors from storeStepResult as it might not be available
					}

					// Notify caller about step completion
					if (onStepComplete) {
						onStepComplete(step.id, result);
						logDebug(`Notified completion of step: ${step.id}`);
					}

					logDebug(`Successfully completed step: ${step.id}`);
					return result;
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					const errorStack = error instanceof Error ? error.stack : undefined;

					logDebug(`Error in workflow step ${step.id}:`, {
						error: errorMessage,
						stack: errorStack,
						step: step.id,
						provider: step.provider,
					});

					// Rethrow with enhanced error message
					throw new Error(
						`Error in workflow step ${step.id} (provider: ${step.provider}): ${errorMessage}`,
					);
				}
			};
		});

		// Initialize all promises to ensure they're ready for dependencies
		logDebug("Initializing all step promises");
		this.steps.forEach((step, index) => {
			const executeStep = stepPromises[index];
			promises[step.id] = executeStep();
		});

		logDebug("Returning step promise generators");
		// Return the original step promise generators
		return stepPromises;
	}

	async execute(
		jobDescription: string,
		workHistory: string,
		onProgress?: ProgressCallback,
	): Promise<string> {
		logDebug("Starting workflow execution");
		const context: WorkflowContext = {
			jobDescription,
			workHistory,
			intermediateResults: {},
		};

		let result: unknown;
		const totalSteps = this.steps.length;
		let completedSteps = 0;
		const results: Record<string, unknown> = {};

		for (const step of this.steps) {
			logDebug(
				`Executing step ${step.id} (${completedSteps + 1}/${totalSteps})`,
			);
			try {
				// Update progress with current step
				if (onProgress) {
					onProgress({
						currentStep: step.id,
						totalSteps,
						completedSteps,
						results,
						isComplete: false,
					});
					logDebug(`Updated progress for step ${step.id}`);
				}

				logDebug(`Getting client for provider: ${step.provider}`);
				const client = this.clients[step.provider];
				if (!client) {
					const error = `No client found for provider: ${step.provider}`;
					logDebug(error);
					throw new Error(error);
				}

				// Generate the prompt
				let prompt: string;
				try {
					prompt =
						typeof step.prompt === "function"
							? step.prompt(context)
							: step.prompt;
					logDebug(
						`Generated prompt for step ${step.id} (length: ${prompt.length} chars)`,
					);
				} catch (error) {
					logDebug(`Error generating prompt for step ${step.id}`, {
						error: error instanceof Error ? error.message : String(error),
					});
					throw error;
				}

				// Call the AI provider
				logDebug(`Calling AI provider: ${step.provider} for step ${step.id}`);
				let response: AIResponse;
				try {
					response = await client.generate(prompt, step.options);
					logDebug(
						`Received response from ${step.provider} for step ${step.id}`,
					);
				} catch (error) {
					logDebug(
						`Error from AI provider ${step.provider} for step ${step.id}`,
						{
							error: error instanceof Error ? error.message : String(error),
							stack: error instanceof Error ? error.stack : undefined,
						},
					);
					throw error;
				}

				// Transform the response
				try {
					result = step.transform
						? step.transform(response, context)
						: response.text;
					logDebug(`Transformed result for step ${step.id}`);
				} catch (error) {
					logDebug(`Error transforming result for step ${step.id}`, {
						error: error instanceof Error ? error.message : String(error),
						responseText:
							response.text.substring(0, 200) +
							(response.text.length > 200 ? "..." : ""),
					});
					throw error;
				}

				// Store the result for API access
				try {
					storeStepResult(step.id, result);
					logDebug(`Stored result for API access: ${step.id}`);
				} catch (e) {
					logDebug(
						`Note: Could not store step result for API access (might be expected): ${step.id}`,
					);
					// Ignore errors from storeStepResult as it might not be available
				}

				// Update context with the result
				context.intermediateResults[step.id] = result;
				logDebug(`Updated context with result for step ${step.id}`);

				// Store the result and update progress
				results[step.id] = result;
				completedSteps++;
				logDebug(`Completed step ${step.id} (${completedSteps}/${totalSteps})`);

				if (onProgress) {
					onProgress({
						currentStep: step.id,
						totalSteps,
						completedSteps,
						results,
						isComplete: completedSteps === totalSteps,
					});
					logDebug(`Updated progress after completing step ${step.id}`);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				const errorStack = error instanceof Error ? error.stack : undefined;

				logDebug(`Error in workflow step ${step.id}:`, {
					error: errorMessage,
					stack: errorStack,
					step: step.id,
					provider: step.provider,
				});

				throw new Error(
					`Error in workflow step ${step.id} (provider: ${step.provider}): ${errorMessage}`,
				);
			}
		}

		logDebug("Workflow execution completed successfully");
		return result as string;
	}
}
