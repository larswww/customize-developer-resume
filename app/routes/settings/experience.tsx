import { getFormProps } from "@conform-to/react";
import { Form, useOutletContext } from "react-router";
import { PlusIcon, TrashIcon } from "~/components/icons";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField, FormMarkdownEditor } from "~/components/ui/FormField";
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
										meta={expFields.company}
										label="Company"
										type="text"
										className="col-span-2 sm:col-span-1"
									/>
									<FormField
										meta={expFields.location}
										label="Location"
										type="text"
										className="col-span-2 sm:col-span-1"
									/>
									<FormField
										meta={expFields.dates}
										label="Dates"
										type="text"
										className="col-span-2"
									/>
								</FormGrid>

								<div className="space-y-6 mt-4">
									{roles.map((role: any, roleIndex: number) => {
										const roleFields = role.getFieldset();
										return (
											<FieldsetSection
												key={role.key}
												title="Role"
												description="Title, description, achievements, responsibilities, and skills for this role"
											>
												<FormField
													meta={roleFields.title}
													placeholder="Title"
													type="text"
												/>

												<FormMarkdownEditor
													meta={roleFields.content}
													editorRef={roleFields.content.editorRef}
												/>

												<Button
													{...form.remove.getButtonProps({
														name: expFields.roles.name,
														index: roleIndex,
													})}
													variant="outline"
													size="icon"
													className="ml-2"
													aria-label="Remove Role"
												>
													<TrashIcon size="sm" />
												</Button>
											</FieldsetSection>
										);
									})}

									<Button
										{...form.insert.getButtonProps({
											name: expFields.roles.name,
										})}
										variant="outline"
										size="icon"
										className="ml-2"
										aria-label="Add Role"
									>
										<PlusIcon size="sm" />
									</Button>
								</div>

								<Button
									{...form.remove.getButtonProps({
										name: fields.experience.name,
										index: expIndex,
									})}
									variant="outline"
									size="icon"
									className="ml-2"
									aria-label="Remove Experience"
								>
									<TrashIcon size="sm" />
								</Button>
							</FieldsetSection>
						);
					})}

					<Button
						{...form.insert.getButtonProps({
							name: fields.experience.name,
						})}
						variant="outline"
						size="icon"
						className="ml-2"
						aria-label="Add Experience"
					>
						<PlusIcon size="sm" />
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
