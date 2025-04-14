import { clientLogger } from "~/utils/logger.client";
export async function exportHtmlToPdf(
	htmlContent: string,
	options: {
		filename?: string;
		format?: "Letter" | "A4";
		landscape?: boolean;
	} = {},
) {
	const {
		filename = "resume.pdf",
		format = "Letter",
		landscape = false,
	} = options;

	// Create notification
	const notificationId = "pdf-export-notification";
	const htmlSize = Math.round(htmlContent.length / 1024);
	let notification: HTMLElement | null = null;

	try {
		clientLogger.log("Starting PDF export, HTML size:", htmlSize, "KB");

		// Create and show notification
		notification = document.createElement("div");
		notification.id = notificationId;
		notification.style.position = "fixed";
		notification.style.bottom = "20px";
		notification.style.right = "20px";
		notification.style.backgroundColor = "#333";
		notification.style.color = "white";
		notification.style.padding = "15px 20px";
		notification.style.borderRadius = "5px";
		notification.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
		notification.style.zIndex = "9999";
		notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Generating borderless PDF</div>
          <div style="font-size: 0.9em; opacity: 0.9;">Processing ${htmlSize}KB of HTML content</div>
        </div>
      </div>
    `;

		document.body.appendChild(notification);
		clientLogger.log("Added notification to document body");

		// Direct fetch approach first - this is better for handling large content
		try {
			clientLogger.log("Trying fetch approach first...");

			// Create FormData
			const formData = new FormData();
			formData.append("htmlContent", htmlContent);
			formData.append("format", format);
			formData.append("landscape", landscape.toString());
			formData.append("filename", filename);

			// Make the fetch request
			const response = await fetch("/export-pdf", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				clientLogger.error("Server error response:", errorText);
				throw new Error(`Server error: ${response.status} - ${errorText}`);
			}

			// Get the PDF blob
			const pdfBlob = await response.blob();
			clientLogger.log(
				"Received PDF blob, size:",
				Math.round(pdfBlob.size / 1024),
				"KB",
			);

			// Create a download link
			const downloadUrl = URL.createObjectURL(pdfBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = downloadUrl;
			downloadLink.download = filename;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);

			// Trigger download
			clientLogger.log("Triggering download...");
			downloadLink.click();

			// Clean up
			setTimeout(() => {
				URL.revokeObjectURL(downloadUrl);
				document.body.removeChild(downloadLink);
				if (notification) {
					document.body.removeChild(notification);
				}
				clientLogger.log("Download link cleanup complete");
			}, 1000);

			return true;
		} catch (fetchError) {
			clientLogger.warn(
				"Fetch approach failed, falling back to form submission...",
				fetchError,
			);

			// Fall back to form submission approach if fetch fails
			const form = document.createElement("form");
			form.method = "POST";
			form.action = "/export-pdf";
			form.target = "_blank"; // Open in new tab/window
			form.enctype = "multipart/form-data"; // Important for large data
			form.style.display = "none";

			// Add hidden inputs for form data - but limit the size
			const maxChunkSize = 500000; // ~500KB chunks to avoid browser limits

			// Split the HTML content into chunks if it's too large
			if (htmlContent.length > maxChunkSize) {
				// Use a simpler HTML with a message about content being too large
				const simplifiedHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Large Resume</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5; }
                h1 { color: #333; }
                .message { background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; margin: 2rem 0; }
              </style>
            </head>
            <body>
              <h1>Resume Generated</h1>
              <div class="message">
                <p>Your resume is too large for direct PDF generation in the browser.</p>
                <p>Please try the "Print" option instead or reduce the content size.</p>
              </div>
            </body>
          </html>
        `;

				const htmlInput = document.createElement("input");
				htmlInput.type = "hidden";
				htmlInput.name = "htmlContent";
				htmlInput.value = simplifiedHtml;
				form.appendChild(htmlInput);
			} else {
				const htmlInput = document.createElement("input");
				htmlInput.type = "hidden";
				htmlInput.name = "htmlContent";
				htmlInput.value = htmlContent;
				form.appendChild(htmlInput);
			}

			const formatInput = document.createElement("input");
			formatInput.type = "hidden";
			formatInput.name = "format";
			formatInput.value = format;
			form.appendChild(formatInput);

			const landscapeInput = document.createElement("input");
			landscapeInput.type = "hidden";
			landscapeInput.name = "landscape";
			landscapeInput.value = landscape.toString();
			form.appendChild(landscapeInput);

			const filenameInput = document.createElement("input");
			filenameInput.type = "hidden";
			filenameInput.name = "filename";
			filenameInput.value = filename;
			form.appendChild(filenameInput);

			// Append form to document and submit
			document.body.appendChild(form);
			clientLogger.log("Submitting form to server...");
			form.submit();

			// Remove notification after a delay
			setTimeout(() => {
				if (notification) {
					document.body.removeChild(notification);
				}
				document.body.removeChild(form);
				clientLogger.log("Notification and form removed");
			}, 3000);

			return true;
		}
	} catch (error) {
		clientLogger.error("PDF export failed:", error);

		// Clean up notification if it exists
		if (notification?.parentNode) {
			notification.parentNode.removeChild(notification);
		}

		// Try to display a helpful error message
		const errorDiv = document.createElement("div");
		errorDiv.style.position = "fixed";
		errorDiv.style.top = "20px";
		errorDiv.style.left = "50%";
		errorDiv.style.transform = "translateX(-50%)";
		errorDiv.style.backgroundColor = "#f8d7da";
		errorDiv.style.color = "#721c24";
		errorDiv.style.padding = "15px 20px";
		errorDiv.style.borderRadius = "5px";
		errorDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
		errorDiv.style.zIndex = "9999";
		errorDiv.style.maxWidth = "80%";
		errorDiv.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">PDF Generation Failed</div>
      <div style="font-size: 0.9em;">${error instanceof Error ? error.message : String(error)}</div>
      <div style="font-size: 0.8em; margin-top: 8px;">Try using the "Print" button instead</div>
    `;

		document.body.appendChild(errorDiv);

		// Remove the error message after 8 seconds
		setTimeout(() => {
			errorDiv.remove();
		}, 8000);

		return false;
	}
}
