import React, { Suspense } from "react";
import { Await } from "react-router";
import type { WorkflowStep } from "~/services/ai/types";
import { LoadingSpinnerIcon, CheckIcon } from "./Icons";

interface WorkflowProgressBarProps {
  steps: WorkflowStep[];
  stepPromises: Map<string, Promise<{ stepId: string; result: string }>>;
  height?: string;
}

function ErrorStepIndicator() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-red-500 text-white">
      X
    </div>
  );
}

export function CompleteStepIndicator() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-green-500 text-white">
      <CheckIcon size="sm" />
    </div>
  );
}

export function PendingStepIndicator() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-blue-500 text-white">
      <LoadingSpinnerIcon size="sm" />
    </div>
  );
}

export function WorkflowProgressBar({ 
  steps, 
  stepPromises,
  height = 'min-h-[200px]'
}: WorkflowProgressBarProps) {
  // Calculate the completed steps based on the resolved promises
  const completedSteps = new Set<string>();
  
  // Calculate progress percentage based on completedSteps size
  const getProgressPercentage = () => {
    return steps.length > 0 
      ? Math.round((completedSteps.size / steps.length) * 100) 
      : 0;
  };
  
  // Calculate the current step index based on completed steps
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => !completedSteps.has(step.id));
  };

  return (
    <div className={`w-full mb-8 ${height}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">
          Generating content ({getProgressPercentage()}%)
        </div>
        <div className="text-sm text-gray-500">
          Step {Math.min(getCurrentStepIndex() + 1, steps.length)} of {steps.length}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      <div className="relative">
        <div className="absolute w-full h-0.5 bg-gray-200 top-4 z-0" />
        
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            return (
              <div key={step.id} className="flex flex-col items-center">
              
                <Suspense fallback={<PendingStepIndicator />}>
                    <Await resolve={stepPromises.get(step.id)}>
                        {(stepResult) => {
                            if (!stepResult) {
                                return <ErrorStepIndicator />
                            }
                            completedSteps.add(stepResult.stepId);
                            return (
                                <CompleteStepIndicator />
                            )
                        }}
                    </Await>
                </Suspense>
                <div className="text-xs text-center font-medium max-w-[100px] truncate">
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.estimatedTimeInMinutes || 1} min
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 