import { type FieldMetadata, useInputControl } from "@conform-to/react";
import { cn } from "~/utils/cn";

export interface FormFieldProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"name" | "value" | "defaultValue"
	> {
	meta: FieldMetadata<string>;
	label?: string;
}

export interface FormTextAreaProps
	extends Omit<
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		"name" | "value" | "defaultValue"
	> {
	meta: FieldMetadata<string>;
	label?: string;
}

const FormField = ({
	meta,
	className,
	label,
	type = "text",
	...props
}: FormFieldProps) => {
	const control = useInputControl(meta);
	const hasError = meta.errors && meta.errors.length > 0;

	return (
		<div className="space-y-2">
			{label && (
				<label
					htmlFor={meta.id}
					className="block text-sm font-medium text-gray-700"
				>
					{label}
				</label>
			)}
			<input
				id={meta.id}
				name={meta.name}
				type={type}
				value={control.value ?? ""}
				onChange={(e) => control.change(e.target.value)}
				onFocus={control.focus}
				onBlur={control.blur}
				className={cn(
					"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
					"py-2 px-3",
					"transition-colors duration-200",
					hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
					className,
				)}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? meta.errorId : undefined}
				{...props}
			/>
			{hasError && (
				<div id={meta.errorId} className="text-sm text-red-600">
					{Array.isArray(meta.errors) ? meta.errors.join(", ") : meta.errors}
				</div>
			)}
		</div>
	);
};

const FormTextArea = ({
	meta,
	className,
	label,
	...props
}: FormTextAreaProps) => {
	const control = useInputControl(meta);
	const hasError = meta.errors && meta.errors.length > 0;

	return (
		<div className="space-y-2">
			{label && (
				<label
					htmlFor={meta.id}
					className="block text-sm font-medium text-gray-700"
				>
					{label}
				</label>
			)}
			<textarea
				id={meta.id}
				name={meta.name}
				value={control.value ?? ""}
				onChange={(e) => control.change(e.target.value)}
				onFocus={control.focus}
				onBlur={control.blur}
				className={cn(
					"block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
					"py-2 px-3",
					"transition-colors duration-200",
					hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
					className,
				)}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? meta.errorId : undefined}
				{...props}
			/>
			{hasError && (
				<div id={meta.errorId} className="text-sm text-red-600">
					{Array.isArray(meta.errors) ? meta.errors.join(", ") : meta.errors}
				</div>
			)}
		</div>
	);
};

FormField.displayName = "FormField";
FormTextArea.displayName = "FormTextArea";

export { FormField, FormTextArea };
