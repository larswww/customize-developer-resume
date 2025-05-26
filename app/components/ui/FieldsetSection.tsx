import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~/utils/cn";
import { FormSectionHeader } from "./FormSectionHeader";

const fieldsetSectionVariants = cva("rounded-lg border p-6 mb-6", {
	variants: {
		variant: {
			default: "border-gray-200",
			subtle:
				"bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm p-4 mb-2",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface FieldsetSectionProps
	extends VariantProps<typeof fieldsetSectionVariants> {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function FieldsetSection({
	title = "",
	description,
	children,
	className,
	variant,
}: FieldsetSectionProps) {
	return (
		<fieldset className={cn(fieldsetSectionVariants({ variant, className }))}>
			<legend className="px-2">
				<FormSectionHeader title={title} description={description} />
			</legend>
			<div className="space-y-4">{children}</div>
		</fieldset>
	);
}

export { fieldsetSectionVariants };
