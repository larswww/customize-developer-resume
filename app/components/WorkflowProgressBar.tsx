import React from 'react';
import type { WorkflowStep } from '../services/ai/types';
import { LoadingSpinnerIcon, CheckIcon } from './Icons';

interface WorkflowProgressBarProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  completedSteps: string[];
  height?: string;
}

export function WorkflowProgressBar({ 
  steps, 
  currentStepIndex, 
  completedSteps,
  height = 'min-h-[200px]'
}: WorkflowProgressBarProps) {
  const totalEstimatedTime = steps.reduce((total, step) => {
    return total + (step.estimatedTimeInMinutes || 1);
  }, 0);

  const completedTime = steps
    .filter((step, index) => index < currentStepIndex || completedSteps.includes(step.id))
    .reduce((total, step) => total + (step.estimatedTimeInMinutes || 1), 0);
  
  const progress = completedSteps.length === steps.length 
    ? 100 
    : (completedTime / totalEstimatedTime) * 100;

  return (
    <div className={`w-full mb-8 ${height}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">
          Generating content ({Math.round(progress)}%)
        </div>
        <div className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="relative">
        <div className="absolute w-full h-0.5 bg-gray-200 top-4 z-0" />
        
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-2
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? (
                    <CheckIcon size="sm" />
                  ) : isCurrent ? (
                    <LoadingSpinnerIcon size="sm" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
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