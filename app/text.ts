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
	landing: {
		heroHeadline: "Build your dev résumé—zero writer's block.",
		heroSub: "AI drafts your story. You refine. First PDF is free.",
		ctaGoogle: "Start free with Google",
		ctaLinkedIn: "Continue with LinkedIn",
		trustHook: "GDPR-compliant & open-source",
		socialProofAlt: "Featured in top tech blogs",
		pain1: "Blank page paralysis?",
		pain2: "Generic bullet points?",
		pain3: "Formatting headaches?",
		solution1: "One-click AI draft.",
		solution2: "Job-specific tailoring.",
		solution3: "Pixel-perfect exports.",
		benefit1:
			"Learns as you go – adds your context to improve every future draft.",
		benefit2:
			"Template variety – senior, junior, freelance, consultant & more.",
		benefit3:
			"Inline AI assistant – rewrite, expand or trim any bullet in seconds.",
		howItWorks: [
			{ step: "Import LinkedIn", desc: "Import your profile in one click." },
			{
				step: "Review AI Draft",
				desc: "Let AI draft your resume, you polish.",
			},
			{ step: "Download PDF", desc: "Export a recruiter-ready PDF instantly." },
		],
		features: [
			{
				tab: "Templates",
				bullets: [
					"Modern, proven layouts",
					"Dark & light modes",
					"Easy to switch anytime",
				],
			},
			{
				tab: "Keyword Matcher",
				bullets: [
					"ATS-friendly",
					"Job description scan",
					"Highlight missing skills",
				],
			},
			{
				tab: "Version Control",
				bullets: [
					"Track changes",
					"Duplicate & edit",
					"Restore previous versions",
				],
			},
		],
		testimonials: [
			{
				quote:
					"Went from nothing to a recruiter-ready resume during my coffee break.",
				name: "Samir",
				role: "Front-end Engineer",
			},
			{
				quote: "The AI suggestions saved me hours.",
				name: "Alex",
				role: "Full Stack Dev",
			},
			{
				quote: "Finally, a resume builder that gets developers.",
				name: "Jamie",
				role: "Backend Engineer",
			},
		],
		faq: [
			{
				q: "Is it really free?",
				a: "Your first PDF is free. No credit card required.",
			},
			{
				q: "Do you store my data?",
				a: "Your data is private and never sold. You control deletion.",
			},
			{
				q: "Is it ATS compatible?",
				a: "Yes, resumes are optimized for applicant tracking systems.",
			},
			{
				q: "Can I use my LinkedIn?",
				a: "Yes, import your LinkedIn profile in one click.",
			},
			{ q: "What about privacy?", a: "We are GDPR-compliant and open-source." },
		],
		secondaryCta: "Ready to ship your resume?",
		privacyPolicy:
			"Your privacy is important. We do not share your data with third parties. All information is securely stored and used only to generate your resume. For more details, contact support.",
	},
} as const;
