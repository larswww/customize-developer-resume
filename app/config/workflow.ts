import type { WorkflowStep } from '../services/ai/types';

// Helper function to extract JSON from potential markdown code blocks
const extractJSON = (text: string): string => {
  // Check if the response contains markdown code blocks
  const jsonRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no markdown code block found, assume it's raw JSON
  return text.trim();
};

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
    transform: (response, context) => {
      try {
        const jsonText = extractJSON(response.text);
        const analysis = JSON.parse(jsonText);
        context.intermediateResults.jobAnalysis = analysis;
        return analysis;
      } catch (error: any) {
        console.error("Failed to parse JSON in analyze-job step:", error);
        console.error("Raw response:", response.text);
        throw new Error(`Failed to parse response as JSON: ${error.message || 'Unknown error'}`);
      }
    }
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
    transform: (response, context) => {
      try {
        const jsonText = extractJSON(response.text);
        const matches = JSON.parse(jsonText);
        context.intermediateResults.matchedExperiences = matches;
        return matches;
      } catch (error: any) {
        console.error("Failed to parse JSON in match-experience step:", error);
        console.error("Raw response:", response.text);
        throw new Error(`Failed to parse response as JSON: ${error.message || 'Unknown error'}`);
      }
    }
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
    transform: (response) => {
      return response.text; // Final markdown resume
    }
  }
]; 