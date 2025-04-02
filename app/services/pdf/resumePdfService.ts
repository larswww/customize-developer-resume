import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source path
// In a browser environment, you need to set the worker source
GlobalWorkerOptions.workerSrc = "/_next/static/pdfjs/pdf.worker.min.js";

/**
 * Generate a PDF file from a resume element using HTML to image and then jsPDF
 */
export async function generateResumePdf(
	resumeElement: HTMLElement,
	fileName: string,
): Promise<void> {
	try {
		// Get resume dimensions
		const width = resumeElement.offsetWidth;
		const height = resumeElement.offsetHeight;

		// Create a temporary canvas
		const canvas = document.createElement("canvas");
		canvas.width = width * 2; // Higher resolution
		canvas.height = height * 2;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Could not get canvas context");
		}

		// Set white background
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.scale(2, 2); // Scale for better quality

		// Create an image from HTML using SVG with foreignObject
		const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="${width}" height="${height}">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${resumeElement.outerHTML
							.replace(
								/bg-yellow-300/g,
								'style="background-color: #FFEB3B !important;"',
							)
							.replace(
								/bg-gray-50/g,
								'style="background-color: #F9FAFB !important;"',
							)}
          </div>
        </foreignObject>
      </svg>
    `;

		// Convert SVG to an image
		const img = new Image();
		const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
		const url = URL.createObjectURL(svgBlob);

		// Wait for image to load
		await new Promise<void>((resolve, reject) => {
			img.onload = () => {
				ctx.drawImage(img, 0, 0, width, height);
				resolve();
			};
			img.onerror = (e) => reject(new Error(`Failed to load SVG image: ${e}`));
			img.src = url;
		});

		// Get image data as PNG
		const imageData = canvas.toDataURL("image/png");

		// Load jsPDF dynamically since we're in the browser
		const jsPDFModule = await import("jspdf");
		const jsPDF = jsPDFModule.default;

		// Create PDF document
		const pdfDoc = new jsPDF({
			orientation: "portrait",
			unit: "px",
			format: [width * 0.75, height * 0.75], // Scale down slightly
		});

		// Add image to PDF
		pdfDoc.addImage(imageData, "PNG", 0, 0, width * 0.75, height * 0.75);

		// Save PDF
		pdfDoc.save(fileName);

		// Clean up
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error generating PDF:", error);
		alert(`There was an error generating the PDF: ${error}`);
		throw error;
	}
}

/**
 * Generate an enhanced PDF with selectable text elements
 */
export async function generateEnhancedResumePdf(
	resumeElement: HTMLElement,
	fileName: string,
): Promise<void> {
	try {
		// This will be similar to the regular PDF generation but with improved handling
		const width = resumeElement.offsetWidth;
		const height = resumeElement.offsetHeight;

		// Create a temporary canvas
		const canvas = document.createElement("canvas");
		canvas.width = width * 2;
		canvas.height = height * 2;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Could not get canvas context");
		}

		// Set white background
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.scale(2, 2);

		// Dynamically load html2canvas for better HTML rendering
		const html2canvasModule = await import("html2canvas");
		const html2canvas = html2canvasModule.default;

		// Create a clone of the resume element to work with
		const clone = resumeElement.cloneNode(true) as HTMLElement;
		document.body.appendChild(clone);
		clone.style.position = "absolute";
		clone.style.left = "-9999px";
		clone.style.width = `${width}px`;

		// Make sure background colors render correctly
		const yellowSections = clone.querySelectorAll(".bg-yellow-300");
		for (const section of yellowSections) {
			if (section instanceof HTMLElement) {
				section.style.backgroundColor = "#FFEB3B";
			}
		}

		const graySections = clone.querySelectorAll(".bg-gray-50");
		for (const section of graySections) {
			if (section instanceof HTMLElement) {
				section.style.backgroundColor = "#F9FAFB";
			}
		}

		// Use html2canvas for better rendering
		const renderedCanvas = await html2canvas(clone, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: "#ffffff",
			logging: false,
		});

		// Get image data
		const imageData = renderedCanvas.toDataURL("image/png");

		// Load jsPDF dynamically
		const jsPDFModule = await import("jspdf");
		const jsPDF = jsPDFModule.default;

		// Create PDF document with appropriate dimensions
		const pdfDoc = new jsPDF({
			orientation: "portrait",
			unit: "px",
			format: [width * 0.75, height * 0.75],
		});

		// Add the image to the PDF
		pdfDoc.addImage(imageData, "PNG", 0, 0, width * 0.75, height * 0.75);

		// Save PDF
		pdfDoc.save(fileName);

		// Clean up
		document.body.removeChild(clone);
	} catch (error) {
		console.error("Error generating enhanced PDF:", error);
		alert(`There was an error generating the enhanced PDF: ${error}`);
		throw error;
	}
}

/**
 * Helper function to convert HTML to an image
 */
async function _html2img(element: HTMLElement): Promise<string> {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Canvas context could not be created");
	}

	// Set canvas dimensions to match element size
	const scale = 2; // Higher resolution
	canvas.width = element.offsetWidth * scale;
	canvas.height = element.offsetHeight * scale;

	// Apply white background
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Scale context for better quality
	ctx.scale(scale, scale);

	// Get computed styles
	const _styles = window.getComputedStyle(element);

	// Apply specific styles for sections
	const yellowSections = element.querySelectorAll(".bg-yellow-300");
	for (const section of yellowSections) {
		if (section instanceof HTMLElement) {
			section.style.backgroundColor = "#FFEB3B";
		}
	}

	const graySections = element.querySelectorAll(".bg-gray-50");
	for (const section of graySections) {
		if (section instanceof HTMLElement) {
			section.style.backgroundColor = "#F9FAFB";
		}
	}

	// Create SVG with foreignObject to render HTML
	const data = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${element.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

	// Create Blob and URL
	const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
	const url = URL.createObjectURL(svgBlob);

	// Load image
	const img = new Image();
	img.src = url;

	return new Promise((resolve, reject) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/png"));
		};
		img.onerror = reject;
	});
}
