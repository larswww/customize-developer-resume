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
								meta={fields.firstName}
								label="First Name"
								type="text"
							/>

							<FormField meta={fields.lastName} label="Last Name" type="text" />

							<FormField meta={fields.title} label="Title" type="text" />
						</FormGrid>
					</FieldsetSection>

					<FieldsetSection
						title="Contact Information"
						description="How potential employers can reach you"
					>
						<FormGrid columns={2}>
							<FormField meta={fields.email} label="Email" type="email" />

							<FormField meta={fields.phone} label="Phone" type="tel" />

							<FormField
								meta={fields.location}
								label="Location"
								type="text"
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
								meta={fields.linkedin}
								label="LinkedIn URL"
								type="url"
							/>

							<FormField
								meta={fields.portfolio}
								label="Portfolio URL"
								type="url"
							/>

							<FormField meta={fields.github} label="GitHub URL" type="url" />
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
