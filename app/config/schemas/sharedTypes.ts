import type { ComponentType } from "react";
import { z } from "zod";
import type { ConsultantOnePagerCoreData } from "./consultantOnePager";
import type { DefaultResumeCoreData } from "./default";
import type { SimpleConsultantCoreData } from "./simple";

export const ContactInfoSchema = z
	.object({
		name: z.string(),
		title: z.string(),
		location: z.string(),
		phone: z.string(),
		email: z.string(),
		linkedin: z.string().url().describe("LinkedIn profile URL"),
		portfolio: z.optional(z.string().url().describe("Portfolio website URL")),
		github: z.optional(z.string().url().describe("GitHub profile URL")),
		imageUrl: z.optional(z.string()),
	})
	.partial();

export const EducationSchema = z.object({
	degree: z.string().describe("The name of the degree or qualification."),
	institution: z.string().describe("The name of the educational institution."),
	dates: z
		.string()
		.describe("The start and end dates of the education (e.g., 2015-2018)."),
	location: z
		.string()
		.describe("The location of the institution (e.g., City, Country)."),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Education = z.infer<typeof EducationSchema>;

export const defaultContactInfo: ContactInfo = {
	name: "Your Name",
	title: "Your Title",
	location: "Your Location",
	phone: "",
	email: "",
	linkedin: "",
	portfolio: "",
	github: "",
};

const globalEducation: Education[] = [
	{
		degree: "BSc Computer Science",
		institution: "Mid Sweden University",
		dates: "2017",
		location: "Sweden",
	},
];

export const globalResumeConstants = {
	contactInfo: defaultContactInfo,
	education: globalEducation,
};

export type ResumeCoreData =
	| DefaultResumeCoreData
	| SimpleConsultantCoreData
	| ConsultantOnePagerCoreData;

export interface ResumeTemplateConfig {
	id: string;
	name: string;
	description: string;
	component: ComponentType<{ data: any }>;
	outputSchema: z.ZodType<ResumeCoreData>;
	componentSchema: z.ZodObject<any>;
	orientation?: "portrait" | "landscape";
}
