import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";
import type { ResumeCoreData } from "~/config/schemas/sharedTypes";
import { serverLogger } from "~/utils/logger.server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
	serverLogger.warn(
		"OpenAI API key is missing. Structured resume generation will fail.",
	);
}
const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

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
