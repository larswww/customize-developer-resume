import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";
import { SETTINGS_KEYS } from "./config/constants";

export default [
	index("routes/index.tsx"),

	layout("components/AppLayout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),

		route("job/:jobId", "routes/resume/job.tsx", [
			index("routes/resume/templates.tsx"),
			route(":templateId", "routes/resume/resume.tsx"),
		]),

		route("settings", "routes/settings/index.tsx", [
			index("routes/settings/contact.tsx"),
			route(SETTINGS_KEYS.EDUCATION, "routes/settings/education.tsx"),
			route(SETTINGS_KEYS.EXPERIENCE, "routes/settings/experience.tsx"),
			route(SETTINGS_KEYS.PROJECTS, "routes/settings/projects.tsx"),
		]),
	]),

	// resource routes
	route("export-pdf", "routes/export-pdf.tsx"),
	route("merge-import", "routes/merge-import.tsx"),
] satisfies RouteConfig;
