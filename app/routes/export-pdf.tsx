import type { PaperFormat } from "puppeteer-core";
import type { ActionFunctionArgs } from "react-router";
import { generatePdfFromHtml } from "~/services/pdf/serverPdfService";

/**
 * Export PDF route handles PDF generation from HTML content
 * Can be accessed via POST from fetch or form submission
 */
export async function action({ request }: ActionFunctionArgs) {
	console.log("PDF export route called, method:", request.method);

	// This route should only handle POST requests
	if (request.method !== "POST") {
		console.error("Method not allowed:", request.method);
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		// Extract the HTML content from the request body
		const formData = await request.formData();
		const htmlContent = formData.get("htmlContent") as string;
		const format = (formData.get("format") as PaperFormat) || "Letter";
		const landscape = formData.get("landscape") === "true";
		const filename = (formData.get("filename") as string) || "resume.pdf";

		console.log("Received form data:", {
			contentLength: htmlContent ? htmlContent.length : 0,
			format,
			landscape,
			filename,
		});

		if (!htmlContent) {
			console.error("Missing HTML content in request");
			return new Response("Missing HTML content", {
				status: 400,
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		// Generate the PDF using the serverPdfService
		console.log("Calling server PDF service to generate PDF...");

		try {
			const pdfBuffer = await generatePdfFromHtml(htmlContent, {
				format,
				landscape,
				printBackground: true,
				margin: {
					top: "0",
					right: "0",
					bottom: "0",
					left: "0",
				},
			});

			console.log(
				"PDF generated successfully, size:",
				pdfBuffer.length,
				"bytes",
			);

			// For very small PDFs, something likely went wrong
			if (pdfBuffer.length < 1000) {
				console.error(
					"Generated PDF is suspiciously small:",
					pdfBuffer.length,
					"bytes",
				);
				return new Response("PDF generation failed: output is too small", {
					status: 500,
					headers: {
						"Content-Type": "text/plain",
					},
				});
			}

			// Return the PDF as a response with proper headers for download
			console.log("Sending PDF response to client with filename:", filename);
			return new Response(pdfBuffer, {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
					"Content-Length": pdfBuffer.length.toString(),
					"Cache-Control": "no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
			});
		} catch (pdfError) {
			// Handle PDF generation errors specifically
			console.error("PDF generation error:", pdfError);
			const errorMessage =
				pdfError instanceof Error ? pdfError.message : String(pdfError);

			return new Response(`PDF generation failed: ${errorMessage}`, {
				status: 500,
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}
	} catch (error) {
		// Handle request processing errors
		console.error("Error processing request:", error);
		return new Response(
			`An error occurred while processing your request: ${error instanceof Error ? error.message : String(error)}`,
			{
				status: 500,
				headers: {
					"Content-Type": "text/plain",
				},
			},
		);
	}
}

// Resource routes should NOT have a default export component
// Removing the default export as per React Router v7 resource routes documentation
