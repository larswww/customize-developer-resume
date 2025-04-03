import type { ComponentType } from "react";
import { z } from "zod"; // Import Zod
// Assuming component and base types are in components/ResumeTemplate
import { ResumeTemplate } from "../components/ResumeTemplate";

// --- Base Zod Schemas for Resume Sections --- (Renamed slightly for clarity)

export const WorkExperienceSchema = z.object({
  title: z.string().describe("The job title."),
  company: z.string().describe("The name of the company."),
  location: z.string().describe("The location of the job (e.g., City, Country)."),
  dates: z.string().describe("The start and end dates of the employment (e.g., Jun 2022 - Sep 2024)."),
  description: z.array(z.string()).describe("Paragraphs describing the role and responsibilities. Use concise, action-oriented language."),
  highlights: z.optional(z.array(z.string())).describe("Optional bullet points highlighting key achievements or contributions."),
});

export const EducationSchema = z.object({
  degree: z.string().describe("The name of the degree or qualification."),
  institution: z.string().describe("The name of the educational institution."),
  dates: z.string().describe("The start and end dates of the education (e.g., 2015-2018)."),
  location: z.string().describe("The location of the institution (e.g., City, Country)."),
});

export const SkillSchema = z.object({
  category: z.string().describe("The category of the skills (e.g., Frontend, Backend, Soft Skills)."),
  items: z.array(z.object({
    name: z.string().describe("The specific skill name."),
    context: z.optional(z.string()).describe("Optional context for the skill, like years of experience (e.g., '3+ years'). Extract if available."),
  })).describe("List of specific skills within the category, potentially with context."),
});

// --- Derived Types from Zod Schemas (used by components/template) ---
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;

// --- Contact Info Schema/Type (can also be defined here) ---
export const ContactInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  phone: z.string(),
  email: z.string().email(),
  linkedin: z.string(), // Could add URL validation if needed
  portfolio: z.optional(z.string()), // Added optional portfolio
  // Add other optional fields if the template supports them
  // website: z.optional(z.string().url()),
});
export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// --- Core Resume Data Schema (What the AI should generate) ---
export const ResumeCoreDataSchema = z.object({
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
});

export type ResumeCoreData = z.infer<typeof ResumeCoreDataSchema>;

// --- Full Resume Data Schema (Includes ContactInfo, used by Template) ---
// Define explicitly instead of spreading to avoid potential issues
export const ResumeDataSchema = z.object({
  contactInfo: ContactInfoSchema,
  // Explicitly include fields from ResumeCoreDataSchema
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  // Keep other optional fields
  languages: z.optional(z.array(z.string())),
  otherInfo: z.optional(z.object({ 
    title: z.string(),
    items: z.array(z.string()),
  })),
});
export type ResumeData = z.infer<typeof ResumeDataSchema>;

// --- Default/Fallback Contact Info ---
const defaultContactInfo: ContactInfo = {
  name: "LARS WÖLDERN",
  title: "Product Engineer",
  location: "Amsterdam & Remote",
  phone: "+31 6 2526 6752",
  email: "lars@productworks.nl",
  linkedin: "linkedin.com/in/larswo",
  portfolio: "productworks.nl", // Added portfolio
};

// --- Interface for a template configuration (Updated) ---
export interface ResumeTemplateConfig {
  id: string;
  name: string;
  component: ComponentType<{ data: ResumeData }>; // Component still expects the full ResumeData
  defaultContactInfo: ContactInfo;
  // Single schema defining the structure for the AI to generate
  outputSchema: typeof ResumeCoreDataSchema;
  // REMOVED aiSchemas property
  // aiSchemas: { ... };
}

// --- Configuration for the default template (Updated) ---
export const defaultTemplateConfig: ResumeTemplateConfig = {
  id: 'default',
  name: 'Default Template',
  component: ResumeTemplate,
  defaultContactInfo: defaultContactInfo,
  // Provide the core schema for AI generation
  outputSchema: ResumeCoreDataSchema,
};

// You could export a map or array of all templates here for selection later
export const availableTemplates: Record<string, ResumeTemplateConfig> = {
  [defaultTemplateConfig.id]: defaultTemplateConfig,
};

// Export types needed by other parts of the application
// It's often cleaner to export types derived from the Zod schemas directly
// instead of relying on potentially outdated base types from the component file.
// Exporting ResumeData and ContactInfo (derived from schemas) is usually sufficient.
// We already export WorkExperience, Education, Skill, ResumeCoreData above. 