import { useEffect, useRef, useState } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { PrintableResume } from "../components/PrintableResume";
import type { ResumeData } from "../components/ResumeTemplate";
import { ResumeTemplate } from "../components/ResumeTemplate";
import { generateStructuredResumeData } from "../services/ai/resumeStructuredDataService";
import { exportHtmlToPdf } from "../services/pdf/clientPdfService";
import dbService from "../services/db/dbService";

export function meta() {
  return [
    { title: "Resume Builder" },
    { name: "description", content: "Create a structured resume using AI" },
  ];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  
  if (Number.isNaN(jobId)) {
    throw new Response("Invalid job ID", { status: 400 });
  }
  
  // Get job from database
  const job = dbService.getJob(jobId);
  
  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }
  
  // Get resume data if exists
  const resumeData = dbService.getResume(jobId);
  
  // Get craft-resume workflow step result
  const craftResumeStep = dbService.getWorkflowStep(jobId, "craft-resume");
  const resumeText = craftResumeStep?.result || "";

  return { 
    job,
    resumeData,
    resumeText
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const resumeText = formData.get("resumeText") as string;
  const actionType = formData.get("actionType") as string;
  const jobId = Number(params.jobId);
  
  if (Number.isNaN(jobId)) {
    return {
      success: false,
      error: "Invalid job ID"
    };
  }
  
  // Get job from database
  const job = dbService.getJob(jobId);
  
  if (!job) {
    return {
      success: false,
      error: "Job not found"
    };
  }

  try {
    if (actionType === "generate") {
      // Generate structured data from the resume text
      const structuredData = await generateStructuredResumeData(resumeText);
      
      // Save the resume to the database
      dbService.saveResume({
        jobId,
        resumeText,
        structuredData
      });
      
      return {
        success: true,
        resumeData: structuredData,
      };
    }

    if (actionType === "save") {
      // Save the current resume text without regenerating
      // This is useful when the user edits the text but doesn't want to regenerate
      const currentResume = dbService.getResume(jobId);
      
      dbService.saveResume({
        jobId,
        resumeText,
        structuredData: currentResume?.structuredData
      });
      
      return {
        success: true,
        message: "Resume text saved",
        resumeData: currentResume?.structuredData
      };
    }

    // Invalid action type
    return {
      success: false,
      error: "Invalid action type",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export default function JobResume() {
  const { job, resumeData, resumeText } = useLoaderData<{
    job: {
      id: number;
      title: string;
      jobDescription: string;
    };
    resumeData: {
      resumeText?: string;
      structuredData?: ResumeData;
    } | null;
    resumeText: string;
  }>();
  
  // Initialize with saved resume text or the text from the workflow step
  const [currentResumeText, setCurrentResumeText] = useState(
    resumeData?.resumeText || resumeText || ""
  );
  
  const [error, setError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const actionData = useActionData<{
    success?: boolean;
    resumeData?: ResumeData;
    error?: string;
    message?: string;
  }>();
  
  const navigation = useNavigation();

  // Use React Router's navigation state to determine if form is submitting
  const isSubmitting = navigation.state === "submitting";

  // When action data changes, update the structured data
  useEffect(() => {
    if (actionData?.success && actionData?.resumeData) {
      console.log("Resume data updated from action", actionData.resumeData);
    }
  }, [actionData]);

  // Update the resume text from state when it changes
  useEffect(() => {
    if (resumeData?.resumeText || resumeText) {
      setCurrentResumeText(resumeData?.resumeText || resumeText);
    }
  }, [resumeData?.resumeText, resumeText]);

  // Handle print functionality
  const handlePrint = () => {
    console.log("--- Print button clicked ---");

    try {
      // Target the resume for printing
      const resumeElement = document.getElementById("printable-resume");
      console.log("Resume element found:", !!resumeElement);

      if (!resumeElement) {
        console.error("Could not find resume element for printing");
        setError("Could not find resume element for printing");
        return;
      }

      // Create an iframe for printing to avoid popup blocking
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";

      // Create a wrapper notification
      const printingNote = document.createElement("div");
      printingNote.style.position = "fixed";
      printingNote.style.top = "15px";
      printingNote.style.left = "50%";
      printingNote.style.transform = "translateX(-50%)";
      printingNote.style.background = "#4B5563";
      printingNote.style.color = "white";
      printingNote.style.padding = "10px 15px";
      printingNote.style.borderRadius = "4px";
      printingNote.style.zIndex = "9999";
      printingNote.innerHTML = "Preparing print view...";

      document.body.appendChild(printingNote);
      document.body.appendChild(iframe);

      const contentClone = resumeElement.cloneNode(true) as HTMLElement;
      console.log("Content cloned successfully");

      // Add necessary styles for printing
      const printStyles = `
        @page {
          size: letter portrait;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .print-container {
          width: 8.5in;
          height: 11in;
          overflow: hidden;
          position: relative;
        }
        /* Make sure colors print */
        .bg-yellow-300 {
          background-color: #FFEB3B !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .bg-gray-50 {
          background-color: #F9FAFB !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;

      // Write to iframe when it's loaded
      iframe.onload = () => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) {
            console.error("Could not access iframe document");
            return;
          }

          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print Resume</title>
                <meta name="color-scheme" content="light">
                <style>${printStyles}</style>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              </head>
              <body>
                <div class="print-container">
                  ${contentClone.outerHTML}
                </div>
                <script>
                  // Auto print when loaded
                  window.onload = function() {
                    console.log('Print window loaded');
                    setTimeout(function() {
                      console.log('Triggering print dialog');
                      window.print();
                      console.log('Print dialog triggered');
                    }, 1000);
                  };
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();

          console.log("Content written to iframe");
          printingNote.innerHTML = "Opening print dialog...";

          // Trigger the print after a short delay
          setTimeout(() => {
            try {
              if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // Clean up after the print dialog is shown
                setTimeout(() => {
                  document.body.removeChild(iframe);
                  document.body.removeChild(printingNote);
                }, 1000);

                return true;
              }
              throw new Error("Could not access iframe content window");
            } catch (printError) {
              console.error("Error triggering print:", printError);
              printingNote.innerHTML =
                "Print failed. Try using Print button in your browser.";
              printingNote.style.background = "#EF4444";

              setTimeout(() => {
                document.body.removeChild(iframe);
                document.body.removeChild(printingNote);
                setError(
                  "Failed to print. Try using your browser print function instead.",
                );
              }, 5000);
            }
          }, 1000);
        } catch (iframeError) {
          console.error("Error setting up iframe:", iframeError);
          document.body.removeChild(iframe);
          document.body.removeChild(printingNote);
          setError("Failed to set up print view. Try another browser.");
        }
      };

      // Handle iframe loading errors
      iframe.onerror = () => {
        console.error("Error loading iframe");
        document.body.removeChild(iframe);
        document.body.removeChild(printingNote);
        setError("Failed to load print preview. Try another browser.");
      };

      // Set iframe source to trigger load event
      iframe.src = "about:blank";
    } catch (error) {
      console.error("Error setting up print:", error);
      setError("Failed to set up print view. Try another browser.");
    }
  };

  const downloadPdf = async () => {
    console.log("--- Download PDF button clicked ---");
    console.log("Starting server-side PDF generation process");

    try {
      // Get a reference to the resume div
      const resumeElement = document.getElementById("printable-resume");
      console.log('Looking for element with ID "printable-resume"');

      if (!resumeElement) {
        console.error(
          "Could not find resume element with ID: printable-resume",
        );
        console.log(
          "Available IDs:",
          Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
        );
        console.log(
          "Resume container found:",
          !!document.querySelector(".resume-container"),
        );
        setError("Could not find resume element to export");
        return false;
      }
      console.log(
        "Resume element found:",
        !!resumeElement,
        "Type:",
        resumeElement.tagName,
      );

      // Clone the element to avoid modifying the displayed resume
      const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
      console.log(
        "Element cloned successfully, size:",
        clonedElement.outerHTML.length,
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
        const currentResumeData = (actionData?.resumeData || resumeData?.structuredData);
        console.log("PDF options:", {
          filename: `${currentResumeData?.contactInfo?.name || job.title || "resume"}.pdf`,
          format: "Letter",
          landscape: false,
        });

        const success = await exportHtmlToPdf(htmlContent, {
          filename: `${currentResumeData?.contactInfo?.name || job.title || "resume"}.pdf`,
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
          pdfError instanceof Error,
        );
        setError(
          `PDF generation error: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`,
        );
        return false;
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace available",
      );
      setError("Failed to download PDF. Please try again.");
      return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resume Builder for {job.title}</h1>
        <div className="flex gap-2">
          <Link 
            to="/dashboard" 
            className="px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
          <Link
            to={`/job/${job.id}/content`}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Generate Content
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <Form method="post" className="mb-4">
          <div className="mb-4">
            <label
              htmlFor="resumeText"
              className="block mb-2 font-medium text-gray-700"
            >
              Resume Text
            </label>
            <textarea
              id="resumeText"
              name="resumeText"
              value={currentResumeText}
              onChange={(e) => setCurrentResumeText(e.target.value)}
              className="w-full h-96 p-4 border rounded font-mono text-sm bg-gray-50"
              placeholder="Enter your resume text here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              name="actionType"
              value="generate"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>Generate Structured Resume</>
              )}
            </button>

            <button
              type="submit"
              name="actionType"
              value="save"
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Save Text Only
            </button>
          </div>
        </Form>
      </div>

      {navigation.state === "loading" && actionData === undefined && (
        <div className="mb-4 p-4 border rounded bg-blue-50">
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading results...</span>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
          {actionData.error}
        </div>
      )}

      {actionData?.message && actionData.success && (
        <div className="text-green-500 mb-4 p-4 border border-green-200 rounded bg-green-50">
          {actionData.message}
        </div>
      )}

      {(actionData?.success && actionData.resumeData) || resumeData?.structuredData ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Generated Resume</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                  title="Print"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  await downloadPdf();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                  title="Download as PDF"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download as PDF
              </button>
            </div>
          </div>

          <div className="mb-20">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div ref={resumeRef} id="printable-resume">
                <ResumeTemplate data={actionData?.resumeData || resumeData?.structuredData} />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Display error message if any */}
      {error && (
        <div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      )}

      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-resume, #printable-resume * {
              visibility: visible;
            }
            #printable-resume {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
} 