import type { MDXEditorMethods } from "@mdxeditor/editor";
import React, { useState, useEffect, useRef, useCallback } from "react";

import type { ContactInfo } from "../config/schemas";
import { availableTemplates, globalResumeConstants } from "../config/schemas";
import type { ConsultantOnePagerData } from "../config/schemas/consultantOnePager";
import type { DefaultResumeData } from "../config/schemas/default";
import type { SimpleConsultantData } from "../config/schemas/simple";
import { clientLogger } from "../utils/logger.client";
import { downloadResumeAsPdf } from "../utils/pdf.client";
import { printResumeElement } from "../utils/print.client";

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
	displayData:
		| DefaultResumeData
		| SimpleConsultantData
		| ConsultantOnePagerData
		| null;
	templateConfig:
		| (typeof availableTemplates)[keyof typeof availableTemplates]
		| null;
}

export function useResumeGenerator({
	jobTitle,
	resumeData,
	initialSourceTexts,
	resumeSourceSteps,
	initialContactInfo,
	templateId,
}: UseResumeGeneratorProps): UseResumeGeneratorReturn {
	const [error, setError] = useState<string | null>(null);
	const resumeRef = useRef<HTMLDivElement>(null);
	const [formData, setFormData] = useState<any>({});
	const [hasLoadedOrGeneratedData, setHasLoadedOrGeneratedData] =
		useState(false);

	const templateConfig = templateId
		? availableTemplates[templateId] || null
		: null;


	const editorRefsRef = useRef<
		Record<string, React.RefObject<MDXEditorMethods | null>>
	>({});
	if (Object.keys(editorRefsRef.current).length !== resumeSourceSteps.length) {
		editorRefsRef.current = resumeSourceSteps.reduce(
			(acc, step) => {
				acc[step.id] = React.createRef<MDXEditorMethods | null>();
				return acc;
			},
			{} as Record<string, React.RefObject<MDXEditorMethods | null>>,
		);
	}

	useEffect(() => {
		const loadedCoreData = resumeData?.structuredData
			? (({ contactInfo, education, ...core }) => core)(
					resumeData.structuredData,
				)
			: {};

		setFormData(loadedCoreData);
		setHasLoadedOrGeneratedData(!!resumeData?.structuredData);
	}, [resumeData]);

	const displayData:
		| DefaultResumeData
		| SimpleConsultantData
		| ConsultantOnePagerData
		| null =
		formData && Object.keys(formData).length > 0
			? ({
					contactInfo: initialContactInfo,
					education: globalResumeConstants.education || [],
					workExperience: formData.workExperience || [],
					skills: formData.skills || [],
					...formData,
				} as DefaultResumeData | SimpleConsultantData | ConsultantOnePagerData)
			: null;




	return {
		error,
		setError,
		resumeRef,
		formData,
		setFormData,
		hasLoadedOrGeneratedData,
		setHasLoadedOrGeneratedData,
		editorRefs: editorRefsRef.current,
		handlePrintClick,
		handleDownloadPdfClick,
		displayData,
		templateConfig,
	};
}
