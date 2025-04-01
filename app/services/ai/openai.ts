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
		
		const model = options.model || "o1";
		const systemPrompt = options.systemPrompt || "You are a helpful assistant.";
		
		// Determine the model type for proper message formatting
		const getModelType = (modelName: string): 'o1' | 'o3' | 'mini' => {
			if (modelName.includes('o1-mini') || modelName.includes('o3-mini')) {
				return 'mini';
			}
			if (modelName.startsWith('o1')) {
				return 'o1';
			}
			return 'o3';
		};
		
		const modelType = getModelType(model);
		
		// Prepare messages based on model type
		let messages: {role: string; content: string}[] = [];
		
		switch (modelType) {
			case 'o1':
				// o1 models use "developer" role
				messages = [
					{
						role: "developer",
						content: systemPrompt,
					},
					{
						role: "user",
						content: prompt,
					},
				];
				break;
			case 'mini':
				// Mini models don't support system/developer messages
				messages = [
					{
						role: "user",
						content: `${systemPrompt}\n\n${prompt}`,
					},
				];
				break;
			default:
				// o3 and other models use "system" role
				messages = [
					{
						role: "system",
						content: systemPrompt,
					},
					{
						role: "user",
						content: prompt,
					},
				];
		}

		// Create request payload
		const requestBody: Record<string, any> = {
			model: model,
			messages: messages,
		};
		
		// Only include max_tokens if provided
		if (options.maxTokens) {
			requestBody.max_tokens = options.maxTokens;
		}
		
		// Only include temperature for models that support it (not mini models)
		if (options.temperature !== undefined && modelType !== 'mini') {
			requestBody.temperature = options.temperature;
		}

		// Use these exact headers and method to ensure MSW intercepts the request
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(requestBody),
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
