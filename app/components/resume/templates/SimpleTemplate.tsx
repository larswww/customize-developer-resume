import type React from "react";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";
import type { SimpleConsultantComponentData } from "~/config/schemas/simple";

interface SimpleTemplateProps {
	data: SimpleConsultantComponentData;
}

const SimpleTemplate: React.FC<SimpleTemplateProps> = ({ data }) => {
	const {
		contactInfo,
		employmentHistory,
		education,
		summary,
		templateSections,
	} = data;

	return (
		<div className="p-8 font-sans text-sm bg-white">
			<header className="mb-6 text-center pb-2">
				<h1 className="text-3xl font-bold text-gray-800">
					<TextWrap
						text={contactInfo.firstName}
						name="contactInfo.firstName"
						label="Name"
					/>
					<TextWrap
						text={contactInfo.lastName}
						name="contactInfo.lastName"
						label="Name"
					/>
				</h1>
				<p className="text-lg text-gray-600 mt-1">
					<TextWrap
						text={contactInfo.title}
						name="contactInfo.title"
						label="Title"
					/>
				</p>
				<div className="text-xs text-gray-500 mt-2 space-x-2 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
					<span>
						<TextWrap
							text={contactInfo.location}
							name="contactInfo.location"
							label="Location"
						/>
					</span>
					<span className="text-gray-300">&bull;</span>
					<span>
						<TextWrap
							text={contactInfo.phone}
							name="contactInfo.phone"
							label="Phone"
						/>
					</span>
					<span className="text-gray-300">&bull;</span>
					<a
						href={`mailto:${contactInfo.email}`}
						className="text-blue-600 hover:underline"
					>
						<TextWrap
							text={contactInfo.email}
							name="contactInfo.email"
							label="Email"
						/>
					</a>
					{contactInfo.linkedin && (
						<>
							<span className="text-gray-300">&bull;</span>
							<a
								href={contactInfo.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								<TextWrap
									text="LinkedIn"
									name="contactInfo.linkedinLabel"
									label="LinkedIn Label"
								/>
							</a>
						</>
					)}
					{contactInfo.portfolio && (
						<>
							<span className="text-gray-300">&bull;</span>
							<a
								href={contactInfo.portfolio}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline"
							>
								<TextWrap
									text="Portfolio"
									name="contactInfo.portfolioLabel"
									label="Portfolio Label"
								/>
							</a>
						</>
					)}
				</div>
			</header>

			{summary && (
				<section className="mb-6 text-base text-gray-700 pb-2 text-center italic">
					<p>
						<TextWrap text={summary} name="summary" label="Summary" />
					</p>
				</section>
			)}

			{employmentHistory && employmentHistory.length > 0 && (
				<section className="mb-4">
					<h2 className="text-xl font-semibold border-b pb-1 mb-4 text-gray-800">
						<TextWrap
							text={templateSections.experienceTitle || "Experience"}
							name="templateSections.experienceTitle"
							label="Experience Section Title"
						/>
					</h2>

					<ArrayRenderer
						items={employmentHistory}
						getKey={(employment) => employment.employer}
						renderItem={(employment, empIndex) => (
							<div
								key={`emp-${employment.employer}-${empIndex}`}
								className="mb-6 pb-3 border-b border-gray-100 last:border-b-0"
							>
								<h3 className="text-lg">
									<span className="font-normal text-gray-600 mr-1">
										<TextWrap
											text={employment.title}
											name={`employmentHistory[${empIndex}].title`}
											label="Job Title"
										/>
									</span>
									at
									<span className="text-gray-800 font-semibold ml-1">
										<TextWrap
											text={employment.employer}
											name={`employmentHistory[${empIndex}].employer`}
											label="Employer"
										/>
									</span>
								</h3>
								<p className="text-xs text-gray-500 mb-3">
									<TextWrap
										text={employment.dates}
										name={`employmentHistory[${empIndex}].dates`}
										label="Employment Dates"
									/>{" "}
									|{" "}
									<TextWrap
										text={employment.location}
										name={`employmentHistory[${empIndex}].location`}
										label="Location"
									/>
								</p>

								{employment.projects && employment.projects.length > 0 && (
									<div className="mt-1 space-y-4">
										<ArrayRenderer
											items={employment.projects}
											getKey={(project, projectIndex) =>
												`${project.client}-${projectIndex}`
											}
											renderItem={(project, projectIndex) => (
												<div
													key={`p-${empIndex}-${project.client}-${projectIndex}`}
													className="pb-2 last:pb-0"
												>
													<div className="flex items-baseline justify-between flex-wrap mb-1.5">
														<h4 className="font-normal text-sm mr-4">
															<span className="text-gray-700 font-medium mr-1.5">
																<TextWrap
																	text={project.client}
																	name={`employmentHistory[${empIndex}].projects[${projectIndex}].client`}
																	label="Client"
																/>
															</span>
														</h4>

														{project.skillsUsed &&
															project.skillsUsed.length > 0 && (
																<ul className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs">
																	<ArrayRenderer
																		items={project.skillsUsed}
																		getKey={(skill, skillIndex) =>
																			`${skill}-${skillIndex}`
																		}
																		renderItem={(skill, skillIndex) => (
																			<li
																				key={`p${empIndex}-${projectIndex}-s${skillIndex}-${skill}`}
																				className="bg-gray-100 text-gray-600 px-1.5 py-0 rounded-sm border border-gray-200 text-xs"
																			>
																				<TextWrap
																					text={skill}
																					name={`employmentHistory[${empIndex}].projects[${projectIndex}].skillsUsed[${skillIndex}]`}
																					label="Skill"
																				/>
																			</li>
																		)}
																	/>
																</ul>
															)}
													</div>

													{project.description &&
														project.description.length > 0 && (
															<ul className="list-disc list-outside text-sm mt-1 ml-8 space-y-1 text-gray-700">
																<ArrayRenderer
																	items={project.description}
																	getKey={(desc, descIndex) =>
																		`${desc.slice(0, 10)}-${descIndex}`
																	}
																	renderItem={(desc, descIndex) => (
																		<li
																			key={`p${empIndex}-d${projectIndex}-${descIndex}-${desc.slice(
																				0,
																				10,
																			)}`}
																			className="pl-1"
																		>
																			<TextWrap
																				text={desc}
																				name={`employmentHistory[${empIndex}].projects[${projectIndex}].description[${descIndex}]`}
																				label="Project Description"
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
								)}
							</div>
						)}
					/>
				</section>
			)}

			{education ? (
				<section className="mb-4">
					<h2 className="text-xl font-semibold border-b pb-1 mb-3 text-gray-800">
						<TextWrap
							text={templateSections.educationTitle}
							name="templateSections.educationTitle"
							label="Education Section Title"
						/>
					</h2>
					<ArrayRenderer
						items={education.educations}
						getKey={(edu, eduIndex) =>
							`${edu.institution}-${edu.degree}-${eduIndex}`
						}
						renderItem={(edu, eduIndex) => (
							<div
								key={`edu-${edu.institution}-${edu.degree}-${eduIndex}`}
								className="mb-2 last:mb-0"
							>
								<h3 className="font-semibold text-base text-gray-800">
									<TextWrap
										text={edu.degree}
										name={`education.educations[${eduIndex}].degree`}
										label="Degree"
									/>
								</h3>
								<p className="text-xs text-gray-500">
									<TextWrap
										text={edu.institution}
										name={`education.educations[${eduIndex}].institution`}
										label="Institution"
									/>{" "}
									|{" "}
									<TextWrap
										text={edu.dates}
										name={`education.educations[${eduIndex}].dates`}
										label="Dates"
									/>{" "}
									|{" "}
									<TextWrap
										text={edu.location}
										name={`education.educations[${eduIndex}].location`}
										label="Location"
									/>
								</p>
							</div>
						)}
					/>
				</section>
			) : null}
		</div>
	);
};

export default SimpleTemplate;
