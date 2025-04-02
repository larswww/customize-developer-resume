import type { WorkflowStep } from "../services/ai/types";
import {
	createJsonTransform,
	createMarkdownTransform,
	textTransform,
} from "../utils/workflowUtils";

export interface WorkflowStep {
	id: string;
	name: string;
	description: string;
	systemPrompt: string;
	userPrompt: string;
}

export const workflowSteps: WorkflowStep[] = [
	{
		id: "job-description-analysis",
		name: "Job Description Analysis",
		description: "Extract key information from the job description",
		systemPrompt: "You are a helpful AI assistant that helps extract key information from job descriptions.",
		userPrompt: "Please analyze the following job description and extract key requirements, skills, and responsibilities:\n\n{{jobDescription}}"
	},
	{
		id: "extract-experience",
		name: "Extract Experience",
		description: "Identify relevant experience from work history",
		systemPrompt: "You are a helpful AI assistant that helps find relevant experience from a work history.",
		userPrompt: "Based on the job description I've analyzed:\n\n{{job-description-analysis}}\n\nPlease identify the most relevant experiences from my work history that I should highlight in my resume:\n\n{{workHistory}}\n\n{{relevant}}"
	},
	{
		id: "craft-resume",
		name: "Craft Resume",
		description: "Create a tailored resume",
		systemPrompt: "You are a helpful AI assistant that helps create professional, tailored resumes.",
		userPrompt: "Based on the job description analysis and relevant experience identified, please craft a professional resume in plain text markdown format, highlighting the experience and skills most relevant to this job opportunity.\n\nJob Description Analysis:\n{{job-description-analysis}}\n\nRelevant Experience:\n{{extract-experience}}"
	},
	{
		id: "background-info",
		name: "Background Info",
		description: "Research background information about the company",
		systemPrompt: "You are a helpful AI assistant that helps research company backgrounds.",
		userPrompt: "Using the job description, please provide some potential background information or context about the company and industry that might be helpful for an interview. If the company isn't specifically mentioned, make an educated guess about the type of company.\n\nJob Description:\n{{jobDescription}}"
	},
	{
		id: "5-qualities-and-5-expertise",
		name: "5 Qualities and 5 Areas of Expertise",
		description: "Identify key qualities and expertise areas",
		systemPrompt: "You are a helpful AI assistant that helps identify key qualities and expertise areas for job applications.",
		userPrompt: "Based on the job description and relevant experience, identify 5 key qualities and 5 areas of expertise that would be most valuable for this position.\n\nJob Description Analysis:\n{{job-description-analysis}}\n\nRelevant Experience:\n{{extract-experience}}"
	},
	{
		id: "write-cover-letter",
		name: "Write Cover Letter",
		description: "Create a tailored cover letter",
		systemPrompt: "You are a helpful AI assistant that helps create professional, tailored cover letters.",
		userPrompt: "Based on all the information gathered, please write a professional cover letter for this job application. Keep it concise, professional, and highlight the key qualities and expertise identified.\n\nJob Description Analysis:\n{{job-description-analysis}}\n\nBackground Information:\n{{background-info}}\n\nQualities and Expertise:\n{{5-qualities-and-5-expertise}}"
	}
];
