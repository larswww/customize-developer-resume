import React from "react";

// Define the structured data interfaces
export interface WorkExperience {
	title: string;
	company: string;
	location: string;
	dates: string;
	description: string[];
	highlights?: string[];
}

export interface Education {
	degree: string;
	institution: string;
	dates: string;
	location: string;
}

export interface Skill {
	category: string;
	items: string[];
}

export interface ContactInfo {
	name: string;
	title: string;
	location: string;
	phone: string;
	email: string;
	github: string;
	linkedin: string;
}

export interface ResumeData {
	contactInfo: ContactInfo;
	workExperience: WorkExperience[];
	education: Education[];
	skills: Skill[];
	otherInfo?: {
		title: string;
		items: string[];
	};
	languages?: string[];
}

interface ResumeTemplateProps {
	data: ResumeData;
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
	// Hardcoded contact info (can be replaced with data from props if needed)
	const contactInfo = {
		name: "LARS WÖLDERN",
		title: "Product Engineer",
		location: "Amsterdam & Remote",
		phone: "+31 6 2526 6752",
		email: "lars@productworks.nl",
		github: "github.com/larswww",
		linkedin: "linkedin.com/in/larswo",
	};

	return (
		<div className="resume-container w-[8.5in] h-[11in] flex flex-col bg-white shadow-lg print:shadow-none">
			{/* Split layout with sidebar */}
			<div className="flex flex-row h-full">
				{/* Left sidebar */}
				<div
					className="w-[30%] bg-gray-50 flex flex-col"
					style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
				>
					{/* Yellow contact section at top */}
					<div
						className="bg-yellow-300 p-5 pb-5"
						style={{
							WebkitPrintColorAdjust: "exact",
							printColorAdjust: "exact",
							backgroundColor: "#FFEB3B",
						}}
					>
						<div className="mb-3">
							<h1 className="text-3xl font-bold uppercase leading-tight">
								LARS
							</h1>
							<h1 className="text-3xl font-bold uppercase mb-0 leading-tight">
								WÖLDERN
							</h1>
							<p className="text-lg italic">{contactInfo.title}</p>
						</div>

						<div className="space-y-0.5">
							<p className="flex items-center text-sm">
								<span className="mr-2">📍</span> {contactInfo.location}
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">📞</span> {contactInfo.phone}
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">✉️</span> {contactInfo.email}
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">🔗</span> {contactInfo.github}
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">🔗</span> {contactInfo.linkedin}
							</p>
						</div>
					</div>

					{/* Rest of sidebar in grey */}
					<div className="p-5 pt-4">
						<h2 className="text-xl font-bold uppercase mb-2">EDUCATION</h2>
						<p className="font-bold text-sm">B.S. Computer Science</p>
						<p className="text-sm">Linnaeus University</p>
						<p className="text-sm">2015-2018</p>
						<p className="text-sm">Kalmar, Sweden</p>

						<h2 className="text-xl font-bold uppercase mt-5 mb-2">SKILLS</h2>

						{/* Frontend skills */}
						<div className="mb-3">
							<p className="font-bold text-gray-700 text-sm">Frontend</p>
							<div className="space-y-0">
								<p className="text-sm">TypeScript</p>
								<p className="text-sm">E2E Testing</p>
								<p className="text-sm">Frontend & Frameworks (React/Vue)</p>
								<p className="text-sm">Mobile-first</p>
								<p className="text-sm">Browser APIs & Service Workers</p>
								<p className="text-sm">SEO & Performance</p>
							</div>
						</div>

						{/* Backend skills */}
						<div className="mb-3">
							<p className="font-bold text-gray-700 text-sm">Backend</p>
							<div className="space-y-0">
								<p className="text-sm">Python</p>
								<p className="text-sm">Postgres & SQL modelling</p>
								<p className="text-sm">Docker & multi-container deploy</p>
								<p className="text-sm">AWS & Cloud</p>
								<p className="text-sm">DevOps & Release strategies</p>
							</div>
						</div>

						{/* Soft skills */}
						<div className="mb-3">
							<p className="font-bold text-gray-700 text-sm">Soft</p>
							<div className="space-y-0">
								<p className="text-sm">Client Relationship Management</p>
								<p className="text-sm">Team Leadership</p>
								<p className="text-sm">Design Sprint</p>
								<p className="text-sm">Agile</p>
							</div>
						</div>

						<h2 className="text-xl font-bold uppercase mt-5 mb-2">OTHER</h2>
						<p className="text-sm">Volunteer at HackYourFuture</p>

						<div className="mt-3 flex items-center space-x-1">
							<span className="w-5 h-5">🇸🇪</span>
							<span className="w-5 h-5">🇬🇧</span>
							<span className="w-5 h-5">🇳🇱</span>
						</div>
					</div>
				</div>

				{/* Right content area */}
				<div className="w-[70%] p-8">
					<h2 className="text-2xl font-bold uppercase mb-6">WORK EXPERIENCE</h2>

					{data.workExperience.map((job) => (
						<div key={`job-${job.company}-${job.title}`} className="mb-8">
							<div className="mb-2">
								<div className="flex justify-between items-baseline">
									<span className="font-bold text-lg">{job.title},</span>
									<span className="text-right">{job.dates}</span>
								</div>
								<p>
									{job.company}, {job.location}
								</p>
							</div>

							{job.description.map((desc, idx) => (
								<p key={`desc-${job.company}-${idx}`} className="mb-2">
									{desc}
								</p>
							))}

							{job.highlights && (
								<ul className="list-disc pl-5 mt-2">
									{job.highlights.map((highlight, idx) => (
										<li
											key={`highlight-${job.company}-${idx}`}
											className="mb-1"
										>
											{highlight}
										</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
