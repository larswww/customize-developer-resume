import { Fragment } from "react";
import type { FC } from "react";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";
import type { StandardResumeData } from "~/config/schemas/standardResume";
import type { ResumeTemplateProps } from "./types";

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
		<div className="resume-container print:w-full print:h-auto flex flex-col bg-white shadow-lg print:shadow-none p-8 max-w-4xl mx-auto">
			{/* Header with name */}
			<header className="mb-6">
				<h1 className="text-4xl font-bold">
					<TextWrap
						text={`${contactInfo.firstName || ""} ${contactInfo.lastName || ""}`}
						name="contactInfo.name"
						label="Name"
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
			<section className="mb-6">
				<h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-1 mb-4">
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
						<div className="mb-4">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-bold">
										<TextWrap
											text={job.title}
											name={`workExperience[${index}].title`}
											label="Job Title"
										/>
									</h3>
									<p>
										<TextWrap
											text={job.company}
											name={`workExperience[${index}].company`}
											label="Company"
										/>
										{job.location && (
											<>
												{" "}
												(
												<TextWrap
													text={job.location}
													name={`workExperience[${index}].location`}
													label="Location"
												/>
												)
											</>
										)}
									</p>
								</div>
								<p className="text-sm">
									<TextWrap
										text={job.dates}
										name={`workExperience[${index}].dates`}
										label="Dates"
									/>
								</p>
							</div>
							<ul className="list-disc pl-5 mt-2">
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

			{/* Projects Section (if available) */}
			{projects && projects.length > 0 && (
				<section className="mb-6">
					<h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-1 mb-4">
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
							<div className="mb-4">
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

			{/* Education Section */}
			<section className="mb-6">
				<h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-1 mb-4">
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
						<div className="mb-3">
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

			{/* Technologies and Languages Section */}
			<section>
				<h2 className="text-2xl font-bold border-b-2 border-blue-500 pb-1 mb-4">
					<TextWrap
						text="Technologies and Languages"
						name="technologiesTitle"
						label="Technologies Section Title"
					/>
				</h2>
				<div className="grid grid-cols-1 gap-4">
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
									{category.items.map((item, itemIndex) => (
										<Fragment key={`tech-item-${index}-${item}`}>
											<TextWrap
												text={item}
												name={`technologyCategories[${index}].items[${itemIndex}]`}
												label="Technology Item"
											/>
											{itemIndex < category.items.length - 1 && ", "}
										</Fragment>
									))}
								</p>
							</div>
						)}
					/>
				</div>
			</section>
		</div>
	);
};

export { StandardResumeTemplate };
