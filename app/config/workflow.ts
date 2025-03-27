import type { WorkflowStep } from '../services/ai/types';
import { createJsonTransform, textTransform } from '../utils/workflowUtils';

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'analyze-job',
    provider: 'anthropic',
    prompt: (context) => `Analyze the following job description and extract key requirements, skills, and responsibilities:

${context.jobDescription}

Format the output as a JSON object with the following structure:
{
  "keySkills": [],
  "responsibilities": [],
  "requiredExperience": [],
  "niceToHave": []
}

Important: Return ONLY the JSON without any markdown formatting or explanation.`,
    transform: createJsonTransform('analyze-job', 'jobAnalysis')
  },
  {
    id: 'match-experience',
    provider: 'openai',
    prompt: (context) => `Given the following job requirements and work history, identify the most relevant experiences and achievements that match the job requirements.

Job Analysis:
${JSON.stringify(context.intermediateResults.jobAnalysis, null, 2)}

Work History:
${context.workHistory}

Format your response as a JSON array of relevant experiences, with each experience containing:
{
  "matchedRequirement": "",
  "relevantExperience": "",
  "impact": "",
  "keywords": []
}

Important: Return ONLY the JSON without any markdown formatting or explanation.`,
    transform: createJsonTransform('match-experience', 'matchedExperiences')
  },
  {
    id: 'generate-resume',
    provider: 'gemini',
    prompt: (context) => `Create a targeted resume based on the following matched experiences and job requirements:

Matched Experiences:
${JSON.stringify(context.intermediateResults.matchedExperiences, null, 2)}

Original Job Description:
${context.jobDescription}

Generate a professional resume in markdown format that highlights these experiences and aligns them with the job requirements.`,
    transform: textTransform
  }
]; 