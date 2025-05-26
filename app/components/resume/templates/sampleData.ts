import type { ConsultantOnePagerData } from "~/config/schemas/consultantOnePager";
import type { DefaultResumeData } from "~/config/schemas/default";
import type { SimpleConsultantComponentData } from "~/config/schemas/simple";
import type { StandardResumeData } from "~/config/schemas/standardResume";

export const defaultSampleData: DefaultResumeData = {
	contactInfo: {
		firstName: "John",
		lastName: "Doe",
		title: "Software Engineer",
		email: "john.doe@email.com",
		phone: "+1 (555) 123-4567",
		location: "San Francisco, CA",
		linkedin: "https://linkedin.com/in/johndoe",
		portfolio: "https://johndoe.dev",
	},
	education: {
		educations: [
			{
				degree: "Bachelor of Science in Computer Science",
				institution: "University of California",
				dates: "2018 - 2022",
				location: "Berkeley, CA",
			},
			{
				degree: "Minor in Data Science",
				institution: "University of California",
				dates: "2018 - 2022",
				location: "Berkeley, CA",
			},
			{
				degree: "Exchange Semester in Computer Engineering",
				institution: "ETH Zurich",
				dates: "Spring 2021",
				location: "Zurich, Switzerland",
			},
			{
				degree: "Certificate in Cloud Computing",
				institution: "Coursera",
				dates: "2020",
				location: "Online",
			},
		],
	},
	workExperience: [
		{
			title: "Senior Software Engineer",
			company: "Tech Corp",
			location: "San Francisco, CA",
			dates: "Jan 2023 - Present",
			description: [
				"Led development of scalable web applications serving 1M+ users",
				"Implemented microservices architecture reducing system latency by 40%",
				"Coordinated cross-team efforts for major product launches",
			],
			highlights: [
				"Promoted to senior role within 18 months",
				"Mentored 3 junior developers",
				"Awarded Employee of the Quarter (Q2 2023)",
				"Presented at company-wide tech summit on scalable architecture",
			],
		},
		{
			title: "Software Engineer",
			company: "StartupXYZ",
			location: "Palo Alto, CA",
			dates: "Jun 2022 - Dec 2022",
			description: [
				"Built full-stack applications using React and Node.js",
				"Collaborated with design team to implement responsive UI components",
				"Integrated third-party APIs for payment and authentication",
			],
		},
		{
			title: "Software Engineering Intern",
			company: "Innovatech",
			location: "San Jose, CA",
			dates: "Jun 2021 - Aug 2021",
			description: [
				"Developed internal tools for data analysis and reporting",
				"Automated deployment pipelines using GitHub Actions",
				"Wrote unit and integration tests for backend services",
			],
		},
		{
			title: "Teaching Assistant",
			company: "University of California, Berkeley",
			location: "Berkeley, CA",
			dates: "Sep 2020 - May 2021",
			description: [
				"Assisted in teaching Data Structures and Algorithms course",
				"Held weekly office hours and graded assignments for 100+ students",
				"Organized coding interview prep workshops",
			],
		},
		{
			title: "Freelance Web Developer",
			company: "Self-Employed",
			location: "Remote",
			dates: "2019 - 2020",
			description: [
				"Designed and built websites for small businesses and non-profits",
				"Provided SEO and analytics consulting",
			],
		},
	],
	skills: [
		{
			category: "Frontend",
			items: [
				{ name: "React", context: "3+ years" },
				{ name: "TypeScript", context: "2+ years" },
				{ name: "CSS/Tailwind", context: "3+ years" },
				{ name: "Next.js", context: "2 years" },
				{ name: "Redux", context: "2 years" },
			],
		},
		{
			category: "Backend",
			items: [
				{ name: "Node.js", context: "2+ years" },
				{ name: "PostgreSQL", context: "2+ years" },
				{ name: "AWS", context: "1+ year" },
				{ name: "Python", context: "2 years" },
				{ name: "Express.js", context: "2 years" },
			],
		},
		{
			category: "DevOps & Tools",
			items: [
				{ name: "Docker", context: "1 year" },
				{ name: "Git", context: "4 years" },
				{ name: "Jest", context: "2 years" },
				{ name: "Cypress", context: "1 year" },
				{ name: "GitHub Actions", context: "1 year" },
			],
		},
		{
			category: "Other",
			items: [
				{ name: "Agile/Scrum", context: "2 years" },
				{ name: "Figma", context: "1 year" },
			],
		},
	],
	projects: {
		projects: [
			{
				title: "E-commerce Platform",
				date: "2023",
				description:
					"Built a full-stack e-commerce platform with React and Node.js",
				link: "https://github.com/johndoe/ecommerce",
			},
			{
				title: "Personal Portfolio Website",
				date: "2022",
				description:
					"Designed and developed a personal portfolio website using Next.js and Tailwind CSS",
				link: "https://johndoe.dev",
			},
			{
				title: "Open Source CLI Tool",
				date: "2021",
				description:
					"Created a CLI tool for automating code formatting and linting",
				link: "https://github.com/johndoe/cli-tool",
			},
			{
				title: "Hackathon Project: Smart Scheduler",
				date: "2020",
				description:
					"Developed a smart scheduling app that won 2nd place at CalHacks",
			},
			{
				title: "Blog Platform",
				date: "2020",
				description:
					"Built a markdown-based blog platform with user authentication and comments",
				link: "https://github.com/johndoe/blog-platform",
			},
			{
				title: "Data Visualization Dashboard",
				date: "2021",
				description:
					"Created a dashboard for visualizing large datasets using D3.js and React",
			},
		],
	},
	other: {
		items: [
			"Fluent in English and Spanish",
			"AWS Certified Developer",
			"Volunteer: Code for Good (2021-present)",
			"Speaker: React Summit 2022",
			"Hobbies: Photography, Hiking, Chess",
			"Member: ACM Student Chapter",
			"Hackathon Mentor (2022-2023)",
		],
	},
};

export const simpleSampleData: SimpleConsultantComponentData = {
	contactInfo: {
		firstName: "Jane",
		lastName: "Smith",
		title: "Management Consultant",
		email: "jane.smith@email.com",
		phone: "+1 (555) 987-6543",
		location: "New York, NY",
		linkedin: "https://linkedin.com/in/janesmith",
	},
	education: {
		educations: [
			{
				degree: "MBA",
				institution: "Harvard Business School",
				dates: "2020 - 2022",
				location: "Boston, MA",
			},
			{
				degree: "BSc in Economics",
				institution: "Columbia University",
				dates: "2016 - 2020",
				location: "New York, NY",
			},
		],
	},
	summary:
		"Experienced management consultant with 5+ years helping Fortune 500 companies optimize operations and drive strategic growth. Proven track record of delivering measurable results through data-driven insights and stakeholder collaboration.",
	employmentHistory: [
		{
			employer: "McKinsey & Company",
			title: "Senior Consultant",
			location: "New York, NY",
			dates: "Sep 2022 - Present",
			projects: [
				{
					client: "Fortune 500 Retailer",
					description: [
						"Led digital transformation initiative resulting in 25% increase in online sales",
						"Developed omnichannel strategy connecting online and offline customer experiences",
					],
					skillsUsed: [
						"Strategic Planning",
						"Digital Transformation",
						"Data Analysis",
					],
				},
				{
					client: "Technology Startup",
					description: [
						"Designed go-to-market strategy for new product launch",
						"Conducted market research and competitive analysis",
					],
					skillsUsed: [
						"Market Research",
						"Product Strategy",
						"Competitive Analysis",
					],
				},
			],
		},
		{
			employer: "Deloitte",
			title: "Consultant",
			location: "Boston, MA",
			dates: "Jul 2020 - Aug 2022",
			projects: [
				{
					client: "Healthcare Provider",
					description: [
						"Streamlined patient onboarding process, reducing wait times by 30%",
						"Implemented data analytics dashboard for executive reporting",
					],
					skillsUsed: [
						"Process Improvement",
						"Stakeholder Management",
						"Data Visualization",
					],
				},
				{
					client: "Financial Services Firm",
					description: [
						"Facilitated post-merger integration for two regional banks",
						"Developed change management plan adopted by 200+ employees",
					],
					skillsUsed: ["Change Management", "Integration", "Training"],
				},
			],
		},
	],
	templateSections: {
		experienceTitle: "Professional Experience",
		educationTitle: "Education",
	},
	projects: {
		projects: [
			{
				title: "Digital Transformation Framework",
				date: "2023",
				description:
					"Developed a comprehensive framework for digital transformation initiatives",
			},
			{
				title: "Cost Optimization Playbook",
				date: "2022",
				description:
					"Created a playbook for cost optimization used by 5+ client organizations",
			},
			{
				title: "Market Entry Strategy for SaaS",
				date: "2021",
				description:
					"Designed a market entry strategy for a SaaS company expanding to Europe",
			},
		],
	},
	other: {
		items: [
			"Certified Management Consultant (CMC)",
			"Fluent in English and French",
			"Proficient in Tableau and Power BI",
			"Volunteer: New York Food Bank (2021-present)",
		],
	},
};

export const consultantOnePagerSampleData: ConsultantOnePagerData = {
	contactInfo: {
		firstName: "Michael",
		lastName: "Johnson",
		title: "Strategy Consultant",
		email: "m.johnson@email.com",
		phone: "+1 (555) 456-7890",
		location: "Chicago, IL",
		linkedin: "https://linkedin.com/in/michaeljohnson",
	},
	language: "English",
	title: "Senior Strategy Consultant",
	subtitle:
		"Transforming businesses through data-driven insights and strategic innovation. Specialized in digital transformation and operational excellence for Fortune 500 companies.",
	highlightHeadline: "Key Achievements",
	highlights: [
		"Led $50M+ digital transformation initiatives across healthcare and technology sectors",
		"Delivered 35% operational efficiency improvements through process optimization",
		"Managed cross-functional teams of 15+ professionals across multiple client engagements",
		"Developed strategic frameworks adopted by 3 Fortune 500 companies",
	],
	expertiseHeadline: "Core Expertise",
	expertise: [
		"Strategic Planning",
		"Digital Transformation",
		"Process Optimization",
		"Change Management",
		"Data Analytics",
		"Stakeholder Management",
		"Business Development",
		"Operational Excellence",
	],
	profileText:
		"Michael is a seasoned strategy consultant with over 8 years of experience helping Fortune 500 companies navigate complex business challenges. His expertise spans digital transformation, operational excellence, and strategic planning. At Bain & Company, he has successfully led numerous high-impact engagements, consistently delivering measurable results that drive sustainable growth. Michael combines analytical rigor with practical implementation experience, making him a trusted advisor to C-suite executives across various industries.",
	companyName: "Target Company",
};

export const standardResumeSampleData: StandardResumeData = {
	contactInfo: {
		firstName: "Alex",
		lastName: "Chen",
		title: "Full Stack Developer",
		email: "alex.chen@email.com",
		phone: "+1 (555) 234-5678",
		location: "Seattle, WA",
		linkedin: "https://linkedin.com/in/alexchen",
		portfolio: "https://alexchen.dev",
	},
	education: {
		educations: [
			{
				degree: "Bachelor of Science in Computer Science",
				institution: "University of Washington",
				dates: "2019 - 2023",
				location: "Seattle, WA",
			},
			{
				degree: "Minor in Mathematics",
				institution: "University of Washington",
				dates: "2019 - 2023",
				location: "Seattle, WA",
			},
		],
	},
	workExperience: [
		{
			title: "Senior Full Stack Developer",
			company: "TechFlow Inc",
			location: "Seattle, WA",
			dates: "Mar 2023 - Present",
			accomplishments: [
				"Architected and implemented microservices platform serving 2M+ daily active users with 99.9% uptime",
				"Led team of 4 developers to deliver customer dashboard reducing support tickets by 45%",
				"Optimized database queries and caching strategies improving API response times by 60%",
				"Mentored junior developers and organized monthly tech talks",
			],
		},
		{
			title: "Software Engineer",
			company: "StartupLab",
			location: "Bellevue, WA",
			dates: "Jun 2022 - Feb 2023",
			accomplishments: [
				"Built real-time collaboration features using WebSocket technology for 10K+ concurrent users",
				"Implemented automated testing pipeline increasing code coverage from 40% to 85%",
				"Developed mobile-responsive React components adopted across 8 product teams",
				"Wrote technical documentation and onboarding guides for new hires",
			],
		},
		{
			title: "Software Engineering Intern",
			company: "CloudNova",
			location: "Remote",
			dates: "Jun 2021 - Aug 2021",
			accomplishments: [
				"Developed internal dashboard for cloud resource monitoring",
				"Automated deployment scripts using GitHub Actions and Docker",
			],
		},
	],
	technologyCategories: [
		{
			category: "Languages & Frameworks",
			item: "TypeScript, React, Node.js, Python, Next.js, Express.js, Java, Go",
		},
		{
			category: "Databases & Cloud",
			item: "PostgreSQL, Redis, MongoDB, AWS (EC2, S3, Lambda), Docker, Azure",
		},
		{
			category: "Tools & Technologies",
			item: "Git, Jest, Cypress, Webpack, GraphQL, REST APIs, Figma, Jira, Linux",
		},
	],
	projects: {
		projects: [
			{
				title: "Open Source React Library",
				date: "2023",
				description:
					"Created and maintained a React component library with 1K+ GitHub stars",
				link: "https://github.com/alexchen/react-components",
			},
			{
				title: "Personal Finance Tracker App",
				date: "2022",
				description:
					"Developed a cross-platform app for tracking expenses and budgets",
				link: "https://github.com/alexchen/finance-tracker",
			},
			{
				title: "Hackathon Winner: Smart Home Automation",
				date: "2021",
				description:
					"Built a smart home automation system using IoT devices and a custom dashboard",
			},
		],
	},
	other: {
		items: [
			"AWS Certified Solutions Architect",
			"Active contributor to open source projects",
			"Fluent in English and Mandarin",
			"Volunteer: Seattle CoderDojo (2022-present)",
		],
	},
};

export const getSampleDataForTemplate = (
	templateId: string,
):
	| DefaultResumeData
	| SimpleConsultantComponentData
	| ConsultantOnePagerData
	| StandardResumeData => {
	switch (templateId) {
		case "simpleConsultant":
			return simpleSampleData;
		case "consultantOnePager":
			return consultantOnePagerSampleData;
		case "standardResume":
			return standardResumeSampleData;
		default:
			return defaultSampleData;
	}
};
