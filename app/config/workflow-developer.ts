import type { WorkflowStep } from "../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
  {
    id: "job-description-analysis",
    name: "Job Description Analysis",
    description: "Extract structured data strictly from the job description.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
    },
    systemPrompt:
      "You strictly extract job requirements into structured JSON without adding any assumptions. Include only explicitly mentioned skills, qualifications, responsibilities, and attributes.",
    prompt: `Analyze and structure the job description strictly into JSON:

Job Description:
{jobDescription}

Output strictly as JSON without extra information.`,
  },
  {
    id: "work-history-parsing",
    name: "Work History & Achievements Parsing",
    description: "Strictly parse provided candidate's work history without invention.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
    },
    systemPrompt:
      "Precisely parse candidate work history into JSON without adding details not explicitly stated. Include roles, titles, dates, companies, responsibilities, and quantifiable achievements exactly as provided.",
    prompt: `Parse this candidate profile strictly into JSON:

Candidate Profile:
{workHistory}

Output strictly as JSON without extra information.`,
  },
  {
    id: "validation-cross-check",
    name: "Validation & Cross-Checking",
    description: "Ensure parsed candidate profile strictly matches original work history.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
    },
    systemPrompt:
      "You strictly cross-check the parsed candidate profile against original raw data. Correct or remove any invented or incorrect details. Output a verified candidate profile JSON without inventions.",
    prompt: `Cross-check and correct parsed data:

Original Work History:
{workHistory}

Parsed Candidate Profile:
{work-history-parsing}

Output strictly corrected JSON.`,
  },
  {
    id: "relevance-matching",
    name: "Relevance Matching & Prioritization",
    description: "Rank experiences strictly based on verified facts for a senior developer role.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
    },
    systemPrompt:
      "Rank explicitly listed verified candidate experiences and skills strictly by relevance to the job description, focusing solely on senior developer competencies without inventing details. Assign relevance scores from 1 to 10.",
    prompt: `Rank and score verified candidate experiences and skills:

Structured Job Description:
{job-description-analysis}

Verified Candidate Profile:
{validation-cross-check}

Output strictly as JSON with relevance scores.`,
  },
  {
    id: "initial-resume-draft",
    name: "Initial Resume Draft Generation",
    description: "Strictly generate a senior developer Markdown resume without invention.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
    },
    systemPrompt:
      "Generate a precise, professional senior developer resume strictly using verified data and relevance-ranked experiences. Do not invent names, roles, or details. Format in clean Markdown.",
    prompt: `Generate a one-page senior developer resume strictly from these inputs:

Structured Job Description:
{job-description-analysis}

Ranked Verified Candidate Experiences:
{relevance-matching}

Verified Candidate Profile:
{validation-cross-check}

Output strictly Markdown without extra information.`,
  },
  {
    id: "resume-optimization",
    name: "Optimization for Conciseness & Impact",
    useInResume: true,
    description: "Strictly optimize senior developer resume for accuracy, impact, and conciseness.",
    provider: "openai",
    options: {
      model: "gpt-3.5-turbo-0125",
    },
    systemPrompt:
      "Optimize the provided Markdown resume strictly for senior developer roles. Remove inaccuracies or inventions, ensure impactful concise language, and format clearly. Do not add new details.",
    prompt: `Optimize the following resume strictly for accuracy and impact:

Resume Draft:
{initial-resume-draft}

Ranked Verified Candidate Experiences:
{relevance-matching}

Output strictly optimized Markdown.`,
  },
];
