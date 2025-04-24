import type { WorkflowStep } from "../../services/ai/types";

export const workflowSteps: WorkflowStep[] = [
	{
		id: "step-a",
		name: "Step A",
		description: "First independent step",
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-3.5-turbo-0125",
		},
		systemPrompt:
			"You are a testing assistant. Keep responses short and simple.",
		prompt: `Generate a very short paragraph about skills based on this job description. Keep it under 50 words.

Job Description:
{jobDescription}

Just provide the paragraph, nothing else.`,
		dependencies: [],
	},
	{
		id: "step-b",
		name: "Step B",
		description: "Second independent step",
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-3.5-turbo-0125",
		},
		systemPrompt:
			"You are a testing assistant. Keep responses short and simple.",
		prompt: `Extract 3-5 key keywords from the work history. Just list them comma-separated, nothing else.

Work History:
{workHistory}`,
		dependencies: [],
	},
	{
		id: "step-c",
		name: "Step C",
		description: "Depends on Step A",
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-3.5-turbo-0125",
		},
		systemPrompt:
			"You are a testing assistant. Keep responses short and simple.",
		prompt: `Based on the skills paragraph, generate a very short personal statement. Keep it under 30 words.

Skills Paragraph:
{step-a}

Just provide the statement, nothing else.`,
		dependencies: ["step-a"],
	},
	{
		id: "step-d",
		name: "Step D",
		description: "Depends on Step B",
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-3.5-turbo-0125",
		},
		systemPrompt:
			"You are a testing assistant. Keep responses short and simple.",
		prompt: `Create a headline using these keywords. Make it catchy and under 10 words.

Keywords:
{step-b}

Just provide the headline, nothing else.`,
		dependencies: ["step-b"],
	},
	{
		id: "step-e",
		name: "Final Step",
		description: "Depends on Steps C and D",
		provider: "openai",
		options: {
			provider: "openai",
			model: "gpt-3.5-turbo-0125",
		},
		systemPrompt:
			"You are a testing assistant. Keep responses short and simple.",
		useInResume: true,
		prompt: `Combine the personal statement and headline into a mini-resume introduction. Keep it under 50 words total.

Personal Statement:
{step-c}

Headline:
{step-d}

Just provide the combined introduction, nothing else.`,
		dependencies: ["step-c", "step-d"],
	},
];
