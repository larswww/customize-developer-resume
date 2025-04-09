import { z } from "zod";
import type { ComponentType } from "react";
import { ContactInfoSchema, type ContactInfo, type ResumeTemplateConfig, globalResumeConstants } from "./sharedTypes";
import OnePagerTemplate from "~/components/resume/templates/OnePagerTemplate";

export const OnePagerCoreDataSchema = z.object({
  title: z.string().describe("The main title/headline for the one-pager slide."),
  subtitle: z.string().describe("A brief paragraph serving as introduction or subtitle."),
  tableData: z.array(z.array(z.string())).describe("Table data with headers in first row and data in subsequent rows."),
  highlights: z.array(z.string()).describe("Key bullet points or highlights to display."),
});

export const OnePagerDataSchema = z.object({
  contactInfo: ContactInfoSchema,
  title: z.string(),
  subtitle: z.string(),
  tableData: z.array(z.array(z.string())),
  highlights: z.array(z.string()),
});

export const templateConfig: ResumeTemplateConfig = {
  id: 'onePager',
  name: 'One-Pager Slide',
  description: 'A PowerPoint-style one-pager slide with a title, subtitle paragraph, table, and profile image. Perfect for brief introductions or executive summaries.',
  component: OnePagerTemplate as ComponentType<{ data: OnePagerData }>,
  outputSchema: OnePagerCoreDataSchema,
  componentSchema: OnePagerDataSchema,
};

export type OnePagerCoreData = z.infer<typeof OnePagerCoreDataSchema>;
export type OnePagerData = z.infer<typeof OnePagerDataSchema>; 