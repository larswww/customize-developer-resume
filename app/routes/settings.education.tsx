import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation, useOutletContext } from "react-router";
import {
  EducationSchema,
} from "~/config/templates/sharedTypes";
import type { SettingsOutletContext } from "./settings";
import { SETTINGS_KEYS } from "~/config/constants";
import text from "~/text";
import { FormField } from "~/components/ui/FormField";
import { Button } from "~/components/ui/Button";
import { FieldsetSection } from "~/components/ui/FieldsetSection";
import { FormGrid } from "~/components/ui/FormGrid";


export default function SettingsEducation() {
  const {education} = useOutletContext<SettingsOutletContext>();
  const lastResult = useActionData();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    id: "education-form",
    lastResult: navigation.state === "idle" ? lastResult : undefined,
    defaultValue: education,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EducationSchema });
    },
    constraint: getZodConstraint(EducationSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{text.settings.education.legend}</h1>
      
      <Form method="post" action="/settings" {...getFormProps(form)}>
        <div className="space-y-8">
          <FieldsetSection 
            title="Education Information" 
            description="Your academic background and qualifications"
          >
            <FormGrid columns={2}>
              <FormField
                {...getInputProps(fields.degree, { type: "text" })}
                label="Degree"
                error={fields.degree.errors}
                errorId={fields.degree.errorId}
              />
              
              <FormField
                {...getInputProps(fields.institution, { type: "text" })}
                label="Institution"
                error={fields.institution.errors}
                errorId={fields.institution.errorId}
              />
              
              <FormField
                {...getInputProps(fields.dates, { type: "text" })}
                label="Dates"
                error={fields.dates.errors}
                errorId={fields.dates.errorId}
              />
              
              <FormField
                {...getInputProps(fields.location, { type: "text" })}
                label="Location"
                error={fields.location.errors}
                errorId={fields.location.errorId}
              />
            </FormGrid>
          </FieldsetSection>

          <div className="pt-4 pb-6 flex justify-end">
            <Button
              name="intent"
              value={SETTINGS_KEYS.EDUCATION}
              type="submit"
              variant="primary"
              disabled={navigation.state !== "idle"}
              className="w-full sm:w-auto"
            >
              {navigation.state !== "idle" ? "Saving..." : text.settings.education.buttonText}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
