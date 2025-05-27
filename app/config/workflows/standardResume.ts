import type { WorkflowStep } from "../../services/ai/types";
import { StandardResumeCoreDataSchema } from "../schemas/standardResume";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "parse-to-format",
		name: "Parse to Format",
		useInResume: true,
		description:
			"Parse the job description to a format that can be used in the next step",
		systemPrompt: `You are an expert resume and profile formatter.  
You will receive arbitrary candidate context (work history, achievements, education, projects, etc.) and an *optional* job description.  
Produce a concise, well‑structured **Markdown** document that showcases the candidate’s most relevant information.

Guidelines  
• Output **must be Markdown only** — no code fences, back‑ticks, or explanatory prose.  
• If a job description is supplied, emphasise experience and skills that map directly to its requirements; otherwise highlight the strongest, most recent achievements.  
• Preserve existing Markdown links, never altering URLs; you may adjust link text so it flows naturally.  
• Omit any section for which no data is provided.  
• Follow this order (omit empty sections):

  ### Professional Summary  
  ### Key Skills  
  ### Work Experience  
  ### Education  
  ### Certifications  
  ### Projects  
`,
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-4o",
		},
		prompt: `Using the candidate context and optional job description below, generate a resume in **Markdown only** (no back‑ticks, no commentary).  
Skip any section for which no data is provided.

CANDIDATE CONTEXT:  
{workHistory}

JOB DESCRIPTION (optional):  
{jobDescription}
`,
	},
];
