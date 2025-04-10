import { z } from "zod";
import type { ComponentType } from "react";
import { ContactInfoSchema, type ContactInfo, type ResumeTemplateConfig, globalResumeConstants } from "./sharedTypes";
import ConsultantOnePagerTemplate from "../../components/resume/templates/ConsultantOnePagerTemplate";

export const ConsultantOnePagerCoreDataSchema = z.object({
  title: z.string().describe("The main title/headline for the consultant introduction."),
  subtitle: z.string().describe("A brief paragraph serving as introduction or subtitle."),
  expertise: z.array(z.string()).describe("Key areas of expertise."),
  highlights: z.array(z.string()).describe("Key achievements or selling points."),
  profileText: z.string().describe("Text describing the consultant's profile and background."),
  companyName: z.string().optional().describe("Company name to display in the footer."),
  language: z.enum(["English", "Swedish", "Dutch"]).describe("Language for the template text elements."),
});

export const ConsultantOnePagerDataSchema = z.object({
  contactInfo: ContactInfoSchema,
  title: z.string(),
  subtitle: z.string(),
  expertise: z.array(z.string()),
  highlights: z.array(z.string()),
  profileText: z.string(),
  companyName: z.string().optional(),
  language: z.enum(["English", "Swedish", "Dutch"]),
});

export const templateConfig: ResumeTemplateConfig = {
  id: 'consultantOnePager',
  name: 'Consultant One-Pager',
  description: 'A one-page template designed specifically for introducing consultants, featuring a profile image, title, subtitle, expertise areas, and key highlights.',
  // Use a wrapped version of the component to force fresh renders
  component: function WrappedTemplate(props: { data: ConsultantOnePagerData }) {
    console.log('Dynamically rendering ConsultantOnePagerTemplate at:', Date.now());
    // Return the component with the same props
    return ConsultantOnePagerTemplate(props);
  } as ComponentType<{ data: ConsultantOnePagerData }>,
  outputSchema: ConsultantOnePagerCoreDataSchema,
  componentSchema: ConsultantOnePagerDataSchema,
};

export type ConsultantOnePagerCoreData = z.infer<typeof ConsultantOnePagerCoreDataSchema>;
export type ConsultantOnePagerData = z.infer<typeof ConsultantOnePagerDataSchema>;
