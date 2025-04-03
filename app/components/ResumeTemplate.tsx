import type { ResumeData } from "../config/resumeTemplates.config";
interface ResumeTemplateProps {
	data: ResumeData;
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
	const contactInfo = data.contactInfo;
	const education = data.education?.[0] ?? null;
	const skills = data.skills || [];

	const otherInfo = data.otherInfo;
	const languages = data.languages;

	return (
		<div className="resume-container print:w-full print:h-auto flex flex-col bg-white shadow-lg print:shadow-none">
			{/* Split layout with sidebar */}
			<div className="flex flex-row h-full flex-grow">
				{/* Left sidebar */}
				<div
					className="w-[30%] bg-gray-50 flex flex-col"
					style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
				>
					{/* Yellow contact section at top - Uses dynamic contactInfo */}
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
								{contactInfo.name.split(' ')[0]} {/* Simple split for first name */}
							</h1>
							<h1 className="text-3xl font-bold uppercase mb-0 leading-tight">
								{contactInfo.name.split(' ').slice(1).join(' ')} {/* Rest of name */} 
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
								<span className="mr-2">✉️</span> 
								<a href={`mailto:${contactInfo.email}`} className="hover:underline">{contactInfo.email}</a>
							</p>
							{contactInfo.portfolio && (
								<p className="flex items-center text-sm">
									<span className="mr-2">💼</span> 
									<a 
										href={contactInfo.portfolio.startsWith('http') ? contactInfo.portfolio : `https://${contactInfo.portfolio}`}
										target="_blank" 
										rel="noopener noreferrer"
										className="hover:underline"
									>
										{contactInfo.portfolio.replace(/^https?:\/\//, '')}
									</a>
								</p>
							)}
							<p className="flex items-center text-sm">
								<span className="mr-2">🔗</span> 
								<a 
									href={contactInfo.linkedin.startsWith('http') ? contactInfo.linkedin : `https://${contactInfo.linkedin}`}
									target="_blank" 
									rel="noopener noreferrer"
									className="hover:underline"
								>
									{contactInfo.linkedin.replace(/^https?:\/\//, '')} {/* Display without protocol */}
								</a>
							</p>
						</div>
					</div>

					{/* Rest of sidebar in grey */}
					<div className="p-5 pt-4">
						{education && (
							<>
								<h2 className="text-xl font-bold uppercase mb-2">EDUCATION</h2>
								<p className="font-bold text-sm">{education.degree}</p>
								<p className="text-sm">{education.institution}</p>
								<p className="text-sm">{education.dates}</p>
								<p className="text-sm">{education.location}</p>
							</>
						)}

						<h2 className="text-xl font-bold uppercase mt-5 mb-2">SKILLS</h2>

						{/* --- Dynamic Skills Section --- */}
						{skills.map((skillCategory) => (
							<div key={skillCategory.category} className="mb-3">
								<p className="font-bold text-gray-700 text-sm uppercase">{skillCategory.category}</p>
								<div className="space-y-0">
									{skillCategory.items.map((item) => (
										<p key={item.name} className="text-sm">
											{item.name}
											{item.context && (
												<span className="text-xs text-gray-500 ml-1">({item.context})</span>
											)}
										</p>
									))}
								</div>
							</div>
						))}
						{/* --- End Dynamic Skills Section --- */}

						{/* --- Dynamic Other Info Section (Optional) --- */}
						{otherInfo?.items?.length > 0 && (
							<>
								<h2 className="text-xl font-bold uppercase mt-5 mb-2">{otherInfo.title || 'OTHER'}</h2>
								{otherInfo.items.map((item) => (
									<p key={item} className="text-sm">{item}</p>
								))}
							</>
						)}
						{/* --- End Dynamic Other Info Section --- */}

						{/* --- Dynamic Languages Section (Optional) --- */}
						{languages && languages.length > 0 && (
							<div className="mt-3 flex items-center space-x-1">
								{languages.map((lang) => (
									<span key={lang} className="w-5 h-5">{lang}</span>
								))}
							</div>
						)}
						{/* --- End Dynamic Languages Section --- */}
					</div>
				</div>

				{/* Right content area - Work Experience */}
				<div className="w-[70%] p-8 overflow-y-auto flex-grow">
					<h2 className="text-2xl font-bold uppercase mb-6 border-b pb-1">WORK EXPERIENCE</h2>

					{data.workExperience.map((job) => (
						<div key={`job-${job.company}-${job.title}`} className="mb-6">
							<div className="mb-1">
								<div className="flex justify-between items-baseline mb-0.5">
									<span className="font-bold text-lg text-gray-900">{job.title}</span>
									<span className="text-sm text-gray-600 text-right flex-shrink-0 ml-4">{job.dates}</span>
								</div>
								<p className="text-sm text-gray-600">
									{job.company}, {job.location}
								</p>
							</div>

							{job.description.map((desc, idx) => (
								<p key={`desc-${job.company}-${idx}`} className="mb-2 text-gray-800">
									{desc}
								</p>
							))}

							{job.highlights && (
								<ul className="list-disc pl-5 mt-2 text-gray-700">
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
