import { getFormProps } from "@conform-to/react";
import { Form, useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { Button } from "~/components/ui/button";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsEducation() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();
	const educations = fields.educations.getFieldList();
	return (
		<div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				{text.settings.education.legend}
			</h1>

			<Form method="post" action="/settings" {...getFormProps(form)}>
				<div className="space-y-8">
					{educations.map((education: any, index: number) => {
						const eduFields = education.getFieldset();
						return (
							<FieldsetSection
								key={education.key}
								title="Education Information"
								description="Your academic background and qualifications"
							>
								<FormGrid columns={2}>
									<FormField
										name={eduFields.degree.name}
										defaultValue={eduFields.degree.value}
										label="Degree"
										error={eduFields.degree.errors}
										errorId={eduFields.degree.errorId}
									/>

									<FormField
										name={eduFields.institution.name}
										defaultValue={eduFields.institution.value}
										label="Institution"
										error={eduFields.institution.errors}
										errorId={eduFields.institution.errorId}
									/>

									<FormField
										name={eduFields.dates.name}
										defaultValue={eduFields.dates.value}
										label="Dates"
										error={eduFields.dates.errors}
										errorId={eduFields.dates.errorId}
									/>

									<FormField
										name={eduFields.location.name}
										defaultValue={eduFields.location.value}
										label="Location"
										error={eduFields.location.errors}
										errorId={eduFields.location.errorId}
									/>
								</FormGrid>
								<Button
									{...form.remove.getButtonProps({
										name: fields.educations.name,
										index,
									})}
									className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
								>
									Remove Education
								</Button>
							</FieldsetSection>
						);
					})}

					<Button
						{...form.insert.getButtonProps({
							name: fields.educations.name,
						})}
						className="text-sm px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
					>
						Add Education
					</Button>

					<div className="pt-4 pb-6 flex justify-end">
						<Button
							name="intent"
							value={SETTINGS_KEYS.EDUCATION}
							type="submit"
							variant="default"
							className="w-full sm:w-auto"
						>
							{text.settings.education.buttonText}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
