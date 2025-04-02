import puppeteer from "puppeteer-core";
import type { PaperFormat } from "puppeteer-core";

/**
 * Server-side service for generating PDFs from HTML
 */
export async function generatePdfFromHtml(
	htmlContent: string,
	options: {
		format?: PaperFormat;
		landscape?: boolean;
		printBackground?: boolean;
		margin?: {
			top?: string;
			right?: string;
			bottom?: string;
			left?: string;
		};
		scale?: number;
	} = {},
): Promise<Uint8Array> {
	console.log("Starting PDF generation with puppeteer");
	console.log("Options:", JSON.stringify(options, null, 2));

	let browser = null;

	try {
		console.log("Launching browser...");
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--font-render-hinting=none",
			],
			executablePath:
				"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		});
		console.log("Browser launched successfully");

		const page = await browser.newPage();
		console.log("New page created");

		// Set the viewport to match the paper size exactly (8.5x11 inches at 96 DPI)
		await page.setViewport({
			width: 816, // 8.5 inches × 96 DPI
			height: 1056, // 11 inches × 96 DPI
			deviceScaleFactor: 1,
		});
		console.log("Viewport set to Letter size (8.5x11 inches)");

		// Set longer timeouts for content loading
		await page.setDefaultNavigationTimeout(60000);
		await page.setDefaultTimeout(60000);

		// Load the HTML content
		console.log(`Loading HTML content (${htmlContent.length} bytes)...`);
		await page.setContent(htmlContent, {
			waitUntil: "networkidle0",
			timeout: 30000,
		});
		console.log("HTML content loaded");

		// Run script to ensure all margins and padding are properly set to zero
		console.log("Running script to reset margins and padding...");
		await page.evaluate(() => {
			// Add critical print styles to override browser defaults
			const style = document.createElement("style");
			style.textContent = `
        @page {
          size: 8.5in 11in;
          margin: 0mm !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          width: 8.5in !important;
          height: 11in !important;
        }
      `;
			document.head.appendChild(style);

			// Force reset any margins that might be causing issues
			document.documentElement.style.margin = "0";
			document.documentElement.style.padding = "0";
			document.body.style.margin = "0";
			document.body.style.padding = "0";

			// Log any elements with margins/padding that might cause issues
			const elementsWithMargins = document.querySelectorAll(
				'[style*="margin"]:not(html):not(body)',
			);
			console.log(
				`Found ${elementsWithMargins.length} elements with explicit margins`,
			);

			const elementsWithPadding = document.querySelectorAll(
				'[style*="padding"]:not(html):not(body)',
			);
			console.log(
				`Found ${elementsWithPadding.length} elements with explicit padding`,
			);
		});
		console.log("Margin reset script executed");

		// Generate PDF with specific settings to prevent margin issues
		console.log("Generating PDF...");
		const pdfBuffer = await page.pdf({
			format: options.format || "Letter",
			landscape: options.landscape || false,
			printBackground: options.printBackground !== false,
			margin: {
				top: "0",
				right: "0",
				bottom: "0",
				left: "0",
				...(options.margin || {}),
			},
			preferCSSPageSize: true,
		});
		console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);

		return pdfBuffer;
	} catch (error) {
		console.error("ERROR in PDF generation:", error);
		throw new Error(
			`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	} finally {
		if (browser) {
			try {
				console.log("Closing browser...");
				await browser.close();
				console.log("Browser closed");
			} catch (closeError) {
				console.error("Error closing browser:", closeError);
			}
		}
	}
}
