import type { WorkflowStep } from "../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "job-description-analysis",
    name: "Job Description Analysis",
    description: "Extract key information from the job description",
    systemPrompt: "You are a seasoned career advisor and resume expert.",
    provider: "openai",
    options: {
      model: "o3-mini",
    },
    prompt:
      "Analyze the following {job_description} and provide an executive summary on what could be important when customizing a resume for this job.",
  },
  {
    id: "extract-experience",
    name: "Extract Experience",
    description: "Identify relevant experience from work history",
    systemPrompt:
      "You are expert career advisor.",
    provider: "openai",
    options: {
      model: "o3-mini",
    },
    prompt: `Extract all information in my complete work experience that is relevant based on the needs described below.

Return the extracted content without changes or any other additions.

Description:

"""{relevant}"""

Complete work experience: 
"""{workHistory}"""`,
  },
  {
    id: "craft-resume",
    name: "Craft Resume",
    description: "Create a tailored resume",
    systemPrompt:
      "You are expert career advisor.",
    provider: "openai",
	options: {
      model: "o1",
    },
    prompt: `Create a custom developer resume for the job description using the provided work experience. 

Focus on specific outcomes, the most relevant experience and track record. Wording should be concise and without buzz-words.

Include original time periods and ensure anything in the resume stays true to the provided work experience. Only provide core resume content, contact details and other sections can be omitted.

Job description:
"""{job-description-analysis}"""

Work experience:
"""{extract-experience}"""`,
  },
  {
    id: "5-qualities-and-5-expertise",
    name: "5 Qualities and 5 Areas of Expertise",
    description: "Identify key qualities and expertise areas",
    systemPrompt:
      "You are a helpful AI assistant that helps identify key qualities and expertise areas for job applications.",
    provider: "openai",
    prompt: `Provide all personal qualities and areas of expertise for the job description, backed by experience, and sorted by relevance.

Provide the list of qualities and expertise only, no other text.

Job description: 
"""{job-description-analysis}"""

Experience:
"""{extract-experience}"""`,
    // prompt:
    //   "Based on the job description and relevant experience, identify 5 key qualities and 5 areas of expertise that would be most valuable for this position.\n\nJob Description Analysis:\n{{job-description-analysis}}\n\nRelevant Experience:\n{{extract-experience}}",
  },
];
