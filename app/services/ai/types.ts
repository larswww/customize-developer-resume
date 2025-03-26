export interface AIResponse {
  text: string;
  metadata?: Record<string, any>;
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

export type AIProvider = 'anthropic' | 'openai' | 'gemini';

export interface WorkflowContext {
  jobDescription: string;
  workHistory: string;
  intermediateResults: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  provider: AIProvider;
  prompt: string | ((context: WorkflowContext) => string);
  options?: AIRequestOptions;
  transform?: (response: AIResponse, context: WorkflowContext) => any;
} 