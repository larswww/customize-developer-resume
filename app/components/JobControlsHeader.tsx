import React from 'react';
import { Select, type SelectOption } from '~/components/ui/Select';
import { defaultTemplateId } from '~/config/templates';
import { defaultWorkflowId } from '~/config/workflows';

interface WorkflowOption {
    id: string;
    label: string;
}

interface TemplateOption {
    id: string;
    name: string;
}

interface JobControlsHeaderProps {
    // Workflow Props
    availableWorkflows: WorkflowOption[];
    currentWorkflowId: string;
    onWorkflowChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    workflowLabel?: string;

    // Template Props
    availableTemplates: TemplateOption[];
    currentTemplateId: string;
    onTemplateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    templateLabel?: string;

    // Optional additional content or styling
    className?: string;
    compact?: boolean; // Add option for compact layout vs boxed layout
}

export function JobControlsHeader({
    availableWorkflows,
    currentWorkflowId,
    onWorkflowChange,
    workflowLabel = "Select Workflow",
    availableTemplates,
    currentTemplateId,
    onTemplateChange,
    templateLabel = "Select Template",
    className = '',
    compact = false
}: JobControlsHeaderProps) {
    // Convert workflow options to format expected by Select component
    const workflowOptions: SelectOption[] = availableWorkflows.map(wf => ({
        value: wf.id,
        label: wf.label
    }));
    
    // Convert template options to format expected by Select component
    const templateOptions: SelectOption[] = availableTemplates.map(template => ({
        value: template.id,
        label: template.name
    }));
    
    // Use the nice styled container with background if not in compact mode
    const containerClasses = compact 
        ? `grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${className}`
        : `bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6 ${className}`;
        
    return (
        <div className={containerClasses}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    id="workflowId"
                    name="workflow"
                    options={workflowOptions}
                    value={currentWorkflowId}
                    onChange={onWorkflowChange}
                    label={workflowLabel}
                    fullWidth
                />
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
        </div>
    );
} 