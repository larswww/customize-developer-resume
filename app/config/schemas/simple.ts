import type { ComponentType } from "react";
import { z } from "zod";
import SimpleTemplate from "~/components/resume/templates/SimpleTemplate";
import {
	ContactInfoSchema,
	EducationSchema,
	type ResumeTemplateConfig,
} from "./sharedTypes";

export const ConsultantProjectSchema = z.object({
	client: z
		.string()
		.describe("The name of the client company for this specific project."),
	dates: z
		.string()
		.describe(
			"The start and end dates of the project/engagement (if different from employment).",
		),
	description: z
		.array(z.string())
		.describe("Paragraphs describing project goals, role, activities."),
	skillsUsed: z
		.optional(z.array(z.string()))
		.describe("Specific skills/technologies utilized for this project."),
});

export const EmploymentSchema = z.object({
	employer: z.string().describe("The name of the company employed at."),
	title: z.string().describe("Your job title at this company."),
	location: z.string().describe("The location of the employer."),
	dates: z
		.string()
		.describe("The start and end dates of your employment period."),
	projects: z
		.array(ConsultantProjectSchema)
		.describe(
			"List of specific client projects or significant engagements during this employment.",
		),
});
const OtherTemplateSections = z.object({
	experienceTitle: z.string().describe("The title of the experience section."),
	educationTitle: z.string().describe("The title of the education section."),
});
export const SimpleConsultantCoreDataSchema = z.object({
	summary: z.string().describe("A brief personal summary (2-4 sentences)."),
	employmentHistory: z
		.array(EmploymentSchema)
		.describe(
			"Chronological list of employment periods, each containing relevant projects.",
		),
	templateSections: OtherTemplateSections,
});

export const SimpleConsultantComponentSchema =
	SimpleConsultantCoreDataSchema.extend({
		education: z.array(EducationSchema),
		contactInfo: ContactInfoSchema,
	});

export const templateConfig: ResumeTemplateConfig = {
	id: "simpleConsultant",
	name: "Simple Consultant",
	description:
		"A senior developer resume format. One-paragraph intro summary. Lists employers and client projects underneath each employer. Each project has a list of technologies skills that can be used to highlight key tech relevant to current job. Under each project, there are bullet point descriptions.",
	component: SimpleTemplate as ComponentType<{ data: unknown }>,
	outputSchema: SimpleConsultantCoreDataSchema,
	componentSchema: SimpleConsultantComponentSchema,
};

export type ConsultantProject = z.infer<typeof ConsultantProjectSchema>;
export type Employment = z.infer<typeof EmploymentSchema>;
export type SimpleConsultantCoreData = z.infer<
	typeof SimpleConsultantCoreDataSchema
>;
export type SimpleConsultantComponentData = z.infer<
	typeof SimpleConsultantComponentSchema
>;
