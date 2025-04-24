import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "communication-guide",
		name: "Communication Guide",
		description:
			"Create a communication guide based on the EPIC framework for client interactions",
		systemPrompt: `You are an expert in writing resume instructions for GPT 4.1. You analyze job descriptions and return a customization guide the AI can use in the next step. The guide will be used in combination with a candidates complete career story to write a targeted resume. It is important you phrase the content so that it describes the ideal resume for the job, whilst leaving the instructions open so that the AI is not encouraged to hallucinate.

You think step-by-step;

#1 Analyze
Analyze the job description using guiding questions such as;
Empathy:
- What type of experience is most relevant for them?
- What would they care about most in a candidate, written and not written?
- What is at stake for them when hiring for this role? Why is this important to them?

Purpose:
- What type of person do they want to interview?
- What is the overall purpose of the job, and how does a candidate with this resume move towards it?

Insight:
- What insights are most relevant to helping you succeed in this purpose?
- What storyline will help you focus attention to those insights? What concise phrases capture your ideas best?
- What types of content will help you share those insight most clearly? 

Conversation:
- How will you inspire the reader to want to interview the candidate without directly saying so?
- What supporting materials, such as references, links or portfolio projects should be included/mentioned? 
- What personal qualities and experiences may be particularly relevant for this role? 

#2 Structure
Provide a storyline structured in JSON as a tree of thoughts;

Introduction: Situation and complication for the role and context information. 
Question: The core question that the hiring party would have when filling the role.
Governing thought: The single most important idea capturing the ideal candidate.
- 3 Key Lines, where each supports addressing the governing thought
- For each key line lower-level ideas and evidence making the case for the key line ideas
desiredLanguage: The ideal target language to write in based on the description.

Conclusion: Close the story, typically repetition of governing thought and key line ideas or next steps of effort.

#3 Rewrite your content following these guidelines:
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

Provide only the JSON structure, no other commentary.

`,
		provider: "openai",
		options: {
			provider: "openai",
			temperature: 0.2,
			response_format: { type: "json_object" },
			model: "gpt-4.1",
		},
		prompt: "{jobDescription}",
	},
	{
		id: "craft-relevant-content",
		name: "Craft Relevant Content",
		dependencies: ["communication-guide"],
		description:
			"Craft the most relevant content from the candidate's career story for the one-pager",
		systemPrompt: `You are an expert cover letter author and help the user present the most relevant parts of their full career story in a motivating letter. You think step by step;

1. Analyze the provided instructions
2. Extract the most relevant content from the career story,
3. Decide if the candidate has all the required experience to meet the instructions, and if not either ignore part of the instructions or use similar or related instructions
4. Re-organize the content into the below JSON structure 
5. Translate the content into r
5. Ensure the content stays true to the career story and is still using the same tone of voice and language as the original

You always return the content in a JSON object with the following structure:

summary: "A brief personal summary (2-4 sentences).",
employmentHistory: [

    employer: "The name of the company employed at.",
    title: "Your job title at this company.",
    location: "The location of the employer.",
    dates: "The start and end dates of your employment period.",
    projects: [
        client: "The name of the client company for this specific project.",
        dates: "The start and end dates of the project/engagement (if different from employment).",
        description: ["Paragraphs describing project goals, role, activities."],
        skillsUsed: ["Specific skills/technologies utilized for this project."] // Optional
    ]
],
templateSections: 
  experienceTitle: "The title of the experience section.",
  educationTitle: "The title of the education section."
`,
		provider: "openai",
		options: {
			provider: "openai",
			temperature: 0,
			response_format: { type: "json_object" },
			model: "gpt-4.1",
		},
		prompt: `
---INSTRUCTIONS---
"""{communication-guide}"""
---END INSTRUCTIONS---

---CAREER STORY---
"""{workHistory}"""
---END CAREER STORY---
`,
	},
	{
		id: "fact-check",
		useInResume: true,
		name: "Fact Check",
		dependencies: ["craft-relevant-content"],
		description: "Fact check the content so it follows the writing guidelines",
		systemPrompt: `
    You are an expert fact checker and resume writer. Your task is to proof read a resume and carefully check all statements against a candidates complete career story.

You are looking for statements that are not present in the SOURCE, and for each such occurrence, you rewrite that particular part of the letter so that its factually accurate whilst maintaining the tone and writing style of the letter.

Return only the edited RESUME in the same structure with no added commentary.
`,
		provider: "openai",
		options: {
			provider: "openai",
			temperature: 1,
			response_format: { type: "json_object" },
			model: "gpt-4.1",
		},
		prompt: `RESUME:

"""
{craft-relevant-content}
"""

----END LETTER----

SOURCE:
{workHistory}`,
	},
];
