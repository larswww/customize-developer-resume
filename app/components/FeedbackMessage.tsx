import type { ReactNode } from "react";

interface FeedbackMessageProps {
	type: "info" | "success" | "error";
	children: ReactNode;
}

export function FeedbackMessage({ type, children }: FeedbackMessageProps) {
	const baseClasses = "mb-4 p-3 border rounded";
	let typeClasses = "";
	let darkTypeClasses = ""; // Added for dark mode

	switch (type) {
		case "info":
			typeClasses = "bg-blue-50 text-blue-700 border-blue-200";
			darkTypeClasses =
				"dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"; // Dark mode info
			break;
		case "success":
			typeClasses = "bg-green-50 text-green-600 border-green-200";
			darkTypeClasses =
				"dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"; // Dark mode success
			break;
		case "error":
			typeClasses = "bg-red-50 text-red-600 border-red-200";
			darkTypeClasses =
				"dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"; // Dark mode error
			break;
	}

	return (
		<div className={`${baseClasses} ${typeClasses} ${darkTypeClasses}`}>
			{children}
		</div>
	);
}
