import { serverLogger } from "~/utils/logger.server";
import type { AIClient, AIRequestOptions, AIResponse } from "./types";
export class GeminiClient implements AIClient {
	private apiKey: string;

	constructor(apiKey?: string) {
		this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
		if (!this.apiKey) {
			throw new Error(
				"Gemini API key not configured. Set GEMINI_API_KEY environment variable.",
			);
		}
	}

	async generate(
		prompt: string,
		options: AIRequestOptions = {},
	): Promise<AIResponse> {
		serverLogger.log("[GeminiClient] Generating content with Gemini API");
		const model = options.model || "gemini-1.5-flash";
		const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKey}`;

		// Gemini doesn't support system role, so we need to prepend it to the user message
		let fullPrompt = prompt;
		if (options.systemPrompt) {
			serverLogger.log("[GeminiClient] Adding system prompt to user message");
			fullPrompt = `${options.systemPrompt}\n\n${prompt}`;
		}

		// Prepare contents array with a single user message that includes the system prompt
		const contents = [
			{
				role: "user",
				parts: [{ text: fullPrompt }],
			},
		];

		try {
			serverLogger.log("[GeminiClient] Sending request to Gemini API");
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: contents,
					generationConfig: {
						temperature: options.temperature || 0.7,
						maxOutputTokens: options.maxTokens || 1000,
					},
					safetySettings: [
						{
							category: "HARM_CATEGORY_HARASSMENT",
							threshold: "BLOCK_MEDIUM_AND_ABOVE",
						},
					],
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				let errorData: Record<string, unknown>;
				try {
					errorData = JSON.parse(errorText);
				} catch {
					errorData = { rawError: errorText };
				}
				serverLogger.error("[GeminiClient] Error response:", errorData);
				throw new Error(
					`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`,
				);
			}

			const data = await response.json();
			serverLogger.log(
				"[GeminiClient] Successfully received response from Gemini API",
			);

			if (!data.candidates || data.candidates.length === 0) {
				throw new Error("Gemini API returned no candidates");
			}

			return {
				text: data.candidates[0].content.parts[0].text,
				metadata: {
					model: model,
					usage: data.usageMetadata,
				},
			};
		} catch (error) {
			serverLogger.error("[GeminiClient] Error:", error);
			throw error;
		}
	}
}
