
export interface AIResponse {
	text: string;
	metadata?: Record<string, unknown>;
}

export interface AIClient {
	generate(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
}

export interface AIRequestOptions {
	model?: string;
	maxTokens?: number;
	temperature?: number;
	response_format?: { type: "json_object" } | { type: "text" };
	systemPrompt?: string | AnthropicSystemParam[];
}

export type AIProvider = "anthropic" | "openai" | "gemini";

export interface WorkflowContext {
	jobDescription: string;
	workHistory: string;
	templateDescription?: string;
	relevant?: string;
	experience?: string;
	workExperience?: string;
	resume?: string;
	intermediateResults: Record<string, unknown>;
}

export interface WorkflowStep {
	id: string;
	name: string;
	description: string;
	provider: "openai" | "anthropic" | "local";
	options?: AIRequestOptions;
	systemPrompt?: string | AnthropicSystemParam[];
	prompt: string;
	transform?: (response: AIResponse, context: WorkflowContext) => unknown;
	useInResume?: boolean;
	estimatedTimeInMinutes?: number;
	dependencies?: string[];
}

export type AnthropicSystemParam = {
	type: "text";
	text: string;
	cache_control?: { type: "ephemeral" };
};
