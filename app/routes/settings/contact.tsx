import { getFormProps, getInputProps } from "@conform-to/react";
import { Form, useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import { Button } from "~/components/ui/button";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import type { SettingsOutletContext } from ".";

export default function SettingsContact() {
	const { form, fields } = useOutletContext<SettingsOutletContext>();

	return (
		<div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				{text.settings.contactInfo.legend}
			</h1>

			<Form method="post" action="/settings" {...getFormProps(form)}>
				<div className="space-y-8">
					<FieldsetSection
						title="Personal Information"
						description="Your basic information that will appear at the top of your resume"
					>
						<FormGrid columns={2}>
							<FormField
								{...getInputProps(fields.firstName, { type: "text" })}
								label="First Name"
								error={fields.firstName.errors}
								errorId={fields.firstName.errorId}
							/>

							<FormField
								{...getInputProps(fields.lastName, { type: "text" })}
								label="Last Name"
								error={fields.lastName.errors}
								errorId={fields.lastName.errorId}
							/>

							<FormField
								{...getInputProps(fields.title, { type: "text" })}
								label="Title"
								error={fields.title.errors}
								errorId={fields.title.errorId}
							/>
						</FormGrid>
					</FieldsetSection>

					<FieldsetSection
						title="Contact Information"
						description="How potential employers can reach you"
					>
						<FormGrid columns={2}>
							<FormField
								{...getInputProps(fields.email, { type: "email" })}
								label="Email"
								error={fields.email.errors}
								errorId={fields.email.errorId}
							/>

							<FormField
								{...getInputProps(fields.phone, { type: "tel" })}
								label="Phone"
								error={fields.phone.errors}
								errorId={fields.phone.errorId}
							/>

							<FormField
								{...getInputProps(fields.location, { type: "text" })}
								label="Location"
								error={fields.location.errors}
								errorId={fields.location.errorId}
								className="sm:col-span-2"
							/>
						</FormGrid>
					</FieldsetSection>

					<FieldsetSection
						title="Professional Profiles"
						description="Links to your online presence and work"
					>
						<FormGrid columns={1}>
							<FormField
								{...getInputProps(fields.linkedin, { type: "url" })}
								label="LinkedIn URL"
								error={fields.linkedin.errors}
								errorId={fields.linkedin.errorId}
							/>

							<FormField
								{...getInputProps(fields.portfolio, { type: "url" })}
								label="Portfolio URL"
								error={fields.portfolio.errors}
								errorId={fields.portfolio.errorId}
							/>

							<FormField
								{...getInputProps(fields.github, { type: "url" })}
								label="GitHub URL"
								error={fields.github.errors}
								errorId={fields.github.errorId}
							/>
						</FormGrid>
					</FieldsetSection>

					<div className="pt-4 pb-6 flex justify-end">
						<Button
							name="intent"
							value={SETTINGS_KEYS.CONTACT_INFO}
							type="submit"
							className="w-full sm:w-auto"
						>
							{text.settings.contactInfo.buttonText}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
