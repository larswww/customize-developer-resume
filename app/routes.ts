import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";
import { SETTINGS_KEYS } from "./config/constants";

export default [
	layout("components/AppLayout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),

		route("job/:jobId", "routes/resume/job.tsx", [
			route("resume", "routes/resume/resume.tsx"),
		]),

		route("settings", "routes/settings.tsx", [
			index("routes/settings.contact.tsx"),
			route(SETTINGS_KEYS.EDUCATION, "routes/settings.education.tsx"),
		]),

		route("career", "routes/settings.work-history.tsx"),
	]),
	route("export-pdf", "routes/export-pdf.tsx"),
	index("routes/index.tsx"),
] satisfies RouteConfig;
