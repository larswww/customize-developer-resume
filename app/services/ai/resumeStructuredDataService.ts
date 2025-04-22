import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";
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

export async function generateStructuredResume<T extends z.ZodTypeAny>(
	combinedSourceText: string,
	jobDescription: string, // Keep job description for context
	outputSchema: T, // Accept the single schema
): Promise<T> {
	// Return type is still ResumeCoreData

	serverLogger.log("Starting single-call structured resume generation...");

	if (!openai.apiKey) throw new Error("OpenAI API key missing.");

	// Use a regular string for the system prompt (Fixes linter warning)
	const systemPrompt =
		"You are an AI assistant specialized in extracting and structuring resume information (work experience, education, skills) from provided text based on a job description. Structure the output according to the provided JSON schema. Focus on extracting accurately, maintaining original phrasing where appropriate, and organizing the information logically (e.g., work experience newest first). For skills, if context like years of experience is mentioned alongside a skill, include it in the 'context' field for that skill item.";

	const userPrompt = `
Job Description Context:
--- START JOB DESCRIPTION ---
${jobDescription}
--- END JOB DESCRIPTION ---

Resume Source Text:
--- START SOURCE TEXT ---
${combinedSourceText}
--- END SOURCE TEXT ---

Please extract the relevant information and structure it as JSON matching the required format.
`;

	try {
		// Make a single call to the AI
		serverLogger.log("Calling OpenAI API...");
		const completion = await openai.beta.chat.completions.parse({
			model: "gpt-4.1-nano-2025-04-14", // Or another suitable model
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			// Use the provided single output schema
			response_format: zodResponseFormat(outputSchema, "resume_data"),
			temperature: 0.1, // Low temperature for structured output
		});

		const parsedData = completion.choices[0].message.parsed;
		if (!parsedData) {
			throw new Error("AI did not return parsed resume data.");
		}

		serverLogger.log(
			"Successfully generated structured resume data in a single call.",
		);
		// Validate the output against the schema (optional but recommended)
		const validationResult = outputSchema.safeParse(parsedData);
		if (!validationResult.success) {
			serverLogger.error(
				"AI output failed schema validation:",
				validationResult.error,
			);
			// Decide how to handle validation errors - throw, return partial, etc.
			throw new Error(
				`AI output failed validation: ${validationResult.error.message}`,
			);
		}

		// Return the validated data, ensuring it conforms to ResumeCoreData
		return validationResult.data;
	} catch (error) {
		serverLogger.error("Error in single-call resume generation:", error);
		throw new Error(
			`Failed to generate structured resume: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
