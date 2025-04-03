import { exportHtmlToPdf } from "../services/pdf/clientPdfService";
import type { ContactInfo } from "../config/resumeTemplates.config";

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
  console.log("--- Download PDF process started ---");

  try {
    // Get a reference to the resume div
    const resumeElement = document.getElementById(elementId);
    console.log(`Looking for element with ID "${elementId}"`);

    if (!resumeElement) {
      console.error(`Could not find resume element with ID: ${elementId}`);
      console.log(
        "Available IDs:",
        Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
      );
      onError("Could not find resume element to export");
      return false;
    }
    console.log(
      "Resume element found:",
      !!resumeElement,
      "Type:",
      resumeElement.tagName
    );

    // Clone the element to avoid modifying the displayed resume
    const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
    console.log(
      "Element cloned successfully, size:",
      clonedElement.outerHTML.length
    );

    // Create a complete HTML document with optimal margins handling
    console.log("Creating HTML document for PDF generation");
    const htmlContent = `
        <!DOCTYPE html>
        <html style="margin:0; padding:0; width:8.5in; height:11in; overflow:hidden;">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Structured Resume</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @page {
                size: 8.5in 11in;
                margin: 0mm !important;
                padding: 0 !important;
              }
              /* Essential resets for puppeteer */
              *, *::before, *::after {
                box-sizing: border-box !important;
              }
              html {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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
                font-family: sans-serif !important;
                overflow: hidden !important;
                position: relative !important;
                display: block !important;
              }
              /* Container positioning with inset instead of absolute positioning */
              .resume-container {
                margin: 0 !important;
                width: 8.5in !important;
                height: 11in !important;
                padding: 0.25in !important;
                overflow: hidden !important;
                background-color: white !important;
                inset: 0 !important;
                position: absolute !important;
              }
              /* Make sure colors print correctly */
              .bg-yellow-300 {
                background-color: #FFEB3B !important;
              }
              .bg-gray-50 {
                background-color: #F9FAFB !important;
              }
              /* Adjust font sizes and line heights */
              .resume-container h1 {
                font-size: 1.7rem !important;
                margin-top: 0 !important;
                margin-bottom: 0.25rem !important;
              }
              .resume-container h2 {
                font-size: 1.3rem !important;
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
              }
              .resume-container h3 {
                font-size: 1.1rem !important;
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
              }
              .resume-container p, .resume-container li {
                font-size: 0.82rem !important;
                line-height: 1.25 !important;
                margin-bottom: 0.2rem !important;
              }
              /* Compact padding and margins */
              .resume-container .mb-4 {
                margin-bottom: 0.5rem !important;
              }
              .resume-container .mb-6 {
                margin-bottom: 0.75rem !important;
              }
              .resume-container .p-4 {
                padding: 0.5rem !important;
              }
              .resume-container .py-4 {
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
              }
              .resume-container .px-4 {
                padding-left: 0.5rem !important;
                padding-right: 0.5rem !important;
              }
              .resume-container .space-y-2 > * + * {
                margin-top: 0.25rem !important;
              }
              .resume-container .space-y-4 > * + * {
                margin-top: 0.5rem !important;
              }
            </style>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `;

    console.log("HTML content created, size:", htmlContent.length, "bytes");

    // Add loading state
    console.log("Creating loading message");
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
    console.log("Loading message added to DOM");

    // Generate and download the PDF
    console.log("Calling exportHtmlToPdf service function");
    try {
      // Use displayData (passed as contactInfo/jobTitle) for filename generation
      const filename = `${
        contactInfo?.name || jobTitle || "resume"
      }.pdf`;
      console.log("PDF options:", {
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

      console.log("exportHtmlToPdf result:", success);
      return success; // Return the result from exportHtmlToPdf
    } catch (pdfError) {
      // Remove loading message even if error occurs
      if (loadingMsg.parentNode) {
        document.body.removeChild(loadingMsg);
      }

      console.error("Error in exportHtmlToPdf:", pdfError);
      console.error(
        "Error type:",
        typeof pdfError,
        "Is Error instance:",
        pdfError instanceof Error
      );
      onError(
        `PDF generation error: ${
          pdfError instanceof Error ? pdfError.message : String(pdfError)
        }`
      );
      return false;
    }
  } catch (error) {
    console.error("Error downloading PDF:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace available"
    );
    onError("Failed to download PDF. Please try again.");
    return false;
  }
} 