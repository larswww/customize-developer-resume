import { useOutletContext } from "react-router";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormField, FormFieldWithLinkButton } from "~/components/ui/FormField";
import { FormGrid } from "~/components/ui/FormGrid";
import type { SettingsOutletContext } from ".";

export default function SettingsContact() {
	const { fields } = useOutletContext<SettingsOutletContext>();

	return (
		<>
			<FieldsetSection
				description="Your basic information that will appear at the top of your resume"
				variant="subtle"
			>
				<FormGrid columns={2} className="gap-2">
					<FormField
						meta={fields.firstName}
						label="First Name"
						type="text"
						variant="inset"
					/>

					<FormField
						meta={fields.lastName}
						label="Last Name"
						type="text"
						variant="inset"
					/>

					<FormField
						meta={fields.title}
						label="Title"
						type="text"
						variant="inset"
						className="sm:col-span-2"
					/>
				</FormGrid>
			</FieldsetSection>

			<FieldsetSection
				description="How potential employers can reach you"
				variant="subtle"
			>
				<FormGrid columns={2} className="gap-2">
					<FormField
						meta={fields.email}
						label="Email"
						type="email"
						variant="inset"
					/>

					<FormField
						meta={fields.phone}
						label="Phone"
						type="phone"
						variant="inset"
					/>

					<FormField
						meta={fields.location}
						label="Location"
						type="location"
						className="sm:col-span-2"
						variant="inset"
					/>
				</FormGrid>
			</FieldsetSection>

			<FieldsetSection
				description="Links to your online presence and work"
				variant="subtle"
			>
				<FormGrid columns={1} className="gap-2">
					<FormFieldWithLinkButton
						meta={fields.linkedin}
						label="LinkedIn URL"
						type="url"
						variant="inset"
					/>

					<FormFieldWithLinkButton
						meta={fields.portfolio}
						label="Portfolio URL"
						type="url"
						variant="inset"
					/>

					<FormFieldWithLinkButton
						meta={fields.github}
						label="GitHub URL"
						placeholder="GitHub URL"
						type="url"
						variant="inset"
					/>
				</FormGrid>
			</FieldsetSection>
		</>
	);
}
