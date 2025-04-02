import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { PrintableResume } from "../components/PrintableResume";
import type { ResumeData } from "../components/ResumeTemplate";
import { ResumeTemplate } from "../components/ResumeTemplate";
import { generateStructuredResumeData } from "../services/ai/resumeStructuredDataService";
import { exportHtmlToPdf } from "../services/pdf/clientPdfService";

export function meta() {
	return [
		{ title: "Structured Resume Generator" },
		{ name: "description", content: "Generate a structured resume using AI" },
	];
}

// This is sample resume text to use as default
const sampleResumeText = `PROFILE  
Front-end developer with substantial experience in Nextjs, TypeScript, and Tailwind. Comfortable setting up new applications from scratch in high-velocity environments. Proven track record in automotive projects, delivering user-friendly interfaces and improving workflows.

RELEVANT EXPERIENCE

Krew (AI)  
• Took over a complex Nextjs codebase from the departing CTO; deployed new features to production within the first week.  
• Translated a detailed Figma prototype into a functional product, enhancing output depth and quality with Python, FastAPI, and Redis on the backend.  
• Iterated on UI from beta to production, focusing on clear typography and streamlined design for end users.

NoLemons (Automotive)  
• Assumed ownership of a legacy full-stack Nextjs and Drupal application; quickly understood, refactored, and deployed it.  
• Enabled the CEO to sell the project to a new owner by stabilizing code, improving responsiveness, and creating a backlog for upcoming enhancements.  

Major Automotive Manufacturer (Automotive)  
• Built a geospatial analysis platform (NextJs, MapBox, MongoDB) to identify optimal EV charging locations, iterating weekly with stakeholders.  
• Repositioned the solution as a generic tool for multiple clients and showcased it at the Junction Hackathon 2022, resulting in high participation and successful recruitment outcomes.  

McKinsey Leap Gen AI Platform (AI, Strategy Consulting) – Lead Developer  
• Implemented core full-stack logic in NextJs/Nestjs for a system modeling McKinsey's business methodology, generating real-time UI in client workshops.  
• Built secure private document ingestion and agent-based retrieval-augmented generation (RAG), ensuring data privacy.  
• Designed an evaluation workflow using LLM feedback to maintain text quality, awarded "Innovation Olympics" Gold Medal and secured €2M in funding.

McKinsey Leap Navigator (Project Management Tools) – Full Stack Team Lead  
• Oversaw sprint planning, backlog grooming, and technical alignment for a Nextjs/Nestjs/Strapi application.  
• Proposed a simplified UX to unblock content delivery, leading to increased user adoption on both desktop and mobile devices.  
• Established a developer-friendly team atmosphere, boosting velocity and encouraging transparent discussions on product-market fit.

EDUCATION
B.S. Computer Science
Linnaeus University
2015-2018
Kalmar, Sweden

SKILLS
Frontend: TypeScript, E2E Testing, Frontend & Frameworks (React/Vue), Mobile-first, Browser APIs & Service Workers, SEO & Performance
Backend: Python, Postgres & SQL modeling, Docker & multi-container deploy, AWS & Cloud, DevOps & Release strategies
Soft: Client Relationship Management, Team Leadership, Design Sprint, Agile

OTHER
Volunteer at HackYourFuture
Languages: Swedish, English, Dutch`;

// Sample structured resume data for testing
const sampleResumeData: ResumeData = {
	contactInfo: {
		name: "LARS WÖLDERN",
		title: "Product Engineer",
		location: "Amsterdam & Remote",
		phone: "+31 6 2526 6752",
		email: "lars@productworks.nl",
		github: "github.com/larswww",
		linkedin: "linkedin.com/in/larswo",
	},
	workExperience: [
		{
			title: "OWNER",
			company: "Product Works B.V.",
			location: "Amsterdam",
			dates: "Oct 2024 - Current",
			description: [
				"Providing independent consulting services & developing portfolio projects.",
			],
		},
		{
			title: "SENIOR SPECIALIST",
			company: "McKinsey & Company",
			location: "Amsterdam",
			dates: "Jun 2022 - Sep 2024",
			description: [
				'Awarded the "Innovation Olympics" Gold Medal for co-developing a GenAI solution modeling McKinsey\'s business methodology, securing €2 million in funding.',
				"Collaborated across teams on development of a chemical use-optimization AI and coal mine monitoring dashboard, enabling a major chemicals producer's transformation from commodities to software.",
				"Led the technical architecture of a customer loyalty platform for a leading European retailer.",
				"Built a geospatial analysis platform used in two client projects and showcased as a McKinsey Digital asset at the Junction 2022 hackathon in Helsinki.",
			],
		},
		{
			title: "TEAM LEAD",
			company: "Accenture Liquid Studio",
			location: "Amsterdam",
			dates: "Jun 2021 - Jun 2022",
			description: [
				"Directed a frontend team to deliver a Fortune 500 Greenfield project from PoC to alpha production. The application, deployed across 5,700 stores, won the TROPHÉES DE L'INNOVATION 2023 Award.",
			],
		},
		{
			title: "CONSULTANT",
			company: "Cygni, Part of Accenture",
			location: "Sweden",
			dates: "Sep 2019 - Jan 2021",
			description: [
				"Delivered full-stack engineering work for four clients across diverse tech stacks, consistently receiving excellent client feedback.",
			],
		},
		{
			title: "ASSOCIATE PARTNER",
			company: "St. James's Place Plc",
			location: "Shanghai & Beijing",
			dates: "2013 - 2018",
			description: [],
		},
	],
	education: [
		{
			degree: "B.S. Computer Science",
			institution: "Linnaeus University",
			dates: "2015-2018",
			location: "Kalmar, Sweden",
		},
	],
	skills: [
		{
			category: "Frontend",
			items: [
				"TypeScript",
				"E2E Testing",
				"Frontend & Frameworks (React/Vue)",
				"Mobile-first",
				"Browser APIs & Service Workers",
				"SEO & Performance",
			],
		},
		{
			category: "Backend",
			items: [
				"Python",
				"Postgres & SQL modelling",
				"Docker & multi-container deploy",
				"AWS & Cloud",
				"DevOps & Release strategies",
			],
		},
		{
			category: "Soft",
			items: [
				"Client Relationship Management",
				"Team Leadership",
				"Design Sprint",
				"Agile",
			],
		},
	],
	otherInfo: {
		title: "OTHER",
		items: ["Volunteer at HackYourFuture"],
	},
	languages: ["🇸🇪", "🇬🇧", "🇳🇱"],
};

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const resumeText = formData.get("resumeText") as string;
	const actionType = formData.get("actionType") as string;

	try {
		// Check if this is a test or an actual generation
		if (actionType === "generate") {
			// Generate structured data from the resume text
			const structuredData = await generateStructuredResumeData(resumeText);

			return {
				success: true,
				resumeData: structuredData,
			};
		}

		if (actionType === "test") {
			// Return sample data for testing
			return {
				success: true,
				resumeData: sampleResumeData,
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
			error:
				error instanceof Error ? error.message : "An unknown error occurred",
		};
	}
}

export default function StructuredResume() {
	const [resumeText, setResumeText] = useState(sampleResumeText);
	const [error, setError] = useState<string | null>(null);
	const resumeRef = useRef<HTMLDivElement>(null);

	const actionData = useActionData<{
		success?: boolean;
		resumeData?: ResumeData;
		error?: string;
	}>();
	const navigation = useNavigation();

	// Use React Router's navigation state to determine if form is submitting
	const isSubmitting = navigation.state === "submitting";

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
				console.log("PDF options:", {
					filename: `${actionData?.resumeData?.contactInfo?.name || "resume"}.pdf`,
					format: "Letter",
					landscape: false,
				});

				const success = await exportHtmlToPdf(htmlContent, {
					filename: `${actionData?.resumeData?.contactInfo?.name || "resume"}.pdf`,
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
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Structured Resume Generator</h1>
				<p className="text-gray-600">
					Create a stylish, structured resume using AI to format your content.
				</p>
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
							value={resumeText}
							onChange={(e) => setResumeText(e.target.value)}
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
							value="test"
							className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							Test with Sample Data
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

			{actionData?.success && actionData.resumeData && (
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
									console.log("--- Download as PDF button wrapper clicked ---");
									try {
										setError(null);

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

										// Start download with a timeout
										console.log("Starting download with timeout protection");
										const downloadResult = await Promise.race([
											downloadPdf(),
											new Promise((_, reject) => {
												console.log("Setting PDF generation timeout (30s)");
												setTimeout(() => {
													console.log("PDF generation timed out");
													reject(
														new Error(
															"PDF generation timeout after 30 seconds",
														),
													);
												}, 30000);
											}),
										]);

										// Remove loading message
										console.log(
											"Download process finished, removing loading message",
										);
										document.body.removeChild(loadingMsg);

										if (!downloadResult) {
											console.error("Download was unsuccessful");
											setError(
												"PDF download failed. Please try the Print option instead.",
											);
										} else {
											console.log("Download was successful");
										}
									} catch (err) {
										console.error(
											"Error in download button click handler:",
											err,
										);
										console.error(
											"Error details:",
											err instanceof Error ? err.stack : String(err),
										);
										setError(
											`Failed to download PDF: ${err instanceof Error ? err.message : String(err)}`,
										);
									}
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
								<ResumeTemplate data={actionData.resumeData} />
							</div>
						</div>
					</div>
				</>
			)}

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
