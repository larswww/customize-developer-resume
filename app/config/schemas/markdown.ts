import { z } from "zod";
import type { ResumeTemplateConfig } from "./sharedTypes";
import MarkdownTemplate from "~/components/resume/templates/MarkdownTemplate";
import type { ComponentType } from "react";

export const MarkdownSchema = z.object({
	content: z
		.string()
		.describe(
			"Markdown formatted string. No code fences, no backticks, no commentary.",
		),
});

export type MarkdownData = z.infer<typeof MarkdownSchema>;

export const templateConfig: ResumeTemplateConfig = {
	id: "markdown",
	defaultWorkflowId: "document",
	name: "Markdown",
	description: "A markdown template",
	pages: 1,
	component: MarkdownTemplate as ComponentType<{
		data: MarkdownData;
	}>,
	outputSchema: MarkdownSchema,
	componentSchema: MarkdownSchema,
};
