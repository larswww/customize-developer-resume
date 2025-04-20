import type { z } from "zod";
import { serverLogger } from "~/utils/logger.server";
import type { ContactInfo } from "../../config/templates";
import { generateStructuredResume } from "../ai/resumeStructuredDataService";
import dbService from "../db/dbService.server";
export interface ResumeGenerationResult<T extends z.ZodTypeAny> {
  success: boolean;
  structuredData?: T;
  error?: string;
}

/**
 * Generates and saves structured resume data
 */
export async function generateAndSaveResume<T extends z.ZodTypeAny>(
  combinedSourceText: string,
  jobDescription: string,
  outputSchema: T,
): Promise<ResumeGenerationResult<T>> {
  try {
    // Validate inputs

    const generatedCoreData = await generateStructuredResume(
      combinedSourceText,
      jobDescription,
      outputSchema
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
