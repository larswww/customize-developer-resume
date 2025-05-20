import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionMessageParam } from "openai/resources";
import type { z } from "zod";
import type { ResumeCoreData } from "~/config/schemas/sharedTypes";
import { serverLogger } from "~/utils/logger.server";
import type { AIClient, AIRequestOptions, AIResponse } from "./types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
	serverLogger.warn(
		"OpenAI API key is missing. Structured resume generation will fail.",
	);
}
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export class OpenAIClient implements AIClient {
	async generate(
		prompt: string,
		options?: AIRequestOptions,
	): Promise<AIResponse> {
		// Simply delegate to our standalone generate function
		return generate(prompt, options || { provider: "openai" });
	}
}

export async function generate(
	prompt: string,
	options: AIRequestOptions & { zodSchema?: z.ZodTypeAny },
): Promise<AIResponse> {
	serverLogger.log("[Resume Service] Making request to OpenAI API");

	const model = options.model || "gpt-4.1";
	const systemPrompt = options.systemPrompt || "You are a helpful assistant.";

	// Properly type the messages for OpenAI
	const messages: ChatCompletionMessageParam[] = [
		{
			role: "system",
			content:
				typeof systemPrompt === "string"
					? systemPrompt
					: "You are a helpful assistant.",
		},
		{ role: "user", content: prompt },
	];

	try {
		// Check if we should use Zod schema parsing
		if (options.response_format?.type === "json_schema" && options.zodSchema) {
			serverLogger.log("[Resume Service] Using Zod schema parsing");

			const completion = await openai.beta.chat.completions.parse({
				model: model as string,
				messages,
				response_format: zodResponseFormat(options.zodSchema, "resume_data"),
				...(options.maxTokens && { max_tokens: options.maxTokens }),
			});

			// Return the text content, not the parsed data
			return {
				text: completion.choices[0].message.content || "",
				metadata: {
					model: completion.model,
					usage: completion.usage,
				},
			};
		}

		// Standard request without Zod schema
		const requestOptions: any = {
			model: model,
			messages,
			temperature: options.temperature,
		};

		if (options.maxTokens) {
			requestOptions.max_tokens = options.maxTokens;
		}

		if (options.response_format) {
			requestOptions.response_format = options.response_format;
		}

		const completion = await openai.chat.completions.create(requestOptions);

		serverLogger.log("[Resume Service] Received response from OpenAI API");

		return {
			text: completion.choices[0].message.content || "",
			metadata: {
				model: completion.model,
				usage: completion.usage,
			},
		};
	} catch (error) {
		serverLogger.error("[Resume Service] Error:", error);
		throw new Error(
			`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function reGenerateWithFeedback<T extends z.ZodTypeAny>(
	structuredData: ResumeCoreData,
	outputSchema: T,
	feedback: string,
): Promise<T> {
	serverLogger.log("Starting re-generation with feedback...");
	if (feedback) {
		serverLogger.log("Incorporating feedback into generation.");
	}

	const systemPrompt = `Your role is to action the feedback provided by the user to the resume data. The original data which user is giving you feedback on is: 
	
	${JSON.stringify(structuredData, null, 2)}
	`;

	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4.1",
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: feedback },
		],
		response_format: zodResponseFormat(outputSchema, "feedback-resume"),
		temperature: 0.1,
	});

	return completion.choices[0].message.parsed as T;
}

export async function generateStructuredResume<T extends z.ZodTypeAny>(
	combinedSourceText: string,
	outputSchema: T,
): Promise<T> {
	serverLogger.log("Starting single-call structured resume generation...");
	if (!openai.apiKey) throw new Error("OpenAI API key missing.");

	const systemPrompt =
		"Structured the provided content into a JSON object matching the required format. ";

	try {
		serverLogger.log("Calling OpenAI API...");
		const completion = await openai.beta.chat.completions.parse({
			model: "gpt-4.1-nano-2025-04-14",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: combinedSourceText },
			],
			response_format: zodResponseFormat(outputSchema, "resume_data"),
			temperature: 0.1,
		});

		const parsedData = completion.choices[0].message.parsed;
		if (!parsedData) {
			throw new Error("AI did not return parsed resume data.");
		}

		serverLogger.log(
			"Successfully generated structured resume data in a single call.",
		);
		const validationResult = outputSchema.safeParse(parsedData);
		if (!validationResult.success) {
			serverLogger.error(
				"AI output failed schema validation:",
				validationResult.error,
			);
			throw new Error(
				`AI output failed validation: ${validationResult.error.message}`,
			);
		}

		return validationResult.data;
	} catch (error) {
		serverLogger.error("Error in single-call resume generation:", error);
		throw new Error(
			`Failed to generate structured resume: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}

export async function parseGenerate<T extends z.ZodTypeAny>(
	prompt: string,
	zodSchema: T,
	options?: {
		systemPrompt?: string;
		model?: string;
		temperature?: number;
		maxTokens?: number;
		responseFormatName?: string;
	},
): Promise<z.infer<T>> {
	serverLogger.log(
		"[parseGenerate] Starting generic structured data generation...",
	);
	if (!openai.apiKey) throw new Error("OpenAI API key missing.");

	const model = options?.model || "gpt-4.1";
	const systemPrompt = options?.systemPrompt || "You are a helpful assistant.";
	const responseFormatName = options?.responseFormatName || "structured_data";

	try {
		serverLogger.log("[parseGenerate] Calling OpenAI API...");
		const completion = await openai.beta.chat.completions.parse({
			model,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
			response_format: zodResponseFormat(zodSchema, responseFormatName),
			temperature: options?.temperature ?? 0.1,
			...(options?.maxTokens && { max_tokens: options.maxTokens }),
		});

		const parsedData = completion.choices[0].message.parsed;
		if (!parsedData) {
			throw new Error("AI did not return parsed data.");
		}

		const validationResult = zodSchema.safeParse(parsedData);
		if (!validationResult.success) {
			serverLogger.error(
				"[parseGenerate] AI output failed schema validation:",
				validationResult.error,
			);
			throw new Error(
				`AI output failed validation: ${validationResult.error.message}`,
			);
		}

		serverLogger.log(
			"[parseGenerate] Successfully generated and validated structured data.",
		);
		return validationResult.data;
	} catch (error) {
		serverLogger.error(
			"[parseGenerate] Error in generic structured data generation:",
			error,
		);
		throw new Error(
			`Failed to generate structured data: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
