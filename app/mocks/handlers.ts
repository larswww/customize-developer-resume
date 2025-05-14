import { JSONSchemaFaker } from "json-schema-faker";
import { http, HttpResponse, delay } from "msw";
import { serverLogger } from "../utils/logger.server";

const workflowResponses = {
	"analyze-description":
		"## Job Description Analysis\n\nThis is a mock analysis of the job description for testing app flow.\n\n* Key requirements identified\n* Skills matched\n* Experience level: Senior",
	"match-experience":
		"## Experience Matching\n\nBased on your experience, here are the key matches for testing app flow:\n\n1. Frontend development experience\n2. Team leadership\n3. Project management",
	"write-summary":
		"## Professional Summary\n\nExperienced software engineer with a strong track record in frontend development and team leadership.",
	"write-cover-letter":
		"# Cover Letter\n\nDear Hiring Manager,\n\nI am writing to express my interest in the position. This is a mock cover letter for testing app flow.",

	"placeholder-step":
		"## Placeholder Step\n\nThis is a generic mock response for the placeholder step in the alternative workflow.",

	"generic-step": `## Mocky McMockface
**Mocked Product Engineer** | Mocksterdam | +1 000 000 0000 | mock@example.com | github.com/mockuser | linkedin.com/in/mockuser

### Work Experience

**Mocked Senior Software Engineer**
*Mock Krew, Mocksterdam* | 2023-Present
- Mocked description paragraph.
- Mocked highlight 1.
- Mocked highlight 2.

### Education

**Mocked Degree**
*Mock University, Mock City* | 2010-2014

### Skills

**Mock Frontend:** Mock React, Mock TypeScript
**Mock Backend:** Mock Python, Mock FastAPI

### Other

**Mock Other:** Mock Item 1

### Languages

🇺🇳, 🇸🇪`,
};

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

function createGenericAIResponse(message: string): string {
	serverLogger.debug("[MSW Test Debug] Received message:", message);

	let responseContent = workflowResponses["generic-step"];

	if (message.includes("json") || message.includes("structured")) {
		serverLogger.debug("[MSW Test Debug] Detected structured data request.");
		return JSON.stringify(mockResumeData);
	}

	for (const stepId of Object.keys(workflowResponses)) {
		if (
			message.toLowerCase().includes(stepId.toLowerCase().replace("-", " "))
		) {
			responseContent =
				workflowResponses[stepId as keyof typeof workflowResponses];
			serverLogger.debug(
				`[MSW Test Debug] Matched stepId: ${stepId}. Returning specific response.`,
			);
			break;
		}
	}

	if (responseContent === workflowResponses["generic-step"]) {
		serverLogger.debug(
			"[MSW Test Debug] No specific step matched. Returning generic response.",
		);
	}

	return responseContent;
}

export const anthropicHandler = http.post(
	"https://api.anthropic.com/v1/messages",
	async ({ request }) => {
		serverLogger.log("[MSW] Anthropic API call intercepted");
		await delay();

		// Get the request body to determine appropriate response
		const requestBody = await request
			.clone()
			.json()
			.catch(() => ({}));
		let responseText = workflowResponses["generic-step"];

		// Get the message content from the request if possible
		const userMessage =
			(requestBody as any).messages?.find((m: any) => m.role === "user")
				?.content || "";
		if (typeof userMessage === "string") {
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
	},
);

interface OpenAIMessage {
	role: string;
	content: string;
}

interface OpenAIRequestBody {
	model?: string;
	messages?: OpenAIMessage[];
	response_format?: { type: string; json_schema?: { schema: any } };
}

const openAIHandler = http.post(
	"https://api.openai.com/v1/chat/completions",
	async ({ request }) => {
		serverLogger.debug("[MSW] OpenAI API call intercepted");
		await delay();

		const requestBody = (await request
			.clone()
			.json()
			.catch(() => ({}))) as OpenAIRequestBody;
		let responseContent = workflowResponses["generic-step"];

		if (
			requestBody.model === "gpt-4-turbo" &&
			requestBody.response_format?.type === "json_object"
		) {
			responseContent = JSON.stringify(mockResumeData);
		} else if (
			requestBody.response_format?.type === "json_schema" &&
			requestBody.response_format?.json_schema?.schema
		) {
			const schemaMock = JSONSchemaFaker.generate(
				requestBody.response_format.json_schema.schema,
			);
			const openAiResponseBodyMock = {
				id: "chatcmpl-BNdffi5RaUJjPbPfwphuNY7MnjTgk",
				object: "chat.completion",
				created: 1744973739,
				model: "gpt-4o-2024-08-06",
				choices: [
					{
						index: 0,
						message: {
							role: "assistant",
							content: JSON.stringify(schemaMock),
							refusal: null,
							annotations: [],
						},
						logprobs: null,
						finish_reason: "stop",
					},
				],
				usage: {
					prompt_tokens: 434,
					completion_tokens: 9,
					total_tokens: 443,
					prompt_tokens_details: {
						cached_tokens: 0,
						audio_tokens: 0,
					},
					completion_tokens_details: {
						reasoning_tokens: 0,
						audio_tokens: 0,
						accepted_prediction_tokens: 0,
						rejected_prediction_tokens: 0,
					},
				},
				service_tier: "default",
				system_fingerprint: "fp_f5bdcc3276",
			};

			return HttpResponse.json(openAiResponseBodyMock);
		} else if (requestBody.messages && Array.isArray(requestBody.messages)) {
			const userMessage =
				requestBody.messages.find((m) => m.role === "user")?.content || "";
			if (typeof userMessage === "string") {
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
	},
);

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

export const geminiHandler = http.post(
	"https://generativelanguage.googleapis.com/*",
	async ({ request }) => {
		serverLogger.debug("[MSW] Gemini API call intercepted");
		await delay();

		const requestBody = (await request
			.clone()
			.json()
			.catch(() => ({}))) as GeminiRequestBody;
		let responseText = workflowResponses["generic-step"];

		if (
			requestBody &&
			"contents" in requestBody &&
			Array.isArray(requestBody.contents)
		) {
			const userMessages = requestBody.contents
				.filter(
					(content) =>
						content?.role === "user" &&
						content?.parts &&
						Array.isArray(content.parts),
				)
				.flatMap(
					(message) =>
						message.parts?.map((part) => part.text).filter(Boolean) || [],
				)
				.join(" ");

			if (userMessages) {
				responseText = createGenericAIResponse(userMessages);
			}
		}

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
	},
);

export const fallbackHandlers = [
	http.all("https://api.anthropic.com/*", async () => {
		serverLogger.debug("[MSW] Fallback Anthropic request intercepted");
		await delay();

		return HttpResponse.json({ message: "Fallback Anthropic response" });
	}),

	http.all("https://api.openai.com/*", async () => {
		serverLogger.debug("[MSW] Fallback OpenAI request intercepted");
		await delay();

		return HttpResponse.json({ message: "Fallback OpenAI response" });
	}),

	http.all("https://generativelanguage.googleapis.com/*", async () => {
		serverLogger.debug("[MSW] Fallback Gemini request intercepted");
		await delay();

		return HttpResponse.json({ message: "Fallback Gemini response" });
	}),
];

export const handlers = [
	anthropicHandler,
	openAIHandler,
	geminiHandler,
	...fallbackHandlers,
];
