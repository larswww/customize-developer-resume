/**
 * Simple HTML generation service for resumes
 * This converts plain text resume content into a styled HTML document
 */

// Function to convert plain text resume into HTML with Tailwind styling
export async function generatePrintableHtml(
	resumeContent: string,
	_jobDescription?: string,
): Promise<string> {
	// Split the content by newlines and process sections
	const _lines = resumeContent.split("\n").filter((line) => line.trim() !== "");
	const _currentSection = "";
	const _htmlContent = "";

	// Basic styling
	const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          color: #333;
          line-height: 1.5;
          padding: 0;
          margin: 0;
        }
        .resume-container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        h1 {
          color: #1a365d;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          border-bottom: 2px solid #2b6cb0;
          padding-bottom: 0.25rem;
        }
        h2 {
          color: #2b6cb0;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .company {
          font-weight: 600;
          margin-top: 1rem;
        }
        ul {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        li {
          margin-bottom: 0.25rem;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <div class="content">
          ${formatResumeContent(resumeContent)}
        </div>
      </div>
    </body>
    </html>
  `;

	return html;
}

// Helper function to format resume content into HTML sections
function formatResumeContent(content: string): string {
	// Split content into sections
	const lines = content.split("\n");
	let htmlContent = "";
	let currentSection = "";
	let isInList = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip empty lines
		if (line === "") continue;

		// Check if this is a section header (all caps or ends with colon)
		if (
			(line === line.toUpperCase() && line.length > 3) ||
			/^[A-Z][\w\s]+:$/.test(line)
		) {
			// Close any previous section
			if (currentSection !== "") {
				if (isInList) {
					htmlContent += "</ul>";
					isInList = false;
				}
			}

			// Start new section
			currentSection = line.replace(":", "");
			htmlContent += `<h1>${currentSection}</h1>`;
		}
		// Check if this is a job/company header (contains parentheses or has a dash)
		else if (line.includes("(") || line.includes("–")) {
			if (isInList) {
				htmlContent += "</ul>";
				isInList = false;
			}
			htmlContent += `<div class="company">${line}</div>`;
		}
		// Check if this is a list item (starts with • or -)
		else if (line.startsWith("•") || line.startsWith("-")) {
			if (!isInList) {
				htmlContent += "<ul>";
				isInList = true;
			}
			htmlContent += `<li>${line.substring(1).trim()}</li>`;
		}
		// Regular paragraph
		else {
			if (isInList) {
				htmlContent += "</ul>";
				isInList = false;
			}
			htmlContent += `<p>${line}</p>`;
		}
	}

	// Close any open list
	if (isInList) {
		htmlContent += "</ul>";
	}

	return htmlContent;
}
