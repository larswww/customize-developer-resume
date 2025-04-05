import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	layout("components/AppLayout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),
		
		layout("routes/job.tsx", [
			route("job/:jobId", "routes/content.tsx", [
				route("resume", "routes/resume.tsx"),

			]),
		]),
		
		route("settings/work-history", "routes/settings.work-history.tsx"),
	]),
	route("export-pdf", "routes/export-pdf.tsx"), 
	index("routes/index.tsx"), 
] satisfies RouteConfig;
