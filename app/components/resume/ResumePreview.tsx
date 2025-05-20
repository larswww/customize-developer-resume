import React from "react";
import type { ConsultantOnePagerData } from "~/config/schemas/consultantOnePager";
import type { DefaultResumeData } from "~/config/schemas/default";
import type { ResumeTemplateConfig } from "~/config/schemas/sharedTypes";
import type { SimpleConsultantComponentData } from "~/config/schemas/simple";

interface ResumePreviewProps {
	displayData:
		| DefaultResumeData
		| SimpleConsultantComponentData
		| ConsultantOnePagerData
		| null;
	resumeRef: React.RefObject<HTMLDivElement | null>;
	TemplateComponent: React.ComponentType<{
		data:
			| DefaultResumeData
			| SimpleConsultantComponentData
			| ConsultantOnePagerData;
	}> | null;
	isGenerating: boolean;
	templateConfig: ResumeTemplateConfig;
}

export function ResumePreview({
	displayData,
	resumeRef,
	TemplateComponent,
	isGenerating,
	templateConfig,
}: ResumePreviewProps) {
	const isLandscape = templateConfig.orientation === "landscape";
	const pageCount = templateConfig.pages;

	const pageHeight = isLandscape ? 210 : 297;
	const pageWidth = isLandscape ? 297 : 210;

	return (
		<div className="bg-gray-100 pt-6 flex justify-center items-start h-full overflow-y-auto">
			<div
				className="bg-white border md:scale-[0.8] scale-[0.8] border-gray-300 rounded-sm shadow-lg relative origin-top p-0 m-0 transform-gpu"
				style={{
					transformOrigin: "top center",
					margin: "0 auto",
				}}
			>
				{/* Page markers overlay - won't be printed */}
				<div
					className="absolute inset-0 pointer-events-none print:hidden"
					aria-hidden="true"
				>
					{Array.from({ length: pageCount * 2 }).map((_, index) => (
						<div
							key={`page-marker-${(index + 1) * pageHeight}`}
							className="absolute w-full border-b border-dashed border-red-400 z-10"
							style={{
								top: `${(index + 1) * pageHeight}mm`,
							}}
						/>
					))}
				</div>

				{/* This is what is actually printend */}
				<div
					ref={resumeRef}
					id="printable-resume"
					className="overflow-visible"
					style={{
						width: `${pageWidth}mm`,
						margin: "none",
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
