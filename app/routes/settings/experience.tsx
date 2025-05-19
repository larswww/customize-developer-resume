import { getFormProps } from "@conform-to/react";
import { Form, useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { Button } from "~/components/ui/button";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsExperience() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const experiences = fields.experience.getFieldList();
	return (
		<div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				{text.settings.workHistory.legend}
			</h1>

			<Form method="post" action="/settings" {...getFormProps(form)}>
				<div className="space-y-8">
					{experiences.map((experience: any, expIndex: number) => {
						const expFields = experience.getFieldset();
						const roles = expFields.roles.getFieldList();
						return (
							<FieldsetSection
								key={experience.key}
								title="Experience"
								description="Your professional work history"
							>
								<FormGrid columns={2}>
									<FormField
										name={expFields.company.name}
										defaultValue={expFields.company.value}
										label="Company"
										error={expFields.company.errors}
										errorId={expFields.company.errorId}
									/>

									<FormField
										name={expFields.location.name}
										defaultValue={expFields.location.value}
										label="Location"
										error={expFields.location.errors}
										errorId={expFields.location.errorId}
									/>

									<FormField
										name={expFields.dates.name}
										defaultValue={expFields.dates.value}
										label="Dates"
										error={expFields.dates.errors}
										errorId={expFields.dates.errorId}
										className="sm:col-span-2"
									/>
								</FormGrid>

								<div className="space-y-6 mt-4">
									{roles.map((role: any, roleIndex: number) => {
										const roleFields = role.getFieldset();
										const achievements = roleFields.achievements.getFieldList();
										const responsibilities =
											roleFields.responsibilities.getFieldList();
										const skills = roleFields.skills.getFieldList();
										return (
											<FieldsetSection
												key={role.key}
												title="Role"
												description="Title, description, achievements, responsibilities, and skills for this role"
											>
												<FormGrid columns={2}>
													<FormField
														name={roleFields.title.name}
														defaultValue={roleFields.title.value}
														label="Title"
														error={roleFields.title.errors}
														errorId={roleFields.title.errorId}
													/>

													<FormField
														name={roleFields.description.name}
														defaultValue={roleFields.description.value}
														label="Description"
														error={roleFields.description.errors}
														errorId={roleFields.description.errorId}
														className="sm:col-span-2"
													/>
												</FormGrid>

												<div className="space-y-2 mt-4">
													{achievements.map((ach: any, achIndex: number) => (
														<div key={ach.key} className="flex items-end gap-2">
															<FormField
																name={ach.name}
																defaultValue={ach.value}
																label="Achievement"
																error={ach.errors}
																errorId={ach.errorId}
															/>
															<Button
																{...form.remove.getButtonProps({
																	name: roleFields.achievements.name,
																	index: achIndex,
																})}
																variant="outline"
																className="mb-1"
															>
																Remove Achievement
															</Button>
														</div>
													))}
													<Button
														{...form.insert.getButtonProps({
															name: roleFields.achievements.name,
														})}
														variant="outline"
														className="mb-2"
													>
														Add Achievement
													</Button>
												</div>

												<div className="space-y-2 mt-4">
													{responsibilities.map(
														(resp: any, respIndex: number) => (
															<div
																key={resp.key}
																className="flex items-end gap-2"
															>
																<FormField
																	name={resp.name}
																	defaultValue={resp.value}
																	label="Responsibility"
																	error={resp.errors}
																	errorId={resp.errorId}
																/>
																<Button
																	{...form.remove.getButtonProps({
																		name: roleFields.responsibilities.name,
																		index: respIndex,
																	})}
																	variant="outline"
																	className="mb-1"
																>
																	Remove Responsibility
																</Button>
															</div>
														),
													)}
													<Button
														{...form.insert.getButtonProps({
															name: roleFields.responsibilities.name,
														})}
														variant="outline"
														className="mb-2"
													>
														Add Responsibility
													</Button>
												</div>

												<div className="space-y-2 mt-4">
													{skills.map((skill: any, skillIndex: number) => (
														<div
															key={skill.key}
															className="flex items-end gap-2"
														>
															<FormField
																name={skill.name}
																defaultValue={skill.value}
																label="Skill"
																error={skill.errors}
																errorId={skill.errorId}
															/>
															<Button
																{...form.remove.getButtonProps({
																	name: roleFields.skills.name,
																	index: skillIndex,
																})}
																variant="outline"
																className="mb-1"
															>
																Remove Skill
															</Button>
														</div>
													))}
													<Button
														{...form.insert.getButtonProps({
															name: roleFields.skills.name,
														})}
														variant="outline"
														className="mb-2"
													>
														Add Skill
													</Button>
												</div>

												<Button
													{...form.remove.getButtonProps({
														name: expFields.roles.name,
														index: roleIndex,
													})}
													className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
												>
													Remove Role
												</Button>
											</FieldsetSection>
										);
									})}

									<Button
										{...form.insert.getButtonProps({
											name: expFields.roles.name,
										})}
										className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
									>
										Add Role
									</Button>
								</div>

								<Button
									{...form.remove.getButtonProps({
										name: fields.experience.name,
										index: expIndex,
									})}
									className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
								>
									Remove Experience
								</Button>
							</FieldsetSection>
						);
					})}

					<Button
						{...form.insert.getButtonProps({
							name: fields.experience.name,
						})}
						className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
					>
						Add Experience
					</Button>

					<div className="pt-4 pb-6 flex justify-end">
						<Button
							name="intent"
							value={SETTINGS_KEYS.EXPERIENCE}
							type="submit"
							variant="default"
							className="w-full sm:w-auto"
						>
							{text.settings.workHistory.buttonText}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
