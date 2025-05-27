import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "parse-to-format",
		name: "Parse to Format",
		useInResume: true,
		description:
			"Parse the job description to a format that can be used in the next step",
		systemPrompt: `You are an expert resume and profile formatter.  
You will receive arbitrary candidate context (work history, achievements, education, projects, etc.) and an *optional* job description.  
Produce a concise, well‑structured **Markdown** string that showcases the candidate’s most relevant information.

Guidelines  
• Output **must be Markdown only** — no code fences, back‑ticks, or explanatory prose.  
• Ensure using # h1, ## h2, ### h3 to structure content. 
• Use *italic*, **bold** and _underline_ for emphasis.
• > blockquotes are allowed.
• You choose between ordered and unordered lists as appropriate.

• Pay close attention to the title and relevant description.
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

  Whenever you lack information from the user you write an example of what you would write phrased so that its easy for the user to add in their information. Such as "Achieved x% increase in y by doing z" etc.

  ONLY PROVIDE MARKDOWN, NO OTHER TEXT.
`,
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-4.1",
		},
		prompt: `Using the candidate context and optional job description below, generate a resume in **Markdown only** (no back‑ticks, no commentary).  
Skip any section for which no data is provided.

TITLE:
{title}

CANDIDATE CONTEXT (may be empty):  
{workHistory}

RELEVANT DESCRIPTION (optional):  
{relevantDescription}

JOB DESCRIPTION (optional):  
{jobDescription}
`,
	},
];
