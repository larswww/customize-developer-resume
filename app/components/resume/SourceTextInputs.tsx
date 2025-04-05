import React, { useState, useEffect } from "react";
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MarkdownEditor } from "~/components/MarkdownEditor";

interface SourceTextInputsProps {
  sourceSteps: { id: string; name: string }[];
  sourceTexts: Record<string, string>;
  editorRefs: Record<string, React.RefObject<MDXEditorMethods | null>>;
}

export function SourceTextInputs({ sourceSteps, sourceTexts, editorRefs }: SourceTextInputsProps) {
  if (!sourceSteps || sourceSteps.length === 0) {
    return (
      <div className="mb-6 p-4 border rounded bg-yellow-50 text-yellow-700">
        No source text sections configured for this workflow in the resume step.
      </div>
    );
  }
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="space-y-4">
      {sourceSteps.map((step) => (
        <div key={step.id} className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
          <div className="mb-3 pb-2 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">{step.name} Text</h3>
            <p className="text-sm text-gray-500 mt-1">
              Edit the AI-generated {step.name.toLowerCase()} below before generating the final
              resume sections.
            </p>
          </div>
          <div className="min-h-[250px]">
            <MarkdownEditor
              markdown={sourceTexts[step.id] || ''}
              onChange={() => {}}
              editorRef={editorRefs[step.id]}
              isClient={isClient}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 