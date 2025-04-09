import React from 'react';
import type { ContactInfo } from '../config/templates/sharedTypes';
import { defaultContactInfo } from '../config/templates/sharedTypes';

interface ContactInfoFormProps {
  contactInfo: ContactInfo;
}

export function ContactInfoForm({ contactInfo }: ContactInfoFormProps) {
  // Define the form fields configuration
  console.log("contactInfo ", contactInfo);
  const contactValues = contactInfo || defaultContactInfo;

  const formFields = [
    { id: 'name', label: 'Name', type: 'text', value: contactValues.name },
    { id: 'title', label: 'Title', type: 'text', value: contactValues.title },
    { id: 'location', label: 'Location', type: 'text', value: contactValues.location },
    { id: 'phone', label: 'Phone', type: 'tel', value: contactValues.phone },
    { id: 'email', label: 'Email', type: 'email', value: contactValues.email },
    { id: 'linkedin', label: 'LinkedIn (handle or URL)', type: 'text', value: contactValues.linkedin },
    { id: 'portfolio', label: 'Portfolio (URL)', type: 'text', value: contactValues.portfolio ?? '' },
    { id: 'imageUrl', label: 'Image (URL)', type: 'url', value: contactValues.imageUrl ?? '' },
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