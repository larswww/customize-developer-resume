import React from "react";
import type { DefaultResumeData } from "~/config/templates/default";
import type { SimpleConsultantData } from "~/config/templates/simple";

interface ResumePreviewProps {
  displayData: DefaultResumeData | SimpleConsultantData | null;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  TemplateComponent: React.ComponentType<{ 
    data: DefaultResumeData | SimpleConsultantData;
  }> | null;
  isGenerating: boolean;
}

export function ResumePreview({ 
  displayData, 
  resumeRef, 
  TemplateComponent, 
  isGenerating,
}: ResumePreviewProps) {
  return (
    <div className="flex justify-start overflow-auto">
      <div className="bg-white border border-gray-300 rounded-sm shadow-lg overflow-hidden origin-top-left" style={{  
        height: '297mm',
        width: '210mm',
        transform: 'scale(1.0)',
        transformOrigin: 'top left'
      }}>
        <div ref={resumeRef} id="printable-resume" className="">
          {TemplateComponent && displayData ? (
            <TemplateComponent 
              data={displayData} 
            />
          ) : isGenerating ? (
            <p className="p-8 text-center text-gray-500">Generating preview...</p>
          ) : !TemplateComponent ? (
            <p className="p-8 text-center text-red-500">Selected template component not found.</p>
          ) : null}
        </div>
      </div>
      
     
    </div>
  );
} 