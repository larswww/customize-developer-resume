import { cn } from "~/utils/cn";

export interface FormSectionHeaderProps {
	title: string;
	description?: string;
	className?: string;
}

export function FormSectionHeader({
	title,
	description,
	className,
}: FormSectionHeaderProps) {
	return (
		<div className={cn("mb-4", className)}>
			<h2 className="text-xl font-medium text-gray-900">{title}</h2>
			{description && (
				<p className="mt-1 text-sm text-gray-500">{description}</p>
			)}
		</div>
	);
}
