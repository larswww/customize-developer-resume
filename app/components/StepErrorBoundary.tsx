import React from "react";

interface StepErrorBoundaryProps {
	stepId: string;
	error: Error;
}

export function StepErrorBoundary({ stepId, error }: StepErrorBoundaryProps) {
	// Log the error to the console for debugging
	console.error(`Error in workflow step ${stepId}:`, error);

	return (
		<div className="ml-10 p-3 border rounded bg-red-50 text-red-500">
			<div className="font-medium mb-2">Error processing this step:</div>
			<div className="mb-2">{error.message}</div>
			<details className="text-xs">
				<summary className="cursor-pointer">Technical details</summary>
				<pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
					{error.stack || "No stack trace available"}
				</pre>
			</details>
		</div>
	);
}
