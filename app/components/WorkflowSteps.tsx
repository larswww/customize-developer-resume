import ReactMarkdown from "react-markdown";
import type { WorkflowStep } from "../services/ai/types";
import { Collapsible } from "./Collapsible";

interface WorkflowStepItemProps {
  step: WorkflowStep;
  index: number;
  result: unknown;
  status: string;
}

function WorkflowStepItem({ step, index, result, status }: WorkflowStepItemProps) {
  const isResultString = typeof result === 'string';
  
  const renderContent = () => {
    if (status === 'completed' && result !== undefined) {
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
        {status === 'completed' ? (
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
  resultsToShow: Record<string, unknown>;
  statusesToShow: Record<string, string>;
  isLoading?: boolean;
  height?: string; // Optional height to match container
}

export function WorkflowSteps({ 
  stepsToRender, 
  resultsToShow, 
  statusesToShow, 
  isLoading = false,
  height = 'min-h-[200px]'
}: WorkflowStepsProps) {
  if (isLoading) {
    return (
      <div className={`mb-8 ${height}`}>
        <Collapsible 
          title="Generated Content Steps"
          defaultOpen={false}
          className="mb-4"
        >
          {stepsToRender.map((step, index) => (
            <div key={step.id} className="mb-4 border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
                    {index + 1}
                  </div>
                  <h3 className="font-medium">{step.name}</h3>
                </div>
                <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Processing
                </div>
              </div>
              <div className="p-3 rounded bg-gray-50">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Processing {step.name}...
                </div>
              </div>
            </div>
          ))}
        </Collapsible>
      </div>
    );
  }

  if (Object.keys(resultsToShow).length === 0 && Object.keys(statusesToShow).length === 0) {
    return null;
  }

  // Get the completion status for the title
  const allComplete = stepsToRender.every(step => statusesToShow[step.id] === 'completed');
  const titleContent = (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium text-gray-800">Generated Content Steps</span>
      {allComplete && (
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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2 flex flex-col">
            {stepsToRender.filter((_, index) => index % 2 === 0).map((step, idx) => (
              <WorkflowStepItem
                key={step.id}
                step={step}
                index={idx * 2}  // Preserve original index numbering
                result={resultsToShow[step.id]}
                status={statusesToShow[step.id] || 'pending'}
              />
            ))}
          </div>
          <div className="md:w-1/2 flex flex-col">
            {stepsToRender.filter((_, index) => index % 2 === 1).map((step, idx) => (
              <WorkflowStepItem
                key={step.id}
                step={step}
                index={idx * 2 + 1}  // Preserve original index numbering
                result={resultsToShow[step.id]}
                status={statusesToShow[step.id] || 'pending'}
              />
            ))}
          </div>
        </div>
      </Collapsible>
    </div>
  );
} 