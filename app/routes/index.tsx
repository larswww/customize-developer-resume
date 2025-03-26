import { useState } from 'react';
import { Form, useActionData } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { WorkflowEngine } from '../services/workflow/WorkflowEngine';
import { workflowSteps } from '../config/workflow';
import ReactMarkdown from 'react-markdown';
import { workHistory } from '../data/workHistory';

// You'll need to set these up in your environment
const API_KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  gemini: process.env.GEMINI_API_KEY || '',
};

export function meta() {
  return [
    { title: "AI Resume Generator" },
    { name: "description", content: "Generate targeted resumes using AI" },
  ];
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobDescription = formData.get('jobDescription') as string;
  
  try {
    const engine = new WorkflowEngine(API_KEYS, workflowSteps);
    const generatedResume = await engine.execute(jobDescription, workHistory);
    return { success: true, result: generatedResume };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

export default function Index() {
  const [jobDescription, setJobDescription] = useState('');
  const actionData = useActionData<{ success: boolean, result?: string, error?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    setIsSubmitting(true);
    // Form will handle the actual submission
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Resume Generator</h1>
      
      <Form method="post" className="mb-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="jobDescription" className="block mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-48 p-2 border rounded"
            placeholder="Paste the job description here..."
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generating...' : 'Generate Resume'}
        </button>
      </Form>

      {actionData?.error && (
        <div className="text-red-500 mb-4">
          {actionData.error}
        </div>
      )}

      {actionData?.success && actionData.result && (
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Generated Resume</h2>
          <ReactMarkdown>{actionData.result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
} 