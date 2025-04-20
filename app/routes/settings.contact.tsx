import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from "react-router";
import {
  type ContactInfo,
  ContactInfoSchema,
  type Education,
} from "~/config/templates/sharedTypes";
import type { action as settingsAction } from "./settings";
import { SETTINGS_KEYS } from "~/config/constants";
// Define the context type manually based on the loader's return shape
interface SettingsOutletContext {
  contactInfo: ContactInfo;
  education: Education;
}

export default function SettingsContact() {
  // Use the manually defined type
  const context = useOutletContext<SettingsOutletContext>();
  const lastResult = useActionData<typeof settingsAction>();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    id: "contact-info-form",
    lastResult: navigation.state === "idle" ? lastResult : undefined,
    defaultValue: context?.contactInfo,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ContactInfoSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Form method="post"  action="/settings" {...getFormProps(form)}>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold mb-2">
          Contact Information
        </legend>
        <div>
          <label
            htmlFor={fields.name.id}
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id={fields.name.id}
            name={fields.name.name}
            defaultValue={fields.name.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div id={fields.name.errorId} className="text-sm text-red-600 mt-1">
            {fields.name.errors}
          </div>
        </div>

        <div>
          <label
            htmlFor={fields.email.id}
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id={fields.email.id}
            name={fields.email.name}
            defaultValue={fields.email.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div id={fields.email.errorId} className="text-sm text-red-600 mt-1">
            {fields.email.errors}
          </div>
        </div>

        <div>
          <label
            htmlFor={fields.phone.id}
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            id={fields.phone.id}
            name={fields.phone.name}
            defaultValue={fields.phone.initialValue}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div id={fields.phone.errorId} className="text-sm text-red-600 mt-1">
            {fields.phone.errors}
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
          value={SETTINGS_KEYS.CONTACT_INFO}
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Contact Info
        </button>
      </fieldset>
    </Form>
  );
}
