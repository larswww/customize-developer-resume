import { useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField, FormMarkdownEditor } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { AddRemoveButton } from "~/components/ui/button";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsProjects() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const projects = fields.projects.getFieldList();
	return (
		<>
			{projects.map((project: any, projectIndex: number) => {
				const projectFields = project.getFieldset();
				return (
					<FieldsetSection
						key={project.key}
						description={text.settings.projects.project.description}
						variant="subtle"
					>
						<FormGrid columns={2} className="gap-2">
							<FormField
								meta={projectFields.title}
								label={text.settings.projects.project.title}
								type="text"
								variant="inset"
							/>
							<FormField
								meta={projectFields.date}
								label={text.settings.projects.project.date}
								type="text"
								variant="inset"
							/>
							<FormField
								meta={projectFields.link}
								label={text.settings.projects.project.link}
								type="url"
								variant="inset"
								className="col-span-2"
							/>
						</FormGrid>
						<FormMarkdownEditor
							meta={projectFields.description}
							editorRef={projectFields.description.editorRef}
							hideToolbar={false}
						/>
						<AddRemoveButton
							type="remove"
							{...form.remove.getButtonProps({
								name: fields.projects.name,
								index: projectIndex,
							})}
						>
							Remove Project
						</AddRemoveButton>
					</FieldsetSection>
				);
			})}

			<AddRemoveButton
				type="add"
				{...form.insert.getButtonProps({
					name: fields.projects.name,
				})}
			>
				Add Project
			</AddRemoveButton>
		</>
	);
}
