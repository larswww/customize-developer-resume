import { useEffect, useRef, useState } from "react";
import { generatePrintableHtml } from "../services/ai/resumeHtmlService";

interface PrintableResumeProps {
	resumeContent: string;
	jobDescription?: string;
	htmlContent?: string;
	onClose: () => void;
	isPowerPointStyle?: boolean; // New prop to indicate PowerPoint style
}

// localStorage keys
const LAST_RESUME_CONTENT_KEY = "lastResumeContent";
const LAST_HTML_CONTENT_KEY = "lastHtmlContent";

// Add page constraints to ensure proper printing
const addPageConstraints = (html: string, isPowerPointStyle = false): string => {
	// Ensure the HTML has the necessary constraints for printing
	const pageConstraints = `
    @page { 
      size: ${isPowerPointStyle ? 'A4 landscape' : 'letter portrait'};
      margin: 0.5cm;
    }
    body { 
      min-height: 0 !important;
      ${isPowerPointStyle 
        ? `width: 11.7in !important;
           height: 8.3in !important;` 
        : `width: 8.5in !important;
           height: 11in !important;`
      }
      margin: 0 auto !important;
      overflow: visible !important;
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
      ${isPowerPointStyle 
        ? `width: 11.7in;
           height: 8.3in;` 
        : `width: 8.5in;
           height: 11in;`
      }
      overflow: visible;
    }
    /* Ensure blue header color prints correctly */
    .bg-\\[\\#1e3a8a\\] {
      background-color: #1e3a8a !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* Button colors */
    .bg-green-600 {
      background-color: #059669 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bg-blue-600 {
      background-color: #2563EB !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bg-gray-800 {
      background-color: #1F2937 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
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
	isPowerPointStyle = false,
) => {
	try {
		const html = await generatePrintableHtml(resumeContent, jobDescription);
		const processedHtml = addPageConstraints(html, isPowerPointStyle);
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
	isPowerPointStyle = false,
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
			const processedHtml = addPageConstraints(htmlContent, isPowerPointStyle);
			setGeneratedHtml(processedHtml);
			// Save to localStorage
			localStorage.setItem(LAST_HTML_CONTENT_KEY, processedHtml);
			setIsGenerating(false);
		}
	}, [htmlContent, isPowerPointStyle]);

	// Generate HTML on first render or with new content
	useEffect(() => {
		if (!htmlContent) {
			const generateHtml = async () => {
				setIsGenerating(true);
				const processedHtml = await generateHtmlContent(
					resumeContent,
					jobDescription,
					isPowerPointStyle,
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
	}, [resumeContent, jobDescription, htmlContent, isPowerPointStyle]);

	// Handle regeneration separately to avoid dependency cycle
	useEffect(() => {
		if (isRegenerating) {
			const regenerate = async () => {
				const processedHtml = await generateHtmlContent(
					resumeContent,
					jobDescription,
					isPowerPointStyle,
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
	}, [isRegenerating, resumeContent, jobDescription, isPowerPointStyle]);

	// Regenerate HTML with the same content
	const handleRegenerate = () => {
		setIsRegenerating(true);
	};

	// Helper function to open print window or generate PDF
	const openPrintWindow = async () => {
		if (generatedHtml) {
			try {
				// Extract just the body content for PDF generation
				const tempDiv = document.createElement("div");
				tempDiv.innerHTML = generatedHtml;
				const documentBody = tempDiv.querySelector("body") || tempDiv;

				// Create a complete HTML document for PDF generation
				const fullHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Resume</title>
                <style>
                  /* Reset */
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    color: #333;
                    ${isPowerPointStyle 
                      ? `width: 11.7in;
                         height: 8.3in;` 
                      : `width: 8.5in;
                         height: 11in;`
                    }
                    margin: 0 auto;
                    padding: 0;
                    background-color: white;
                    overflow: hidden;
                  }
                  /* Typography */
                  h1, h2, h3, h4, h5, h6 {
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                  }
                  h1 {
                    font-size: 1.5rem;
                  }
                  h2 {
                    font-size: 1.25rem;
                  }
                  h3 {
                    font-size: 1.125rem;
                  }
                  p {
                    margin-bottom: 0.5rem;
                  }
                  /* Utilities */
                  .font-bold {
                    font-weight: bold !important;
                  }
                  .text-sm {
                    font-size: 0.875rem !important;
                  }
                  .text-xs {
                    font-size: 0.75rem !important;
                  }
                  .text-lg {
                    font-size: 1.125rem !important;
                  }
                  .text-xl {
                    font-size: 1.25rem !important;
                  }
                  .text-2xl {
                    font-size: 1.5rem !important;
                  }
                  .text-gray-500 {
                    color: #6B7280 !important;
                  }
                  .text-gray-600 {
                    color: #4B5563 !important;
                  }
                  .text-gray-700 {
                    color: #374151 !important;
                  }
                  .text-gray-800 {
                    color: #1F2937 !important;
                  }
                  .text-gray-900 {
                    color: #111827 !important;
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

				// Fallback to client-side printing
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
								className={`bg-white shadow-lg transform scale-75 origin-top ${
									isPowerPointStyle 
										? "w-[11.7in] h-[8.3in]" 
										: "w-[8.5in] h-[11in]"
								}`}
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
