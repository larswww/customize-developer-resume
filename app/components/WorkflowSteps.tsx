import ReactMarkdown from "react-markdown";
import type { WorkflowStep } from "../services/ai/types";
import { Collapsible } from "./Collapsible";

interface WorkflowStepData {
  stepId: string;
  result: unknown;
  status: string;
}

interface WorkflowStepItemProps {
  step: WorkflowStep;
  stepData?: WorkflowStepData;
  index: number;
}

function WorkflowStepItem({ step, stepData, index }: WorkflowStepItemProps) {
  const result = stepData?.result;
  const status = stepData?.status || 'pending';
  const isResultString = typeof result === 'string';
  
  const renderContent = () => {
    if ((status === 'completed' || status === 'success') && result !== undefined) {
      return (
        <div className="p-2 rounded bg-green-50">
          <div className="markdown-content overflow-auto max-h-[500px]">
            {isResultString ? (
              <ReactMarkdown className="prose max-w-none">
                {result as string}
              </ReactMarkdown>
            ) : (
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      );
    }
    
    if (status === 'error') {
      return (
        <div className="p-2 rounded bg-red-50">
          <p className="text-red-600">Error processing step.</p>
        </div>
      );
    }
    
    return (
      <div className="p-2 rounded bg-gray-50">
        <p className="text-gray-500">Not yet processed</p>
      </div>
    );
  };

  const titleContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
          {index + 1}
        </div>
        <h3 className="font-medium">{step.name}</h3>
      </div>
      <div>
        {status === 'completed' || status === 'success' ? (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Complete
          </span>
        ) : status === 'error' ? (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Error
          </span>
        ) : (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            Pending
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-4">
      <div className="p-4 rounded-lg">
        {titleContent}
      </div>
      <div className="pl-4">
        {renderContent()}
      </div>
    </div>
  );
}

interface WorkflowStepsProps {
  stepsToRender: WorkflowStep[];
  workflowStepsData: WorkflowStepData[];
  height?: string;
  isComplete: boolean;
}

export function WorkflowSteps({ 
  stepsToRender, 
  workflowStepsData,
  height = 'min-h-[200px]',
  isComplete
}: WorkflowStepsProps) {
  if (workflowStepsData.length === 0) {
    return null;
  }

  const titleContent = (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium text-gray-800">Generated Content Steps</span>
      {isComplete && (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Complete
        </span>
      )}
    </div>
  );

  return (
    <div className={`mb-8 ${height}`}>
      <Collapsible 
        title={titleContent}
        defaultOpen={false}
        className="mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stepsToRender.map((step, index) => (
            <WorkflowStepItem
              key={step.id}
              step={step}
              index={index}
              stepData={workflowStepsData.find(data => data.stepId === step.id)}
            />
          ))}
        </div>
      </Collapsible>
    </div>
  );
} 