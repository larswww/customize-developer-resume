import type { ComponentType } from "react";
import { z } from "zod";

import { ConsultantOnePagerTemplate } from "../../components/resume/templates/ConsultantOnePagerTemplate";
import { ContactInfoSchema, type ResumeTemplateConfig } from "./sharedTypes";

export const ConsultantOnePagerCoreDataSchema = z.object({
	title: z
		.string()
		.describe("Main title/headline for the consultant introduction."),
	subtitle: z
		.string()
		.describe("Brief paragraph serving as introduction or subtitle."),
	highlightHeadline: z
		.string()
		.describe("Headline for the highlights section."),
	highlights: z
		.array(z.string())
		.describe("Key achievements supporting the subtitle."),
	expertiseHeadline: z.string().describe("Headline for the expertise section."),
	expertise: z
		.array(z.string())
		.describe("List of tags/skills with relevant expertise."),
	profileText: z
		.string()
		.describe("Synthesized career story as relevant to the job description."),
	companyName: z
		.string()
		.optional()
		.describe("Name of company/stakeholder the letter is addressed to."),
});

export const ConsultantOnePagerDataSchema =
	ConsultantOnePagerCoreDataSchema.extend({
		contactInfo: ContactInfoSchema,
		language: z
			.enum(["English", "Swedish", "Dutch"])
			.describe("Language of the template text elements."),
	});

export const templateConfig: ResumeTemplateConfig = {
	id: "consultantOnePager",
	defaultWorkflowId: "onePager",
	name: "Consultant One-Pager",
	description:
		"A one-page template designed specifically for introducing consultants, featuring a profile image, title, subtitle, expertise areas, and key highlights.",
	pages: 1,
	component: ConsultantOnePagerTemplate as ComponentType<{
		data: ConsultantOnePagerData;
	}>,
	outputSchema: ConsultantOnePagerCoreDataSchema,
	componentSchema: ConsultantOnePagerDataSchema,
};

export type ConsultantOnePagerCoreData = z.infer<
	typeof ConsultantOnePagerCoreDataSchema
>;
export type ConsultantOnePagerData = z.infer<
	typeof ConsultantOnePagerDataSchema
>;
