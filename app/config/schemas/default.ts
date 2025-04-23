import type { ComponentType } from "react";
import { z } from "zod";
import { ResumeTemplate } from "~/components/resume/templates/ResumeTemplate";
import {
  type ContactInfo,
  ContactInfoSchema,
  EducationSchema,
  type ResumeTemplateConfig,
  globalResumeConstants,
} from "./sharedTypes";

export const WorkExperienceSchema = z.object({
  title: z.string().describe("The job title."),
  company: z.string().describe("The name of the company."),
  location: z
    .string()
    .describe("The location of the job (e.g., City, Country)."),
  dates: z
    .string()
    .describe(
      "The start and end dates of the employment (e.g., Jun 2022 - Sep 2024)."
    ),
  description: z
    .array(z.string())
    .describe("Paragraphs describing the role and responsibilities."),
  highlights: z
    .optional(z.array(z.string()))
    .describe("Optional bullet points highlighting achievements."),
});

export const SkillSchema = z.object({
  category: z
    .string()
    .describe("The category of the skills (e.g., Frontend, Backend)."),
  items: z.array(
    z.object({
      name: z.string().describe("The specific skill name."),
      context: z
        .optional(z.string())
        .describe("Optional context (e.g., '3+ years')."),
    })
  ),
});

export const DefaultResumeCoreDataSchema = z.object({
  workExperience: z.array(WorkExperienceSchema),
  skills: z.array(SkillSchema),
});

export const DefaultResumeDataSchema = DefaultResumeCoreDataSchema.extend({
  contactInfo: ContactInfoSchema,
  education: z.array(EducationSchema),
  languages: z.optional(z.array(z.string())),
  otherInfo: z.optional(
    z.object({
      title: z.string(),
      items: z.array(z.string()),
    })
  ),
});

export const templateConfig: ResumeTemplateConfig = {
  id: "default",
  name: "Standard Professional",
  description:
    "A standard professional resume layout including work experience, education, and a categorized skills section. Suitable for typical job applications.",
  component: ResumeTemplate as ComponentType<{ data: DefaultResumeData }>,
  outputSchema: DefaultResumeCoreDataSchema,
  componentSchema: DefaultResumeDataSchema,
};

export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type DefaultResumeCoreData = z.infer<typeof DefaultResumeCoreDataSchema>;
export type DefaultResumeData = z.infer<typeof DefaultResumeDataSchema>;
