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

// Helper to construct the user prompt, incorporating optional feedback
function constructUserPrompt(
	jobDescription: string,
	combinedSourceText: string,
	feedback?: string,
): string {
	let prompt = `
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

	if (feedback) {
		prompt += `

Refinement Feedback:
--- START FEEDBACK ---
${feedback}
--- END FEEDBACK ---

Please refine the structured output based on this feedback.
`;
	}

	return prompt;
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
		model: "gpt-4.1", // Or another suitable model
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: feedback },
		],
		// Use the provided single output schema
		response_format: zodResponseFormat(outputSchema, "feedback-resume"),
		temperature: 0.1, // Low temperature for structured output
	});

	return completion.choices[0].message.parsed as T;
}

export async function generateStructuredResume<T extends z.ZodTypeAny>(
	combinedSourceText: string,
	jobDescription: string, // Keep job description for context
	outputSchema: T, // Accept the single schema
	feedback?: string, // Optional feedback parameter
): Promise<T> {
	serverLogger.log("Starting single-call structured resume generation...");
	if (feedback) {
		serverLogger.log("Incorporating feedback into generation.");
	}

	if (!openai.apiKey) throw new Error("OpenAI API key missing.");

	const systemPrompt =
		"You are an AI assistant specialized in extracting and structuring resume information (work experience, education, skills) from provided text based on a job description. Structure the output according to the provided JSON schema. Focus on extracting accurately, maintaining original phrasing where appropriate, and organizing the information logically (e.g., work experience newest first). For skills, if context like years of experience is mentioned alongside a skill, include it in the 'context' field for that skill item. If refinement feedback is provided, adjust the output accordingly.";

	const userPrompt = constructUserPrompt(
		jobDescription,
		combinedSourceText,
		feedback,
	);

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
			`Failed to generate structured resume: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
