export interface AIResponse {
	text: string;
	metadata?: Record<string, unknown>;
}

export interface AIClient {
	generate(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
}

export interface AIRequestOptions {
	temperature?: number;
	maxTokens?: number;
	model?: string;
	systemPrompt?: string;
}

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface WorkflowContext {
	jobDescription: string;
	workHistory: string;
	relevant?: string;
	experience?: string;
	workExperience?: string;
	resume?: string;
	intermediateResults: Record<string, unknown>;
}

export interface WorkflowStep {
	id: string;
	provider: string;
	prompt: string | ((context: WorkflowContext) => string);
	options?: AIRequestOptions;
	transform?: (response: AIResponse, context: WorkflowContext) => unknown;
}
