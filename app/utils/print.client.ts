/**
 * Handles printing the resume element by cloning it into an iframe.
 * @param elementId The ID of the HTML element to print.
 * @param onError Callback function to handle errors.
 * @param isPowerPointStyle Whether the resume is in PowerPoint style format (kept for backward compatibility).
 */
export function printResumeElement(
  elementId: string,
  onError: (message: string) => void,
  isPowerPointStyle = false
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
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      /* Ensure blue header prints with correct color */
      .bg-\\[\\#1e3a8a\\] {
        background-color: #1e3a8a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* New button styles for consultant template */
      .bg-\\[\\#25D366\\] {
        background-color: #25D366 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .bg-\\[\\#333333\\] {
        background-color: #333333 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .bg-\\[\\#0055AA\\] {
        background-color: #0055AA !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .bg-\\[\\#24292e\\] {
        background-color: #24292e !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Make sure other colors print */
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
      .bg-white {
        background-color: #FFFFFF !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Add rule to prevent specific elements from breaking across pages */
      li, p, h1, h2, h3, h4, h5, h6 {
        break-inside: avoid !important;
      }
      /* Fix for buttons */
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
      /* Fix for shadow and rounded elements */
      .shadow-lg, .shadow-md, .shadow-sm, .shadow {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .rounded-md, .rounded-lg, .rounded-full {
        border-radius: 0.375rem !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Fix text colors */
      .text-blue-800 {
        color: #1e40af !important;
      }
      .text-blue-600 {
        color: #2563eb !important;
      }
      .text-green-800 {
        color: #065f46 !important;
      }
      .text-gray-800 {
        color: #1f2937 !important;
      }
      .text-gray-600 {
        color: #4b5563 !important;
      }
      .text-blue-100 {
        color: #dbeafe !important;
      }
      .text-blue-50 {
        color: #eff6ff !important;
      }
      /* Background for footer */
      .bg-gray-100 {
        background-color: #f3f4f6 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Border colors */
      .border-gray-200 {
        border-color: #e5e7eb !important;
      }
      /* Custom background color for disclaimer underline */
      .bg-\\[\\#e53e3e\\] {
        background-color: #e53e3e !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Scale content to fit on page */
      #printable-resume {
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      /* Ensure text is white on colored backgrounds */
      .text-white {
        color: white !important;
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
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

        // Trigger the print after a short delay
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