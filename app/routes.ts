import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Add routes for all available resume tools
export default [
	route("dashboard", "routes/dashboard.tsx"),
	route("job/:jobId/content", "routes/job.$jobId.content.tsx"),
	route("job/:jobId/resume", "routes/job.$jobId.resume.tsx"),
	route("settings/work-history", "routes/settings.work-history.tsx"),
	route("resume-editor", "routes/resume-editor.tsx"),
	route("structured-resume", "routes/structured-resume.tsx"),
	route("export-pdf", "routes/export-pdf.tsx"),
	index("routes/index.tsx"), // Redirect to dashboard from the index page
] satisfies RouteConfig;
