import { useEffect, useRef, useState } from "react";
import { generatePrintableHtml } from "../services/ai/resumeHtmlService";

interface PrintableResumeProps {
	resumeContent: string;
	jobDescription?: string;
	htmlContent?: string;
	onClose: () => void;
}

// localStorage keys
const LAST_RESUME_CONTENT_KEY = "lastResumeContent";
const LAST_HTML_CONTENT_KEY = "lastHtmlContent";

// Add page constraints to ensure single page printing
const addPageConstraints = (html: string): string => {
	// Ensure the HTML has the necessary constraints for single-page printing
	const pageConstraints = `
    @page { 
      size: letter portrait;
      margin: 0.5cm;
    }
    body { 
      min-height: 0 !important;
      max-height: 11in !important;
      width: 8.5in !important;
      margin: 0 auto !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    * { 
      box-sizing: border-box !important;
    }
    .print-preview {
      transform: scale(0.9);
      transform-origin: top center;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      background-color: white;
      width: 8.5in;
      height: 11in;
      overflow: hidden;
    }
  `;

	// If there's already a style tag, add to it
	if (html.includes("</style>")) {
		return html.replace("</style>", `${pageConstraints}</style>`);
	}

	// If there's a head tag, add style to head
	if (html.includes("</head>")) {
		return html.replace("</head>", `<style>${pageConstraints}</style></head>`);
	}

	// If there's no head or style, create a complete HTML document
	return `<!DOCTYPE html><html><head><style>${pageConstraints}</style></head><body>${html}</body></html>`;
};

// Helper function to generate the HTML
const generateHtmlContent = async (
	resumeContent: string,
	jobDescription?: string,
) => {
	try {
		const html = await generatePrintableHtml(resumeContent, jobDescription);
		const processedHtml = addPageConstraints(html);
		return processedHtml;
	} catch (error) {
		console.error("Error generating print view:", error);
		return null;
	}
};

export function PrintableResume({
	resumeContent,
	jobDescription,
	htmlContent,
	onClose,
}: PrintableResumeProps) {
	const [isGenerating, setIsGenerating] = useState(!htmlContent);
	const [generatedHtml, setGeneratedHtml] = useState<string | null>(
		htmlContent || null,
	);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	// Save the resume content to localStorage
	useEffect(() => {
		if (resumeContent) {
			localStorage.setItem(LAST_RESUME_CONTENT_KEY, resumeContent);
		}
	}, [resumeContent]);

	// Process and set provided HTML when available
	useEffect(() => {
		if (htmlContent) {
			const processedHtml = addPageConstraints(htmlContent);
			setGeneratedHtml(processedHtml);
			// Save to localStorage
			localStorage.setItem(LAST_HTML_CONTENT_KEY, processedHtml);
			setIsGenerating(false);
		}
	}, [htmlContent]);

	// Generate HTML on first render or with new content
	useEffect(() => {
		if (!htmlContent) {
			const generateHtml = async () => {
				setIsGenerating(true);
				const processedHtml = await generateHtmlContent(
					resumeContent,
					jobDescription,
				);
				if (processedHtml) {
					setGeneratedHtml(processedHtml);
					// Save to localStorage
					localStorage.setItem(LAST_HTML_CONTENT_KEY, processedHtml);
				}
				setIsGenerating(false);
			};

			generateHtml();
		}
	}, [resumeContent, jobDescription, htmlContent]);

	// Handle regeneration separately to avoid dependency cycle
	useEffect(() => {
		if (isRegenerating) {
			const regenerate = async () => {
				const processedHtml = await generateHtmlContent(
					resumeContent,
					jobDescription,
				);
				if (processedHtml) {
					setGeneratedHtml(processedHtml);
					// Save to localStorage
					localStorage.setItem(LAST_HTML_CONTENT_KEY, processedHtml);
				}
				setIsRegenerating(false);
			};

			regenerate();
		}
	}, [isRegenerating, resumeContent, jobDescription]);

	// Regenerate HTML with the same content
	const handleRegenerate = () => {
		setIsRegenerating(true);
	};

	// Helper function to open print window or generate PDF
	const openPrintWindow = () => {
		if (!generatedHtml) return;

		// Use our server-side PDF generation
		if (iframeRef.current?.contentDocument) {
			const documentBody = iframeRef.current.contentDocument.body;
			if (documentBody) {
				try {
					// Create a complete HTML document with proper styles
					const _fullHtml = `
            <!DOCTYPE html>
            <html style="margin:0; padding:0; width:8.5in; height:11in; overflow:hidden;">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Resume PDF</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                  @page { 
                    size: 8.5in 11in;
                    margin: 0;
                    padding: 0;
                  }
                  html {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 8.5in !important;
                    height: 11in !important;
                    overflow: hidden !important;
                  }
                  body { 
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 8.5in !important;
                    height: 11in !important;
                    font-family: system-ui, -apple-system, sans-serif;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                  }
                  * { 
                    box-sizing: border-box !important;
                  }
                  /* Main content padding and positioning */
                  body > * {
                    padding: 0.25in !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                  }
                  /* Typography adjustments */
                  h1 {
                    font-size: 1.7rem !important;
                    margin-top: 0 !important;
                    margin-bottom: 0.25rem !important;
                  }
                  h2, h3 {
                    font-size: 1.2rem !important;
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                  }
                  p, li {
                    font-size: 0.8rem !important;
                    line-height: 1.2 !important;
                    margin-bottom: 0.2rem !important;
                  }
                  /* Layout adjustments */
                  .mb-4, .my-4 {
                    margin-bottom: 0.4rem !important;
                  }
                  .mt-4, .my-4 {
                    margin-top: 0.4rem !important;
                  }
                  .p-4 {
                    padding: 0.4rem !important;
                  }
                  .px-4 {
                    padding-left: 0.4rem !important;
                    padding-right: 0.4rem !important;
                  }
                  .py-4 {
                    padding-top: 0.4rem !important;
                    padding-bottom: 0.4rem !important;
                  }
                  /* Fix for background colors */
                  .bg-yellow-300 {
                    background-color: #FFEB3B !important;
                  }
                  .bg-gray-50 {
                    background-color: #F9FAFB !important;
                  }
                </style>
              </head>
              <body>
                ${documentBody.innerHTML}
              </body>
            </html>
          `;

					console.log("Sending complete HTML document for PDF generation");

					// requestPdfGeneration(fullHtml, {
					//   filename: 'resume.pdf',
					//   format: 'Letter'
					// });
				} catch (error) {
					console.error("Error generating PDF:", error);

					// Fallback to client-side printing if server-side fails
					const printWindow = window.open("", "_blank");
					if (printWindow) {
						printWindow.document.write(generatedHtml);
						printWindow.document.close();
						// Wait for resources to load (like Tailwind CSS)
						setTimeout(() => {
							printWindow.focus();
							printWindow.print();
						}, 1000);
					}
				}
			}
		}
	};

	// Load HTML into iframe for preview
	useEffect(() => {
		if (generatedHtml && iframeRef.current) {
			const iframeDoc = iframeRef.current.contentDocument;
			if (iframeDoc) {
				iframeDoc.open();
				iframeDoc.write(generatedHtml);
				iframeDoc.close();
			}
		}
	}, [generatedHtml]);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
				<div className="flex justify-between items-center p-4 border-b">
					<h2 className="text-xl font-bold">Print-Ready Resume</h2>
					<div className="flex gap-2 items-center">
						<button
							onClick={handleRegenerate}
							type="button"
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
							disabled={isGenerating || isRegenerating}
						>
							{isRegenerating ? "Regenerating..." : "Regenerate HTML"}
						</button>
						<button
							onClick={openPrintWindow}
							type="button"
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							disabled={!generatedHtml || isGenerating}
						>
							Download PDF
						</button>
						<button
							onClick={onClose}
							type="button"
							className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
						>
							Close
						</button>
					</div>
				</div>

				<div className="overflow-y-auto p-4 flex-grow flex justify-center bg-gray-100">
					{isGenerating || isRegenerating ? (
						<div className="text-center py-8 self-center">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4" />
							<p>Generating print-optimized version of your resume...</p>
						</div>
					) : (
						<div className="preview-container">
							<iframe
								ref={iframeRef}
								title="Resume Preview"
								className="w-[8.5in] h-[11in] bg-white shadow-lg transform scale-75 origin-top"
								style={{
									border: "1px solid #e2e8f0",
									overflow: "hidden",
								}}
							/>
							<div className="mt-4 text-center text-sm text-gray-500">
								↑ Preview (scaled down) - use the Print button for actual size ↑
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
