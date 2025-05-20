import { exportHtmlToPdf } from "../services/pdf/clientPdfService";
import { clientLogger } from "../utils/logger.client";
interface DownloadPdfOptions {
	elementId: string;
	onError: (message: string) => void;
}

/**
 * Handles preparing HTML and triggering PDF download.
 * @param options - Options including elementId, contactInfo, jobTitle, and onError handler.
 * @returns Promise<boolean> True if PDF export was initiated successfully, false otherwise.
 */
export async function downloadResumeAsPdf({
	elementId,
	onError,
}: DownloadPdfOptions): Promise<boolean> {
	clientLogger.log("--- Download PDF process started ---");

	try {
		const resumeElement = document.getElementById(elementId);
		clientLogger.log(`Looking for element with ID "${elementId}"`);

		if (!resumeElement) {
			clientLogger.error(`Could not find resume element with ID: ${elementId}`);
			onError("Could not find resume element to export");
			return false;
		}
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
			<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `;

		clientLogger.log("HTML content created, size:", htmlContent, "bytes");
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
		try {
			const filename = "resume.pdf";
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
