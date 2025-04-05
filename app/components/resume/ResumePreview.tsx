import React from "react";
import type { DefaultResumeData } from "~/templates/default";
import type { SimpleConsultantData } from "~/templates/simpleConsultant";

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
    <div className="mb-20">
      {/* A4 paper container with fixed dimensions and paper styling */}
      <div className="flex justify-center">
        <div className="resume-preview-container relative bg-white rounded-sm shadow-lg overflow-hidden mx-auto" style={{
          width: '210mm',
          height: '297mm',
          maxWidth: '100%',
          transform: 'scale(0.8)',
          transformOrigin: 'top center',
          marginBottom: '6rem',
        }}>
          <div ref={resumeRef} id="printable-resume" className="absolute inset-0">
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
      
      {/* Print styles */}
      <style>{`
        /* Static scaling for all screen sizes */
        @media (max-width: 768px) {
          .resume-preview-container {
            transform: scale(0.65);
            margin-bottom: 4rem !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1200px) {
          .resume-preview-container {
            transform: scale(0.75);
            margin-bottom: 5rem !important;
          }
        }
        
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0; 
            top: 0;
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            max-width: 100%;
            box-shadow: none !important;
            box-sizing: border-box;
            transform: scale(1) !important;
          }
          #printable-resume > .resume-container {
            box-shadow: none !important;
            height: auto !important;
            min-height: 100%;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            box-sizing: border-box;
          }
          #printable-resume > .resume-container > .flex-row {
            flex-grow: 1 !important;
            height: 100% !important;
            box-sizing: border-box;
          }
          #printable-resume .w-\\[70\\%\\] {
            flex-grow: 1 !important;
            overflow: visible !important;
          }
          .page-layout-header, .page-layout-sidebar, .page-layout-bottom-bar {
            display: none;
          }
          .page-layout-main {
            width: 100%;
            padding: 0;
            margin: 0;
          }
          #printable-resume > div > div {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
} 