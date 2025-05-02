export * from "./sharedTypes";

import { templateConfig as consultantOnePagerConfig } from "./consultantOnePager";
import { templateConfig as defaultConfig } from "./default";
import { templateConfig as simpleConsultantConfig } from "./simple";

export { defaultConfig, simpleConsultantConfig, consultantOnePagerConfig };

import type { ResumeTemplateConfig } from "./sharedTypes";

export const availableTemplates: Record<string, ResumeTemplateConfig> = {
	[defaultConfig.id]: defaultConfig,
	[simpleConsultantConfig.id]: simpleConsultantConfig,
	[consultantOnePagerConfig.id]: consultantOnePagerConfig,
};

export const defaultTemplateId = defaultConfig.id;
