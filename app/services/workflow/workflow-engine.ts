import { OpenAIClient } from "../../services/ai/openai";
import { AnthropicClient } from "../../services/ai/anthropic";
import { GeminiClient } from "../../services/ai/gemini";
import type {
	WorkflowStep,
	AIProvider,
	AIClient,
	WorkflowContext,
	AnthropicSystemParam,
	AIRequestOptions,
	AIResponse,
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
	 * Execute workflow steps in parallel where possible, respecting dependencies
	 * Returns an array of individual step promises along with the final context promise
	 */
	async execute(initialContext: WorkflowContext) {
		let context: WorkflowContext = { ...initialContext };
		const completedSteps = new Set<string>();
		const stepPromises = new Map<string, Promise<{ stepId: string; result: string }>>();
		
		// Create a promise that will resolve when all steps are completed
		const contextPromise = new Promise<WorkflowContext>((resolve, reject) => {
			const executeSteps = async () => {
				try {
					while (completedSteps.size < this.steps.length) {
						const readySteps = this.findReadySteps(completedSteps);
						this.checkForCircularDependencies(readySteps, completedSteps);
						
						console.log(`Executing ${readySteps.length} steps in parallel: ${readySteps.map(s => s.id).join(", ")}`);
						
						const stepPromisesForBatch = readySteps.map(step => this.prepareAndExecuteStep(step, context));
						
						// Register these promises in our map
						readySteps.forEach((step, index) => {
							stepPromises.set(step.id, stepPromisesForBatch[index]);
						});
						
						const results = await Promise.all(stepPromisesForBatch);
						context = this.updateContextWithResults(context, results, completedSteps);
					}
					
					resolve(context);
				} catch (error) {
					reject(error);
				}
			};
			
			executeSteps();
		});
		
		return { contextPromise, stepPromises };
	}
	
	private findReadySteps(completedSteps: Set<string>): WorkflowStep[] {
		return this.steps.filter(step => {
			if (completedSteps.has(step.id)) return false;
			
			const dependencies = step.dependencies || [];
			return dependencies.every(depId => completedSteps.has(depId));
		});
	}
	
	private checkForCircularDependencies(readySteps: WorkflowStep[], completedSteps: Set<string>): void {
		if (readySteps.length === 0) {
			const pendingSteps = this.steps
				.filter(step => !completedSteps.has(step.id))
				.map(step => step.id)
				.join(", ");
			throw new Error(`Cannot proceed with workflow execution. Possible circular dependency among steps: ${pendingSteps}`);
		}
	}
	
	private async prepareAndExecuteStep(step: WorkflowStep, context: WorkflowContext): Promise<{ stepId: string, result: string }> {
		try {
			this.validateRequiredVariables(step, context);
			const result = await this.executeStep(step, context);
			return { stepId: step.id, result };
		} catch (error) {
			this.handleStepExecutionError(error, step);
			throw error;
		}
	}
	
	private validateRequiredVariables(step: WorkflowStep, context: WorkflowContext): void {
		const promptTemplate = step.prompt;
		const placeholders = promptTemplate.match(/{([^}]+)}/g) || [];
		
		for (const placeholder of placeholders) {
			const key = placeholder.replace('{', '').replace('}', '');
			const value = context[key as keyof WorkflowContext] ?? context.intermediateResults[key];
			
			if (value === undefined) {
				throw new Error(`Missing required context variable '{${key}}' for step '${step.id}'`);
			}
		}
	}
	
	private handleStepExecutionError(error: unknown, step: WorkflowStep): void {
		if (error instanceof Error && error.message.startsWith('Missing required context variable')) {
			console.error(`Workflow halted at step ${step.id}: ${error.message}`);
		} else {
			console.error(`Error executing step ${step.id}:`, error);
		}
	}
	
	private updateContextWithResults(
		context: WorkflowContext, 
		results: Array<{ stepId: string, result: string }>, 
		completedSteps: Set<string>
	): WorkflowContext {
		let updatedContext = { ...context };
		
		for (const { stepId, result } of results) {
			updatedContext = {
				...updatedContext,
				intermediateResults: {
					...updatedContext.intermediateResults,
					[stepId]: result,
				},
			};
			completedSteps.add(stepId);
		}
		
		return updatedContext;
	}

	/**
	 * Replaces placeholders like {{key}} in a prompt string with values from the context.
	 */
	private interpolatePrompt(promptTemplate: string, context: WorkflowContext): string {
		let prompt = promptTemplate;
		const placeholders = prompt.match(/{([^}]+)}/g) || [];

		for (const placeholder of placeholders) {
			const key = placeholder.replace('{', '').replace('}', '');
			const value = context[key as keyof WorkflowContext] ?? context.intermediateResults[key];
			
			if (value !== undefined) {
				prompt = prompt.replace(placeholder, String(value));
			} else {
				console.warn(`Placeholder '{${key}}' not found in context for step.`);
				prompt = prompt.replace(placeholder, '');
			}
		}
		return prompt;
	}

	/**
	 * Executes a single workflow step using the configured AI provider.
	 */
	private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<string> {
		console.log(`Executing step: ${step.id} using provider: ${step.provider}`);
		
		const client = this.createAIClient(step.provider);
		const finalPrompt = this.interpolatePrompt(step.prompt, context);
		const interpolatedSystemPrompt = this.interpolateSystemPrompt(step.systemPrompt, context);
		const options = this.prepareClientOptions(step.options, interpolatedSystemPrompt);

		try {
			console.log(`Sending prompt to ${step.provider} for step ${step.id}`);
			const response = await client.generate(finalPrompt, options);
			console.log(`Received response from ${step.provider} for step ${step.id}`);
			
			return this.processStepResponse(response, step, context);
		} catch (error) {
			this.handleAIGenerationError(error, step);
			throw error;
		}
	}
	
	private createAIClient(provider: "openai" | "anthropic" | "gemini" | "local"): AIClient {
		switch (provider) {
			case "openai":
				if (!this.apiKeys.openai) throw new Error("OpenAI API key not configured");
				return new OpenAIClient(this.apiKeys.openai);
			case "anthropic":
				if (!this.apiKeys.anthropic) throw new Error("Anthropic API key not configured");
				return new AnthropicClient(this.apiKeys.anthropic);
			case "gemini":
				if (!this.apiKeys.gemini) throw new Error("Gemini API key not configured");
				return new GeminiClient(this.apiKeys.gemini);
			default:
				throw new Error(`Unsupported AI provider: ${provider}`);
		}
	}
	
	private interpolateSystemPrompt(
		systemPrompt: string | AnthropicSystemParam[] | undefined, 
		context: WorkflowContext
	): string | AnthropicSystemParam[] | undefined {
		if (typeof systemPrompt === "string") {
			return this.interpolatePrompt(systemPrompt, context);
		}
		
		if (Array.isArray(systemPrompt)) {
			return systemPrompt.map(param => {
				if (typeof param === 'object' && param !== null && 'text' in param) {
					return {
						...param,
						text: this.interpolatePrompt(param.text, context),
					};
				}
				return param;
			});
		}
		
		return undefined;
	}
	
	private prepareClientOptions(
		stepOptions: AIRequestOptions | undefined, 
		systemPrompt: string | AnthropicSystemParam[] | undefined
	): AIRequestOptions {
		return {
			...(stepOptions || {}),
			systemPrompt,
		};
	}
	
	private processStepResponse(response: AIResponse, step: WorkflowStep, context: WorkflowContext): string {
		if (step.transform) {
			const transformedResult = step.transform(response, context);
			return typeof transformedResult === 'string' ? transformedResult : JSON.stringify(transformedResult);
		}
		return response.text;
	}
	
	private handleAIGenerationError(error: unknown, step: WorkflowStep): void {
		console.error(`Error during AI generation for step ${step.id} with provider ${step.provider}:`, error);
		throw new Error(`AI generation failed for step ${step.id}: ${error instanceof Error ? error.message : String(error)}`);
	}
}
