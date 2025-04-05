import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { printResumeElement } from '../utils/print.client';
import { downloadResumeAsPdf } from '../utils/pdf.client';
import type { ContactInfo } from '../templates';
import { globalResumeConstants } from '../templates';
import type { DefaultResumeData } from '../templates/default';
import type { SimpleConsultantData } from '../templates/simpleConsultant';
import type { WorkflowStep } from '../services/ai/types';

interface UseResumeGeneratorProps {
  jobId: number;
  jobTitle: string;
  resumeData: { structuredData?: any } | null;
  initialSourceTexts: Record<string, string>;
  resumeSourceSteps: { id: string; name: string }[];
  initialContactInfo: ContactInfo;
}

interface UseResumeGeneratorReturn {
  error: string | null;
  setError: (error: string | null) => void;
  resumeRef: React.RefObject<HTMLDivElement | null>;
  currentSourceTexts: Record<string, string>;
  setCurrentSourceTexts: (texts: Record<string, string>) => void;
  formData: any;
  setFormData: (data: any) => void;
  hasLoadedOrGeneratedData: boolean;
  setHasLoadedOrGeneratedData: (value: boolean) => void;
  editorRefs: Record<string, React.RefObject<MDXEditorMethods | null>>;
  handlePrintClick: () => void;
  handleDownloadPdfClick: () => Promise<void>;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  displayData: DefaultResumeData | SimpleConsultantData | null;
}

export function useResumeGenerator({
  jobId,
  jobTitle,
  resumeData,
  initialSourceTexts,
  resumeSourceSteps,
  initialContactInfo,
}: UseResumeGeneratorProps): UseResumeGeneratorReturn {
  const [error, setError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [currentSourceTexts, setCurrentSourceTexts] = useState<Record<string, string>>(
    initialSourceTexts || {}
  );
  const [formData, setFormData] = useState<any>({});
  const [hasLoadedOrGeneratedData, setHasLoadedOrGeneratedData] = useState(false);

  // Create refs for the markdown editors
  const editorRefsRef = useRef<Record<string, React.RefObject<MDXEditorMethods | null>>>({});
  if (Object.keys(editorRefsRef.current).length !== resumeSourceSteps.length) {
    editorRefsRef.current = resumeSourceSteps.reduce((acc, step) => {
      acc[step.id] = React.createRef<MDXEditorMethods | null>();
      return acc;
    }, {} as Record<string, React.RefObject<MDXEditorMethods | null>>);
  }

  // Load initial data from resumeData if available
  useEffect(() => {
    const loadedCoreData = resumeData?.structuredData
      ? (({ contactInfo, education, ...core }) => core)(resumeData.structuredData)
      : {};
    
    setFormData(loadedCoreData);
    setCurrentSourceTexts(initialSourceTexts || {});
    setHasLoadedOrGeneratedData(!!resumeData?.structuredData);
  }, [resumeData, initialSourceTexts]);

  // Display data with contactInfo from initialContactInfo
  const displayData: DefaultResumeData | SimpleConsultantData | null =
    formData && Object.keys(formData).length > 0
      ? {
          contactInfo: initialContactInfo,
          education: globalResumeConstants.education || [],
          workExperience: formData.workExperience || [],
          skills: formData.skills || [],
          ...formData,
        } as DefaultResumeData | SimpleConsultantData
      : null;

  // Handle printing the resume
  const handlePrintClick = useCallback(() => {
    setError(null);
    printResumeElement("printable-resume", setError);
  }, []);

  // Handle downloading the resume as PDF
  const handleDownloadPdfClick = useCallback(async () => {
    setError(null);
    if (!displayData) {
      setError("No resume data available to download.");
      return;
    }
    await downloadResumeAsPdf({
      elementId: "printable-resume",
      contactInfo: displayData.contactInfo,
      jobTitle,
      onError: setError,
    });
  }, [displayData, jobTitle]);

  // Handle form submission to extract editor content
  const handleFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    for (const step of resumeSourceSteps) {
      const editorRef = editorRefsRef.current[step.id]?.current;
      if (editorRef) {
        const markdown = editorRef.getMarkdown();
        const hiddenInput = form.elements.namedItem(step.id) as HTMLInputElement | null;
        if (hiddenInput) {
          hiddenInput.value = markdown;
        } else {
          console.warn(`Could not find hidden input for step: ${step.id}`);
        }
      } else {
         console.warn(`Could not find editor ref for step: ${step.id}`);
      }
    }
  }, [resumeSourceSteps]);

  return {
    error,
    setError,
    resumeRef,
    currentSourceTexts,
    setCurrentSourceTexts,
    formData,
    setFormData,
    hasLoadedOrGeneratedData,
    setHasLoadedOrGeneratedData,
    editorRefs: editorRefsRef.current,
    handlePrintClick,
    handleDownloadPdfClick,
    handleFormSubmit,
    displayData,
  };
} 