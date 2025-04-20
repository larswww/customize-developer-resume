import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useOutletContext } from "react-router";
import {
  EducationSchema,
} from "~/config/templates/sharedTypes";
import type { SettingsOutletContext } from "./settings";
import { SETTINGS_KEYS } from "~/config/constants";


export default function SettingsEducation() {
  const {education} = useOutletContext<SettingsOutletContext>();

  const [form, fields] = useForm({
    id: "education-form",
    defaultValue: education,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EducationSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Form method="post" action="/settings" {...getFormProps(form)}>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold mb-2">Education</legend>
        <div>
          <label
            htmlFor={fields.degree.id}
            className="block text-sm font-medium text-gray-700"
          >
            Degree
          </label>
          <input
            id={fields.degree.id}
            name={fields.degree.name}
            defaultValue={fields.degree.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div id={fields.degree.errorId} className="text-sm text-red-600 mt-1">
            {fields.degree.errors}
          </div>
        </div>

        <div>
          <label
            htmlFor={fields.institution.id}
            className="block text-sm font-medium text-gray-700"
          >
            Institution
          </label>
          <input
            id={fields.institution.id}
            name={fields.institution.name}
            defaultValue={fields.institution.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div
            id={fields.institution.errorId}
            className="text-sm text-red-600 mt-1"
          >
            {fields.institution.errors}
          </div>
        </div>

        <div>
          <label
            htmlFor={fields.dates.id}
            className="block text-sm font-medium text-gray-700"
          >
            Dates
          </label>
          <input
            id={fields.dates.id}
            name={fields.dates.name}
            defaultValue={fields.dates.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div id={fields.dates.errorId} className="text-sm text-red-600 mt-1">
            {fields.dates.errors}
          </div>
        </div>

        <div>
          <label
            htmlFor={fields.location.id}
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            id={fields.location.id}
            name={fields.location.name}
            defaultValue={fields.location.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div
            id={fields.location.errorId}
            className="text-sm text-red-600 mt-1"
          >
            {fields.location.errors}
          </div>
        </div>

        <button
          name="intent"
          value={SETTINGS_KEYS.EDUCATION}
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Education
        </button>
      </fieldset>
    </Form>
  );
}
