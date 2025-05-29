import { z } from "zod";
import { SETTINGS_KEYS } from "~/config/constants";
import {
	type ContactInfo,
	ContactInfoSchema,
	type Education,
	EducationSchema,
	ExperienceSchema,
	OtherSchema,
	ProjectsSchema,
} from "~/config/schemas/sharedTypes";
import type { SimpleConsultantCoreData } from "~/config/schemas/simple";
import type {
	DefaultResumeCoreData,
	DefaultResumeData,
} from "../../config/schemas/default";

const TimeStampSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
});

const JobInputSchema = z.object({
	title: z
		.string()
		.min(2, "Job title must be at least 2 characters")
		.max(255, "Job title cannot exceed 255 characters")
		.refine((val) => !val.includes("\\"), {
			message: "Job title cannot contain backslashes",
		}),
	jobDescription: z.string().optional().or(z.literal("")),
	relevantDescription: z.string().optional().or(z.literal("")),
	link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

const JobSchema = z
	.object({
		id: z.number(),
		title: z.string(),
		jobDescription: z.string(),
		relevantDescription: z.string().optional(),
		link: z.string().url().nullable().optional(),
	})
	.merge(TimeStampSchema);

const WorkflowStepStatusSchema = z.enum([
	"pending",
	"success",
	"error",
	"processing",
]);

const WorkflowStepInputSchema = z.object({
	jobId: z.number(),
	stepId: z.string(),
	workflowId: z.string(),
	result: z.string(),
	status: WorkflowStepStatusSchema,
});

const WorkflowStepSchema = z
	.object({
		id: z.number(),
		jobId: z.number(),
		stepId: z.string(),
		workflowId: z.string(),
		result: z.string(),
		status: z.string().transform((val) => WorkflowStepStatusSchema.parse(val)),
	})
	.merge(TimeStampSchema);

const ResumeInputSchema = z.object({
	jobId: z.number(),
	resumeText: z.string().optional(),
	templateId: z.string().default("default"),
	structuredData: z
		.union([
			z.string(),
			z.custom<DefaultResumeCoreData>(),
			z.custom<SimpleConsultantCoreData>(),
			z.null(),
		])
		.optional()
		.transform((data) => {
			if (typeof data === "string" || data === null) return data;
			return JSON.stringify(data);
		}),
});

const ResumeSchema = z
	.object({
		id: z.number().optional(),
		jobId: z.number(),
		templateId: z.string().default("default"),
		resumeText: z.string().nullable(),
		structuredData: z.preprocess((val) => {
			if (typeof val === "string") {
				try {
					return JSON.parse(val);
				} catch (e) {
					return undefined;
				}
			}
			return val;
		}, z.custom<DefaultResumeData>().optional()),
	})
	.merge(TimeStampSchema.partial());

const SettingsKeySchema = z.nativeEnum(SETTINGS_KEYS);
const SettingsSchema = z.discriminatedUnion("key", [
	z.object({
		key: z.literal(SETTINGS_KEYS.EDUCATION),
		structuredData: EducationSchema,
		value: z.string().nullable(),
	}),
	z.object({
		key: z.literal(SETTINGS_KEYS.CONTACT_INFO),
		structuredData: ContactInfoSchema,
		value: z.string().nullable(),
	}),
	z.object({
		key: z.literal(SETTINGS_KEYS.EXPERIENCE),
		structuredData: ExperienceSchema,
		value: z.string().nullable(),
	}),
	z.object({
		key: z.literal(SETTINGS_KEYS.PROJECTS),
		structuredData: ProjectsSchema,
		value: z.string().nullable(),
	}),
	z.object({
		key: z.literal(SETTINGS_KEYS.OTHER),
		structuredData: OtherSchema,
		value: z.string().nullable(),
	}),
]);

// Zod Functions
const createJobFn = z.function().args(JobInputSchema).returns(JobSchema);
const getJobFn = z.function().args(z.number()).returns(JobSchema.nullable());
const getAllJobsFn = z.function().args().returns(z.array(JobSchema));
const updateJobFn = z
	.function()
	.args(z.object({ id: z.number() }).merge(JobInputSchema.partial()))
	.returns(JobSchema);
const deleteJobFn = z.function().args(z.number()).returns(z.boolean());
const saveWorkflowStepFn = z
	.function()
	.args(WorkflowStepInputSchema)
	.returns(WorkflowStepSchema);
const getWorkflowStepFn = z
	.function()
	.args(z.number(), z.string(), z.string())
	.returns(WorkflowStepSchema.nullable());
const getWorkflowStepsFn = z
	.function()
	.args(z.number(), z.string().optional())
	.returns(z.array(WorkflowStepSchema));
const saveResumeFn = z.function().args(ResumeInputSchema).returns(ResumeSchema);
const getResumeFn = z
	.function()
	.args(z.number(), z.string().optional())
	.returns(ResumeSchema.nullable());
const getResumesFn = z
	.function()
	.args(z.number().optional())
	.returns(z.array(ResumeSchema));
const getSettingFn = z
	.function()
	.args(SettingsKeySchema)
	.returns(SettingsSchema.nullable());
const saveSettingFn = z.function().args(SettingsSchema).returns(z.boolean());
const saveWorkHistoryFn = z.function().args(z.string()).returns(z.boolean());
const saveContactInfoFn = z
	.function()
	.args(ContactInfoSchema)
	.returns(z.boolean());
const saveEducationFn = z.function().args(EducationSchema).returns(z.boolean());

// Inferred Types
export type Job = z.infer<typeof JobSchema>;
export type JobInput = z.infer<typeof JobInputSchema>;
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>;
export type WorkflowStepInput = z.infer<typeof WorkflowStepInputSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type ResumeInput = {
	jobId: number;
	resumeText?: string;
	templateId?: string;
	structuredData?: DefaultResumeData | string | null;
};
export type Resume = z.infer<typeof ResumeSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type { ContactInfo, Education };
export type Other = z.infer<typeof OtherSchema>;

export {
	TimeStampSchema,
	JobInputSchema,
	JobSchema,
	WorkflowStepStatusSchema,
	WorkflowStepInputSchema,
	WorkflowStepSchema,
	ResumeInputSchema,
	ResumeSchema,
	SettingsKeySchema,
	SettingsSchema,
	createJobFn,
	getJobFn,
	getAllJobsFn,
	updateJobFn,
	deleteJobFn,
	saveWorkflowStepFn,
	getWorkflowStepFn,
	getWorkflowStepsFn,
	saveResumeFn,
	getResumeFn,
	getResumesFn,
	getSettingFn,
	saveSettingFn,
	saveWorkHistoryFn,
	saveContactInfoFn,
	saveEducationFn,
};
