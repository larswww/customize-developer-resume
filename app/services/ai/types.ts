import type { z } from "zod";

export interface AIResponse {
	text: string;
	metadata?: Record<string, unknown>;
}

export interface AIClient {
	generate(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;
}

export type AIProvider = "anthropic" | "openai" | "gemini";

export type AnthropicModels =
	| "claude-3-7-sonnet-latest"
	| "claude-3-opus-latest"
	| "claude-3-5-haiku-latest"
	| "claude-3-5-sonnet-latest"
	| "claude-3-opus-latest"
	| "claude-3-sonnet-20240229"
	| "claude-3-haiku-20240307";

export type GeminiModels =
	| "gemini-2.5-pro-preview-03-25"
	| "gemini-2.0-flash"
	| "gemini-2.0-flash-lite"
	| "gemini-1.5-flash"
	| "gemini-1.5-flash-8b"
	| "gemini-1.5-pro"
	| "gemini-embedding-exp"
	| "imagen-3.0-generate-002";

// Placeholder for OpenAI models, can be expanded later
export type OpenAIModels = string;

type ProviderSpecificOptions<P extends AIProvider, M> = {
	provider: P;
	model?: M;
	systemPrompt?: P extends "anthropic"
		? string | AnthropicSystemParam[]
		: string;
};

export type AIRequestOptions = Omit<
	BaseAIRequestOptions,
	"provider" | "model" | "systemPrompt"
> &
	(
		| ProviderSpecificOptions<"anthropic", AnthropicModels>
		| ProviderSpecificOptions<"openai", OpenAIModels>
		| ProviderSpecificOptions<"gemini", GeminiModels>
	);

// Base options common to all providers, excluding provider-specific ones
interface BaseAIRequestOptions {
	model?: string;
	maxTokens?: number;
	temperature?: number;
	response_format?:
		| { type: "json_object" }
		| { type: "text" }
		| { type: "json_schema" };
	systemPrompt?: string | AnthropicSystemParam[];
	zodSchema?: z.ZodTypeAny;
	provider: AIProvider; // Added provider here for the base interface
}

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

// Base WorkflowStep structure excluding provider-specific fields
interface BaseWorkflowStep {
	id: string;
	name: string;
	description: string;
	prompt: string;
	transform?: (response: AIResponse, context: WorkflowContext) => unknown;
	useInResume?: boolean;
	estimatedTimeInMinutes?: number;
	dependencies?: string[]; // Keep dependencies here in the base step
}

// New WorkflowStep union using Extract
export type WorkflowStep = Omit<BaseWorkflowStep, never> & // Keep all base fields
	(
		| {
				provider: "anthropic";
				options?: Extract<AIRequestOptions, { provider: "anthropic" }>;
				systemPrompt?: string | AnthropicSystemParam[];
		  }
		| {
				provider: "openai";
				options?: Extract<AIRequestOptions, { provider: "openai" }>;
				systemPrompt?: string;
		  }
		| {
				provider: "gemini";
				options?: Extract<AIRequestOptions, { provider: "gemini" }>;
				systemPrompt?: string;
		  }
	);

export type AnthropicSystemParam = {
	type: "text";
	text: string;
	cache_control?: { type: "ephemeral" };
};
