import type { ResumeData, WorkExperience, Education, Skill } from "../../components/ResumeTemplate";

/**
 * Service for generating structured resume data using OpenAI
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Function to generate structured resume data
export async function generateStructuredResumeData(
	resumeText: string,
): Promise<ResumeData> {
	if (!OPENAI_API_KEY) {
		throw new Error(
			"OpenAI API key is missing. Please check your environment configuration.",
		);
	}

	try {
		const prompt = createStructuredDataPrompt(resumeText);

		const response = await fetch(OPENAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4-turbo",
				response_format: { type: "json_object" },
				messages: [
					{
						role: "system",
						content: `You are a resume parser that converts plain text resume content into structured JSON data. 
            Use the provided format and ensure all fields are properly populated with appropriate content.
            Make reasonable inferences when information is implicit. When dates are unclear, use approximate ranges.
            For skills, categorize them into logical groups. If contact information is missing, use placeholder values.`,
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.2,
				max_tokens: 2000,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`OpenAI API error: ${errorData.error?.message || response.statusText}`,
			);
		}

		const data = await response.json();
		const result = JSON.parse(data.choices[0].message.content);

		// Validate and return the structured data
		return validateAndCleanResumeData(result);
	} catch (error) {
		console.error("Error generating structured resume data:", error);
		throw error;
	}
}

// Create a prompt for the structured data
function createStructuredDataPrompt(resumeText: string): string {
	return `
Convert the following resume text into a structured JSON format:

${resumeText}

The JSON should follow this format:
\`\`\`json
{
  "contactInfo": {
    "name": "Full Name",
    "title": "Professional Title",
    "location": "City & Remote Status",
    "phone": "Phone Number",
    "email": "Email Address",
    "github": "GitHub URL or username",
    "linkedin": "LinkedIn URL or username"
  },
  "workExperience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "dates": "Start Date - End Date",
      "description": [
        "Main paragraph about responsibilities and achievements"
      ],
      "highlights": [
        "Bullet point highlight 1",
        "Bullet point highlight 2"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "dates": "Start Year - End Year",
      "location": "City, Country"
    }
  ],
  "skills": [
    {
      "category": "Skill Category",
      "items": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ],
  "otherInfo": {
    "title": "OTHER",
    "items": ["Item 1", "Item 2"]
  },
  "languages": ["🇺🇸", "🇸🇪", "🇳🇱"]
}
\`\`\`

Return ONLY the JSON, with no other text.
`;
}

// Validate and clean up the resume data
function validateAndCleanResumeData(data: Record<string, unknown>): ResumeData {
	// Implement basic validation here
	// This ensures that the data meets the expected format
	
	// Safely access nested properties with type checking
	const contactInfoRaw = data.contactInfo as Record<string, unknown> || {};
	const workExperienceRaw = Array.isArray(data.workExperience) ? data.workExperience : [];
	const educationRaw = Array.isArray(data.education) ? data.education : [];
	const skillsRaw = Array.isArray(data.skills) ? data.skills : [];
	
	// For optional fields that need specific shapes
	const otherInfoRaw = data.otherInfo as { title: string; items: string[] } | undefined;
	const languagesRaw = Array.isArray(data.languages) ? data.languages as string[] : undefined;

	const result: ResumeData = {
		contactInfo: {
			name: typeof contactInfoRaw.name === 'string' ? contactInfoRaw.name : "John Doe",
			title: typeof contactInfoRaw.title === 'string' ? contactInfoRaw.title : "Professional",
			location: typeof contactInfoRaw.location === 'string' ? contactInfoRaw.location : "City & Remote",
			phone: typeof contactInfoRaw.phone === 'string' ? contactInfoRaw.phone : "+1 123 456 7890",
			email: typeof contactInfoRaw.email === 'string' ? contactInfoRaw.email : "email@example.com",
			github: typeof contactInfoRaw.github === 'string' ? contactInfoRaw.github : "github.com/username",
			linkedin: typeof contactInfoRaw.linkedin === 'string' ? contactInfoRaw.linkedin : "linkedin.com/in/username",
		},
		workExperience: workExperienceRaw as WorkExperience[],
		education: educationRaw as Education[],
		skills: skillsRaw as Skill[],
		otherInfo: otherInfoRaw,
		languages: languagesRaw,
	};

	return result;
}
