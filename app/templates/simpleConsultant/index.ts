import { z } from "zod";
import type { ComponentType } from "react";
// Import shared types/schemas
import { ContactInfoSchema, EducationSchema, type ContactInfo, type ResumeTemplateConfig, globalResumeConstants } from "../sharedTypes";
// Import the specific component for this template
import SimpleTemplate from "~/components/templates/SimpleTemplate"; // Adjust path as needed

// --- Template-Specific Schemas --- 

// Schema for a Project (specific to this template)
// This now represents a project *within* an employment period
export const ConsultantProjectSchema = z.object({
  title: z.string().describe("The project title or role during the engagement."),
  client: z.string().describe("The name of the client company for this specific project."),
  // location: z.string().describe("The location of the client or project."), // Can be inferred from employment? Optional?
  dates: z.string().describe("The start and end dates of the project/engagement (if different from employment)."),
  description: z.array(z.string()).describe("Paragraphs describing project goals, role, activities."),
  skillsUsed: z.optional(z.array(z.string())).describe("Specific skills/technologies utilized for this project."),
});

// Schema for an Employment Period
export const EmploymentSchema = z.object({
    employer: z.string().describe("The name of the company employed at."),
    title: z.string().describe("Your job title at this company."),
    location: z.string().describe("The location of the employer."),
    dates: z.string().describe("The start and end dates of your employment period."),
    projects: z.array(ConsultantProjectSchema).describe("List of specific client projects or significant engagements during this employment."),
});

// Core data schema for AI generation
export const SimpleConsultantCoreDataSchema = z.object({
  summary: z.string().describe("A brief personal summary (2-4 sentences)."),
  // projects: z.array(ConsultantProjectSchema).describe("List of client projects/engagements."), // Replaced by employment
  employmentHistory: z.array(EmploymentSchema).describe("Chronological list of employment periods, each containing relevant projects."),
  // education: z.array(EducationSchema), // Removed - comes from global
});

// Full data schema the component expects
export const SimpleConsultantDataSchema = z.object({
    contactInfo: ContactInfoSchema, 
    summary: z.string(),
    // projects: z.array(ConsultantProjectSchema), // Replaced by employment
    employmentHistory: z.array(EmploymentSchema), // Use the new Employment schema
    education: z.array(EducationSchema), // Component expects education
});

// --- Template Configuration --- 

// Use global contact info
const templateDefaultContactInfo: ContactInfo = globalResumeConstants.contactInfo;

export const templateConfig: ResumeTemplateConfig = {
  id: 'simpleConsultant',
  name: 'Simple Consultant',
  description: 'A senior developer resume format. One-paragraph intro summary. List employers and client projects underneath each employer. Each project has a list of technologies skills that can be used to highlight key tech relevant to current job. ', // Updated description
  component: SimpleTemplate as ComponentType<{ data: any }>, 
  defaultContactInfo: templateDefaultContactInfo,
  outputSchema: SimpleConsultantCoreDataSchema,
  componentSchema: SimpleConsultantDataSchema, 
};

// Export specific types if needed elsewhere
export type ConsultantProject = z.infer<typeof ConsultantProjectSchema>;
export type Employment = z.infer<typeof EmploymentSchema>; // Export new type
export type SimpleConsultantCoreData = z.infer<typeof SimpleConsultantCoreDataSchema>;
export type SimpleConsultantData = z.infer<typeof SimpleConsultantDataSchema>; 