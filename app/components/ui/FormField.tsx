import { type FieldMetadata, useInputControl } from "@conform-to/react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { cn } from "~/utils/cn";
import { ClientMarkdownEditor } from "../MarkdownEditor";
import { Input } from "./input";
import { Textarea } from "./textarea";

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

export interface FormMarkdownEditorProps {
	meta: FieldMetadata<string>;
	label?: string;
	editorRef: React.RefObject<MDXEditorMethods | null>;
	placeholder?: string;
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
			<Input
				id={meta.id}
				name={meta.name}
				type={type}
				value={control.value ?? ""}
				onChange={(e) => control.change(e.target.value)}
				onFocus={control.focus}
				onBlur={control.blur}
				className={cn(
					hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
					className,
				)}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? meta.errorId : undefined}
				{...props}
			/>
			<div
				id={meta.errorId}
				className={cn(
					"text-xs min-h-[1.25rem]",
					hasError ? "text-red-600" : "text-transparent",
				)}
			>
				{hasError
					? Array.isArray(meta.errors)
						? meta.errors.join(", ")
						: meta.errors
					: "\u00A0"}
			</div>
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
			<Textarea
				id={meta.id}
				name={meta.name}
				value={control.value ?? ""}
				onChange={(e) => control.change(e.target.value)}
				onFocus={control.focus}
				onBlur={control.blur}
				className={cn(
					hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
					className,
				)}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? meta.errorId : undefined}
				{...props}
			/>
			<div
				id={meta.errorId}
				className={cn(
					"text-xs min-h-[1.25rem]",
					hasError ? "text-red-600" : "text-transparent",
				)}
			>
				{hasError
					? Array.isArray(meta.errors)
						? meta.errors.join(", ")
						: meta.errors
					: "\u00A0"}
			</div>
		</div>
	);
};

const FormMarkdownEditor = ({
	meta,
	label,
	editorRef,
	placeholder,
}: FormMarkdownEditorProps) => {
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
			<ClientMarkdownEditor
				name={meta.name}
				markdown={control.value ?? ""}
				onChange={(markdown) => {
					control.change(markdown);
				}}
				editorRef={editorRef}
				placeholder={placeholder}
			/>
			<div
				id={meta.errorId}
				className={cn(
					"text-xs min-h-[1.25rem]",
					hasError ? "text-red-600" : "text-transparent",
				)}
			>
				{hasError
					? Array.isArray(meta.errors)
						? meta.errors.join(", ")
						: meta.errors
					: "\u00A0"}
			</div>
		</div>
	);
};

FormField.displayName = "FormField";
FormTextArea.displayName = "FormTextArea";
FormMarkdownEditor.displayName = "FormMarkdownEditor";

export { FormField, FormTextArea, FormMarkdownEditor };
