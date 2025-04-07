import type { WorkflowStep } from "../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "job-description-analysis",
    name: "Job Description Analysis",
    description: "Extract key information from the job description",
    systemPrompt: "You are a seasoned career advisor and resume expert.",
    provider: "openai",
    options: {
      model: "o1",
    },
    prompt: `Analyze the following {jobDescription} and provide a complete step-by-step guide for customizing a resume for this job. Your guide will be used by an AI to customize a resume, so it should be in a way that is easy for an AI to understand. Direct to Ai to use the same language as the job description requests, or if not specified use the same language as the job description.

	Guiding questions:
	- which specific skills and achievements should be highlighted?
	- What technical skills, frameworks and tools are mentioned?
	- Are specific minimum years of experience mentioned and how should a resume reflect this?
	- What is the order and priority of what responsibilities should be listed?
	- Find unique keywords and jargon and provide guidance on how to highlight them in the resume.
	- How can the resumes tone be adapted based on the type of company and industry?
	- What type of strenghts and achievements would be most relevant for this job?
	- how can the job descriptions language and tone of voice be mirrored?

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
      "You are expert career advisor.",
    provider: "openai",
	options: {
      model: "o1",
    },
	prompt: `
	Rewrite the candidates work experience based on the instructions, carefully considering language and selecting the most relevant experience. Reduce the full work experience to approximately one page by focusing on the most relevant experience and track record. Prefer more recent experience.
	
	Wording should be concise and without buzz-words.
	Where desired technologies are mentioned, make sure to include them in the work experience.
	Include original time periods and ensure anything in the resume stays true to the provided work experience. 

Customizations instructions:
"""{job-description-analysis}"""

Work experience:
"""{workHistory}"""`,
	useInResume: true,
	dependencies: ["job-description-analysis"]
  },
  {
    id: "generate-motivation",
    name: "Generate Motivation",
    description: "Craft a short, compelling motivation paragraph.",
    systemPrompt:
      "You are a skilled writer specializing in crafting authentic and personalized career narratives.",
    provider: "openai",
    options: {
      model: "o1",
    },
    prompt: `Based on the job description and the candidate's work history, write a short (2-3 sentences) motivation statement. Focus on genuinely connecting the candidate's core experiences and aspirations with the key requirements and opportunities of the role. Avoid clichés and generic statements. The tone should be professional yet personal and authentic.

Use the same language as the job description. If the job description explicitly specifies a language, use that language.

Job Description:
"""{jobDescription}"""

Work History:
"""{workHistory}"""

Provide only the motivation statement, no other text or commentary.`,
	dependencies: []
  },
  {
    id: "generate-personal-background",
    name: "Generate Personal Background",
    description: "Create a brief personal background section.",
    systemPrompt:
      "You are a skilled writer specializing in crafting authentic and personalized career narratives.",
    provider: "openai",
    options: {
      model: "o1",
    },
    prompt: `Using the provided job description and work history, draft a brief (1-2 sentences) personal background summary for the candidate's resume. Highlight 1-2 key personal attributes or experiences that align with the company culture or job requirements, inferred from the provided texts. Ensure the tone sounds natural and human, not AI-generated.

Use the same language as the job description. If the job description explicitly specifies a language, use that language.

Job Description:
"""{jobDescription}"""

Work History:
"""{workHistory}"""

Provide only the personal background summary, no other text or commentary.`,
	dependencies: []
  }
];
