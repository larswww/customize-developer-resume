import type { WorkflowStep } from "../services/ai/types";
import {
	createJsonTransform,
	createMarkdownTransform,
	textTransform,
} from "../utils/workflowUtils";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "job-description-analysis",
		provider: "openai",
		options: {
			systemPrompt: "You are a seasoned career advisor and resume expert.",
			model: "o3-mini"
		},
		prompt: (context) => `Analyze the following ${context.jobDescription} and provide an executive summary on what could be important when customizing a resume for this job.`,
		transform: textTransform,
	},
	{
		id: "extract-experience",
		provider: "openai",
		options: {
			systemPrompt: "You are expert career advisor.",
			model: "o3-mini"
		},
		prompt: (context) => `Extract all information in my complete work experience that is relevant based on the needs described below.

Return the extracted content without changes or any other additions.

Description:

"""${context.relevant}"""


Complete work experience: 
"""${context.workHistory}"""`,
		transform: textTransform,
	},
	{
		id: "craft-resume",
		provider: "openai",
		options: {
			systemPrompt: "You are an expert career advisor.",
			model: "o1"
		},
		prompt: (context) => `Create a custom developer resume for the job description using the provided work experience. 

Focus on specific outcomes, the most relevant experience and track record. Wording should be concise and without buzz-words.

Include original time periods and ensure anything in the resume stays true to the provided work experience. Only provide core resume content, contact details and other sections can be omitted.

Job description:
"""${context.jobDescription}"""

Work experience:
"""${context.experience}"""`,
		transform: textTransform,
	},
	{
		id: "background-info",
		provider: "openai",
		options: {
			systemPrompt: "You are an expert at crafting concise, compelling personal backgrounds for job applications.",
			model: "o1"
		},
		prompt: (context) => `Write a short personal background to send along with application for the job described. Use the information in the full work experience provided. Follow these writing instructions;
- Short, simple sentences.
- Plain words, no buzzwords.
- Logic first, pack last.
- Ideal length is one paragraph.
- Use the same language as the job description.

Job:
${context.jobDescription}

Personal background:
${context.experience}`,
		transform: textTransform,
	},
	{
		id: "5-qualities-and-5-expertise",
		provider: "openai",
		options: {
			systemPrompt: "You are an expert at identifying personal qualities and areas of expertise from work experience that match job requirements.",
			model: "o1-mini"
		},
		prompt: (context) => `Provide 5 personal qualities and 5 areas of expertise for the job description, backed by experience.

Provide the list of qualities and expertise only, no other text.

Job description: 
"""${context.jobDescription}"""

Experience:
"""${context.workExperience}"""`,
		transform: textTransform,
	},
	{
		id: "write-cover-letter",
		provider: "openai",
		options: {
			systemPrompt: "You are a senior full stack software engineer applying for freelance contracts.",
			model: "o1"
		},
		prompt: (context) => `Write a short cover-letter for this job/resume. Follow these writing instructions;
- Short, simple sentences.
- Plain words, no buzzwords.
- Logic first, pack last.
- Ideal length is one paragraph.
- Use the same language as the job description.

Job description: 
"""${context.jobDescription}"""

Resume:
"""${context.resume}"""`,
		transform: textTransform,
	},
];
