import { z } from "zod";
import type { ComponentType } from "react";
// Import shared types/schemas
import { ContactInfoSchema, EducationSchema, type ContactInfo, type ResumeTemplateConfig, globalResumeConstants } from "../sharedTypes";
// Import the specific component for this template
import { ResumeTemplate } from "~/components/ResumeTemplate"; // Adjust path as needed

// --- Template-Specific Schemas --- 

// Schema for Work Experience (specific to this template's structure)
export const WorkExperienceSchema = z.object({
  title: z.string().describe("The job title."),
  company: z.string().describe("The name of the company."),
  location: z.string().describe("The location of the job (e.g., City, Country)."),
  dates: z.string().describe("The start and end dates of the employment (e.g., Jun 2022 - Sep 2024)."),
  description: z.array(z.string()).describe("Paragraphs describing the role and responsibilities."),
  highlights: z.optional(z.array(z.string())).describe("Optional bullet points highlighting achievements."),
});

// Schema for Skills (specific to this template's structure)
export const SkillSchema = z.object({
  category: z.string().describe("The category of the skills (e.g., Frontend, Backend)."),
  items: z.array(z.object({
    name: z.string().describe("The specific skill name."),
    context: z.optional(z.string()).describe("Optional context (e.g., '3+ years')."),
  })),
});

// Core data schema for AI generation for this template
export const DefaultResumeCoreDataSchema = z.object({
  workExperience: z.array(WorkExperienceSchema),
  skills: z.array(SkillSchema),
});

// Full data schema the component expects
export const DefaultResumeDataSchema = z.object({
  contactInfo: ContactInfoSchema,
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  languages: z.optional(z.array(z.string())),
  otherInfo: z.optional(z.object({ 
    title: z.string(),
    items: z.array(z.string()),
  })),
});

// --- Template Configuration --- 

// Optionally use global contact info or define template-specific
const templateDefaultContactInfo: ContactInfo = globalResumeConstants.contactInfo;

export const templateConfig: ResumeTemplateConfig = {
  id: 'default',
  name: 'Standard Professional',
  description: 'A standard professional resume layout including work experience, education, and a categorized skills section. Suitable for typical job applications.',
  component: ResumeTemplate as ComponentType<{ data: any }>, // Cast component type
  defaultContactInfo: templateDefaultContactInfo, // Use chosen default
  outputSchema: DefaultResumeCoreDataSchema,
  componentSchema: DefaultResumeDataSchema, // Add the component schema
};

// Export specific types if needed elsewhere, though often not necessary
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type DefaultResumeCoreData = z.infer<typeof DefaultResumeCoreDataSchema>;
export type DefaultResumeData = z.infer<typeof DefaultResumeDataSchema>; 