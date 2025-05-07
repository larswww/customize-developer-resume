import { parseWithZod } from "@conform-to/zod";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	NavLink,
	Outlet,
	redirect,
} from "react-router";
import { SETTINGS_KEYS, SETTINGS_SCHEMAS } from "~/config/constants";
import type { Education } from "~/config/schemas/sharedTypes";
import dbService, { type ContactInfo } from "~/services/db/dbService.server";
import type { Route } from "./+types/settings";

export const loader = async () => {
	const contactInfo = await dbService.getContactInfo();
	const education = await dbService.getEducation();
	return {
		contactInfo:
			contactInfo ?? SETTINGS_SCHEMAS[SETTINGS_KEYS.CONTACT_INFO].emptyValue,
		education:
			education ?? SETTINGS_SCHEMAS[SETTINGS_KEYS.EDUCATION].emptyValue,
	};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const intent = formData.get("intent") as keyof typeof SETTINGS_SCHEMAS;
	const submission = parseWithZod(formData, {
		schema: SETTINGS_SCHEMAS[intent].schema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	dbService.saveSetting({
		key: intent,
		structuredData: submission.value as any,
		value: null,
	});

	if (intent !== SETTINGS_KEYS.CONTACT_INFO) {
		return redirect(`/settings/${intent}`);
	}
};

export const id = "routes/settings";

export interface SettingsOutletContext {
	contactInfo: ContactInfo;
	education: Education;
}

export default function SettingsLayout({ loaderData }: Route.ComponentProps) {
	return (
		<div className="p-4 space-y-4">
			<h1 className="text-2xl font-bold">Settings</h1>
			<nav className="flex space-x-4 border-b">
				<NavLink
					to="/settings"
					end
					prefetch="intent"
					className={({ isActive }: { isActive: boolean }) =>
						`py-2 px-4 ${
							isActive
								? "border-b-2 border-blue-500 font-semibold"
								: "text-gray-500"
						}`
					}
				>
					Contact Info
				</NavLink>
				<NavLink
					to="/settings/education"
					prefetch="intent"
					className={({ isActive }: { isActive: boolean }) =>
						`py-2 px-4 ${
							isActive
								? "border-b-2 border-blue-500 font-semibold"
								: "text-gray-500"
						}`
					}
				>
					Education
				</NavLink>
			</nav>
			<div className="mt-4">
				<Outlet context={loaderData} />
			</div>
		</div>
	);
}
