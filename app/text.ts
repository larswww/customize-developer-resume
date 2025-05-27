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
		},
		contactInfo: {
			legend: "Contact Information",
		},
		education: {
			legend: "Education",
		},
		projects: {
			legend: "Projects",
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
		},
		nav: {
			contactInfo: "Contact Info",
			education: "Education",
		},
	},
	dashboard: {
		createJob: {
			ctaButton: "Start Making",
			confirmButton: "Create custom Resume",
			link: "Job Link (Optional)",
			jobDescription: "Job Description",
			jobTitle: "Job Title",
		},
		viewJob: {
			viewJobButton: "View Job",
			resumeButton: "Resume",
		},
		sections: {
			createJob: "Create a new resumé",
			starred: "Most Recent Resumes",
			all: "All Jobs",
			starredEmpty: "You have no recent resumes yet.",
			allEmpty: "You don't have any resume jobs yet.",
			createPrompt:
				"Customize for different jobs, employers or any other context.",
		},
		jobsTable: {
			title: "Title",
			created: "Created",
			updated: "Updated",
			link: "Link",
			delete: "Remove",
			view: "Open",
		},
		contextButton: "Context",
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
