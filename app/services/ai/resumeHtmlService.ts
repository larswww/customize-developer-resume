import { AnthropicClient } from "./anthropic";

/**
 * Generates a printable HTML resume with Tailwind CSS styling
 */
export async function generatePrintableHtml(
	resumeContent: string,
	jobDescription?: string,
): Promise<string> {
	try {
		// Use Anthropic for HTML generation
		const anthropicClient = new AnthropicClient(
			process.env.ANTHROPIC_API_KEY || "",
		);

		// Create a professional resume prompt
		const prompt = `
      You are an expert resume designer with deep knowledge of HTML and Tailwind CSS. 
      
      Convert the following resume content into beautiful, print-ready HTML using Tailwind CSS classes.
      
      Guidelines:
      1. Use only Tailwind CSS classes for all styling (no custom CSS)
      2. Create a professional, elegant design that makes good use of typography and spacing
      3. Make it print-friendly with appropriate page breaks
      4. Include all the content from the resume
      5. Use appropriate semantic HTML elements
      6. The design should be optimized for printing to PDF
      7. The resume MUST fit on a single 8.5"x11" letter page when printed (this is CRITICAL)
      8. Use concise spacing: compact margins, tight line-height, and efficient use of space
      9. Font sizes should be readable but not wasteful of space (10-12pt for body text)

      Return ONLY the complete HTML (including the DOCTYPE, html, head, and body tags). 
      Include the Tailwind CSS CDN in the head section.
      Add print-specific styles in a style tag to ensure the resume prints well.
      
      Resume Content:
      ${resumeContent}
      
      ${jobDescription ? `Job Description (to match resume with): ${jobDescription}` : ""}
    `;

		const response = await anthropicClient.generate(prompt, {
			model: "claude-3.7-sonnet",
			temperature: 0.2,
			maxTokens: 4000,
			systemPrompt:
				"You are a resume design expert who outputs clean, print-friendly HTML with Tailwind CSS styling. Your resume designs MUST fit on a single page.",
		});

		// Extract just the HTML from the response
		const htmlContent = response.text.trim();

		return htmlContent;
	} catch (error) {
		console.error("Error generating printable HTML:", error);

		// Return a simple fallback HTML if generation fails
		return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Printable Resume</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body class="font-sans p-8 max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Resume</h1>
        <div class="whitespace-pre-line">${resumeContent}</div>
      </body>
      </html>
    `;
	}
}
