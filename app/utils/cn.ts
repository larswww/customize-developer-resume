import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility for constructing className strings conditionally
 * Combines clsx for conditional classes with tailwind-merge to handle conflicting Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
