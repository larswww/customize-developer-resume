const getEnv = (key: string, defaultValue?: string): string | undefined => {
	if (typeof import.meta !== "undefined" && import.meta.env) {
		return import.meta.env[key] || defaultValue;
	}
	if (typeof process !== "undefined" && process.env) {
		return process.env[key] || defaultValue;
	}
	return defaultValue;
};

export const BASE_URL =
	getEnv("BASE_URL") || `http://localhost:${getEnv("PORT")}`;

export default {
	stylesheetUrl: `${BASE_URL}/index1.css`,
};

export const DB_DIR = "./db-data";
export const DB_FILE_NAME = "resume.db";

export const SETTINGS_KEYS = {
	EXPERIENCE: "experience",
	CONTACT_INFO: "contactInfo",
	EDUCATION: "education",
	PROJECTS: "projects",
} as const;

import { z } from "zod";
import {
	ContactInfoSchema,
	EducationSchema,
	ExperienceSchema,
	ProjectsSchema,
} from "./schemas/sharedTypes";

export const SETTINGS_SCHEMAS = {
	[SETTINGS_KEYS.EXPERIENCE]: {
		hasStructuredData: false,
		schema: ExperienceSchema,
		emptyValue: ExperienceSchema.parse({
			experience: [
				{
					company: "",
					location: "",
					dates: "",
					roles: [
						{
							title: "",
							content: "",
						},
					],
				},
			],
		}),
	},
	[SETTINGS_KEYS.CONTACT_INFO]: {
		hasStructuredData: true,
		schema: ContactInfoSchema,
		emptyValue: ContactInfoSchema.parse({
			name: "",
			title: "",
			location: "",
			phone: "",
			email: "",
		}),
	},
	[SETTINGS_KEYS.EDUCATION]: {
		hasStructuredData: true,
		schema: EducationSchema,
		emptyValue: EducationSchema.parse({
			educations: [
				{
					degree: "",
					institution: "",
					dates: "",
					location: "",
				},
			],
		}),
	},
	[SETTINGS_KEYS.PROJECTS]: {
		hasStructuredData: true,
		schema: ProjectsSchema,
		emptyValue: ProjectsSchema.parse({
			projects: [
				{
					title: "",
					date: "",
					description: "",
					link: "",
				},
			],
		}),
	},
};

export type SettingsKey = keyof typeof SETTINGS_KEYS;
