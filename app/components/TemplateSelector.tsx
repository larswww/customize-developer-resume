import React from 'react';

interface TemplateOption {
  id: string;
  name: string;
}

interface TemplateSelectorProps {
  availableTemplates: TemplateOption[];
  currentTemplateId: string;
  onTemplateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
}

export function TemplateSelector({ 
  availableTemplates,
  currentTemplateId,
  onTemplateChange,
  label = "Select Template"
}: TemplateSelectorProps) {
  return (
    <div>
      <label htmlFor="template-selector" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id="template-selector"
        name="templateId" // Name might not be strictly needed if controlled via URL params
        value={currentTemplateId}
        onChange={onTemplateChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
      >
        {availableTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
} 