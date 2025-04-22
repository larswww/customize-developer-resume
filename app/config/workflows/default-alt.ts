import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "job-description-analysis",
    name: "Job Description Analysis",
    description: "Extract key information from the job description",
    systemPrompt: `You are a seasoned career advisor and resume expert. Analyze the users request and attached job description, and provide a complete step-by-step guide for customizing a resume for this job. Your guide will be used by an AI to customize a resume, so it should be in a way that is easy for an AI to understand. Direct to Ai to use the same language as the job description requests, or if not specified use the same language as the job description.

	Guiding questions:
  - In which language should the resume be written?
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
      model: "gpt-4.1-mini-2025-04-14",
      provider: "openai"
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
      model: "gpt-4.1-mini-2025-04-14",
      provider: "openai"
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

  Your content should be structured as follows:
  
  
	
  YOU ALWAYS FOLLOW THESE WRITING GUIDELINES:
  - Short, simple sentences: each sentence contains no more than 20 words and avoids chaining multiple clauses with "and", "or", "which", etc.
  - Plain English, not Pure Consultant. The best English is simple English. Avoid meaningless 'consultant-speak' words, such as 'key', 'focus' and 'spearheaded'. 
  - The Pyramid Principle; Every communication should have the arresting introduction (situation, complication, resolution), the governing though, the parallel logical structure built around a few important messages, and an ending that links back to the beginning. 
  - One page, one paragraph, one phrase. All important ideas can be summarised on on page. Good ideas can be summarized in one paragraph. Great ideas are captured in a simple phrase.  Make sure your idea are captured in simple, memorable phrases. 
  - Where desired technologies are mentioned, make sure to include them in the work experience.
  - Write all prose consistently in the language identified in the job description or the job‑description‑analysis; if none is specified, default to the language of the job description. Translate skill names only if a well‑known local equivalent exists.
  - Actively convert abstract noun phrases (e.g., "implementation of automation") and buzzwords into direct verb‑led sentences (e.g., "automated the process").
  - Center real‑world actors. Choose tangible subjects (people, teams, products) as sentence subjects.
  - Lead with the action. Place a direct, vivid verb early in every sentence to show what the subject does.
  - Use the verb form, not the noun form. Prefer "plan to discuss" over "planning a discussion", "client morale improved" over "improvement in client morale".
  - Prefer precise, specific verbs instead of flat helpers such as "deliver", "enable", or "conduct". For example, replace "conducted an analysis" with "analyzed the data".
  - Match grammar to meaning and keep sentences lean; trim filler so the subject‑verb‑object structure stays visible and energetic.

	Include original time periods and ensure anything in the resume stays true to the provided work experience. `,
    provider: "openai",
	options: {
      model: "gpt-4.1-mini-2025-04-14",
      provider: "openai"
    },
	prompt: `
  The resume follows this structure:

  ## Layout
  \`\`\`
  # Name
  Title
  Location • Phone • Email • LinkedIn • Portfolio

  *Summary statement*

  ## Experience
  ### Job Title at Employer
  Dates | Location
  
  #### Client
  - Skills: Skill1, Skill2, Skill3
  - Project description point 1
  - Project description point 2
  
  #### Client 2
  - Skills: Skill1, Skill2, Skill3
  - Project description point 1
  - Project description point 2

  ### Previous Job Title at Previous Employer
  Dates | Location
  
  #### Client
  - Skills: Skill1, Skill2, Skill3
  - Project description point 1
  - Project description point 2

  ## Education
  ### Degree
  Institution | Dates | Location
  \`\`\`

Customizations instructions:
"""{job-description-analysis}"""

Ideal skills:
"""{extract-skills}"""

Work experience:
"""{workHistory}"""`,
	useInResume: true,
	dependencies: ["job-description-analysis"]
  },
];
