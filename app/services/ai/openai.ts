import type { AIClient, AIRequestOptions, AIResponse } from "./types";

export class OpenAIClient implements AIClient {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async generate(
		prompt: string,
		options: AIRequestOptions = {},
	): Promise<AIResponse> {
		console.log("[OpenAI Client] Making request to OpenAI API");

		// Use these exact headers and method to ensure MSW intercepts the request
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: options.model || "o1",
				messages: [
					{
						role: "system",
						content: options.systemPrompt || "You are a helpful assistant.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				max_tokens: options.maxTokens,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			const errorData = errorText ? JSON.parse(errorText) : {};
			console.error("[OpenAI Client] Error response:", errorData);
			throw new Error(
				`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`,
			);
		}

		const data = await response.json();
		console.log("[OpenAI Client] Received response from OpenAI API");

		return {
			text: data.choices[0].message.content,
			metadata: {
				model: data.model,
				usage: data.usage,
			},
		};
	}
}
