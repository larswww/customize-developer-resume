import type { ComponentType } from "react";
import { z } from "zod";
import type { ConsultantOnePagerCoreData } from "./consultantOnePager";
import type { DefaultResumeCoreData } from "./default";
import type { SimpleConsultantCoreData } from "./simple";

export const ContactInfoSchema = z
	.object({
		firstName: z.string(),
		lastName: z.string(),
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

export const EduSchema = z.object({
	degree: z.string().describe("The name of the degree or qualification."),
	institution: z.string().describe("The name of the educational institution."),
	dates: z
		.string()
		.describe("The start and end dates of the education (e.g., 2015-2018)."),
	location: z
		.string()
		.describe("The location of the institution (e.g., City, Country)."),
});

export const EducationSchema = z.object({
	educations: z.array(EduSchema),
});

export const CoreSchema = z.object({
	contactInfo: ContactInfoSchema,
	education: EducationSchema,
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Core = z.infer<typeof CoreSchema>;
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
