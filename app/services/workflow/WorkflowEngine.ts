import type { AIClient, WorkflowStep, WorkflowContext } from '../ai/types';
import { AnthropicClient } from '../ai/anthropic';
import { OpenAIClient } from '../ai/openai';
import { GeminiClient } from '../ai/gemini';
// Import other AI clients when implemented

export class WorkflowEngine {
  private clients: Record<string, AIClient>;
  private steps: WorkflowStep[];

  constructor(
    apiKeys: Record<string, string>,
    steps: WorkflowStep[]
  ) {
    this.steps = steps;
    this.clients = {
      anthropic: new AnthropicClient(apiKeys.anthropic),
      openai: new OpenAIClient(apiKeys.openai),
      gemini: new GeminiClient(apiKeys.gemini)
    };
  }

  async execute(jobDescription: string, workHistory: string): Promise<string> {
    const context: WorkflowContext = {
      jobDescription,
      workHistory,
      intermediateResults: {}
    };

    let result: any;

    for (const step of this.steps) {
      try {
        const client = this.clients[step.provider];
        if (!client) {
          throw new Error(`No client found for provider: ${step.provider}`);
        }

        const prompt = typeof step.prompt === 'function' 
          ? step.prompt(context)
          : step.prompt;

        const response = await client.generate(prompt, step.options);
        
        result = step.transform 
          ? step.transform(response, context)
          : response.text;

      } catch (error) {
        console.error(`Error in workflow step ${step.id}:`, error);
        throw error;
      }
    }

    return result;
  }
} 