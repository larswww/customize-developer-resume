interface ResumeSection {
	title: string;
	content: string;
	level: number;
}

/**
 * Parses markdown resume content into structured sections
 * @param content The markdown resume content
 * @returns Array of resume sections
 */
export function parseResumeContent(content: string): ResumeSection[] {
	const lines = content.split("\n");
	const sections: ResumeSection[] = [];

	let currentSection: ResumeSection | null = null;
	let sectionContent: string[] = [];

	// Process each line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check if line is a header (# Header, ## Subheader, etc)
		const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

		if (headerMatch) {
			// If we were building a section, add it to our sections array
			if (currentSection) {
				currentSection.content = sectionContent.join("\n").trim();
				sections.push(currentSection);
				sectionContent = [];
			}

			// Start a new section
			currentSection = {
				title: headerMatch[2].trim(),
				content: "",
				level: headerMatch[1].length, // Number of # symbols
			};
		} else if (line.trim() !== "") {
			// If not a header and not empty, add to current section content
			sectionContent.push(line);
		} else if (sectionContent.length > 0) {
			// If empty line and we have content, preserve the newline
			sectionContent.push("");
		}
	}

	// Add the last section if there is one
	if (currentSection) {
		currentSection.content = sectionContent.join("\n").trim();
		sections.push(currentSection);
	} else if (sectionContent.length > 0) {
		// If there's content but no headers, create a default section
		sections.push({
			title: "Resume",
			content: sectionContent.join("\n").trim(),
			level: 1,
		});
	}

	return sections;
}

/**
 * Formats resume content for better display
 * @param content The markdown resume content
 * @returns Formatted markdown with enhanced structure
 */
export function formatResumeForPrinting(content: string): string {
	const sections = parseResumeContent(content);

	// Enhance the resume with better formatting
	// For now, we're just adding proper spacing between sections
	let formattedContent = "";

	sections.forEach((section, _index) => {
		// Add heading with proper level
		formattedContent += `${"#".repeat(section.level)} ${section.title}\n\n`;

		// Add section content
		formattedContent += `${section.content}\n\n`;
	});

	return formattedContent.trim();
}

/**
 * Extracts contact information from resume content
 * This is a basic implementation and could be enhanced with regex patterns
 * @param content The markdown resume content
 * @returns Extracted contact info or null if none found
 */
export function extractContactInfo(
	content: string,
): { email?: string; phone?: string; name?: string } | null {
	const contactInfo: { email?: string; phone?: string; name?: string } = {};

	// Extract email using regex
	const emailMatch = content.match(
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
	);
	if (emailMatch) {
		contactInfo.email = emailMatch[0];
	}

	// Extract phone number (basic pattern, can be enhanced)
	const phoneMatch = content.match(
		/(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/,
	);
	if (phoneMatch) {
		contactInfo.phone = phoneMatch[0];
	}

	// Try to find a name (this is a simplistic approach)
	const firstLine = content.split("\n")[0];
	if (firstLine && !firstLine.startsWith("#") && firstLine.trim().length > 0) {
		contactInfo.name = firstLine.trim();
	}

	return Object.keys(contactInfo).length > 0 ? contactInfo : null;
}
