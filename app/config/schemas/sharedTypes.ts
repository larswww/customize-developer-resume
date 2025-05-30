import type { ComponentType } from "react";
import { z } from "zod";
import type { WorkFlowId } from "../workflows";
import type { ConsultantOnePagerCoreData } from "./consultantOnePager";
import type { DefaultResumeCoreData } from "./default";
import type { SimpleConsultantCoreData } from "./simple";
import type { StandardResumeCoreData } from "./standardResume";
import type { MarkdownData } from "./markdown";

export const ExperienceSchema = z.object({
	experience: z.array(
		z.object({
			company: z.string(),
			location: z.string(),
			dates: z.string(),
			roles: z.array(
				z.object({
					title: z.string(),
					content: z.string().describe("MARKDOWN content for the role"),
				}),
			),
		}),
	),
});

export const ProjectSchema = z.object({
	title: z.string().describe("The name of the project."),
	date: z.string().describe("The date or date range of the project."),
	description: z.string().describe("Description of the project."),
	link: z.string().optional().describe("Optional link to the project."),
});

export const ProjectsSchema = z.object({
	projects: z.array(ProjectSchema),
});

export const OtherSchema = z.object({
	items: z
		.array(z.string())
		.describe("Additional information in markdown format"),
});

export const ContactInfoSchema = z
	.object({
		firstName: z.string(),
		lastName: z.string(),
		title: z.string(),
		location: z.string(),
		phone: z.string(),
		email: z.string(),
		linkedin: z.string().describe("LinkedIn profile URL"),
		portfolio: z.optional(z.string().describe("Portfolio website URL")),
		github: z.optional(z.string().describe("GitHub profile URL")),
		imageUrl: z.optional(z.string()),
	})
	.partial();

export const EduSchema = z.object({
	degree: z.string().describe("The name of the degree or qualification."),
	institution: z.string().describe("The name of the educational institution."),
	dates: z
		.string()
		.describe("The start and end dates of the education (e.g., 2015-2018)."),
	location: z
		.string()
		.describe("The location of the institution (e.g., City, Country)."),
	achievements: z
		.array(z.string())
		.describe("Achievements or notable accomplishments.")
		.optional(),
	thesis: z.string().describe("Thesis title or project name.").optional(),
	specialization: z
		.string()
		.describe("Specialization or focus of the degree.")
		.optional(),
});

export const EducationSchema = z.object({
	educations: z.array(EduSchema),
});

export const CoreSchema = z.object({
	contactInfo: ContactInfoSchema,
	education: EducationSchema,
	projects: ProjectsSchema,
	other: OtherSchema,
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Core = z.infer<typeof CoreSchema>;
export type Other = z.infer<typeof OtherSchema>;

export const defaultContactInfo: ContactInfo = {
	firstName: "",
	lastName: "",
	title: "",
	location: "",
	phone: "",
	email: "",
	linkedin: "",
	portfolio: "",
	github: "",
};

export type ResumeCoreData =
	| DefaultResumeCoreData
	| SimpleConsultantCoreData
	| ConsultantOnePagerCoreData
	| StandardResumeCoreData
	| MarkdownData;

export interface ResumeTemplateConfig {
	id: string;
	defaultWorkflowId: WorkFlowId;
	name: string;
	description: string;
	pages: number;
	component: ComponentType<{ data: any }>;
	outputSchema: z.ZodType<ResumeCoreData>;
	componentSchema: z.ZodObject<any>;
	orientation?: "portrait" | "landscape";
}
