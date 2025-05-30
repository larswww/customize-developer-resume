import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "job-description-analysis",
		name: "Job Description Analysis",
		description: "Extract structured data from the job description.",
		provider: "openai",
		options: {
			model: "gpt-4.1-mini-2025-04-14",
			provider: "openai",
			response_format: { type: "json_object" },
		},
		systemPrompt:
			"You are an expert recruitment analyst specializing in breaking down job descriptions into structured, actionable data. Extract required and preferred skills, qualifications, responsibilities, and attributes from provided job descriptions in a concise, structured JSON format.",
		prompt: `Analyze and structure the following job description into clearly-defined sections:

Job Description:
{jobDescription}

Output the results as a structured JSON object.`,
		dependencies: [],
	},

	{
		id: "work-history-parsing",
		name: "Work History & Achievements Parsing",
		description: "Parse and structure the candidate's work history.",
		provider: "openai",
		options: {
			model: "gpt-4.1-mini-2025-04-14",
			provider: "openai",
		},
		systemPrompt:
			"You are an expert in parsing professional career histories. Transform the provided candidate profile document into a structured JSON format with each role clearly listed, including job title, dates, company, responsibilities, achievements (quantified if available), and extracted skills.",
		prompt: `Parse and structure the following professional history and achievements into clearly defined JSON sections.
    
Candidate Profile:
{workHistory}

Output the results as a structured JSON object. Strictly adhere to JSON format.`,
		dependencies: [],
	},
	{
		id: "relevance-matching",
		name: "Relevance Matching & Prioritization",
		description: "Rank experiences and skills by relevance to the job.",
		provider: "openai",
		options: {
			model: "gpt-4.1-mini-2025-04-14",
			provider: "openai",
			response_format: { type: "json_object" },
		},
		systemPrompt:
			"You are an expert career coach specializing in aligning candidate experiences with specific job descriptions. Rank the candidate's structured experiences and achievements by relevance to the provided structured job description. Provide a relevance score from 1 (low) to 10 (high) for each experience and skill. Carefully consider the technical skills that are most relevant for the job and highlight them. Prioritize more recent experiences and achievements. ",
		prompt: `Given the following structured job description and structured candidate profile, identify, score, and rank experiences and skills based on their relevance to the job:

Structured Job Description:
{job-description-analysis}

Structured Candidate Profile:
{work-history-parsing}

Output the results as a structured JSON object including ranks/scores.`,
		dependencies: ["job-description-analysis", "work-history-parsing"],
	},

	{
		id: "initial-resume-draft",
		name: "Initial Resume Draft Generation",
		description: "Generate an initial resume draft in Markdown.",
		provider: "openai",
		options: {
			model: "gpt-4.1-mini-2025-04-14",
			provider: "openai",
		},
		systemPrompt:
			"You are an expert resume writer who crafts compelling, targeted, professional resumes. Using structured, ranked experiences and achievements, create an initial draft of a resume tailored explicitly to the provided job description. Format the output in clean, professional Markdown adhering to the template description. Pay especially close attention to the users customization instructions. Return only the Markdown resume content, no other text.",
		prompt: `Draft a one-page resume targeted explicitly toward the following structured job description.

Customization instructions:
{relevant}

Resume template:
{templateDescription}    

Structured Job Description:
{job-description-analysis}

Structured Candidate Profile:
{work-history-parsing}

Output only the Markdown resume content.`,
		dependencies: ["job-description-analysis", "work-history-parsing"],
	},
	{
		id: "resume-optimization",
		name: "Optimization for Conciseness & Impact",
		useInResume: true,
		description: "Optimize the resume draft for one page and impact.",
		provider: "openai",
		options: {
			model: "gpt-4.1-mini-2025-04-14",
			provider: "openai",
		},
		systemPrompt:
			"You are a professional resume editor who optimizes content for clarity, conciseness, and maximum impact. Ensure the resume fits neatly onto one page, eliminate redundancy, choose impactful action verbs, quantify achievements where possible, and maintain readability. Format clearly in Markdown. Use the template description to guide the optimization. Carefully consider the prioritized candidate experiences and achievements. Return only the Markdown resume content, no other text.",
		prompt: `Optimize the following resume draft for conciseness, clarity, and impact. Ensure it fits neatly onto one page, retains the most relevant and impactful content for the job, and is formatted clearly in Markdown:

Resume template:
{templateDescription}    

Resume Draft:
{initial-resume-draft}

Prioritized Candidate Experiences:
{relevance-matching}

Output only the optimized Markdown resume content.`,
		dependencies: ["initial-resume-draft", "relevance-matching"],
	},
];
