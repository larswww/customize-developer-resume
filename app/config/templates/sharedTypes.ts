import type { ComponentType } from "react";
import { z } from "zod";
import type { DefaultResumeCoreData } from "./default";
import type { SimpleConsultantCoreData } from "./simple";
// --- Shared Schemas --- 

export const ContactInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  phone: z.string(),
  email: z.string().email(),
  linkedin: z.string(),
  portfolio: z.optional(z.string()),
});

export const EducationSchema = z.object({
  degree: z.string().describe("The name of the degree or qualification."),
  institution: z.string().describe("The name of the educational institution."),
  dates: z.string().describe("The start and end dates of the education (e.g., 2015-2018)."),
  location: z.string().describe("The location of the institution (e.g., City, Country)."),
});

// --- Shared Types --- 

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type Education = z.infer<typeof EducationSchema>;

// --- NEW: Global Resume Constants --- 

const globalContactInfo: ContactInfo = {
  name: "LARS WÖLDERN",
  // This title might be overridden by template defaults if desired
  title: "Product Engineer / Consultant", 
  location: "Amsterdam & Remote",
  phone: "+31 6 2526 6752",
  email: "lars@productworks.nl",
  linkedin: "linkedin.com/in/larswo",
  portfolio: "productworks.nl",
};

// Define education data globally
const globalEducation: Education[] = [
  {
    degree: "BSc Computer Science",
    institution: "Mid Sweden University",
    dates: "2017",
    location: "Sweden",
  },
];

// Export the constants object
export const globalResumeConstants = {
  contactInfo: globalContactInfo,
  education: globalEducation,
};

// --- Shared Interface for Template Configuration --- 

export type ResumeCoreData = DefaultResumeCoreData | SimpleConsultantCoreData;

export interface ResumeTemplateConfig {
  id: string;
  name: string;
  description: string;
  component: ComponentType<{ data: any }>; 
  // Default contact info for the template (can use global or specify differently)
  defaultContactInfo: ContactInfo; 
  outputSchema: z.ZodType<ResumeCoreData>; 
  componentSchema?: z.ZodObject<any>; 
} 