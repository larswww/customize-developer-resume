import { getFormProps } from "@conform-to/react";
import { Form, useOutletContext } from "react-router";
import { PlusIcon, TrashIcon } from "~/components/icons";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormMarkdownEditor } from "~/components/ui/FormField";
import { Button } from "~/components/ui/button";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsOther() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const otherField = fields.items.getFieldList();

	return (
		<div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">{text.settings.other.legend}</h1>

			<Form method="post" action="/settings" {...getFormProps(form)}>
				<div className="space-y-8">
					{otherField.map((item: any, index: number) => (
						<FieldsetSection
							key={item.key}
							description="Additional information you'd like to include on your resume"
						>
							<div className="flex items-start">
								<div className="grow">
									<FormMarkdownEditor meta={item} editorRef={item.editorRef} />
								</div>
								<Button
									{...form.remove.getButtonProps({
										name: fields.items.name,
										index,
									})}
									variant="outline"
									size="icon"
									className="ml-2"
									aria-label="Remove Item"
								>
									<TrashIcon size="sm" />
								</Button>
							</div>
						</FieldsetSection>
					))}
					<Button
						{...form.insert.getButtonProps({
							name: fields.items.name,
						})}
						variant="outline"
						className="flex items-center gap-2"
						aria-label="Add Other Section"
					>
						<PlusIcon size="sm" /> Add Other Section
					</Button>

					<div className="pt-4 pb-6 flex justify-end">
						<Button
							name="intent"
							value={SETTINGS_KEYS.OTHER}
							type="submit"
							variant="default"
							className="w-full sm:w-auto"
						>
							{text.settings.other.buttonText}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
