import { z } from "zod";
import serverLogger from "~/utils/logger.server";

export function withErrorHandling<T, R>(
	operation: () => T,
	schema: z.ZodType<R>,
	errorContext: string,
	defaultValue?: R,
): R | null {
	try {
		const result = operation();
		if (result === undefined || result === null) {
			return defaultValue ?? null;
		}
		return schema.parse(result);
	} catch (error) {
		serverLogger.error(`Error in ${errorContext}:`, error);
		return defaultValue ?? null;
	}
}

export function withArrayErrorHandling<T, R>(
	operation: () => T,
	schema: z.ZodType<R[]>,
	errorContext: string,
): R[] {
	try {
		const result = operation();
		if (result === undefined || result === null) {
			return [];
		}
		return schema.parse(result);
	} catch (error) {
		serverLogger.error(`Error in ${errorContext}:`, error);
		return [];
	}
}
