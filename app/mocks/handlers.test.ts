import { JSONSchemaFaker } from "json-schema-faker";
import { describe, expect, it } from "vitest";

const requestBodySchema = {
	type: "object",
	properties: {
		workExperience: {
			type: "array",
			items: {
				type: "object",
				properties: {
					title: {
						type: "string",
						description: "The job title.",
					},
					company: {
						type: "string",
						description: "The name of the company.",
					},
					location: {
						type: "string",
						description: "The location of the job (e.g., City, Country).",
					},
					dates: {
						type: "string",
						description:
							"The start and end dates of the employment (e.g., Jun 2022 - Sep 2024).",
					},
					description: {
						type: "array",
						items: {
							type: "string",
						},
						description: "Paragraphs describing the role and responsibilities.",
					},
					highlights: {
						type: "array",
						items: {
							type: "string",
						},
						description: "Optional bullet points highlighting achievements.",
					},
				},
				required: [
					"title",
					"company",
					"location",
					"dates",
					"description",
					"highlights",
				],
				additionalProperties: false,
			},
		},
		skills: {
			type: "array",
			items: {
				type: "object",
				properties: {
					category: {
						type: "string",
						description:
							"The category of the skills (e.g., Frontend, Backend).",
					},
					items: {
						type: "array",
						items: {
							type: "object",
							properties: {
								name: {
									type: "string",
									description: "The specific skill name.",
								},
								context: {
									type: "string",
									description: "Optional context (e.g., '3+ years').",
								},
							},
							required: ["name", "context"],
							additionalProperties: false,
						},
					},
				},
				required: ["category", "items"],
				additionalProperties: false,
			},
		},
	},
	required: ["workExperience", "skills"],
	additionalProperties: false,
	$schema: "http://json-schema.org/draft-07/schema#",
};

describe("JSON Schema Faker", () => {
	it("should generate a valid JSON object", async () => {
		const mock = JSONSchemaFaker.generate(requestBodySchema);
		expect(mock).toBeDefined();
	});
});
