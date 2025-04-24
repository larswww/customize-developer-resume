import { forwardRef } from "react";
import { cn } from "~/utils/cn";

export interface FormFieldProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string | string[] | undefined;
	errorId?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
	(
		{
			className,
			label,
			error,
			id,
			errorId,
			"aria-invalid": ariaInvalid,
			...props
		},
		ref,
	) => {
		const hasError =
			error &&
			(typeof error === "string" ? error.length > 0 : error.length > 0);

		return (
			<div className="space-y-2">
				<label htmlFor={id} className="block text-sm font-medium text-gray-700">
					{label}
				</label>
				<input
					id={id}
					className={cn(
						"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
						"py-2 px-3",
						"transition-colors duration-200",
						hasError &&
							"border-red-300 focus:border-red-500 focus:ring-red-500",
						className,
					)}
					ref={ref}
					aria-invalid={ariaInvalid ?? (hasError || undefined)}
					aria-describedby={errorId}
					{...props}
				/>
				{hasError && (
					<div id={errorId} className="text-sm text-red-600">
						{Array.isArray(error) ? error.join(", ") : error}
					</div>
				)}
			</div>
		);
	},
);

FormField.displayName = "FormField";

export { FormField };
