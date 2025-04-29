import type { z } from "zod";
import { serverLogger } from "~/utils/logger.server";
import { generateStructuredResume } from "../ai/resumeStructuredDataService";

export interface ResumeGenerationResult<T extends z.ZodTypeAny> {
	success: boolean;
	structuredData?: T;
	error?: string;
}
export async function generateAndSaveResume<T extends z.ZodTypeAny>(
	combinedSourceText: string,
	jobDescription: string,
	outputSchema: T,
	feedback?: string,
): Promise<ResumeGenerationResult<T>> {
	try {
		const generatedCoreData = await generateStructuredResume(
			combinedSourceText,
			jobDescription,
			outputSchema,
			feedback,
		);

		return {
			success: true,
			structuredData: generatedCoreData,
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
