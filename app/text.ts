export default {
	nav: {
		dashboard: "Dashboard",
		settings: "Work History",
		info: "About Me",
	},
	ui: {
		delete: "Delete",
		generating: "Generating...",
		complete: "Complete",
	},
	settings: {
		workHistory: {
			buttonText: "Save Work History",
		},
		contactInfo: {
			legend: "Contact Information",
			buttonText: "Save Contact Info",
		},
		education: {
			legend: "Education",
			buttonText: "Save Education",
		},
		nav: {
			contactInfo: "Contact Info",
			education: "Education",
		},
	},
	dashboard: {
		createJob: {
			ctaButton: "Create New Job",
			confirmButton: "Create Job",
			link: "Job Link (Optional)",
			jobDescription: "Job Description",
		},
		viewJob: {
			viewJobButton: "View Job",
			resumeButton: "Resume",
		},
	},
	content: {
		generateButton: "Generate Resume Text",
		regenerateButton: "Regenerate Resume Text",
	},
	resume: {
		saveChanges: "Save Changes",
		generateButton: "Generate Resume",
		regenerateButton: "Regenerate Resume",
		editButton: "Edit Resume",
		downloadButton: "Download as PDF",
		printButton: "Print",
		emptyState: "Resume preview will appear here",
	},
} as const;
