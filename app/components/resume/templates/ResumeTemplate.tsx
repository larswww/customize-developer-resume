import type { DefaultResumeData } from "~/config/schemas/default";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";

interface ResumeTemplateProps {
	data: DefaultResumeData;
	onDataChange: (path: (string | number)[], value: string) => void;
	onItemDelete: (path: (string | number)[]) => void;
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
								<TextWrap
									text={contactInfo.firstName ?? ""}
									name="contactInfo.firstName"
									label="First Name"
								/>
							</h1>
							<h1 className="text-3xl font-bold uppercase mb-0 leading-tight">
								<TextWrap
									text={contactInfo.lastName ?? ""}
									name="contactInfo.lastName"
									label="Last Name"
								/>
							</h1>
							<p className="text-lg italic">
								<TextWrap
									text={contactInfo.title}
									name="contactInfo.title"
									label="Title"
								/>
							</p>
						</div>

						<div className="space-y-0.5">
							<p className="flex items-center text-sm">
								<span className="mr-2">📍</span>{" "}
								<TextWrap
									text={contactInfo.location}
									name="contactInfo.location"
									label="Location"
								/>
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">📞</span>{" "}
								<TextWrap
									text={contactInfo.phone}
									name="contactInfo.phone"
									label="Phone"
								/>
							</p>
							<p className="flex items-center text-sm">
								<span className="mr-2">✉️</span>
								<a
									href={`mailto:${contactInfo.email}`}
									className="hover:underline"
								>
									<TextWrap
										text={contactInfo.email}
										name="contactInfo.email"
										label="Email"
										alternativeValue={contactInfo.email}
									/>
								</a>
							</p>
							{contactInfo.portfolio && (
								<p className="flex items-center text-sm">
									<span className="mr-2">💼</span>
									<a
										href={contactInfo.portfolio}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:underline"
									>
										<TextWrap
											text="Portfolio"
											name="contactInfo.portfolio"
											label="Portfolio"
											alternativeValue={contactInfo.portfolio}
										/>
									</a>
								</p>
							)}
							<p className="flex items-center text-sm">
								<span className="mr-2">🔗</span>
								<a
									href={contactInfo.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									<TextWrap
										text="LinkedIn"
										name="contactInfo.linkedin"
										label="LinkedIn"
										alternativeValue={contactInfo.linkedin}
									/>
								</a>
							</p>
						</div>
					</div>

					{/* Rest of sidebar in grey */}
					<div className="p-5 pt-4">
						{education && (
							<>
								<h2 className="text-xl font-bold uppercase mb-2">
									<TextWrap
										text="EDUCATION"
										name="education.title"
										label="Education Section Title"
									/>
								</h2>
								<p className="font-bold text-sm">
									<TextWrap
										text={education.degree}
										name="education[0].degree"
										label="Degree"
									/>
								</p>
								<p className="text-sm">
									<TextWrap
										text={education.institution}
										name="education[0].institution"
										label="Institution"
									/>
								</p>
								<p className="text-sm">
									<TextWrap
										text={education.dates}
										name="education[0].dates"
										label="Dates"
									/>
								</p>
								<p className="text-sm">
									<TextWrap
										text={education.location}
										name="education[0].location"
										label="Location"
									/>
								</p>
							</>
						)}

						<h2 className="text-xl font-bold uppercase mt-5 mb-2">
							<TextWrap
								text="SKILLS"
								name="skillsTitle"
								label="Skills Section Title"
							/>
						</h2>

						{/* --- Dynamic Skills Section --- */}
						<ArrayRenderer
							items={skills}
							getKey={(skillCategory) => skillCategory.category}
							renderItem={(skillCategory, categoryIndex) => (
								<div className="mb-3">
									<p className="font-bold text-gray-700 text-sm uppercase">
										<TextWrap
											text={skillCategory.category}
											name={`skills[${categoryIndex}].category`}
											label="Skill Category"
										/>
									</p>
									<div className="space-y-0">
										<ArrayRenderer
											items={skillCategory.items}
											getKey={(item) => item.name}
											renderItem={(item, itemIndex) => (
												<p className="text-sm">
													<TextWrap
														text={item.name}
														name={`skills[${categoryIndex}].items[${itemIndex}].name`}
														label="Skill Name"
													/>
													{item.context && (
														<span className="text-xs text-gray-500 ml-1">
															(
															<TextWrap
																text={item.context}
																name={`skills[${categoryIndex}].items[${itemIndex}].context`}
																label="Skill Context"
															/>
															)
														</span>
													)}
												</p>
											)}
										/>
									</div>
								</div>
							)}
						/>
						{/* --- End Dynamic Skills Section --- */}

						{/* --- Dynamic Other Info Section (Optional) --- */}
						{otherInfo?.items?.length ? (
							<>
								<h2 className="text-xl font-bold uppercase mt-5 mb-2">
									<TextWrap
										text={otherInfo.title || "OTHER"}
										name="otherInfo.title"
										label="Other Info Section Title"
									/>
								</h2>
								<ArrayRenderer
									items={otherInfo.items}
									getKey={(item, index) => `${item}-${index}`}
									renderItem={(item, index) => (
										<p className="text-sm">
											<TextWrap
												text={item}
												name={`otherInfo.items[${index}]`}
												label="Other Info Item"
											/>
										</p>
									)}
								/>
							</>
						) : null}
						{/* --- End Dynamic Other Info Section --- */}

						{/* --- Dynamic Languages Section (Optional) --- */}
						{languages && languages.length > 0 && (
							<div className="mt-3 flex items-center space-x-1">
								<ArrayRenderer
									items={languages}
									getKey={(lang, index) => `${lang}-${index}`}
									renderItem={(lang, index) => (
										<span className="w-5 h-5">
											<TextWrap
												text={lang}
												name={`languages[${index}]`}
												label="Language"
											/>
										</span>
									)}
								/>
							</div>
						)}
						{/* --- End Dynamic Languages Section --- */}
					</div>
				</div>

				{/* Right content area - Work Experience */}
				<div className="w-[70%] p-8 overflow-y-auto flex-grow">
					<h2 className="text-2xl font-bold uppercase mb-6 border-b pb-1">
						<TextWrap
							text="WORK EXPERIENCE"
							name="workExperienceTitle"
							label="Work Experience Section Title"
						/>
					</h2>

					<ArrayRenderer
						items={data.workExperience}
						getKey={(job, index) => `job-${job.company}-${job.title}-${index}`}
						renderItem={(job, jobIndex) => (
							<div className="mb-6">
								<div className="mb-1">
									<div className="flex justify-between items-baseline mb-0.5">
										<span className="font-bold text-lg text-gray-900">
											<TextWrap
												text={job.title}
												name={`workExperience[${jobIndex}].title`}
												label="Job Title"
											/>
										</span>
										<span className="text-sm text-gray-600 text-right flex-shrink-0 ml-4">
											<TextWrap
												text={job.dates}
												name={`workExperience[${jobIndex}].dates`}
												label="Job Dates"
											/>
										</span>
									</div>
									<p className="text-sm text-gray-600">
										<TextWrap
											text={job.company}
											name={`workExperience[${jobIndex}].company`}
											label="Company"
										/>
										,{" "}
										<TextWrap
											text={job.location}
											name={`workExperience[${jobIndex}].location`}
											label="Job Location"
										/>
									</p>
								</div>

								<ArrayRenderer
									items={job.description}
									getKey={(desc, index) => `desc-${index}`}
									renderItem={(desc, descIndex) => (
										<p className="mb-2 text-gray-800">
											<TextWrap
												text={desc}
												name={`workExperience[${jobIndex}].description[${descIndex}]`}
												label="Job Description"
											/>
										</p>
									)}
								/>

								{job.highlights && (
									<ul className="list-disc pl-5 mt-2 text-gray-700">
										<ArrayRenderer
											items={job.highlights}
											getKey={(highlight, index) => `highlight-${index}`}
											renderItem={(highlight, highlightIndex) => (
												<li className="mb-1">
													<TextWrap
														text={highlight}
														name={`workExperience[${jobIndex}].highlights[${highlightIndex}]`}
														label="Job Highlight"
													/>
												</li>
											)}
										/>
									</ul>
								)}
							</div>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
