import React from "react";
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";

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

  return (
    <div className="space-y-4">
      {sourceSteps.map((step) => (
 
          <div key={step.id} className="min-h-[250px]">
            <ClientMarkdownEditor
              markdown={sourceTexts[step.id] || ''}
              onChange={() => {}}
              editorRef={editorRefs[step.id]}
            />
          </div>

      ))}
    </div>
  );
} 