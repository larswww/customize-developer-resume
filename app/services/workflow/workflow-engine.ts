import { OpenAIClient } from "../../services/ai/openai";
import { AnthropicClient } from "../../services/ai/anthropic";
import { GeminiClient } from "../../services/ai/gemini";
import type {
	WorkflowStep,
	AIProvider,
	AIClient,
	WorkflowContext,
} from "../../services/ai/types";

type ApiKeys = {
	anthropic: string;
	openai: string;
	gemini?: string;
};

/**
 * WorkflowEngine - Handles the execution of workflow steps
 */
export class WorkflowEngine {
	private apiKeys: ApiKeys;
	private steps: WorkflowStep[];

	constructor(apiKeys: ApiKeys, steps: WorkflowStep[]) {
		this.apiKeys = apiKeys;
		this.steps = steps;
	}

	/**
	 * Execute all workflow steps in sequence
	 */
	async execute(initialContext: WorkflowContext): Promise<WorkflowContext> {
		let context: WorkflowContext = { ...initialContext };

		// Execute each step in order
		for (const step of this.steps) {
			try {
				const promptTemplate = typeof step.prompt === 'function' ? step.prompt(context) : step.prompt;
				const placeholders = promptTemplate.match(/{([^}]+)}/g) || [];

				for (const placeholder of placeholders) {
					const key = placeholder.replace('{', '').replace('}', '');
					const value = context[key as keyof WorkflowContext] ?? context.intermediateResults[key];
					
					if (value === undefined) {
						throw new Error(`Missing required context variable '{${key}}' for step '${step.id}'`);
					}
				}

				const result = await this.executeStep(step, context);
				// Add result to context with step ID as key
				context = {
					...context,
					intermediateResults: {
						...context.intermediateResults,
						[step.id]: result,
					},
				};
			} catch (error) {
				if (error instanceof Error && error.message.startsWith('Missing required context variable')) {
					console.error(`Workflow halted at step ${step.id}: ${error.message}`);
				} else {
					console.error(`Error executing step ${step.id}:`, error);
				}
				throw error;
			}
		}

		return context;
	}

	/**
	 * Creates a list of promises for each step that can be executed independently
	 * (Note: This method is no longer used in the primary workflow but kept for potential future use)
	 */
	createCustomStepPromises(initialContext: WorkflowContext): Array<() => Promise<unknown>> {
		let context: WorkflowContext = { ...initialContext };
		const stepPromises: Array<() => Promise<unknown>> = [];

		// For each step, create a promise factory function
		this.steps.forEach((step, index) => {
			// Create a function that when called, will execute the step
			const promise = async () => {
				// Wait for all previous steps to complete
				if (index > 0) {
					for (let i = 0; i < index; i++) {
						// Ensure the previous step's result is available in the intermediateResults
						if (!context.intermediateResults[this.steps[i].id]) {
							const result = await stepPromises[i]();
							context = {
								...context,
								intermediateResults: {
									...context.intermediateResults,
									[this.steps[i].id]: result,
								},
							};
						}
					}
				}

				// Now execute this step with the updated context
				return this.executeStep(step, context);
			};

			stepPromises.push(promise);
		});

		return stepPromises;
	}

	/**
	 * Replaces placeholders like {{key}} in a prompt string with values from the context.
	 */
	private interpolatePrompt(promptTemplate: string, context: WorkflowContext): string {
		let prompt = promptTemplate;
		const placeholders = prompt.match(/{([^}]+)}/g) || [];

		for (const placeholder of placeholders) {
			const key = placeholder.replace('{', '').replace('}', '');
			// Access values from the main context or intermediate results
			const value = context[key as keyof WorkflowContext] ?? context.intermediateResults[key];
			
			if (value !== undefined) {
				// Ensure value is a string; handle objects/arrays appropriately if needed
				prompt = prompt.replace(placeholder, String(value));
			} else {
				console.warn(`Placeholder '{${key}}' not found in context for step.`);
				prompt = prompt.replace(placeholder, ''); // Replace with empty string or handle as error
			}
		}
		return prompt;
	}

	/**
	 * Executes a single workflow step using the configured AI provider.
	 */
	private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<string> {
		console.log(`Executing step: ${step.id} using provider: ${step.provider}`);

		let client: AIClient;
		const provider = step.provider as AIProvider;

		// Instantiate the correct AI client based on the provider
		switch (provider) {
			case "openai":
				if (!this.apiKeys.openai) throw new Error("OpenAI API key not configured");
				client = new OpenAIClient(this.apiKeys.openai);
				break;
			case "anthropic":
				if (!this.apiKeys.anthropic) throw new Error("Anthropic API key not configured");
				client = new AnthropicClient(this.apiKeys.anthropic);
				break;
			case "gemini":
				if (!this.apiKeys.gemini) throw new Error("Gemini API key not configured");
				client = new GeminiClient(this.apiKeys.gemini);
				break;
			default:
				throw new Error(`Unsupported AI provider: ${provider}`);
		}

		// Determine the prompt to use (function or string)
		const promptTemplate = typeof step.prompt === 'function' ? step.prompt(context) : step.prompt;
		
		// Interpolate the prompt with context values
		const finalPrompt = this.interpolatePrompt(promptTemplate, context);

		// Prepare options for the AI client
		const options = {
			...(step.options || {}),
			systemPrompt: step.systemPrompt, // Pass system prompt in options
		};

		try {
			console.log(`Sending prompt to ${provider} for step ${step.id}`);
			const response = await client.generate(finalPrompt, options);
			console.log(`Received response from ${provider} for step ${step.id}`);
			
			// Optional transformation step
			if (step.transform) {
				const transformedResult = step.transform(response, context);
				// Ensure the transformed result is a string for consistency
				return typeof transformedResult === 'string' ? transformedResult : JSON.stringify(transformedResult);
			}

			return response.text;
		} catch (error) {
			console.error(`Error during AI generation for step ${step.id} with provider ${provider}:`, error);
			throw new Error(`AI generation failed for step ${step.id}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
