import { CheckIcon, FailedIcon, LoadingSpinnerIcon } from "./icons";

// Component for displaying compact status (icon only)
export function StatusCompletedIcon() {
	return (
		<span className="text-green-600 flex items-center">
			<CheckIcon size="md" />
		</span>
	);
}

export function TemplateStatusIcon({
	status,
}: { status: "completed" | "pending" | "not-started" | "failed" }) {
	if (status === "completed") {
		return <StatusCompletedIcon />;
	}
	if (status === "pending") {
		return (
			<span className="flex items-center">
				<LoadingSpinnerIcon size="md" />
			</span>
		);
	}
	if (status === "failed") {
		return (
			<span className="text-red-600">
				<FailedIcon size="md" />
			</span>
		);
	}
	return (
		<span className="text-gray-400 flex items-center">
			<svg width="20" height="20" fill="none" viewBox="0 0 20 20">
				<title>Not started</title>
				<circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
			</svg>
		</span>
	);
}
