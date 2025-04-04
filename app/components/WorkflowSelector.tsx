import React from 'react';

interface WorkflowOption {
  id: string;
  label: string;
}

interface WorkflowSelectorProps {
  availableWorkflows: WorkflowOption[];
  currentWorkflowId: string;
  onWorkflowChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string; // Optional label for the select element
}

export function WorkflowSelector({ 
  availableWorkflows,
  currentWorkflowId,
  onWorkflowChange,
  label = "Select Workflow" // Default label
}: WorkflowSelectorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="workflowId" className="block mb-2 font-medium">
        {label}
      </label>
      <select
        id="workflowId"
        name="workflowId" // Keep name attribute if needed for form submission on the page
        value={currentWorkflowId}
        onChange={onWorkflowChange}
        className="w-full md:w-1/3 p-2 border rounded"
      >
        {availableWorkflows.map(wf => (
          <option key={wf.id} value={wf.id}>
            {wf.label}
          </option>
        ))}
      </select>
    </div>
  );
} 