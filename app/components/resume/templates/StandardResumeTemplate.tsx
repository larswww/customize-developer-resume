import type { FC } from "react";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";
import type { StandardResumeData } from "~/config/schemas/standardResume";
import type { ResumeTemplateProps } from "./types";

const marginSettings = {
	header: "mb-6",
	section: "mb-24",
	sectionTitle: "pb-1 mb-4",
	workItem: "mb-4",
	workItemTitle: "mb-1",
	workItemAccomplishments: "mt-2",
	techCategory: "gap-4",
	educationItem: "mb-3",
	educationItemTitle: "mb-1",
	projectSection: "mb-8",
	projectItem: "mb-4",
	projectTitle: "mt-1",
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
		<div className="resume-container print:w-full print:h-auto print:block  bg-white shadow-lg print:shadow-none p-8 max-w-4xl mx-auto">
			{/* Header with name */}
			<header className={marginSettings.header}>
				<h1 className="text-4xl font-bold">
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

				{contactInfo.email && (
					<div className="flex items-center text-sm mt-2">
						<a href={`mailto:${contactInfo.email}`} className="hover:underline">
							<TextWrap
								text={contactInfo.email}
								name="contactInfo.email"
								label="Email"
							/>
						</a>
						{contactInfo.phone && (
							<>
								<span className="mx-2">•</span>
								<TextWrap
									text={contactInfo.phone}
									name="contactInfo.phone"
									label="Phone"
								/>
							</>
						)}
						{contactInfo.location && (
							<>
								<span className="mx-2">•</span>
								<TextWrap
									text={contactInfo.location}
									name="contactInfo.location"
									label="Location"
								/>
							</>
						)}
						{contactInfo.linkedin && (
							<>
								<span className="mx-2">•</span>
								<a
									href={contactInfo.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									LinkedIn
								</a>
							</>
						)}
						{contactInfo.github && (
							<>
								<span className="mx-2">•</span>
								<a
									href={contactInfo.github}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									GitHub
								</a>
							</>
						)}
						{contactInfo.portfolio && (
							<>
								<span className="mx-2">•</span>
								<a
									href={contactInfo.portfolio}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:underline"
								>
									Portfolio
								</a>
							</>
						)}
					</div>
				)}
			</header>

			{/* Work Experience Section */}
			<section className={marginSettings.section}>
				<h2
					className={`text-2xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
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
								<div className="font-bold text-lg">
									<TextWrap
										text={job.company}
										name={`workExperience[${index}].company`}
										label="Company"
									/>
								</div>
								{job.location && (
									<div className="flex-1 text-center text-xs text-gray-500">
										<TextWrap
											text={job.location}
											name={`workExperience[${index}].location`}
											label="Location"
										/>
									</div>
								)}
								<div className="text-sm text-right min-w-fit">
									<TextWrap
										text={job.dates}
										name={`workExperience[${index}].dates`}
										label="Dates"
									/>
								</div>
							</div>
							{/* Second row: Title */}
							<div className=" text-base mb-1">
								<TextWrap
									text={job.title}
									name={`workExperience[${index}].title`}
									label="Job Title"
								/>
							</div>
							<ul
								className={`list-disc pl-5 ${marginSettings.workItemAccomplishments}`}
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
					className={`text-2xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
				>
					<TextWrap
						text="Technologies and Languages"
						name="technologiesTitle"
						label="Technologies Section Title"
					/>
				</h2>
				<div className={`grid grid-cols-1 ${marginSettings.techCategory}`}>
					<ArrayRenderer
						items={technologyCategories || []}
						getKey={(category, index) => `tech-${index}`}
						renderItem={(category, index) => (
							<div>
								<h3 className="font-bold">
									<TextWrap
										text={category.category}
										name={`technologyCategories[${index}].category`}
										label="Category"
									/>
								</h3>
								<p>
									<TextWrap
										text={category.item}
										name={`technologyCategories[${index}].item`}
										label="Technology Item"
									/>
								</p>
							</div>
						)}
					/>
				</div>
			</section>

			{/* Education Section */}
			<section className={marginSettings.section}>
				<h2
					className={`text-2xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
				>
					<TextWrap
						text="Education"
						name="educationTitle"
						label="Education Section Title"
					/>
				</h2>
				<ArrayRenderer
					items={education?.educations || []}
					getKey={(edu, index) => `edu-${index}`}
					renderItem={(edu, index) => (
						<div className={marginSettings.educationItem}>
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-bold">
										<TextWrap
											text={edu.degree}
											name={`education.educations[${index}].degree`}
											label="Degree"
										/>
									</h3>
									<p>
										<TextWrap
											text={edu.institution}
											name={`education.educations[${index}].institution`}
											label="Institution"
										/>
										{edu.location && (
											<>
												{" "}
												(
												<TextWrap
													text={edu.location}
													name={`education.educations[${index}].location`}
													label="Location"
												/>
												)
											</>
										)}
									</p>
								</div>
								<p className="text-sm">
									<TextWrap
										text={edu.dates}
										name={`education.educations[${index}].dates`}
										label="Dates"
									/>
								</p>
							</div>
						</div>
					)}
				/>
			</section>

			{/* Projects Section (if available) */}
			{projects && projects.length > 0 && (
				<section className={marginSettings.projectSection}>
					<h2
						className={`text-2xl font-bold border-b-2 border-blue-500 ${marginSettings.sectionTitle}`}
					>
						<TextWrap
							text="Projects"
							name="projectsTitle"
							label="Projects Section Title"
						/>
					</h2>
					<ArrayRenderer
						items={projects}
						getKey={(project, index) => `project-${index}`}
						renderItem={(project, index) => (
							<div className={marginSettings.projectItem}>
								<div className="flex justify-between items-start">
									<h3 className="text-lg font-bold">
										{project.link ? (
											<a
												href={project.link}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:underline"
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
									</h3>
									<p className="text-sm">
										<TextWrap
											text={project.date}
											name={`projects[${index}].date`}
											label="Date"
										/>
									</p>
								</div>
								<p className="mt-1">
									<TextWrap
										text={project.description}
										name={`projects[${index}].description`}
										label="Description"
									/>
								</p>
							</div>
						)}
					/>
				</section>
			)}
		</div>
	);
};

export { StandardResumeTemplate };
