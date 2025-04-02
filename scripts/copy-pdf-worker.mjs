import { promises as fs, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source worker from node_modules (using the correct path)
const sourceWorker = path.join(
	__dirname,
	"../node_modules/.pnpm/pdfjs-dist@5.1.91/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
);

// Destination in public directory
const publicDir = path.join(__dirname, "../public/_next/static/pdfjs");
const destWorker = path.join(publicDir, "pdf.worker.min.js");

// Create directory if it doesn't exist
if (!existsSync(publicDir)) {
	mkdirSync(publicDir, { recursive: true });
}

// Copy the worker file
try {
	await fs.copyFile(sourceWorker, destWorker);
	console.log("PDF.js worker file copied successfully");
} catch (err) {
	console.error("Error copying PDF.js worker file:", err);
}
