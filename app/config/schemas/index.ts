export * from "./sharedTypes";

import { templateConfig as consultantOnePagerConfig } from "./consultantOnePager";
import { templateConfig as defaultConfig } from "./default";
import { templateConfig as simpleConsultantConfig } from "./simple";
import { templateConfig as standardResumeConfig } from "./standardResume";
import { templateConfig as markdownConfig } from "./markdown";

export {
	defaultConfig,
	simpleConsultantConfig,
	consultantOnePagerConfig,
	standardResumeConfig,
	markdownConfig,
};

import type { ResumeTemplateConfig } from "./sharedTypes";

export const availableTemplates: Record<string, ResumeTemplateConfig> = {
	[defaultConfig.id]: defaultConfig,
	[simpleConsultantConfig.id]: simpleConsultantConfig,
	[consultantOnePagerConfig.id]: consultantOnePagerConfig,
	[standardResumeConfig.id]: standardResumeConfig,
	[markdownConfig.id]: markdownConfig,
};

export const defaultTemplateId = defaultConfig.id;
