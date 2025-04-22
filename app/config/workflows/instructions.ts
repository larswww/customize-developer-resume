import { zodToJsonSchema } from "zod-to-json-schema"; // Helper to convert Zod schema to JSON schema
import type { WorkflowStep } from "../../services/ai/types";
import { SimpleConsultantCoreDataSchema } from "../schemas/simple"; // Import the schema

// Convert the Zod schema to a JSON schema string for use in prompts
const targetJsonSchema = JSON.stringify(
	zodToJsonSchema(SimpleConsultantCoreDataSchema),
	null,
	2,
);

export const workflowSteps: WorkflowStep[] = [
	{
		id: "job-description-analysis",
		name: "Job Description Analysis",
		description: "Extract structured data from the job description into JSON.",
		provider: "anthropic", // Top-level provider
		options: {
			provider: "anthropic", // Required inside options by type
			model: "claude-3-5-sonnet-latest", // Updated model
			// response_format: { type: "json_object" }, // Optional: Ensure model supports JSON mode if available, otherwise rely on prompt engineering
		},
		systemPrompt: `You strictly extract user requirements for the target role into a structured JSON object based on the provided job description. Do not add assumptions. Include only explicitly stated information. If stated, include fields like:
      - desiredLanguage: string
      - technicalSkills: string[]
      - experienceTypes: string[]
      - collaborationStyle: string
      - keyResponsibilities: string[]
      - companyValues: string[] // if mentioned
      - requiredEducation: string // if mentioned
      - reportingStructure: string // if mentioned

      Adapt the fields based *only* on what is present in the description. Output *only* the JSON object.`,
		prompt: `Analyze the job description and extract requirements into JSON:

Job Description:
{jobDescription}

Output strictly the JSON object and nothing else.`,
		dependencies: [],
	},
	{
		id: "work-history-parsing", // Reinstated and updated
		name: "Parse Master Resume",
		description: "Parse the provided master resume text into structured JSON.",
		provider: "anthropic", // Top-level provider
		options: {
			provider: "anthropic", // Required inside options by type
			model: "claude-3-5-sonnet-latest", // Updated model
			// response_format: { type: "json_object" }, // Optional: Ensure model supports JSON mode
		},
		systemPrompt: `Precisely parse the candidate's master resume or work history text into a structured JSON format. Capture details like roles, titles, dates, companies, locations, responsibilities, projects, and quantifiable achievements exactly as provided. Define a consistent structure, perhaps an array of employment objects, each potentially containing project details. Do not invent details. Output *only* the JSON object. Example structure for an employment entry:
      {
        "employer": "Company Name",
        "title": "Job Title",
        "location": "City, State",
        "dates": "Month Year - Month Year",
        "responsibilities": ["Responsibility 1...", "Responsibility 2..."],
        "achievements": ["Achievement 1...", "Achievement 2..."],
        "projects": [ // Optional, if applicable
          {
            "name": "Project Name",
            "description": ["Project detail 1...", "Project detail 2..."],
            "skillsUsed": ["Skill 1", "Skill 2"]
          }
        ]
      }`,
		prompt: `Parse this master resume / work history strictly into JSON:

Master Resume / Work History:
{workHistory}

Output strictly the JSON object and nothing else.`,
		dependencies: [],
	},
	{
		id: "relevance-matching",
		name: "Relevance Matching & Prioritization",
		description:
			"Score and rank parsed work history items based on relevance to the job description.",
		provider: "anthropic", // Top-level provider
		options: {
			provider: "anthropic", // Required inside options by type
			model: "claude-3-opus-latest", // Updated model for stronger reasoning
			// response_format: { type: "json_object" }, // Optional: Ensure model supports JSON mode
		},
		systemPrompt:
			"Analyze the parsed work history items against the structured job description requirements. Assign a relevance score (1-10, 10 being highest) to each major work history entry (e.g., each past job or significant project) based *only* on how well it aligns with the explicit requirements in the job description JSON. Output the original parsed work history JSON, with each major entry augmented with a 'relevanceScore' field. Do not invent details or modify the original parsed content other than adding the score. Output *only* the augmented JSON object.",
		prompt: `Score and rank the parsed work history based on the job description requirements:

Job Description Requirements (JSON):
{job-description-analysis}

Parsed Work History (JSON):
{work-history-parsing}

Output strictly the augmented JSON object with relevance scores and nothing else.`,
		// Ensure dependencies provide JSON
		dependencies: ["job-description-analysis", "work-history-parsing"],
	},
	{
		id: "resume-content-generation", // New consolidated step
		name: "Generate Core Resume Content",
		description:
			"Generate tailored resume summary and employment sections based on top-ranked experiences.",
		provider: "anthropic", // Top-level provider
		options: {
			provider: "anthropic", // Required inside options by type
			model: "claude-3-opus-latest", // Updated model for strong generation
		},
		systemPrompt: `Generate core content for a targeted resume using the provided inputs. Focus on the highest-scoring experiences (relevance score >= 7 or top 3-5 experiences). Create:
      1. A concise 'summary' (2-4 sentences) highlighting the candidate's suitability based on the job description and top experiences.
      2. An 'employmentHistory' section conforming to the employment structure expected by the target schema (employer, title, location, dates, projects array with client, dates, description, skillsUsed). Select and rewrite descriptions/achievements from the highest-ranked experiences to be impactful and directly address the job requirements. Use bullet points for project descriptions.

      Refer to the target JSON schema structure for 'employmentHistory' provided in the prompt. Output the generated content as a JSON object containing only the 'summary' and 'employmentHistory' keys.

      Target Schema for 'employmentHistory' entries (and nested 'projects'):
      ${JSON.stringify(
				{
					employer: "string",
					title: "string",
					location: "string",
					dates: "string",
					projects: [
						{
							client: "string",
							dates: "string",
							description: ["string"],
							skillsUsed: ["string"],
						},
					],
				},
				null,
				2,
			)}
      `,
		prompt: `Generate the resume 'summary' and 'employmentHistory' JSON based on the following:

Job Description Requirements (JSON):
{job-description-analysis}

Ranked Work History (JSON with Scores):
{relevance-matching}

Output strictly a JSON object containing 'summary' and 'employmentHistory' keys, following the specified structure.`,
		dependencies: ["job-description-analysis", "relevance-matching"],
	},
	{
		id: "final-json-formatting", // New final step
		name: "Format Resume to Target Schema",

		useInResume: true, // Assuming this means it's a final output step
		description:
			"Format the generated content into the final JSON structure matching the SimpleConsultantCoreDataSchema.",
		provider: "anthropic", // Top-level provider
		options: {
			provider: "anthropic", // Required inside options by type
			model: "claude-3-5-haiku-latest", // Updated model: Use Haiku for efficient formatting
			// response_format: { type: "json_object" }, // Optional: Crucial for this step
		},
		systemPrompt: `Take the generated resume content (summary and employment history) and format it *strictly* according to the provided target JSON schema. Ensure all required fields from the schema are present. If the input lacks data for a required field, use a sensible placeholder like "N/A" or an empty array/string as appropriate for the schema type. Do not add information not present in the input content unless strictly necessary to conform to the schema structure (like empty arrays). Output *only* the final, valid JSON object conforming to the schema.

Target JSON Schema:
${targetJsonSchema}`,
		prompt: `Format the following resume content strictly according to the target JSON schema:

Generated Resume Content (JSON):
{resume-content-generation}

Output strictly the final JSON object conforming to the schema and nothing else.`,
		dependencies: ["resume-content-generation"], // Depends on the generated content
	},
];
