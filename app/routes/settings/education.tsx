import { useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { AddRemoveButton } from "~/components/ui/button";
import type { SettingsOutletContext } from ".";

export default function SettingsEducation() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const educations = fields.educations.getFieldList();
	return (
		<>
			{educations.map((education: any, index: number) => {
				const eduFields = education.getFieldset();
				return (
					<FieldsetSection
						key={education.key}
						description="Your academic background and qualifications"
						variant="subtle"
					>
						<FormGrid columns={2} className="gap-2">
							<FormField
								meta={eduFields.degree}
								label="Degree"
								type="text"
								variant="inset"
							/>

							<FormField
								meta={eduFields.institution}
								label="Institution"
								type="text"
								variant="inset"
							/>

							<FormField
								meta={eduFields.dates}
								label="Dates"
								type="text"
								variant="inset"
							/>

							<FormField
								meta={eduFields.location}
								label="Location"
								type="text"
								variant="inset"
								className="sm:col-span-2"
							/>
						</FormGrid>
						<AddRemoveButton
							type="remove"
							{...form.remove.getButtonProps({
								name: fields.educations.name,
								index,
							})}
						>
							Remove Education
						</AddRemoveButton>
					</FieldsetSection>
				);
			})}

			<AddRemoveButton
				type="add"
				{...form.insert.getButtonProps({
					name: fields.educations.name,
				})}
			>
				Add Education
			</AddRemoveButton>
		</>
	);
}
