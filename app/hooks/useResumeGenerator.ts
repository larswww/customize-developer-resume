import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MDXEditorMethods } from '@mdxeditor/editor';

import { clientLogger } from '../utils/logger.client';
import { printResumeElement } from '../utils/print.client';
import { downloadResumeAsPdf } from '../utils/pdf.client';
import type { ContactInfo } from '../config/templates';
import { globalResumeConstants, availableTemplates } from '../config/templates';
import type { DefaultResumeData } from '../config/templates/default';
import type { SimpleConsultantData } from '../config/templates/simple';
import type { ConsultantOnePagerData } from '../config/templates/consultantOnePager';

interface UseResumeGeneratorProps {
  jobId: number;
  jobTitle: string;
  resumeData: { structuredData?: any } | null;
  initialSourceTexts: Record<string, string>;
  resumeSourceSteps: { id: string; name: string }[];
  initialContactInfo: ContactInfo;
  templateId?: string; // Template ID to identify which template is being used
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
  displayData: DefaultResumeData | SimpleConsultantData | ConsultantOnePagerData | null;
  templateConfig: typeof availableTemplates[keyof typeof availableTemplates] | null;
}

export function useResumeGenerator({
  jobId,
  jobTitle,
  resumeData,
  initialSourceTexts,
  resumeSourceSteps,
  initialContactInfo,
  templateId,
}: UseResumeGeneratorProps): UseResumeGeneratorReturn {
  const [error, setError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [currentSourceTexts, setCurrentSourceTexts] = useState<Record<string, string>>(
    initialSourceTexts || {}
  );
  const [formData, setFormData] = useState<any>({});
  const [hasLoadedOrGeneratedData, setHasLoadedOrGeneratedData] = useState(false);

  // Get the template configuration
  const templateConfig = templateId ? availableTemplates[templateId] || null : null;
  
  // Check if the template uses landscape orientation - no longer needed but kept for backward compatibility
  const isLandscape = false;

  const editorRefsRef = useRef<Record<string, React.RefObject<MDXEditorMethods | null>>>({});
  if (Object.keys(editorRefsRef.current).length !== resumeSourceSteps.length) {
    editorRefsRef.current = resumeSourceSteps.reduce((acc, step) => {
      acc[step.id] = React.createRef<MDXEditorMethods | null>();
      return acc;
    }, {} as Record<string, React.RefObject<MDXEditorMethods | null>>);
  }

  useEffect(() => {
    const loadedCoreData = resumeData?.structuredData
      ? (({ contactInfo, education, ...core }) => core)(resumeData.structuredData)
      : {};
    
    setFormData(loadedCoreData);
    setCurrentSourceTexts(initialSourceTexts || {});
    setHasLoadedOrGeneratedData(!!resumeData?.structuredData);
  }, [resumeData, initialSourceTexts]);

  const displayData: DefaultResumeData | SimpleConsultantData | ConsultantOnePagerData | null =
    formData && Object.keys(formData).length > 0
      ? {
          contactInfo: initialContactInfo,
          education: globalResumeConstants.education || [],
          workExperience: formData.workExperience || [],
          skills: formData.skills || [],
          ...formData,
        } as DefaultResumeData | SimpleConsultantData | ConsultantOnePagerData
      : null;

  const handlePrintClick = useCallback(() => {
    setError(null);
    printResumeElement("printable-resume", setError);
  }, []);

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
          clientLogger.warn(`Could not find hidden input for step: ${step.id}`);
        }
      } else {
         clientLogger.warn(`Could not find editor ref for step: ${step.id}`);
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
    templateConfig,
  };
}