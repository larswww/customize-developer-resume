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
				"--disable-web-security",
			],
			executablePath:
				"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		});
		console.log("Browser launched successfully");

		const page = await browser.newPage();
		console.log("New page created");

		// Set exact viewport size for Letter paper
		// await page.setViewport({
		// 	width: 816, // 8.5 inches × 96 DPI
		// 	height: 1056, // 11 inches × 96 DPI
		// 	deviceScaleFactor: 1,
		// 	hasTouch: false,
		// 	isLandscape: false,
		// 	isMobile: false,
		// });
		console.log("Viewport set to exact Letter size");

		// Set longer timeouts for content loading
		await page.setDefaultNavigationTimeout(60000);
		await page.setDefaultTimeout(60000);

		// Load the HTML content
		console.log(`Loading HTML content (${htmlContent.length} bytes)...`);
		
		// Ensure Tailwind styles are properly loaded by adding custom loadEvent
		await page.setContent(htmlContent, {
			waitUntil: ["load", "networkidle0"],
			timeout: 30000,
		});
		
		// Wait for Tailwind to fully process styles
		await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
		
		console.log("HTML content loaded");

		// // Inject CSS to eliminate ALL margins and hide ALL scrollbars
		// console.log("Applying zero-margin and no-scrollbar styles...");
		// await page.addStyleTag({
		// 	content: `
		// 		@page {
		// 			size: 8.5in 11in;
		// 			margin: 0 !important;
		// 			padding: 0 !important;
		// 		}
				
		// 		html, body {
		// 			margin: 0 !important;
		// 			padding: 0 !important;
		// 			width: 8.5in !important;
		// 			height: 11in !important;
		// 			overflow: hidden !important; /* Hide scrollbars */
		// 		}
				
		// 		/* Hide scrollbars across all browsers */
		// 		html::-webkit-scrollbar, body::-webkit-scrollbar {
		// 			display: none !important;
		// 			width: 0 !important;
		// 			height: 0 !important;
		// 		}
				
		// 		/* Firefox */
		// 		html, body {
		// 			scrollbar-width: none !important;
		// 			-ms-overflow-style: none !important;
		// 		}
				
		// 		/* Ensure all elements use border-box */
		// 		* {
		// 			box-sizing: border-box !important;
		// 		}
				
		// 		/* Prevent scrollbars on all elements */
		// 		*::-webkit-scrollbar {
		// 			display: none !important;
		// 			width: 0 !important;
		// 			height: 0 !important;
		// 		}
				
		// 		/* Prevent margin creep everywhere */
		// 		* {
		// 			margin: 0 !important;
		// 			margin-left: 0 !important;
		// 			margin-right: 0 !important;
		// 			margin-top: 0 !important;
		// 			margin-bottom: 0 !important;
		// 		}
		// 	`
		// });

		// // Run script to ensure all scrollbars are disabled
		// console.log("Running script to disable scrollbars and reset margins...");
		// await page.evaluate(() => {
		// 	// Force reset margins and disable scrollbars
		// 	document.documentElement.style.margin = "0";
		// 	document.documentElement.style.padding = "0";
		// 	document.documentElement.style.overflow = "hidden";
		// 	document.documentElement.style.width = "8.5in";
		// 	document.documentElement.style.height = "11in";
			
		// 	// Apply to body as well
		// 	document.body.style.margin = "0";
		// 	document.body.style.padding = "0";
		// 	document.body.style.overflow = "hidden";
		// 	document.body.style.width = "8.5in";
		// 	document.body.style.height = "11in";
			
		// 	// Disable all scrollbars in the document
		// 	const allElements = document.querySelectorAll('*');
		// 	for (const el of allElements) {
		// 		// Cast to HTMLElement to access style
		// 		const htmlEl = el as HTMLElement;
		// 		if (htmlEl && htmlEl.style) {
		// 			htmlEl.style.overflow = "visible"; // Prevent internal scrollbars
		// 		}
		// 	}
			
		// 	// Log elements with margins for debugging
		// 	const elementsWithMargins = document.querySelectorAll(
		// 		'[style*="margin"]:not(html):not(body)',
		// 	);
		// 	console.log(
		// 		`Found ${elementsWithMargins.length} elements with explicit margins`,
		// 	);
		// });
		// console.log("Scrollbar removal and margin reset completed");

		// // Generate PDF with zero margins
		// console.log("Generating PDF...");
		const pdfBuffer = await page.pdf({
			format: options.format || "a4",
			landscape: options.landscape || false,
			printBackground: options.printBackground !== false,
			margin: {
				top: "0",
				right: "0",
				bottom: "0",
				left: "0",
			},
			scale: 1, // Exact 1:1 scale
			preferCSSPageSize: true,
			// Disable headers and footers
			displayHeaderFooter: false,
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
