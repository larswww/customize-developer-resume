// Re-export shared types for convenience
export * from "./sharedTypes";

// Import configurations from individual template files
import { templateConfig as defaultConfig } from './default';
import { templateConfig as simpleConsultantConfig } from './simpleConsultant';

// Export the configurations individually if needed
export { defaultConfig, simpleConsultantConfig };

// --- Aggregate Available Templates --- 

// Use the imported interface
import type { ResumeTemplateConfig } from './sharedTypes';

// Create the map of available templates
export const availableTemplates: Record<string, ResumeTemplateConfig> = {
  [defaultConfig.id]: defaultConfig,
  [simpleConsultantConfig.id]: simpleConsultantConfig,
};

// Get the ID of the default template
export const defaultTemplateId = defaultConfig.id; 