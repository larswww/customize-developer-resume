import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("components/AppLayout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),

		layout("routes/resume/job.tsx", [
			route("job/:jobId", "routes/resume/content.tsx", [
				route("resume", "routes/resume/resume.tsx"),
			]),
		]),

		route("settings/work-history", "routes/settings.work-history.tsx"),
	]),
	route("export-pdf", "routes/export-pdf.tsx"),
	index("routes/index.tsx"),
] satisfies RouteConfig;
