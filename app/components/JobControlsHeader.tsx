import React from 'react';
import { WorkflowSelector } from './WorkflowSelector';
import { TemplateSelector } from './TemplateSelector';

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
}

export function JobControlsHeader({
    availableWorkflows,
    currentWorkflowId,
    onWorkflowChange,
    workflowLabel,
    availableTemplates,
    currentTemplateId,
    onTemplateChange,
    templateLabel,
    className = ''
}: JobControlsHeaderProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${className}`}>
            <WorkflowSelector
                availableWorkflows={availableWorkflows}
                currentWorkflowId={currentWorkflowId}
                onWorkflowChange={onWorkflowChange}
                label={workflowLabel}
            />
            <TemplateSelector
                availableTemplates={availableTemplates}
                currentTemplateId={currentTemplateId}
                onTemplateChange={onTemplateChange}
                label={templateLabel}
            />
        </div>
    );
} 