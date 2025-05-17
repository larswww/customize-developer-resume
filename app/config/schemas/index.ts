export * from "./sharedTypes";

import { templateConfig as consultantOnePagerConfig } from "./consultantOnePager";
import { templateConfig as defaultConfig } from "./default";
import { templateConfig as simpleConsultantConfig } from "./simple";
import { templateConfig as standardResumeConfig } from "./standardResume";

export {
	defaultConfig,
	simpleConsultantConfig,
	consultantOnePagerConfig,
	standardResumeConfig,
};

import type { ResumeTemplateConfig } from "./sharedTypes";

export const availableTemplates: Record<string, ResumeTemplateConfig> = {
	[defaultConfig.id]: defaultConfig,
	[simpleConsultantConfig.id]: simpleConsultantConfig,
	[consultantOnePagerConfig.id]: consultantOnePagerConfig,
	[standardResumeConfig.id]: standardResumeConfig,
};

export const defaultTemplateId = defaultConfig.id;
