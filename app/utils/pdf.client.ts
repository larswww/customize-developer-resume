import type { ContactInfo } from "../config/templates/sharedTypes";
import { exportHtmlToPdf } from "../services/pdf/clientPdfService";
import { clientLogger } from "../utils/logger.client";
interface DownloadPdfOptions {
	elementId: string;
	contactInfo: ContactInfo | null | undefined;
	jobTitle: string | null | undefined;
	onError: (message: string) => void;
}

/**
 * Handles preparing HTML and triggering PDF download.
 * @param options - Options including elementId, contactInfo, jobTitle, and onError handler.
 * @returns Promise<boolean> True if PDF export was initiated successfully, false otherwise.
 */
export async function downloadResumeAsPdf({
	elementId,
	contactInfo,
	jobTitle,
	onError,
}: DownloadPdfOptions): Promise<boolean> {
	clientLogger.log("--- Download PDF process started ---");

	try {
		// Get a reference to the resume div
		const resumeElement = document.getElementById(elementId);
		clientLogger.log(`Looking for element with ID "${elementId}"`);

		if (!resumeElement) {
			clientLogger.error(`Could not find resume element with ID: ${elementId}`);
			clientLogger.log(
				"Available IDs:",
				Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
			);
			onError("Could not find resume element to export");
			return false;
		}
		clientLogger.log(
			"Resume element found:",
			!!resumeElement,
			"Type:",
			resumeElement.tagName,
		);

		// Clone the element to avoid modifying the displayed resume
		const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
		clientLogger.log(
			"Element cloned successfully, size:",
			clonedElement.outerHTML.length,
		);
		const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Structured Resume</title>
            <link href="http://localhost:3000/index.css" rel="stylesheet">
            <style>
          @page
{
  size: A4 portrait;
  margin: 0;
}
            </style>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `;

		clientLogger.log("HTML content created, size:", htmlContent, "bytes");

		// Add loading state
		clientLogger.log("Creating loading message");
		const loadingMsg = document.createElement("div");
		loadingMsg.style.position = "fixed";
		loadingMsg.style.top = "15px";
		loadingMsg.style.left = "50%";
		loadingMsg.style.transform = "translateX(-50%)";
		loadingMsg.style.padding = "10px 15px";
		loadingMsg.style.background = "#4B5563";
		loadingMsg.style.color = "white";
		loadingMsg.style.borderRadius = "4px";
		loadingMsg.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
		loadingMsg.style.zIndex = "9999";
		loadingMsg.innerHTML = "Preparing resume PDF...";
		document.body.appendChild(loadingMsg);
		clientLogger.log("Loading message added to DOM");

		// Generate and download the PDF
		clientLogger.log("Calling exportHtmlToPdf service function");
		try {
			// Use displayData (passed as contactInfo/jobTitle) for filename generation
			const filename = `${contactInfo?.name || jobTitle || "resume"}.pdf`;
			clientLogger.log("PDF options:", {
				filename: filename,
				format: "Letter",
				landscape: false,
			});

			const success = await exportHtmlToPdf(htmlContent, {
				filename: filename,
				format: "Letter",
				landscape: false,
			});

			// Remove loading message
			document.body.removeChild(loadingMsg);

			clientLogger.log("exportHtmlToPdf result:", success);
			return success; // Return the result from exportHtmlToPdf
		} catch (pdfError) {
			// Remove loading message even if error occurs
			if (loadingMsg.parentNode) {
				document.body.removeChild(loadingMsg);
			}

			clientLogger.error("Error in exportHtmlToPdf:", pdfError);
			clientLogger.error(
				"Error type:",
				typeof pdfError,
				"Is Error instance:",
				pdfError instanceof Error,
			);
			onError(
				`PDF generation error: ${
					pdfError instanceof Error ? pdfError.message : String(pdfError)
				}`,
			);
			return false;
		}
	} catch (error) {
		clientLogger.error("Error downloading PDF:", error);
		clientLogger.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace available",
		);
		onError("Failed to download PDF. Please try again.");
		return false;
	}
}
