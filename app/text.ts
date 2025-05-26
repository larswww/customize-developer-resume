export default {
	nav: {
		dashboard: "Resumes",
		career: "Career",
	},
	ui: {
		cancel: "Cancel",
		delete: "Delete",
		generating: "Generating...",
		complete: "Complete",
		failed: "Failed",
		save: "Save",
	},
	settings: {
		workHistory: {
			legend: "Work Experience",
			buttonText: "Save Work Experience",
		},
		contactInfo: {
			legend: "Contact Information",
			buttonText: "Save Contact Info",
		},
		education: {
			legend: "Education",
			buttonText: "Save Education",
		},
		projects: {
			legend: "Projects",
			buttonText: "Save Projects",
			project: {
				legend: "Project",
				description: "Details about the project",
				title: "Title",
				date: "Date",
				link: "Link",
				removeProject: "Remove Project",
				addProject: "Add Project",
			},
		},
		other: {
			legend: "Other Information",
			buttonText: "Save Other Information",
		},
		nav: {
			contactInfo: "Contact Info",
			education: "Education",
		},
	},
	dashboard: {
		createJob: {
			ctaButton: "Create New Job",
			confirmButton: "Create custom Resume",
			link: "Job Link (Optional)",
			jobDescription: "Job Description",
		},
		viewJob: {
			viewJobButton: "View Job",
			resumeButton: "Resume",
		},
		sections: {
			createJob: "Create a New Resume Job",
			starred: "Starred Resumes",
			all: "All Resumes",
			starredEmpty: "You have no starred resumes yet.",
			allEmpty: "You don't have any resume jobs yet.",
			createPrompt: "Start by creating your first resume job.",
		},
	},
	template: {
		title: "Choose a template",
	},
	content: {
		generateButton: "Generate Resume Text",
		regenerateButton: "Regenerate Resume Text",
	},
	resume: {
		feedbackPlaceholder: "Enter feedback for the resume",
		saveChanges: "Save Changes",
		generateButton: "Assistant",
		regenerateButton: "Regenerate",
		editButton: "Edit Resume",
		downloadButton: "Download as PDF",
		printButton: "Print",
		emptyState: "Resume preview will appear here",
	},
} as const;
