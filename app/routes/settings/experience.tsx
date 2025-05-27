import { useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField, FormMarkdownEditor } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { AddRemoveButton } from "~/components/ui/button";
import type { SettingsOutletContext } from ".";

export default function SettingsExperience() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const experiences = fields.experience.getFieldList();
	return (
		<>
			{experiences.map((experience: any, expIndex: number) => {
				const expFields = experience.getFieldset();
				const roles = expFields.roles.getFieldList();
				return (
					<FieldsetSection
						key={experience.key}
						description="Your professional work history"
						variant="subtle"
					>
						<FormGrid columns={2} className="gap-2">
							<FormField
								meta={expFields.company}
								label="Company"
								type="text"
								variant="inset"
							/>
							<FormField
								meta={expFields.location}
								label="Location"
								type="text"
								variant="inset"
							/>
							<FormField
								meta={expFields.dates}
								label="Dates"
								type="text"
								variant="inset"
								className="col-span-2"
							/>
						</FormGrid>
						<div className="space-y-4 mt-4">
							{roles.map((role: any, roleIndex: number) => {
								const roleFields = role.getFieldset();
								return (
									<FieldsetSection
										key={role.key}
										description="Title, description, achievements, responsibilities, and skills for this role"
										variant="subtle"
									>
										<FormField
											meta={roleFields.title}
											placeholder="Title"
											type="text"
											variant="inset"
										/>
										<FormMarkdownEditor
											meta={roleFields.content}
											editorRef={roleFields.content.editorRef}
											hideToolbar={false}
										/>
										<AddRemoveButton
											type="remove"
											{...form.remove.getButtonProps({
												name: expFields.roles.name,
												index: roleIndex,
											})}
										>
											Remove Role
										</AddRemoveButton>
									</FieldsetSection>
								);
							})}
							<AddRemoveButton
								type="add"
								{...form.insert.getButtonProps({
									name: expFields.roles.name,
								})}
							>
								Add Role
							</AddRemoveButton>
						</div>
						<AddRemoveButton
							type="remove"
							{...form.remove.getButtonProps({
								name: fields.experience.name,
								index: expIndex,
							})}
						>
							Remove Experience
						</AddRemoveButton>
					</FieldsetSection>
				);
			})}

			<AddRemoveButton
				type="add"
				{...form.insert.getButtonProps({
					name: fields.experience.name,
				})}
			>
				Add Experience
			</AddRemoveButton>
		</>
	);
}
