import type { FC } from "react";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";
import type { StandardResumeData } from "~/config/schemas/standardResume";
import type { ResumeTemplateProps } from "./types";

const marginSettings = {
	header: "mb-0",
	section: "mb-24",
	sectionTitle: "pb-1 mb-4",
	workItem: "mb-8",
	workItemTitle: "mb-1",
	workItemAccomplishments: "mt-2",
	techCategory: "gap-4",
	educationItem: "mb-3",
	educationItemTitle: "mb-1",
	projectSection: "mb-8",
	projectItem: "mb-4",
	projectTitle: "mt-1",
	listIndent: "pl-12",
};

const StandardResumeTemplate: FC<ResumeTemplateProps<StandardResumeData>> = ({
	data,
}) => {
	const {
		contactInfo,
		workExperience,
		education,
		technologyCategories,
		projects,
	} = data;

	return (
		<div className="resume-container print:w-full print:h-auto print:block bg-white shadow-lg print:shadow-none p-8 max-w-4xl mx-auto leading-relaxed text-base">
			{/* Header with name */}
			<header className={marginSettings.header}>
				<div className="flex w-full items-center justify-between">
					{/* Left: Name, vertically centered */}

					<h1 className="text-3xl font-bold ">
						<TextWrap
							text={contactInfo.firstName}
							name="contactInfo.firstName"
							label="First Name"
						/>{" "}
						<TextWrap
							text={contactInfo.lastName}
							name="contactInfo.lastName"
							label="Last Name"
						/>
					</h1>

					{/* Right: Location, Phone, Email, Links */}
					<div className="flex flex-col items-end text-sm w-1/2 min-w-0">
						{contactInfo.location && (
							<span className="mb-1">
								<TextWrap
									text={contactInfo.location}
									name="contactInfo.location"
									label="Location"
								/>
							</span>
						)}
						{contactInfo.phone && (
							<span className="mb-1">
								<TextWrap
									text={contactInfo.phone}
									name="contactInfo.phone"
									label="Phone"
								/>
							</span>
						)}
						{contactInfo.email && (
							<a
								href={`mailto:${contactInfo.email}`}
								className="underline mb-1"
							>
								<TextWrap
									text={contactInfo.email}
									name="contactInfo.email"
									label="Email"
								/>
							</a>
						)}
						{contactInfo.linkedin && (
							<a
								href={contactInfo.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="underline mb-1"
							>
								LinkedIn
							</a>
						)}
						{contactInfo.github && (
							<a
								href={contactInfo.github}
								target="_blank"
								rel="noopener noreferrer"
								className="underline mb-1"
							>
								GitHub
							</a>
						)}
						{contactInfo.portfolio && (
							<a
								href={contactInfo.portfolio}
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							>
								Portfolio
							</a>
						)}
					</div>
				</div>
			</header>

			{/* Work Experience Section */}
			<section className={marginSettings.section}>
				<h2
					className={`text-xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
				>
					<TextWrap
						text="Work Experience"
						name="workExperienceTitle"
						label="Work Experience Section Title"
					/>
				</h2>
				<ArrayRenderer
					items={workExperience || []}
					getKey={(job, index) => `job-${index}`}
					renderItem={(job, index) => (
						<div className={marginSettings.workItem}>
							{/* First row: Company - Location (center, gray) - Date */}
							<div
								className={`flex justify-between items-center w-full ${marginSettings.workItemTitle}`}
							>
								<div className="flex flex-col">
									<div className="font-bold text-lg">
										<TextWrap
											text={job.company}
											name={`workExperience[${index}].company`}
											label="Company"
										/>
									</div>

									<div className="flex-1 text-sm text-gray-500 col-span-1">
										<TextWrap
											text={job.title}
											name={`workExperience[${index}].title`}
											label="Job Title"
										/>
										{" | "}
										<TextWrap
											text={job.location}
											name={`workExperience[${index}].location`}
											label="Location"
										/>
									</div>
								</div>

								<div className="text-sm text-right min-w-fit text-gray-500 col-span-1">
									<TextWrap
										text={job.dates}
										name={`workExperience[${index}].dates`}
										label="Dates"
									/>
								</div>
							</div>

							<ul
								className={`list-disc leading-relaxed ${marginSettings.workItemAccomplishments} ${marginSettings.listIndent}`}
							>
								<ArrayRenderer
									items={job.accomplishments || []}
									getKey={(item, i) => `desc-${index}-${i}`}
									renderItem={(item, descIndex) => (
										<li>
											<TextWrap
												text={item}
												name={`workExperience[${index}].accomplishments[${descIndex}]`}
												label="Accomplishment Item"
											/>
										</li>
									)}
								/>
							</ul>
						</div>
					)}
				/>
			</section>

			{/* Technologies and Languages Section */}
			<section className={marginSettings.section}>
				<h2
					className={`text-xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
				>
					<TextWrap
						text="Technologies and Languages"
						name="technologiesTitle"
						label="Technologies Section Title"
					/>
				</h2>
				<ul
					className={`list-disc ${marginSettings.workItemAccomplishments} ${marginSettings.listIndent}`}
				>
					<ArrayRenderer
						items={technologyCategories || []}
						getKey={(category, index) => `tech-${index}`}
						renderItem={(category, index) => (
							<li>
								<span className="font-bold">
									<TextWrap
										text={category.category}
										name={`technologyCategories[${index}].category`}
										label="Category"
									/>
								</span>
								{": "}
								<span>
									<TextWrap
										text={category.item}
										name={`technologyCategories[${index}].item`}
										label="Technology Item"
									/>
								</span>
							</li>
						)}
					/>
				</ul>
			</section>

			{/* Education Section */}
			<section className={marginSettings.section}>
				<h2
					className={`text-xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
				>
					<TextWrap
						text="Education"
						name="educationTitle"
						label="Education Section Title"
					/>
				</h2>
				<ul
					className={`list-disc ${marginSettings.workItemAccomplishments} ${marginSettings.listIndent}`}
				>
					<ArrayRenderer
						items={education?.educations || []}
						getKey={(edu, index) => `edu-${index}`}
						renderItem={(edu, index) => (
							<li>
								<div className="flex justify-between items-center">
									<span>
										<span className="font-bold">
											<TextWrap
												text={edu.degree}
												name={`education.educations[${index}].degree`}
												label="Degree"
											/>
										</span>
										{", "}
										<span>
											<TextWrap
												text={edu.institution}
												name={`education.educations[${index}].institution`}
												label="Institution"
											/>
											{edu.location && (
												<>
													{" ("}
													<TextWrap
														text={edu.location}
														name={`education.educations[${index}].location`}
														label="Location"
													/>
													{")"}
												</>
											)}
										</span>
									</span>
									<span className="text-sm text-gray-500 min-w-fit text-right ml-2">
										<TextWrap
											text={edu.dates}
											name={`education.educations[${index}].dates`}
											label="Dates"
										/>
									</span>
								</div>
							</li>
						)}
					/>
				</ul>
			</section>

			{/* Projects Section (if available) */}
			{projects && projects.length > 0 && (
				<section className={marginSettings.projectSection}>
					<h2
						className={`text-xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
					>
						<TextWrap
							text="Projects"
							name="projectsTitle"
							label="Projects Section Title"
						/>
					</h2>
					<ul
						className={`list-disc pl-5 leading-relaxed ${marginSettings.workItemAccomplishments} ${marginSettings.listIndent}`}
					>
						<ArrayRenderer
							items={projects}
							getKey={(project, index) => `project-${index}`}
							renderItem={(project, index) => (
								<li>
									<div className="flex justify-between items-start mt-1">
										<span>
											<span className="font-bold">
												{project.link ? (
													<a
														href={project.link}
														target="_blank"
														rel="noopener noreferrer"
														className="underline"
													>
														<TextWrap
															text={project.title}
															name={`projects[${index}].title`}
															label="Project Title"
														/>
													</a>
												) : (
													<TextWrap
														text={project.title}
														name={`projects[${index}].title`}
														label="Project Title"
													/>
												)}
											</span>
											{project.description && (
												<span className="ml-1">
													<TextWrap
														text={project.description}
														name={`projects[${index}].description`}
														label="Description"
													/>
												</span>
											)}
										</span>
										{project.date && (
											<span className="text-sm text-gray-500 min-w-fit text-right mt-1 ml-2">
												<TextWrap
													text={project.date}
													name={`projects[${index}].date`}
													label="Date"
												/>
											</span>
										)}
									</div>
								</li>
							)}
						/>
					</ul>
				</section>
			)}
		</div>
	);
};

export { StandardResumeTemplate };
