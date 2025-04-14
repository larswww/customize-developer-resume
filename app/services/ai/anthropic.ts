import Anthropic from "@anthropic-ai/sdk";
import type {
	MessageParam,
	TextBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import { serverLogger } from "~/utils/logger.server";
import type {
	AIClient,
	AIRequestOptions,
	AIResponse,
	AnthropicSystemParam,
} from "./types";
export class AnthropicClient implements AIClient {
	private client: Anthropic;

	constructor(apiKey?: string) {
		const key = apiKey || process.env.ANTHROPIC_API_KEY || "";
		if (!key) {
			throw new Error(
				"Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.",
			);
		}
		this.client = new Anthropic({ apiKey: key });
	}

	async generate(
		prompt: string,
		options: AIRequestOptions = {},
	): Promise<AIResponse> {
		serverLogger.log(
			"[Anthropic Client] Making request to Anthropic API via SDK",
		);

		const messages: MessageParam[] = [
			{
				role: "user",
				content: prompt,
			},
		];

		// Handle system prompt for Anthropic SDK
		let systemForSdk: string | TextBlockParam[] | undefined;
		if (typeof options.systemPrompt === "string") {
			systemForSdk = options.systemPrompt; // Pass simple string directly
		} else if (Array.isArray(options.systemPrompt)) {
			// Use type assertion to allow cache_control
			systemForSdk = options.systemPrompt as TextBlockParam[];
		}

		try {
			const response = await this.client.messages.create({
				model: options.model || "claude-3-sonnet-20240229",
				max_tokens: options.maxTokens || 4096,
				messages: messages,
				temperature: options.temperature || 0.7,
				// Use the prepared system prompt for the SDK call
				system: systemForSdk,
			});

			serverLogger.log(
				"[Anthropic Client] Received response from Anthropic API via SDK",
			);

			const textContent =
				response.content.find((block) => block.type === "text")?.text || "";

			return {
				text: textContent,
				metadata: {
					model: response.model,
					usage: response.usage,
				},
			};
		} catch (error: any) {
			serverLogger.error(
				"[Anthropic Client] Error calling Anthropic API:",
				error.message,
			);
			throw new Error(
				`Anthropic SDK error: ${error.message || "Unknown error"}`,
			);
		}
	}
}
