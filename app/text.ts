export default {
	nav: {
		dashboard: "Dashboard",
		settings: "Work History",
		info: "About Me",
	},
	ui: {
		cancel: "Cancel",
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
		feedbackPlaceholder: "Enter feedback for the resume",
		saveChanges: "Save Changes",
		generateButton: "Re-Generate",
		regenerateButton: "Regenerate",
		editButton: "Edit Resume",
		downloadButton: "Download as PDF",
		printButton: "Print",
		emptyState: "Resume preview will appear here",
	},
} as const;
