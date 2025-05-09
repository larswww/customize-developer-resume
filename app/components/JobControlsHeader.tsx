import type React from "react";
import { Select, type SelectOption } from "~/components/ui/Select";

interface TemplateOption {
	id: string;
	name: string;
}

interface JobControlsHeaderProps {
	availableTemplates: TemplateOption[];
	currentTemplateId: string;
	onTemplateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	templateLabel?: string;
	className?: string;
	compact?: boolean;
}

export function JobControlsHeader({
	availableTemplates,
	currentTemplateId,
	onTemplateChange,
	templateLabel = "Select Template",
	className = "",
	compact = false,
}: JobControlsHeaderProps) {
	const templateOptions: SelectOption[] = availableTemplates.map(
		(template) => ({
			value: template.id,
			label: template.name,
		}),
	);

	const containerClasses = compact
		? `grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${className}`
		: `bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6 ${className}`;

	return (
		<div className={containerClasses}>
			<Select
				id="templateId"
				name="template"
				options={templateOptions}
				value={currentTemplateId}
				onChange={onTemplateChange}
				label={templateLabel}
				fullWidth
			/>
		</div>
	);
}
