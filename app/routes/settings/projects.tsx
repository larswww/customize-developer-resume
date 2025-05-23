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

export default function SettingsProjects() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const projects = fields.projects.getFieldList();
	return (
		<div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				{text.settings.projects.legend}
			</h1>

			<Form method="post" action="/settings" {...getFormProps(form)}>
				<div className="space-y-8">
					{projects.map((project: any, projectIndex: number) => {
						const projectFields = project.getFieldset();
						return (
							<FieldsetSection
								key={project.key}
								title={text.settings.projects.project.legend}
								description={text.settings.projects.project.description}
							>
								<FormGrid columns={2}>
									<FormField
										meta={projectFields.title}
										label={text.settings.projects.project.title}
										type="text"
										className="col-span-2 sm:col-span-1"
									/>
									<FormField
										meta={projectFields.date}
										label={text.settings.projects.project.date}
										type="text"
										className="col-span-2 sm:col-span-1"
									/>
									<FormField
										meta={projectFields.link}
										label={text.settings.projects.project.link}
										type="url"
										className="col-span-2"
									/>
								</FormGrid>
								<FormMarkdownEditor
									meta={projectFields.description}
									editorRef={projectFields.description.editorRef}
								/>

								<Button
									{...form.remove.getButtonProps({
										name: fields.projects.name,
										index: projectIndex,
									})}
									variant="outline"
									size="icon"
									className="ml-2 mt-2"
									aria-label={text.settings.projects.project.removeProject}
								>
									<TrashIcon size="sm" />
								</Button>
							</FieldsetSection>
						);
					})}

					<Button
						{...form.insert.getButtonProps({
							name: fields.projects.name,
						})}
						variant="outline"
						size="icon"
						className="ml-2"
						aria-label={text.settings.projects.project.addProject}
					>
						<PlusIcon size="sm" />
					</Button>

					<div className="pt-4 pb-6 flex justify-end">
						<Button
							name="intent"
							value={SETTINGS_KEYS.PROJECTS}
							type="submit"
							variant="default"
							className="w-full sm:w-auto"
						>
							{text.settings.projects.buttonText}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
