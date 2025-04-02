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
	"generate-resume": `RESUME

PRODUCT WORKS B.V. – OWNER
Amsterdam | Oct 2024 – Current

• Krew (AI Industry)
– Took over a Next.js and TypeScript project left by the previous CTO and deployed new features within the first week.
– Rebuilt front-end components with Tailwind, improving UI consistency and responsiveness.
– Collaborated on Python/FastAPI back end to enhance data flow and reliability.

• NoLemons (Automotive)
– Maintained and refactored a complex Next.js/Tailwind codebase for a secondhand car marketplace.
– Handled feature backlog and deployments, enabling a smooth handover to a new owner and accelerated business exit.

MCKINSEY & COMPANY – SENIOR FULL STACK ENGINEER / SENIOR SPECIALIST
Amsterdam | Jun 2022 – Sep 2024

• Major Automotive Manufacturer
– Developed a Next.js platform for geospatial EV-charging analysis, merging big data and ML insights.
– Deployed weekly UI updates, enabling iterative feedback and cross-team collaboration.
– Packaged the solution for broader reuse, showcased at a leading European hackathon.

• McKinsey Leap Gen AI Platform (AI/Strategy Consulting)
– Built a Next.js front end integrating NestJS back end for generative AI experiences.
– Led full stack development, including real-time data streaming and private document ingestion.
– Won an "Innovation Olympics" Gold Medal for delivering a fully functional GenAI prototype that secured €2M funding.

ACCENTURE LIQUID STUDIO – FULL STACK ENGINEER TEAM LEAD
Amsterdam | Jun 2021 – Sep 2022

• Fortune 500 Retail Company
– Led a small team to deliver a progressive web application with Tailwind, Vue, and modern testing tools.
– Removed vendor lock-in and saved €1.5M by driving in-house front-end development.
– Deployed to 5,700 stores, winning an innovation award for mobile-first efficiency.

CYGNI, PART OF ACCENTURE – FULL STACK ENGINEER
Östersund | Sep 2019 – Jan 2021

• Octopoda AB (SaaS Startup)
– Conducted design sprints to define crucial MVP features and reduce scope creep.
– Delivered weekly iterations on a Vue and Node.js AWS stack, securing further funding rounds.

• WorkPi
– Implemented React/TypeScript component library from PDF specs, winning a hackathon.

• Mid Sweden University
– Modernized a JavaScript curriculum, improving course feedback score from 2.8 to 4.8.

––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– (End of core resume content)`,
	"generate-printable-html": `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet">
    <style>
        @media print {
            @page {
                margin: 1in;
            }
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #000;
            }
            a {
                color: #000;
                text-decoration: none;
            }
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body class="bg-white text-gray-800">
    <header class="mb-8">
        <h1 class="text-4xl font-bold mb-2">[Your Name]</h1>
        <p class="text-lg">[Your Address] | [City, State] | [Your Email] | [Your Phone Number] | <a href="[LinkedIn URL]" class="text-blue-600">LinkedIn</a></p>
    </header>

    <main class="space-y-8">
        <section>
            <h2 class="text-2xl font-semibold border-b-2 border-gray-300 pb-1 mb-4">Professional Experience</h2>

            <article class="mb-6">
                <header class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold">PRODUCT WORKS B.V. – OWNER</h3>
                    <span class="text-sm text-gray-600">Amsterdam | Oct 2024 – Current</span>
                </header>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>
                        <strong>Krew (AI Industry)</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Took over a Next.js and TypeScript project left by the previous CTO and deployed new features within the first week.</li>
                            <li>Rebuilt front-end components with Tailwind, improving UI consistency and responsiveness.</li>
                            <li>Collaborated on Python/FastAPI back end to enhance data flow and reliability.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>NoLemons (Automotive)</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Maintained and refactored a complex Next.js/Tailwind codebase for a secondhand car marketplace.</li>
                            <li>Handled feature backlog and deployments, enabling a smooth handover to a new owner and accelerated business exit.</li>
                        </ul>
                    </li>
                </ul>
            </article>

            <article class="mb-6">
                <header class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold">MCKINSEY & COMPANY – SENIOR FULL STACK ENGINEER / SENIOR SPECIALIST</h3>
                    <span class="text-sm text-gray-600">Amsterdam | Jun 2022 – Sep 2024</span>
                </header>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>
                        <strong>Major Automotive Manufacturer</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Developed a Next.js platform for geospatial EV-charging analysis, merging big data and ML insights.</li>
                            <li>Deployed weekly UI updates, enabling iterative feedback and cross-team collaboration.</li>
                            <li>Packaged the solution for broader reuse, showcased at a leading European hackathon.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>McKinsey Leap Gen AI Platform (AI/Strategy Consulting)</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Built a Next.js front end integrating NestJS back end for generative AI experiences.</li>
                            <li>Led full stack development, including real-time data streaming and private document ingestion.</li>
                            <li>Won an "Innovation Olympics" Gold Medal for delivering a fully functional GenAI prototype that secured €2M funding.</li>
                        </ul>
                    </li>
                </ul>
            </article>

            <article class="mb-6">
                <header class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold">ACCENTURE LIQUID STUDIO – FULL STACK ENGINEER TEAM LEAD</h3>
                    <span class="text-sm text-gray-600">Amsterdam | Jun 2021 – Sep 2022</span>
                </header>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>
                        <strong>Fortune 500 Retail Company</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Led a small team to deliver a progressive web application with Tailwind, Vue, and modern testing tools.</li>
                            <li>Removed vendor lock-in and saved €1.5M by driving in-house front-end development.</li>
                            <li>Deployed to 5,700 stores, winning an innovation award for mobile-first efficiency.</li>
                        </ul>
                    </li>
                </ul>
            </article>

            <article>
                <header class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold">CYGNI, PART OF ACCENTURE – FULL STACK ENGINEER</h3>
                    <span class="text-sm text-gray-600">Östersund | Sep 2019 – Jan 2021</span>
                </header>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>
                        <strong>Octopoda AB (SaaS Startup)</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Conducted design sprints to define crucial MVP features and reduce scope creep.</li>
                            <li>Delivered weekly iterations on a Vue and Node.js AWS stack, securing further funding rounds.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>WorkPi</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Implemented React/TypeScript component library from PDF specs, winning a hackathon.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Mid Sweden University</strong>
                        <ul class="list-disc list-inside ml-4">
                            <li>Modernized a JavaScript curriculum, improving course feedback score from 2.8 to 4.8.</li>
                        </ul>
                    </li>
                </ul>
            </article>
        </section>
    </main>
</body>
</html>`,
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

// Mock OpenAI API
const openAIHandler = http.post(
	"https://api.openai.com/v1/chat/completions",
	async ({ request }) => {
		console.log("[MSW] OpenAI API call intercepted:", request.url);
		const requestBody = await request.clone().json().catch(() => null);
		console.log(
			"[MSW] OpenAI API request body (parsed):",
			JSON.stringify(requestBody, null, 2),
		);

		// Check if this is the structured resume generation request
		if (
			requestBody &&
			requestBody.model === "gpt-4-turbo" &&
			requestBody.response_format?.type === "json_object"
		) {
			console.log("[MSW] Handling structured resume generation request.");
			// Return a mock structured ResumeData object
			const mockResumeData = {
				contactInfo: {
					name: "Mocked Lars Wöldern",
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
				languages: ["🇺��", "🇸🇪"],
			};

			return HttpResponse.json({
				choices: [
					{
						message: {
							content: JSON.stringify(mockResumeData),
						},
					},
				],
			});
		}

		// Default fallback for other OpenAI calls (if any)
		console.warn("[MSW] Unhandled OpenAI API call, returning default empty response.");
		return HttpResponse.json({
			choices: [{ message: { content: "Default mock response" } }],
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
	openAIHandler,
	geminiHandler,
	...fallbackHandlers,
];
