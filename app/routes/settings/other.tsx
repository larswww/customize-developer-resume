import { getFormProps } from "@conform-to/react";
import { useOutletContext } from "react-router";
import { PlusIcon, TrashIcon } from "~/components/icons";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormMarkdownEditor } from "~/components/ui/FormField";
import { AddRemoveButton, Button } from "~/components/ui/button";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsOther() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const otherField = fields.items.getFieldList();

	return (
		<>
			{otherField.map((item: any, index: number) => (
				<FieldsetSection
					key={item.key}
					description="Additional information you'd like to include on your resume"
					variant="subtle"
				>
					<FormMarkdownEditor meta={item} editorRef={item.editorRef} />
					<AddRemoveButton
						type="remove"
						{...form.remove.getButtonProps({
							name: fields.items.name,
							index,
						})}
					>
						Remove Project
					</AddRemoveButton>
				</FieldsetSection>
			))}

			<AddRemoveButton
				type="add"
				{...form.insert.getButtonProps({
					name: fields.items.name,
				})}
			>
				Add Other Section
			</AddRemoveButton>
		</>
	);
}
