import React from 'react';
import type { ContactInfo } from '../config/templates';

interface ContactInfoFormProps {
  contactInfo: ContactInfo;
}

export function ContactInfoForm({ contactInfo }: ContactInfoFormProps) {
  // Define the form fields configuration
  const formFields = [
    { id: 'name', label: 'Name', type: 'text', value: contactInfo.name },
    { id: 'title', label: 'Title', type: 'text', value: contactInfo.title },
    { id: 'location', label: 'Location', type: 'text', value: contactInfo.location },
    { id: 'phone', label: 'Phone', type: 'tel', value: contactInfo.phone },
    { id: 'email', label: 'Email', type: 'email', value: contactInfo.email },
    { id: 'linkedin', label: 'LinkedIn (handle or URL)', type: 'text', value: contactInfo.linkedin },
    { id: 'portfolio', label: 'Portfolio (URL)', type: 'text', value: contactInfo.portfolio ?? '' },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-100">
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {formFields.map((field) => (
          <div key={field.id} className="mb-1">
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              defaultValue={field.value}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 