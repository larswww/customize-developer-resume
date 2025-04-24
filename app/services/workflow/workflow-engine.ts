import { serverLogger } from "~/utils/logger.server";
import { AnthropicClient } from "../../services/ai/anthropic";
import { GeminiClient } from "../../services/ai/gemini";
import { OpenAIClient } from "../../services/ai/openai";
import type {
	AIClient,
	AIProvider,
	AIRequestOptions,
	AIResponse,
	AnthropicSystemParam,
	WorkflowContext,
	WorkflowStep,
} from "../../services/ai/types";
import type { WorkflowStepStatus } from "../db/dbService.server";
export interface WorkflowStepUpdate {
	id: string;
	status: WorkflowStepStatus;
	result?: string;
	error?: string;
}

export interface DBService {
	updateStepStatus(update: WorkflowStepUpdate): Promise<void>;
}

/**
 * WorkflowEngine - Handles the execution of workflow steps
 */
export class WorkflowEngine {
	private steps: WorkflowStep[];
	private dbService?: DBService;

	constructor(steps: WorkflowStep[], dbService?: DBService) {
		this.steps = steps;
		this.dbService = dbService;
	}

	/**
	 * Execute workflow steps in parallel where possible, respecting dependencies
	 * Returns an array of individual step promises along with the final context promise
	 */
	async execute(initialContext: WorkflowContext) {
		let context: WorkflowContext = { ...initialContext };
		const completedSteps = new Set<string>();
		const stepPromises = new Map<
			string,
			Promise<{ stepId: string; result: string }>
		>();

		// Create a promise that will resolve when all steps are completed
		const contextPromise = new Promise<WorkflowContext>((resolve, reject) => {
			const executeSteps = async () => {
				try {
					while (completedSteps.size < this.steps.length) {
						const readySteps = this.findReadySteps(completedSteps);
						this.checkForCircularDependencies(readySteps, completedSteps);

						serverLogger.log(
							`Executing ${readySteps.length} steps in parallel: ${readySteps.map((s) => s.id).join(", ")}`,
						);

						// Update status to processing for ready steps
						await Promise.all(
							readySteps.map((step) =>
								this.updateStepStatus({
									id: step.id,
									status: "processing",
								}),
							),
						);

						const stepPromisesForBatch = readySteps.map((step) =>
							this.prepareAndExecuteStep(step, context),
						);

						// Register these promises in our map
						readySteps.forEach((step, index) => {
							stepPromises.set(step.id, stepPromisesForBatch[index]);
						});

						const results = await Promise.all(stepPromisesForBatch);
						context = await this.updateContextWithResults(
							context,
							results,
							completedSteps,
						);
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
		return this.steps.filter((step) => {
			if (completedSteps.has(step.id)) return false;

			const dependencies = step.dependencies || [];
			return dependencies.every((depId) => completedSteps.has(depId));
		});
	}

	private checkForCircularDependencies(
		readySteps: WorkflowStep[],
		completedSteps: Set<string>,
	): void {
		if (readySteps.length === 0) {
			const pendingSteps = this.steps
				.filter((step) => !completedSteps.has(step.id))
				.map((step) => step.id)
				.join(", ");
			throw new Error(
				`Cannot proceed with workflow execution. Possible circular dependency among steps: ${pendingSteps}`,
			);
		}
	}

	private async prepareAndExecuteStep(
		step: WorkflowStep,
		context: WorkflowContext,
	): Promise<{ stepId: string; result: string }> {
		try {
			this.validateRequiredVariables(step, context);
			const result = await this.executeStep(step, context);

			// Update step status to completed with result
			await this.updateStepStatus({
				id: step.id,
				status: "success",
				result,
			});

			return { stepId: step.id, result };
		} catch (error) {
			this.handleStepExecutionError(error, step);

			// Update step status to error
			await this.updateStepStatus({
				id: step.id,
				status: "error",
				error: error instanceof Error ? error.message : String(error),
			});

			throw error;
		}
	}

	private validateRequiredVariables(
		step: WorkflowStep,
		context: WorkflowContext,
	): void {
		const promptTemplate = step.prompt;
		const placeholders = promptTemplate.match(/{([^}]+)}/g) || [];

		for (const placeholder of placeholders) {
			const key = placeholder.replace("{", "").replace("}", "");
			const value =
				context[key as keyof WorkflowContext] ??
				context.intermediateResults[key];

			if (value === undefined) {
				throw new Error(
					`Missing required context variable '{${key}}' for step '${step.id}'`,
				);
			}
		}
	}

	private handleStepExecutionError(error: unknown, step: WorkflowStep): void {
		if (
			error instanceof Error &&
			error.message.startsWith("Missing required context variable")
		) {
			serverLogger.error(
				`Workflow halted at step ${step.id}: ${error.message}`,
			);
		} else {
			serverLogger.error(`Error executing step ${step.id}:`, error);
		}
	}

	private async updateContextWithResults(
		context: WorkflowContext,
		results: Array<{ stepId: string; result: string }>,
		completedSteps: Set<string>,
	): Promise<WorkflowContext> {
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
	 * Updates the status of a step in the database if a DB service is provided
	 */
	private async updateStepStatus(update: WorkflowStepUpdate): Promise<void> {
		if (this.dbService) {
			try {
				await this.dbService.updateStepStatus(update);
				serverLogger.log(
					`Updated step ${update.id} status to ${update.status}`,
				);
			} catch (error) {
				serverLogger.error(`Failed to update step ${update.id} status:`, error);
			}
		}
	}

	/**
	 * Replaces placeholders like {{key}} in a prompt string with values from the context.
	 */
	private interpolatePrompt(
		promptTemplate: string,
		context: WorkflowContext,
	): string {
		let prompt = promptTemplate;
		const placeholders = prompt.match(/{([^}]+)}/g) || [];

		for (const placeholder of placeholders) {
			const key = placeholder.replace("{", "").replace("}", "");
			const value =
				context[key as keyof WorkflowContext] ??
				context.intermediateResults[key];

			if (value !== undefined) {
				prompt = prompt.replace(placeholder, String(value));
			} else {
				serverLogger.warn(
					`Placeholder '{${key}}' not found in context for step.`,
				);
				prompt = prompt.replace(placeholder, "");
			}
		}
		return prompt;
	}

	/**
	 * Executes a single workflow step using the configured AI provider.
	 */
	private async executeStep(
		step: WorkflowStep,
		context: WorkflowContext,
	): Promise<string> {
		serverLogger.log(
			`Executing step: ${step.id} using provider: ${step.provider}`,
		);

		const client = this.createAIClient(step.provider);
		const finalPrompt = this.interpolatePrompt(step.prompt, context);
		const interpolatedSystemPrompt = this.interpolateSystemPrompt(
			step.systemPrompt,
			context,
		);
		const options = this.prepareClientOptions(
			step.options,
			interpolatedSystemPrompt,
		);

		try {
			serverLogger.log(
				`Sending prompt to ${step.provider} for step ${step.id}`,
			);
			const response = await client.generate(finalPrompt, options);
			serverLogger.log(
				`Received response from ${step.provider} for step ${step.id}`,
			);

			return this.processStepResponse(response, step, context);
		} catch (error) {
			this.handleAIGenerationError(error, step);
			throw error;
		}
	}

	private createAIClient(provider: AIProvider): AIClient {
		switch (provider) {
			case "openai":
				return new OpenAIClient();
			case "anthropic":
				return new AnthropicClient();
			case "gemini":
				return new GeminiClient();
			default:
				throw new Error(`Unsupported AI provider: ${provider}`);
		}
	}

	private interpolateSystemPrompt(
		systemPrompt: string | AnthropicSystemParam[] | undefined,
		context: WorkflowContext,
	): string | AnthropicSystemParam[] | undefined {
		if (typeof systemPrompt === "string") {
			return this.interpolatePrompt(systemPrompt, context);
		}

		if (Array.isArray(systemPrompt)) {
			return systemPrompt.map((param) => {
				if (typeof param === "object" && param !== null && "text" in param) {
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
		systemPrompt: string | AnthropicSystemParam[] | undefined,
	): AIRequestOptions {
		if (!stepOptions || !stepOptions.provider) {
			throw new Error("Provider must be specified in AIRequestOptions");
		}
		
		if (stepOptions.provider === 'anthropic') {
			return {
				...stepOptions,
				systemPrompt,
			} as Extract<AIRequestOptions, { provider: 'anthropic' }>;
		}
		
		return {
			...stepOptions,
			systemPrompt: typeof systemPrompt === 'string' ? systemPrompt : undefined,
		} as AIRequestOptions;
	}

	private processStepResponse(
		response: AIResponse,
		step: WorkflowStep,
		context: WorkflowContext,
	): string {
		if (step.transform) {
			const transformedResult = step.transform(response, context);
			return typeof transformedResult === "string"
				? transformedResult
				: JSON.stringify(transformedResult);
		}
		return response.text;
	}

	private handleAIGenerationError(error: unknown, step: WorkflowStep): void {
		serverLogger.error(
			`Error during AI generation for step ${step.id} with provider ${step.provider}:`,
			error,
		);
		throw new Error(
			`AI generation failed for step ${step.id}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
