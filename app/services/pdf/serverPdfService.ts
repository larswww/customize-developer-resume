import puppeteer from "puppeteer";
import type { PaperFormat } from "puppeteer";
import { serverLogger } from "~/utils/logger.server";

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
	serverLogger.log("Starting PDF generation with puppeteer");
	serverLogger.log("Options:", JSON.stringify(options, null, 2));

	let browser = null;

	try {
		serverLogger.log("Launching browser...");
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--font-render-hinting=none",
				"--disable-web-security",
			],
		});
		serverLogger.log("Browser launched successfully");

		const page = await browser.newPage();

		await page.setDefaultNavigationTimeout(60000);
		await page.setDefaultTimeout(60000);

		serverLogger.log(`Loading HTML content (${htmlContent.length} bytes)...`);
		await page.setContent(htmlContent, {
			waitUntil: ["load", "networkidle0"],
			timeout: 30000,
		});
		await page.evaluate(
			() => new Promise((resolve) => setTimeout(resolve, 500)),
		);
		serverLogger.log("HTML content loaded");

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
		serverLogger.log(`PDF generated successfully: ${pdfBuffer.length} bytes`);

		return pdfBuffer;
	} catch (error) {
		serverLogger.error("ERROR in PDF generation:", error);
		throw new Error(
			`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	} finally {
		if (browser) {
			try {
				serverLogger.log("Closing browser...");
				await browser.close();
				serverLogger.log("Browser closed");
			} catch (closeError) {
				serverLogger.error("Error closing browser:", closeError);
			}
		}
	}
}
