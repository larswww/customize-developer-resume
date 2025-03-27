/**
 * Helper function to extract JSON from potential markdown code blocks
 *
 * @param text - Text that may contain JSON within markdown code blocks
 * @returns The extracted JSON text, ready for parsing
 */
export const extractJSON = (text: string): string => {
	// Check if the response contains markdown code blocks
	const jsonRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/;
	const match = text.match(jsonRegex);

	if (match?.[1]) {
		return match[1].trim();
	}

	// If no markdown code block found, assume it's raw JSON
	return text.trim();
};
