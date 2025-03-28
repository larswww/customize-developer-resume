import { http, HttpResponse } from "msw";

// Mock responses for each step
const mockResponses = {
	"analyze-job": `# Job Analysis

## Key Skills
- Nextjs
- TypeScript
- Tailwind CSS
- Responsive interfaces
- Frontend development

## Responsibilities
- Setting up a new Product Management System
- Building responsive and user-friendly interfaces
- Working with backend developers, UX/UI designers and product owners

## Required Experience
- Strong experience with Nextjs
- Strong experience with TypeScript
- Strong experience with Tailwind
- Experience building responsive interfaces
- Experience setting up applications from scratch

## Nice to Have
- None specified
`,
	"match-experience": `# Relevance Matching

## Nextjs experience
**Relevant Experience**: Led development of an e-commerce platform using Next.js, implementing SSR and optimizing performance
**Impact**: Reduced page load times by 45% and improved SEO rankings
**Keywords**: Next.js, SSR, Performance optimization, SEO

## TypeScript expertise
**Relevant Experience**: Implemented TypeScript across multiple frontend projects, creating robust type definitions and interfaces
**Impact**: Reduced type-related bugs by 60% and improved code maintainability
**Keywords**: TypeScript, Type safety, Code quality

## Tailwind CSS proficiency
**Relevant Experience**: Designed and implemented responsive UI components using Tailwind CSS
**Impact**: Accelerated UI development time by 40% while maintaining design consistency
**Keywords**: Tailwind CSS, Responsive design, UI components
`,
	"professional-summary":
		"Senior software engineer with expertise in Next.js, TypeScript, and AI integrations. Demonstrated success in optimizing cloud costs by 95% and delivering MVPs 4x faster than standard timelines.",
	"generate-resume": `# Lars Woldern
Frontend Developer | Next.js Specialist

## Professional Summary
Experienced frontend developer with strong expertise in Next.js, TypeScript, and Tailwind CSS. Specialized in building responsive and user-friendly interfaces, with a proven track record of setting up applications from scratch and optimizing performance.

## Key Skills
- Next.js
- TypeScript
- Tailwind CSS
- Responsive Design
- Performance Optimization
- SSR/SSG Implementation

## Professional Experience

### Senior Frontend Developer
**Digital Solutions Inc.** | 2021 - Present
- Led development of an e-commerce platform using Next.js, implementing SSR and optimizing performance which reduced page load times by 45%
- Implemented TypeScript across multiple frontend projects, creating robust type definitions and interfaces
- Designed and built responsive UI components using Tailwind CSS, accelerating UI development time by 40%
- Collaborated closely with backend developers, UX/UI designers, and product owners to deliver high-quality products

### Frontend Developer
**Web Innovations** | 2018 - 2021
- Built and maintained multiple web applications using React and Next.js
- Migrated legacy JavaScript codebase to TypeScript, improving code quality and reducing bugs
- Created responsive interfaces for various devices following accessibility best practices

## Education
**Bachelor of Science in Computer Science**
University of Technology | 2018

## Languages
- Dutch (Native)
- English (Fluent)

## Contact
- Email: lars.woldern@example.com
- LinkedIn: linkedin.com/in/larswoldern
- GitHub: github.com/larswoldern`,
};

// Mock Anthropic API
export const anthropicHandler = http.post(
	"https://api.anthropic.com/v1/messages",
	async ({ request }) => {
		// Parse the request to determine which mock to return
		console.log("[MSW] Anthropic API call intercepted:", request.url);

		// Log request details for debugging
		const requestBody = await request
			.clone()
			.json()
			.catch(() => "Could not parse request JSON");
		console.log(
			"[MSW] Anthropic API request body:",
			JSON.stringify(requestBody, null, 2),
		);
		console.log(
			"[MSW] Anthropic API request headers:",
			Object.fromEntries([...request.headers.entries()]),
		);

		// For real-world scenarios, you'd parse the request body and return appropriate mock
		console.log("[MSW] Mocking Anthropic API call");
		return HttpResponse.json({
			id: "msg_01234567890",
			type: "message",
			role: "assistant",
			model: "claude-3-7-sonnet-20250219",
			content: [
				{
					type: "text",
					text: mockResponses["analyze-job"],
				},
			],
			usage: {
				input_tokens: 250,
				output_tokens: 150,
			},
		});
	},
);

// Mock OpenAI API - Make the path pattern more general
export const openaiHandler = http.post(
	"https://api.openai.com/v1/*",
	async ({ request }) => {
		console.log("[MSW] OpenAI API call intercepted:", request.url);

		// Log request details for debugging
		const requestBody = await request
			.clone()
			.json()
			.catch(() => "Could not parse request JSON");
		console.log(
			"[MSW] OpenAI API request body:",
			JSON.stringify(requestBody, null, 2),
		);
		console.log(
			"[MSW] OpenAI API request headers:",
			Object.fromEntries([...request.headers.entries()]),
		);

		console.log("[MSW] Mocking OpenAI API call");
		return HttpResponse.json({
			id: "chatcmpl-abc123",
			object: "chat.completion",
			created: Date.now(),
			model: "o1",
			choices: [
				{
					index: 0,
					message: {
						role: "assistant",
						content: mockResponses["match-experience"],
					},
					logprobs: null,
					finish_reason: "stop",
				},
			],
			usage: {
				prompt_tokens: 300,
				completion_tokens: 200,
				total_tokens: 500,
			},
		});
	},
);

// Mock Gemini API - Make the URL pattern more general
export const geminiHandler = http.post(
	"https://generativelanguage.googleapis.com/*",
	async ({ request }) => {
		console.log("[MSW] Gemini API call intercepted:", request.url);

		// Log request details for debugging
		const requestBody = await request
			.clone()
			.json()
			.catch(() => "Could not parse request JSON");
		console.log(
			"[MSW] Gemini API request body:",
			JSON.stringify(requestBody, null, 2),
		);
		console.log(
			"[MSW] Gemini API request headers:",
			Object.fromEntries([...request.headers.entries()]),
		);

		console.log("[MSW] Mocking Gemini API call");

		// Try to determine which step we're handling based on request content
		// This is a simplistic approach - in a real-world scenario, you'd parse the prompt more carefully
		interface ContentPart {
			text?: string;
			[key: string]: unknown;
		}

		interface Content {
			parts?: ContentPart[];
			role?: string;
			[key: string]: unknown;
		}

		// Check if the request includes text about creating a professional summary or full resume
		let responseText = mockResponses["professional-summary"];
		let matchProfessionalSummary = false;
		let matchFinalResume = false;

		// Parse the request content to determine which mock to return
		if (
			requestBody &&
			typeof requestBody === "object" &&
			"contents" in requestBody &&
			Array.isArray(requestBody.contents)
		) {
			// Look through each part for our step identifiers
			const userMessages = requestBody.contents.filter(
				(content: Content) =>
					content?.role === "user" &&
					content?.parts &&
					Array.isArray(content.parts),
			);

			for (const message of userMessages) {
				const textParts =
					message.parts?.filter(
						(part: ContentPart) => part?.text && typeof part.text === "string",
					) || [];

				for (const part of textParts) {
					const text = part.text || "";
					if (text.includes("compelling professional summary")) {
						matchProfessionalSummary = true;
					}
					if (text.includes("complete, tailored resume in markdown format")) {
						matchFinalResume = true;
					}
				}
			}
		}

		// Choose appropriate response based on content match
		if (matchFinalResume) {
			responseText = mockResponses["generate-resume"];
		} else if (matchProfessionalSummary) {
			responseText = mockResponses["professional-summary"];
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
	},
);

// Also add fallback handlers for any other requests to these domains
export const fallbackHandlers = [
	http.all("https://api.anthropic.com/*", async ({ request }) => {
		console.log("[MSW] Catching fallback Anthropic request:", request.url);
		return HttpResponse.json({ message: "Fallback Anthropic response" });
	}),

	http.all("https://api.openai.com/*", async ({ request }) => {
		console.log("[MSW] Catching fallback OpenAI request:", request.url);
		return HttpResponse.json({ message: "Fallback OpenAI response" });
	}),

	http.all(
		"https://generativelanguage.googleapis.com/*",
		async ({ request }) => {
			console.log("[MSW] Catching fallback Gemini request:", request.url);
			return HttpResponse.json({ message: "Fallback Gemini response" });
		},
	),
];

export const handlers = [
	anthropicHandler,
	openaiHandler,
	geminiHandler,
	...fallbackHandlers,
];
