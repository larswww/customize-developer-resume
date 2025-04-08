import { http, HttpResponse } from "msw";
import { JSONSchemaFaker } from "json-schema-faker";

// Update with more generic mock responses for testing app flow
const workflowResponses = {
	// Default workflow steps
	"analyze-description": "## Job Description Analysis\n\nThis is a mock analysis of the job description for testing app flow.\n\n* Key requirements identified\n* Skills matched\n* Experience level: Senior",
	"match-experience": "## Experience Matching\n\nBased on your experience, here are the key matches for testing app flow:\n\n1. Frontend development experience\n2. Team leadership\n3. Project management",
	"write-summary": "## Professional Summary\n\nExperienced software engineer with a strong track record in frontend development and team leadership.",
	"write-cover-letter": "# Cover Letter\n\nDear Hiring Manager,\n\nI am writing to express my interest in the position. This is a mock cover letter for testing app flow.",
	
	// Alternative workflow steps
	"placeholder-step": "## Placeholder Step\n\nThis is a generic mock response for the placeholder step in the alternative workflow.",
	
	// Generic fallback response for any step
	"generic-step": "## Generic Response\n\nThis is a generic mock response for any workflow step that doesn't have a specific mock.",
};

// Structured resume data mock
const mockResumeData = {
	contactInfo: {
		name: "Mocky McMockface",
		title: "Mocked Product Engineer",
		location: "Mocksterdam",
		phone: "+1 000 000 0000",
		email: "mock@example.com",
		github: "github.com/mockuser",
		linkedin: "linkedin.com/in/mockuser",
	},
	workExperience: [
		{
			title: "Mocked Senior Software Engineer",
			company: "Mock Krew",
			location: "Mocksterdam",
			dates: "2023-Present",
			description: ["Mocked description paragraph."],
			highlights: ["Mocked highlight 1.", "Mocked highlight 2."],
		},
	],
	education: [
		{
			degree: "Mocked Degree",
			institution: "Mock University",
			dates: "2010-2014",
			location: "Mock City",
		},
	],
	skills: [
		{
			category: "Mock Frontend",
			items: ["Mock React", "Mock TypeScript"],
		},
		{
			category: "Mock Backend",
			items: ["Mock Python", "Mock FastAPI"],
		},
	],
	otherInfo: {
		title: "Mock Other",
		items: ["Mock Item 1"],
	},
	languages: ["🇺🇳", "🇸🇪"],
};

// Generic function to create AI response for any model
function createGenericAIResponse(message: string): string {
	console.log("[MSW Test Debug] Received message:", message);
	
	// Try to determine which workflow step is being requested
	let responseContent = workflowResponses["generic-step"];
	
	// Check for structured data request
	if (message.includes("json") || message.includes("structured")) {
		console.log("[MSW Test Debug] Detected structured data request.");
		return JSON.stringify(mockResumeData);
	}
	
	// Try to match the step ID from the workflow steps
	for (const stepId of Object.keys(workflowResponses)) {
		// Simple keyword matching - in real implementation you would use more robust checks
		if (message.toLowerCase().includes(stepId.toLowerCase().replace("-", " "))) {
			responseContent = workflowResponses[stepId as keyof typeof workflowResponses];
			console.log(`[MSW Test Debug] Matched stepId: ${stepId}. Returning specific response.`);
			break; // Exit loop once a match is found
		}
	}
	
	if (responseContent === workflowResponses["generic-step"]) {
		console.log("[MSW Test Debug] No specific step matched. Returning generic response.");
	}
	
	return responseContent;
}

// Mock Anthropic API - Simplified generic handler
export const anthropicHandler = http.post(
	"https://api.anthropic.com/v1/messages",
	async ({ request }) => {
		console.log("[MSW] Anthropic API call intercepted");
		
		// Get the request body to determine appropriate response
		const requestBody = await request.clone().json().catch(() => ({}));
		let responseText = workflowResponses["generic-step"];
		
		// Get the message content from the request if possible
		const userMessage = (requestBody as any).messages?.find((m: any) => m.role === 'user')?.content || '';
		if (typeof userMessage === 'string') {
			responseText = createGenericAIResponse(userMessage);
		}
		
		return HttpResponse.json({
			id: "msg_01234567890",
			type: "message",
			role: "assistant",
			model: "claude-3-7-sonnet-20250219",
			content: [
				{
					type: "text",
					text: responseText,
				},
			],
			usage: {
				input_tokens: 250,
				output_tokens: 150,
			},
		});
	}
);

// Define interfaces for OpenAI request types
interface OpenAIMessage {
	role: string;
	content: string;
}

interface OpenAIRequestBody {
	model?: string;
	messages?: OpenAIMessage[];
	response_format?: { type: string };
}

// Mock OpenAI API - Simplified generic handler
const openAIHandler = http.post(
	"https://api.openai.com/v1/chat/completions",
	async ({ request }) => {
		console.log("[MSW] OpenAI API call intercepted");
		
		// Parse the request to determine which mock to return
		const requestBody = await request.clone().json().catch(() => ({})) as OpenAIRequestBody;
		let responseContent = workflowResponses["generic-step"];
		
		// Check if this is a structured resume generation request
		if (
			requestBody.model === "gpt-4-turbo" &&
			requestBody.response_format?.type === "json_object"
		) {
			responseContent = JSON.stringify(mockResumeData);
		} else if (requestBody.response_format?.type === "json_schema") {
			const mock = await JSONSchemaFaker.resolve(requestBody.response_format.json_schema.schema)
			responseContent = JSON.stringify(mock);
		} else if (requestBody.messages && Array.isArray(requestBody.messages)) {
			// Get the last user message
			const userMessage = requestBody.messages.find(m => m.role === 'user')?.content || '';
			if (typeof userMessage === 'string') {
				responseContent = createGenericAIResponse(userMessage);
			}
		}
		
		return HttpResponse.json({
			choices: [
				{
					message: {
						content: responseContent,
					},
				},
			],
		});
	}
);

// Define interfaces for Gemini request types
interface GeminiContentPart {
	text?: string;
	[key: string]: unknown;
}

interface GeminiContent {
	role?: string;
	parts?: GeminiContentPart[];
	[key: string]: unknown;
}

interface GeminiRequestBody {
	contents?: GeminiContent[];
	[key: string]: unknown;
}

// Mock Gemini API - Simplified generic handler
export const geminiHandler = http.post(
	"https://generativelanguage.googleapis.com/*",
	async ({ request }) => {
		console.log("[MSW] Gemini API call intercepted");
		
		// Get the request body to determine appropriate response
		const requestBody = await request.clone().json().catch(() => ({})) as GeminiRequestBody;
		let responseText = workflowResponses["generic-step"];
		
		// Try to extract user message from Gemini request format
		if (
			requestBody &&
			"contents" in requestBody &&
			Array.isArray(requestBody.contents)
		) {
			// Collect all user messages
			const userMessages = requestBody.contents
				.filter(content => content?.role === "user" && content?.parts && Array.isArray(content.parts))
				.flatMap(message => message.parts?.map(part => part.text).filter(Boolean) || [])
				.join(" ");
				
			if (userMessages) {
				responseText = createGenericAIResponse(userMessages);
			}
		}
		
		// Return a properly formatted Gemini response
		return HttpResponse.json({
			candidates: [
				{
					content: {
						parts: [
							{
								text: responseText,
							},
						],
						role: "model",
					},
					finishReason: "STOP",
					safetyRatings: [],
				},
			],
			usageMetadata: {
				promptTokenCount: 300,
				candidatesTokenCount: 200,
				totalTokenCount: 500,
			},
			promptFeedback: {
				safetyRatings: [],
			},
		});
	}
);

// Simple fallback handlers for any requests to AI model domains
export const fallbackHandlers = [
	http.all("https://api.anthropic.com/*", async () => {
		console.log("[MSW] Fallback Anthropic request intercepted");
		return HttpResponse.json({ message: "Fallback Anthropic response" });
	}),

	http.all("https://api.openai.com/*", async () => {
		console.log("[MSW] Fallback OpenAI request intercepted");
		return HttpResponse.json({ message: "Fallback OpenAI response" });
	}),

	http.all("https://generativelanguage.googleapis.com/*", async () => {
		console.log("[MSW] Fallback Gemini request intercepted");
		return HttpResponse.json({ message: "Fallback Gemini response" });
	}),
];

export const handlers = [
	anthropicHandler,
	openAIHandler,
	geminiHandler,
	...fallbackHandlers,
];
