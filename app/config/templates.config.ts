import { z } from "zod";

// Contact Info Schema
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Core Resume Data Schema
export interface ResumeCoreData {
  contactInfo: ContactInfo;
  summary: string;
  workExperience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location?: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate: string;
    location?: string;
    highlights?: string[];
  }[];
  skills: {
    name: string;
    level?: string;
    context?: string;
  }[];
  certifications?: {
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }[];
  projects?: {
    name: string;
    description: string;
    url?: string;
    highlights?: string[];
  }[];
}

// Resume Template Configuration
export interface ResumeTemplateConfig {
  id: string;
  name: string;
  description: string;
  tags: string[];
  preview?: string;
  outputSchema: z.ZodSchema<ResumeCoreData>;
}

// Default output schema
export const defaultResumeSchema = z.object({
  contactInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional()
  }),
  summary: z.string(),
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    highlights: z.array(z.string())
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().optional(),
    highlights: z.array(z.string()).optional()
  })),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string().optional(),
    context: z.string().optional()
  })),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    date: z.string().optional(),
    url: z.string().optional()
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().optional(),
    highlights: z.array(z.string()).optional()
  })).optional()
});

// Example template configuration
export const templates: ResumeTemplateConfig[] = [
  {
    id: "standard",
    name: "Standard Resume",
    description: "A clean, professional resume layout suitable for most industries",
    tags: ["professional", "clean", "standard"],
    outputSchema: defaultResumeSchema
  },
  {
    id: "modern",
    name: "Modern Resume",
    description: "A contemporary design with clean lines and visual hierarchy",
    tags: ["modern", "creative", "clean"],
    outputSchema: defaultResumeSchema
  }
];

export default templates; 