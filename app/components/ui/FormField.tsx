import { type FieldMetadata, useInputControl } from "@conform-to/react";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { type VariantProps, cva } from "class-variance-authority";
import React from "react";
import { cn } from "~/utils/cn";
import { ClientMarkdownEditor } from "../MarkdownEditor";
import {
	EmailIcon,
	ExternalLinkIcon,
	type IconSize,
	LinkIcon,
	LocationIcon,
	PhoneIcon,
} from "../icons";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

const formFieldVariants = cva("flex flex-col gap-0.5", {
	variants: {
		variant: {
			default: "space-y-2",
			inset: "relative pt-4",
		},
		error: {
			true: "",
			false: "",
		},
		withIcon: {
			true: "",
			false: "",
		},
	},
	defaultVariants: {
		variant: "default",
		error: false,
		withIcon: false,
	},
});

const inputVariants = cva("", {
	variants: {
		error: {
			true: "border-red-300 focus:border-red-500 focus:ring-red-500",
			false: "",
		},
		withIcon: {
			true: "pr-10",
			false: "",
		},
	},
	defaultVariants: {
		error: false,
		withIcon: false,
	},
});

function getDefaultIcon(
	type: string,
	size: IconSize = "md",
): React.ReactNode | null {
	switch (type) {
		case "url":
			return <LinkIcon size={size} />;
		case "email":
			return <EmailIcon size={size} />;
		case "phone":
			return <PhoneIcon size={size} />;
		case "location":
			return <LocationIcon size={size} />;

		default:
			return null;
	}
}

function FormFieldLabel({
	htmlFor,
	label,
	variant,
	hasValue,
	isFocused,
}: {
	htmlFor: string;
	label?: string;
	variant: "default" | "inset";
	hasValue: boolean;
	isFocused: boolean;
}) {
	if (!label) return null;
	if (variant === "inset") {
		return (
			<label
				htmlFor={htmlFor}
				className={cn(
					"absolute left-3 top-0 z-10 origin-[0] transition-all duration-200 pointer-events-none px-2 rounded bg-white dark:bg-neutral-900",
					hasValue || isFocused
						? "text-xs text-muted-foreground font-normal translate-y-1/3 scale-90"
						: "text-base text-muted-foreground font-normal translate-y-1/2 scale-100",
				)}
				style={{ backgroundClip: "padding-box" }}
			>
				{label}
			</label>
		);
	}
	return (
		<label
			htmlFor={htmlFor}
			className={cn(
				"block text-sm",
				variant === "default"
					? "font-medium text-gray-700"
					: "font-normal text-xs text-muted-foreground",
			)}
		>
			{label}
		</label>
	);
}

function FormFieldError({
	errorId,
	errors,
}: { errorId: string; errors?: string[] | string }) {
	const hasError =
		errors && (Array.isArray(errors) ? errors.length > 0 : !!errors);
	return (
		<div
			id={errorId}
			className={cn(
				"text-xs min-h-[1.25rem]",
				hasError ? "text-red-600" : "text-transparent",
			)}
		>
			{hasError
				? Array.isArray(errors)
					? errors.join(", ")
					: errors
				: "\u00A0"}
		</div>
	);
}

export interface FormFieldProps
	extends Omit<
			React.InputHTMLAttributes<HTMLInputElement>,
			"name" | "value" | "defaultValue"
		>,
		VariantProps<typeof formFieldVariants> {
	meta: FieldMetadata<string>;
	label?: string;
	icon?: React.ReactNode | false;
	disableIcon?: boolean;
}

const FormField = ({
	meta,
	className,
	label,
	type = "text",
	variant: variantProp = "default",
	icon,
	disableIcon,
	...props
}: FormFieldProps) => {
	const control = useInputControl(meta);
	const hasError = meta.errors && meta.errors.length > 0;
	const hasValue = Boolean(control.value);
	const [isFocused, setIsFocused] = React.useState(false);
	const variant = variantProp ?? "default";
	const showIcon =
		icon !== false && !disableIcon && (icon || getDefaultIcon(type));
	return (
		<div
			className={cn(
				formFieldVariants({
					variant,
					error: hasError,
					withIcon: !!showIcon,
					className,
				}),
			)}
		>
			<FormFieldLabel
				htmlFor={meta.id}
				label={label}
				variant={variant}
				hasValue={hasValue}
				isFocused={isFocused}
			/>
			<div className={showIcon ? "relative" : undefined}>
				{showIcon && (
					<span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
						{icon || getDefaultIcon(type)}
					</span>
				)}
				<Input
					id={meta.id}
					name={meta.name}
					type={type}
					value={control.value ?? ""}
					onChange={(e) => control.change(e.target.value)}
					onFocus={(e) => {
						setIsFocused(true);
						control.focus();
					}}
					onBlur={(e) => {
						setIsFocused(false);
						control.blur();
					}}
					className={cn(
						inputVariants({ error: hasError, withIcon: !!showIcon }),
						className,
					)}
					aria-invalid={hasError || undefined}
					aria-describedby={hasError ? meta.errorId : undefined}
					{...props}
				/>
			</div>
			<FormFieldError errorId={meta.errorId} errors={meta.errors} />
		</div>
	);
};

export interface FormTextAreaProps
	extends Omit<
			React.TextareaHTMLAttributes<HTMLTextAreaElement>,
			"name" | "value" | "defaultValue"
		>,
		VariantProps<typeof formFieldVariants> {
	meta: FieldMetadata<string>;
	label?: string;
}

const FormTextArea = ({
	meta,
	className,
	label,
	variant: variantProp = "default",
	...props
}: FormTextAreaProps) => {
	const control = useInputControl(meta);
	const hasError = meta.errors && meta.errors.length > 0;
	const variant = variantProp ?? "default";
	return (
		<div
			className={cn(formFieldVariants({ variant, error: hasError, className }))}
		>
			<FormFieldLabel
				htmlFor={meta.id}
				label={label}
				variant={variant}
				hasValue={Boolean(control.value)}
				isFocused={false}
			/>
			<Textarea
				id={meta.id}
				name={meta.name}
				value={control.value ?? ""}
				onChange={(e) => control.change(e.target.value)}
				onFocus={control.focus}
				onBlur={control.blur}
				className={cn(inputVariants({ error: hasError }), className)}
				aria-invalid={hasError || undefined}
				aria-describedby={hasError ? meta.errorId : undefined}
				{...props}
			/>
			<FormFieldError errorId={meta.errorId} errors={meta.errors} />
		</div>
	);
};

export interface FormMarkdownEditorProps {
	meta: FieldMetadata<string>;
	label?: string;
	editorRef: React.RefObject<MDXEditorMethods | null>;
	placeholder?: string;
	variant?: "default" | "inset";
}

const FormMarkdownEditor = ({
	meta,
	label,
	editorRef,
	placeholder,
	variant: variantProp = "default",
}: FormMarkdownEditorProps) => {
	const control = useInputControl(meta);
	const hasError = meta.errors && meta.errors.length > 0;
	const variant = variantProp ?? "default";
	return (
		<div className={cn(formFieldVariants({ variant, error: hasError }))}>
			<FormFieldLabel
				htmlFor={meta.id}
				label={label}
				variant={variant}
				hasValue={Boolean(control.value)}
				isFocused={false}
			/>
			<ClientMarkdownEditor
				name={meta.name}
				markdown={control.value ?? ""}
				onChange={(markdown) => {
					control.change(markdown);
				}}
				editorRef={editorRef}
				placeholder={placeholder}
			/>
			<FormFieldError errorId={meta.errorId} errors={meta.errors} />
		</div>
	);
};

function isValidUrl(url?: string) {
	if (!url) return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export interface FormFieldWithLinkButtonProps extends FormFieldProps {
	buttonTitle?: string;
	buttonClassName?: string;
}

function FormFieldWithLinkButton({
	meta,
	buttonTitle = "Open link in new tab",
	buttonClassName,
	...props
}: FormFieldWithLinkButtonProps) {
	const value = meta?.value;
	const valid = isValidUrl(value);
	return (
		<div className="flex flex-row items-baseline">
			<FormField meta={meta} {...props} className={valid ? "pr-2" : ""} />
			{valid && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => window.open(value, "_blank", "noopener,noreferrer")}
					title={buttonTitle}
				>
					<ExternalLinkIcon size="md" />
				</Button>
			)}
		</div>
	);
}

FormField.displayName = "FormField";
FormTextArea.displayName = "FormTextArea";
FormMarkdownEditor.displayName = "FormMarkdownEditor";
FormFieldWithLinkButton.displayName = "FormFieldWithLinkButton";

export { FormField, FormTextArea, FormMarkdownEditor, FormFieldWithLinkButton };
