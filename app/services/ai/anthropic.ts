import type { AIClient, AIResponse, AIRequestOptions } from './types';

export class AnthropicClient implements AIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    console.log('[Anthropic Client] Making request to Anthropic API');
    
    // Use these exact headers and method to ensure MSW intercepts the request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: options.model || 'claude-3-7-sonnet-20250219',
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = errorText ? JSON.parse(errorText) : {};
      console.error('[Anthropic Client] Error response:', errorData);
      throw new Error(`Anthropic API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('[Anthropic Client] Received response from Anthropic API');
    
    return {
      text: data.content[0].text,
      metadata: {
        model: data.model,
        usage: data.usage
      }
    };
  }
} 