import React from "react";
import { LoadingSpinnerIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";

interface ResumeGenerationControlsProps {
  isSubmitting: boolean;
  isGenerating: boolean;
  sourceSteps: { id: string; name: string }[];
  sourceTexts: Record<string, string>;
}

export function ResumeGenerationControls({
  isSubmitting,
  isGenerating,
  sourceSteps,
  sourceTexts,
}: ResumeGenerationControlsProps) {
  const allSourceTextsPresent = sourceSteps.every(step => sourceTexts[step.id] && sourceTexts[step.id].trim() !== '');
  const generateDisabled = isSubmitting || isGenerating || !allSourceTextsPresent;
  const missingTexts = sourceSteps
    .filter(step => !sourceTexts[step.id] || sourceTexts[step.id].trim() === '')
    .map(step => step.name)
    .join(', ');

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Resume Generation</h2>
        <Button
          type="submit"
          name="actionType"
          value="generate"
          variant="primary"
          size="lg"
          disabled={generateDisabled}
          title={
            generateDisabled
              ? `Cannot generate: Required text missing for: ${missingTexts || 'Unknown sections'}`
              : "Generate structured resume sections"
          }
          className="w-full sm:w-auto shadow-sm hover:shadow"
        >
          {isGenerating ? (
            <>
              <LoadingSpinnerIcon />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <>Generate Resume Sections</>
          )}
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Confirm your details and text inputs above, then use the button to generate the structured resume sections.
      </p>

      {!allSourceTextsPresent && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-100">
          <p className="text-center">
            Required text missing for: {missingTexts || 'Unknown sections'}. Please fill all sections before generating.
          </p>
        </div>
      )}
    </div>
  );
} 