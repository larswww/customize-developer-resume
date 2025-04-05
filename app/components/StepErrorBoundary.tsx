import React from "react";
import { WarningIcon } from "./Icons";

interface StepErrorBoundaryProps {
	stepId: string;
	error: Error;
}

export function StepErrorBoundary({ stepId, error }: StepErrorBoundaryProps) {
	return (
		<div className="p-3 rounded bg-red-50">
			<div className="flex items-center text-red-600 mb-2">
				<WarningIcon />
				<span>Error in step: {stepId}</span>
			</div>
			<div className="mt-2 p-2 bg-red-100 text-red-800 rounded font-mono text-sm overflow-auto">
				{error.message}
			</div>
		</div>
	);
}
