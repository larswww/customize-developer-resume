import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "job-description-analysis",
    name: "Job Description Analysis",
    description: "Extract key information from the job description",
    systemPrompt: `You are a seasoned career advisor and resume expert. Analyze the users request and attached job description, and provide a complete step-by-step guide for customizing a resume for this job. Your guide will be used by an AI to customize a resume, so it should be in a way that is easy for an AI to understand. Direct to Ai to use the same language as the job description requests, or if not specified use the same language as the job description.

	Guiding questions:
	- which specific skills and achievements should be highlighted?
	- What technical skills, frameworks and tools are mentioned?
	- Are specific minimum years of experience mentioned and how should a resume reflect this?
	- What is the order and priority of what responsibilities should be listed?
	- Find unique keywords and jargon and provide guidance on how to highlight them in the resume.
	- How can the resumes tone be adapted based on the type of company and industry?
	- What type of strenghts and achievements would be most relevant for this job?
	- how can the job descriptions language and tone of voice be mirrored?`,
    provider: "openai",
    options: {
      model: "o1",
    },
    prompt: `

  {jobDescription}

	Provide only the guide, no other text or commentary.`,
    dependencies: []
  },
  {
    id: "extract-skills",
    name: "Extract Skills",
    description: "Identify relevant skills from work history",
    systemPrompt:
      "You are expert engineering manager.",
    provider: "openai",
    options: {
      model: "o1",
    },
	prompt: `Consider the provided job description, then analyze your engineers most relevant skills.

	Provide a list of each skill, grouped by category.
	Where there is no exact match, use a relevant skill. Only provide the list of skills, no other text or commentary. 

  Finally, divide the list into two parts:
  - top preferred skills based on the job description
  - other relevant skills

Instructions:
"""{jobDescription}"""

Work experience:
"""{workHistory}"""`,
	useInResume: true,
	dependencies: []
  },
  {
    id: "craft-work-experience",
    name: "Craft Work Experience",
    description: "Create a tailored work experience",
    systemPrompt:
      `You are expert career advisor. You Rewrite the candidates work experience based on the instructions, carefully considering language and selecting the most relevant experience. Reduce the full work experience to approximately one page by focusing on the most relevant experience and track record. Prefer more recent experience.

  Your content will be used for the following template:
  {templateDescription}
	
  YOU ALWAYS FOLLOW THESE WRITING GUIDELINES:
  - Short, simple sentences. They should have subjects, verbs and objects, preferably in that order. If you start with a verb, make it a verb that describes an action.
  - Plain English, not Pure Consultant. The best English is simple English. Avoid meaningless ‘consultant-speak’ words, such as ‘key’, ‘focus’ and 'spearheaded'. 
  - The Pyramid Principle; Every communication should have the arresting introduction (situation, complication, resolution), the governing though, the parallel logical structure built around a few important messages, and an ending that links back to the beginning. 
  - One page, one paragraph, one phrase. All important ideas can be summarised on on page. Good ideas can be summarized in one paragraph. Great ideas are captured in a simple phrase.  Make sure your idea are captured in simple, memorable phrases. 
  - Where desired technologies are mentioned, make sure to include them in the work experience.

	Include original time periods and ensure anything in the resume stays true to the provided work experience. `,
    provider: "openai",
	options: {
      model: "o1",
    },
	prompt: `
	

Customizations instructions:
"""{job-description-analysis}"""

Work experience:
"""{workHistory}"""`,
	useInResume: true,
	dependencies: ["job-description-analysis"]
  },
];
