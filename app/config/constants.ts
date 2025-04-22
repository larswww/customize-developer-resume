export const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

export default {
	stylesheetUrl: `${BASE_URL}/index.css`,
};

export const DB_DIR = "./db-data";
export const DB_NAMES = {
	TEST: "test.db",
	PROD: "resume_app.db",
};

export const SETTINGS_KEYS = {
	WORK_HISTORY: "workHistory",
	CONTACT_INFO: "contactInfo",
	EDUCATION: "education",
} as const;

import { z } from "zod";
import { ContactInfoSchema, EducationSchema } from "./schemas/sharedTypes";

export const SETTINGS_SCHEMAS = {
	[SETTINGS_KEYS.WORK_HISTORY]: {
		hasStructuredData: false,
		schema: z.string().nullable(),
		emptyValue: "",
	},
	[SETTINGS_KEYS.CONTACT_INFO]: {
		hasStructuredData: true,
		schema: ContactInfoSchema.nullable(),
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
		schema: EducationSchema.nullable(),
		emptyValue: EducationSchema.parse({
			degree: "",
			institution: "",
			dates: "",
			location: "",
		}),
	},
};

export type SettingsKey = keyof typeof SETTINGS_KEYS;
