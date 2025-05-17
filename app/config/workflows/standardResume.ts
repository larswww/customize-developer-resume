import type { WorkflowStep } from "../../services/ai/types";
import { StandardResumeCoreDataSchema } from "../schemas/standardResume";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "parse-to-format",
		name: "Parse to Format",
		useInResume: true,
		description:
			"Parse the job description to a format that can be used in the next step",
		systemPrompt: `You are an expert resume writer. You receive job description prompts and adapt the candidates work history to the provided structure. 
		
		WORK HISTORY:
		{workHistory}
		
		`,
		provider: "openai",
		options: {
			provider: "openai",
			response_format: { type: "json_schema" },
			model: "gpt-4.1",
			zodSchema: StandardResumeCoreDataSchema,
		},
		prompt: `Adapt the candidates work history to the provided structure. 
		
		WORK HISTORY:
		{workHistory}
`,
	},
];
