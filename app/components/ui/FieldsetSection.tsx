import { cn } from "~/utils/cn";
import { FormSectionHeader } from "./FormSectionHeader";

export interface FieldsetSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export function FieldsetSection({
	title,
	description,
	children,
	className,
}: FieldsetSectionProps) {
	return (
		<fieldset
			className={cn("rounded-lg border border-gray-200 p-6 mb-6", className)}
		>
			<legend className="px-2">
				<FormSectionHeader title={title} description={description} />
			</legend>
			<div className="space-y-4">{children}</div>
		</fieldset>
	);
}
