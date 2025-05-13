import { Suspense } from "react";
import { Await } from "react-router";
import { CheckIcon, FailedIcon, LoadingSpinnerIcon } from "./icons";

// Display a completed status with a checkmark
export function StatusCompleted() {
	return (
		<span className="text-green-600 flex items-center">
			<CheckIcon size="md" className="mr-1" />
			Generated
		</span>
	);
}

// Display a loading status for pending jobs
export function StatusPending({ promise }: { promise: Promise<any> }) {
	return (
		<Suspense
			fallback={
				<span className="text-blue-600 flex items-center">
					<LoadingSpinnerIcon size="md" className="mr-1" />
					Processing...
				</span>
			}
		>
			<Await
				resolve={promise}
				errorElement={
					<span className="text-red-600 flex items-center">
						<FailedIcon size="md" className="mr-1" />
						Failed
					</span>
				}
			>
				{(result) => <StatusCompleted />}
			</Await>
		</Suspense>
	);
}

// Component for displaying compact status (icon only)
export function StatusCompletedIcon() {
	return (
		<span className="text-green-600 flex items-center">
			<CheckIcon size="md" />
		</span>
	);
}

// Component for displaying compact pending status (icon only)
export function StatusPendingIcon({ promise }: { promise: Promise<any> }) {
	return (
		<Suspense
			fallback={
				<span className="text-blue-600">
					<LoadingSpinnerIcon size="md" />
				</span>
			}
		>
			<Await
				resolve={promise}
				errorElement={
					<span className="text-red-600">
						<FailedIcon size="md" />
					</span>
				}
			>
				{(result) => <StatusCompletedIcon />}
			</Await>
		</Suspense>
	);
}

// Component for displaying error status
export function StatusError() {
	return (
		<span className="text-red-600 flex items-center">
			<FailedIcon size="md" className="mr-1" />
			Failed
		</span>
	);
}
