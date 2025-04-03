import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

// Add routes for all available resume tools
export default [
	// Use the AppLayout for the main application routes
	layout("components/AppLayout.tsx", [
		route("dashboard", "routes/dashboard.tsx"),
		route("job/:jobId/content", "routes/job.$jobId.content.tsx"),
		route("job/:jobId/resume", "routes/job.$jobId.resume.tsx"),
		route("settings/work-history", "routes/settings.work-history.tsx"),
		route("resume-editor", "routes/resume-editor.tsx"),
		route("structured-resume", "routes/structured-resume.tsx"),
		// Note: export-pdf might not need the layout depending on its function
	]),
	// Routes outside the main layout (if any)
	route("export-pdf", "routes/export-pdf.tsx"), 
	index("routes/index.tsx"), // Redirect to dashboard from the index page remains outside layout
] satisfies RouteConfig;
