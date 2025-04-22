import React from "react";
import type { ConsultantOnePagerData } from "~/config/schemas/consultantOnePager";
import type { DefaultResumeData } from "~/config/schemas/default";
import type { ResumeTemplateConfig } from "~/config/schemas/sharedTypes";
import type { SimpleConsultantData } from "~/config/schemas/simple";

interface ResumePreviewProps {
	displayData:
		| DefaultResumeData
		| SimpleConsultantData
		| ConsultantOnePagerData
		| null;
	resumeRef: React.RefObject<HTMLDivElement | null>;
	TemplateComponent: React.ComponentType<{
		data: DefaultResumeData | SimpleConsultantData | ConsultantOnePagerData;
	}> | null;
	isGenerating: boolean;
	templateConfig?: ResumeTemplateConfig | null;
}

export function ResumePreview({
	displayData,
	resumeRef,
	TemplateComponent,
	isGenerating,
	templateConfig,
}: ResumePreviewProps) {
	// Determine if we're using a landscape template
	const isLandscape = templateConfig?.orientation === "landscape";

	return (
		<div className="flex bg-gray-100 overflow-auto">
			<div
				className="bg-white border md:scale-[0.6] scale-[0.4] border-gray-300 rounded-sm shadow-lg origin-top-left relative"
				style={{
					width: isLandscape ? "210mm" : "148mm", // Scaled down A4 width (70% of actual size)
					height: isLandscape ? "148mm" : "210mm", // Scaled down A4 height (70% of actual size)
					// scale: 0.6,
					padding: 0,
					margin: 0,
					// aspectRatio: isLandscape ? '1.414' : '0.707', // A4 aspect ratio
				}}
			>
				<div
					ref={resumeRef}
					id="printable-resume"
					className="absolute top-0 left-0"
					style={{
						transformOrigin: "top left",
						height: isLandscape ? "210mm" : "297mm", // Full A4 height
						width: isLandscape ? "297mm" : "210mm", // Full A4 width
					}}
				>
					{TemplateComponent && displayData ? (
						(() => {
							return React.createElement(TemplateComponent, {
								data: displayData,
								key: Date.now(),
							});
						})()
					) : isGenerating ? (
						<p className="p-8 text-center text-gray-500">
							Generating preview...
						</p>
					) : !TemplateComponent ? (
						<p className="p-8 text-center text-red-500">
							Selected template component not found.
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
