import type { AIResponse, WorkflowContext } from "../services/ai/types";
import { extractJSON } from "./jsonUtils";

/**
 * Creates a transform function for steps that convert AI responses to JSON
 *
 * @param stepId - The ID of the workflow step
 * @param resultKey - Key to store the result under in intermediateResults
 * @returns A transform function that handles JSON parsing and error handling
 */
export const createJsonTransform = (stepId: string, resultKey: string) => {
	return (response: AIResponse, context: WorkflowContext) => {
		try {
			const jsonText = extractJSON(response.text);
			const result = JSON.parse(jsonText);

			// Store result in the context for later steps
			if (resultKey) {
				context.intermediateResults[resultKey] = result;
			}

			return result;
		} catch (error: unknown) {
			console.error(`Failed to parse JSON in ${stepId} step:`, error);
			console.error("Raw response:", response.text);
			// Return the raw text if we can't parse it
			return response.text;
		}
	};
};

/**
 * Simple transform for text responses that don't need parsing
 *
 * @param response - The AI response
 * @returns The text content from the response
 */
export const textTransform = (response: AIResponse) => {
	return response.text;
};

/**
 * Transformer for Markdown responses that returns the text as is
 * but stores it under a specific key in the context
 */
export function createMarkdownTransform(stepId: string, contextKey: string) {
	return (response: AIResponse, context: WorkflowContext) => {
		// Store the result in the context with the specified key
		if (contextKey) {
			context.intermediateResults[contextKey] = response.text.trim();
		}
		// Simply return the markdown text as is
		return response.text.trim();
	};
}
