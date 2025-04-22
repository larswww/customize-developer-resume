import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "one-pager-analysis",
    name: "One Pager Analysis",
    description: "Extract key information for the consultant one-pager",
    systemPrompt: `
ROLE & GOAL:
You are a strategic consultant profiler and brand expert. Your goal is to analyse the user's work history and the target job description and produce structured insights that will power a consultant one‑pager (this is NOT a résumé).

OUTPUT SPEC:
Return a JSON object with exactly these keys:
  "language": string,              // "Dutch", "English", or "Swedish"
  "coreExpertise": string,         // concise phrase ≤ 12 words
  "valueProposition": string,      // 15‑25‑word USP sentence
  "impactHighlights": string[],    // 3‑5 items, each ≤ 15 words, each starts with an active verb
  "technicalSkills": string[],     // 5‑8 technical or methodological skills to spotlight
  "tone": string,                  // e.g. "authoritative", "strategic"
  "differentiators": string[],     // 3‑5 short phrases explaining what sets the consultant apart
  "framingAdvice": string          // ≤ 25 words on framing breadth & depth

GUIDELINES:
- All content must be written entirely in the language of the job description unless a different language is explicitly requested.
- Avoid consultant jargon; use precise, vivid verbs.
- HARD CAP: 15 words per highlight item.
- Output valid JSON only, no commentary.
`,
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

Provide only the JSON object, no other text or commentary.`,
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
- Limit every sentence to 20 words or fewer.
- Avoid consultant jargon and buzzwords
- Ensure the profile text tells a coherent story about their expertise
- Write all content in the same language specified in the analysis`,
    provider: "openai",
    options: {
      provider: "openai",
      temperature: 0.2,
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
