/**
 * Handles printing the resume element by cloning it into an iframe.
 * @param elementId The ID of the HTML element to print.
 * @param onError Callback function to handle errors.
 */
export function printResumeElement(
  elementId: string,
  onError: (message: string) => void
): void {
  console.log("--- Print button clicked ---");

  try {
    // Target the resume for printing
    const resumeElement = document.getElementById(elementId);
    console.log("Resume element found:", !!resumeElement);

    if (!resumeElement) {
      console.error(`Could not find element with ID '${elementId}' for printing`);
      onError(`Could not find element with ID '${elementId}' for printing`);
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
        margin: 0.5in; /* Define page margins directly */
      }
      body {
        margin: 0; /* Body margin is not needed with @page margin */
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
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
      /* Add rule to prevent specific elements from breaking across pages */
      /* Target list items, paragraphs, and headings */
      li, p, h1, h2, h3, h4, h5, h6 {
        break-inside: avoid !important;
      }
    `;

    // Write to iframe when it's loaded
    iframe.onload = () => {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.error("Could not access iframe document");
          // Clean up before erroring
          if (iframe.parentNode === document.body) document.body.removeChild(iframe);
          if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
          onError("Could not access iframe document for printing.");
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
              <!-- Removed .print-container wrapper, rely on @page margin -->
              ${contentClone.outerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        console.log("Content written to iframe");
        printingNote.innerHTML = "Opening print dialog...";

        // Trigger the print after a short delay (Reverted to original mechanism)
        setTimeout(() => {
          try {
            if (iframe.contentWindow) {
              iframe.contentWindow.focus(); // Focus the iframe window
              iframe.contentWindow.print(); // Call print on the iframe's window

              // Clean up after the print dialog is likely shown/actioned
              setTimeout(() => {
                 if (iframe.parentNode === document.body) document.body.removeChild(iframe);
                 if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
              }, 2000); // Adjusted cleanup delay

            } else {
              throw new Error("Could not access iframe content window");
            }
          } catch (printError) {
            console.error("Error triggering print:", printError);
            printingNote.innerHTML =
              "Print failed. Try using Print button in your browser.";
            printingNote.style.background = "#EF4444";

            setTimeout(() => {
              if (iframe.parentNode === document.body) document.body.removeChild(iframe);
              if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
              onError(
                "Failed to print. Try using your browser print function instead."
              );
            }, 5000);
          }
        }, 1000); // Delay before triggering print
      } catch (iframeError) {
        console.error("Error setting up iframe:", iframeError);
        if (iframe.parentNode === document.body) document.body.removeChild(iframe);
        if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
        onError("Failed to set up print view. Try another browser.");
      }
    };

    // Handle iframe loading errors
    iframe.onerror = () => {
      console.error("Error loading iframe");
      if (iframe.parentNode === document.body) document.body.removeChild(iframe);
      if (printingNote.parentNode === document.body) document.body.removeChild(printingNote);
      onError("Failed to load print preview. Try another browser.");
    };

    // Set iframe source to trigger load event
    iframe.src = "about:blank";
  } catch (error) {
    console.error("Error setting up print:", error);
    // Ensure cleanup even if initial setup fails
    const potentiallyAddedIframe = document.querySelector("iframe[style*='position: fixed']");
    if (potentiallyAddedIframe && potentiallyAddedIframe.parentNode === document.body) {
        document.body.removeChild(potentiallyAddedIframe);
    }
    const potentiallyAddedNote = document.querySelector("div[style*='position: fixed'][style*='zIndex: 9999']");
     if (potentiallyAddedNote && potentiallyAddedNote.parentNode === document.body) {
        document.body.removeChild(potentiallyAddedNote);
    }
    onError("Failed to set up print view. Try another browser.");
  }
} 