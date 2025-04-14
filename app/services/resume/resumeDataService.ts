import type { z } from "zod";
import { serverLogger } from "~/utils/logger.server";
import type { ContactInfo } from "../../config/templates";
import { generateStructuredResume } from "../ai/resumeStructuredDataService";
import dbService from "../db/dbService.server";
export interface ResumeGenerationResult {
	success: boolean;
	resumeData?: any;
	error?: string;
}

/**
 * Generates and saves structured resume data
 */
export async function generateAndSaveResume<T extends z.ZodTypeAny>(
	jobId: number,
	contactInfo: ContactInfo,
	sourceTexts: Record<string, string>,
	resumeSourceSteps: { id: string; name: string }[],
	jobDescription: string,
	outputSchema: T,
): Promise<ResumeGenerationResult> {
	try {
		// Validate inputs
		const missingSteps: string[] = [];
		for (const step of resumeSourceSteps) {
			const text = sourceTexts[step.id];
			if (!text || text.trim() === "") {
				missingSteps.push(step.name);
			}
		}

		if (missingSteps.length > 0) {
			return {
				success: false,
				error: `Missing required input: Text for ${missingSteps.join(", ")} cannot be empty. Please ensure all source text sections are filled.`,
			};
		}

		// Combine source texts for AI processing
		const combinedSourceText = resumeSourceSteps
			.map((step) => `${step.name.toUpperCase()}:\n${sourceTexts[step.id]}`)
			.join("\n\n---\n\n");

		// Generate structured data using AI
		const generatedCoreData = await generateStructuredResume(
			combinedSourceText,
			jobDescription,
			outputSchema,
		);

		// Save to database
		const finalResumeData = {
			contactInfo,
			...generatedCoreData,
		};

		dbService.saveResume({
			jobId: jobId,
			structuredData: generatedCoreData,
			resumeText: combinedSourceText,
		});

		return {
			success: true,
			resumeData: finalResumeData,
		};
	} catch (error) {
		serverLogger.error("Error in resume generation:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "An unknown error occurred during resume processing",
		};
	}
}
