import { clientLogger } from "../utils/logger.client";

/**
 * Handles printing the resume element by cloning it into an iframe.
 * @param elementId The ID of the HTML element to print.
 * @param onError Callback function to handle errors.
 * @param isPowerPointStyle Whether the resume is in PowerPoint style format (kept for backward compatibility).
 */
export function printResumeElement(
	elementId: string,
	onError: (message: string) => void,
	isPowerPointStyle = false,
): void {
	try {
		const resumeElement = document.getElementById(elementId);
		if (!resumeElement) {
			clientLogger.error(
				`Could not find element with ID '${elementId}' for printing`,
			);
			onError(`Could not find element with ID '${elementId}' for printing`);
			return;
		}

		const iframe = document.createElement("iframe");
		document.body.appendChild(iframe);

		const contentClone = resumeElement.cloneNode(true) as HTMLElement;
		clientLogger.log("Content cloned successfully");

		iframe.onload = () => {
			try {
				const iframeDoc =
					iframe.contentDocument || iframe.contentWindow?.document;
				if (!iframeDoc) {
					clientLogger.error("Could not access iframe document");
					// Clean up before erroring
					if (iframe.parentNode === document.body)
						document.body.removeChild(iframe);
					// if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
					onError("Could not access iframe document for printing.");
					return;
				}

				iframeDoc.open();
				iframeDoc.write(`
          <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Structured Resume</title>
            <link href="http://localhost:3000/index1.css" rel="stylesheet">
            <style>
          @page
{
  size: A4 portrait;
  margin: 0mm;
}
            </style>
          </head>
          <body>
            ${contentClone.outerHTML}
          </body>
        </html>
        `);
				iframeDoc.close();

				clientLogger.log("Content written to iframe");
				setTimeout(() => {
					try {
						if (iframe.contentWindow) {
							iframe.contentWindow.focus();
							iframe.contentWindow.print();

							setTimeout(() => {
								if (iframe.parentNode === document.body)
									document.body.removeChild(iframe);
							}, 2000);
						} else {
							throw new Error("Could not access iframe content window");
						}
					} catch (printError) {
						clientLogger.error("Error triggering print:", printError);
						setTimeout(() => {
							if (iframe.parentNode === document.body)
								document.body.removeChild(iframe);
							onError(
								"Failed to print. Try using your browser print function instead.",
							);
						}, 5000);
					}
				}, 1000);
			} catch (iframeError) {
				clientLogger.error("Error setting up iframe:", iframeError);
				if (iframe.parentNode === document.body)
					document.body.removeChild(iframe);
				onError("Failed to set up print view. Try another browser.");
			}
		};

		iframe.onerror = () => {
			clientLogger.error("Error loading iframe");
			if (iframe.parentNode === document.body)
				document.body.removeChild(iframe);
			onError("Failed to load print preview. Try another browser.");
		};

		iframe.src = "about:blank";
	} catch (error) {
		clientLogger.error("Error setting up print:", error);
		const potentiallyAddedIframe = document.querySelector(
			"iframe[style*='position: fixed']",
		);
		if (
			potentiallyAddedIframe &&
			potentiallyAddedIframe.parentNode === document.body
		) {
			document.body.removeChild(potentiallyAddedIframe);
		}

		onError("Failed to set up print view. Try another browser.");
	}
}
