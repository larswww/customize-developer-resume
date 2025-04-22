import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "one-pager-analysis",
    name: "One Pager Analysis",
    description: "Extract key information for the consultant one-pager",
    systemPrompt: `You are a strategic consultant profiler and brand expert. Analyze the user's work history and job description to create a compelling one-pager that highlights their expertise as a consultant. Your analysis will be used to generate content for a professional one-pager, not a resume. Direct the AI to use the same language as requested, or if not specified, use English.

    Guiding questions:
    - In which language should the one-pager be written?
    - What is the consultant's core expertise and unique value proposition?
    - What are the most impactful highlights and achievements that demonstrate expertise?
    - What technical skills, methodologies, or frameworks should be emphasized?
    - What tone and positioning would be most effective for the target audience?
    - What distinguishes this consultant from others in their field?
    - How can their experience be framed to show breadth and depth of expertise?`,
    provider: "openai",
    options: {
      provider: "openai",
      temperature: 0.2,
      model: "gpt-4.1-mini-2025-04-14"
    },
    prompt: `
---BEGIN JOB DESCRIPTION---
{jobDescription}
---END JOB DESCRIPTION---

---BEGIN WORK HISTORY---
{workHistory}
---END WORK HISTORY---

Provide only the strategic analysis, no other text or commentary.`,
    dependencies: []
  },
  {
    id: "extract-expertise",
    name: "Extract Expertise",
    description: "Identify core expertise areas and skills",
    systemPrompt: `ROLE & GOAL:
You are an expert consultant profiler. Your goal is to extract and categorize the consultant's expertise and skills that would be most relevant for a professional one-pager.

OUTPUT SPEC:
Return a JSON object with exactly two keys:
  "expertise": string[], (5-8 core expertise areas or skills)
  "highlights": string[] (5-7 impactful achievements or highlights)

GUIDELINES:
- For expertise: focus on specialized knowledge areas, methodologies, and technical skills
- For highlights: prioritize quantifiable achievements and unique case studies
- Keep highlights concise (15-25 words each)
- Preserve original terminology for specialized fields
- Output valid JSON only, no prose

All content must be written in the language requested in the one-pager-analysis.`,
    provider: "openai",
    options: {
      provider: "openai",
      temperature: 0.2,
      response_format: { type: "json_object" },
      model: "gpt-4.1-mini-2025-04-14"
    },
    prompt: `
---BEGIN JOB DESCRIPTION---
{jobDescription}
---END JOB DESCRIPTION---

---BEGIN WORK HISTORY---
{workHistory}
---END WORK HISTORY---

---BEGIN ANALYSIS---
{one-pager-analysis}
---END ANALYSIS---`,
    useInResume: true,
    dependencies: ["one-pager-analysis"]
  },
  {
    id: "craft-profile-content",
    name: "Craft Profile Content",
    description: "Create compelling content for the consultant one-pager",
    systemPrompt:
      `You are an expert in consultant branding and professional profiles. Create tailored content for a consultant one-pager that positions them as an expert in their field. The one-pager is NOT a resume but a strategic marketing document.

All content you write must be in the language requested in the one-pager-analysis.

YOUR OUTPUT STRUCTURE:
Return a JSON object with these exact keys:
{
  "contactInfo": { "name": string, "imageUrl": string (leave empty) },
  "title": string, (compelling headline/title for the consultant)
  "subtitle": string, (concise value proposition, 15-25 words)
  "profileText": string, (compelling profile text, 150-200 words)
  "expertise": string[], (5-8 core expertise areas or skills, from extract-expertise)
  "highlights": string[], (5-7 impactful achievements or highlights, from extract-expertise)
  "companyName": string, (company they represent)
  "language": string (English, Swedish, or Dutch)
}

WRITING GUIDELINES:
- Write crisp, authoritative content that establishes expertise
- Focus on what makes the consultant distinctive and valuable
- Highlight strategic thinking and business impact
- Use active voice and powerful, precise verbs
- Avoid consultant jargon and buzzwords
- Ensure the profile text tells a coherent story about their expertise
- Write all content in the same language specified in the analysis`,
    provider: "openai",
    options: {
      provider: "openai",
      temperature: 0.3,
      response_format: { type: "json_object" },
      model: "gpt-4.1-mini-2025-04-14"
    },
    prompt: `
Strategic analysis:
---BEGIN ANALYSIS---
{one-pager-analysis}
---END ANALYSIS---

Expertise and highlights JSON:
---BEGIN EXPERTISE---
{extract-expertise}
---END EXPERTISE---

---BEGIN JOB DESCRIPTION---
{jobDescription}
---END JOB DESCRIPTION---

---BEGIN WORK HISTORY---
{workHistory}
---END WORK HISTORY---`,
    useInResume: true,
    dependencies: ["one-pager-analysis", "extract-expertise"]
  },
];
