import React, { useRef, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { availableTemplates } from "~/config/schemas";
import type { ConsultantOnePagerData } from "~/config/schemas/consultantOnePager";
import type { DefaultResumeData } from "~/config/schemas/default";
import type { SimpleConsultantComponentData } from "~/config/schemas/simple";
import type { StandardResumeData } from "~/config/schemas/standardResume";
import { getSampleDataForTemplate } from "./templates/sampleData";
import type { MarkdownData } from "~/config/schemas/markdown";

interface TemplatePreviewProps {
	templateId: string;
	fixedWidth?: number;
	data?:
		| DefaultResumeData
		| SimpleConsultantComponentData
		| ConsultantOnePagerData
		| StandardResumeData;
	className?: string;
}

export function TemplatePreview({
	templateId,
	data,
	className = "",
	fixedWidth = 320,
}: TemplatePreviewProps) {
	const templateConfig = availableTemplates[templateId];
	if (!templateConfig) {
		return (
			<div className={`flex items-center justify-center ${className}`}>
				<span className="text-gray-500 text-sm font-medium">
					Template not found
				</span>
			</div>
		);
	}

	const TemplateComponent = templateConfig.component as ComponentType<{
		data:
			| DefaultResumeData
			| SimpleConsultantComponentData
			| ConsultantOnePagerData
			| StandardResumeData
			| MarkdownData;
	}>;

	const previewData = data ?? getSampleDataForTemplate(templateId);
	const isLandscape = templateConfig.orientation === "landscape";
	const pageWidthMM = isLandscape ? 297 : 210;
	const pageHeightMM = isLandscape ? 210 : 297;

	const MM_TO_PX = 3.7795275591;
	const pageWidthPx = pageWidthMM * MM_TO_PX;
	const pageHeightPx = pageHeightMM * MM_TO_PX;

	const scale = fixedWidth / pageWidthPx;

	return (
		<div
			className={`w-full h-full relative ${className}`}
			style={{ aspectRatio: `${pageWidthMM} / ${pageHeightMM}` }}
		>
			<div
				style={{
					width: pageWidthPx,
					height: pageHeightPx,
					transform: `scale(${scale})`,
					transformOrigin: "top left",
					position: "absolute",
					top: 0,
					left: 0,
					pointerEvents: "none",
				}}
			>
				<TemplateComponent data={previewData} />
			</div>
		</div>
	);
}
