import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getZodConstraint } from "@conform-to/zod";
import { useMemo } from "react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	NavLink,
	Outlet,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import {
	SETTINGS_KEYS,
	SETTINGS_SCHEMAS,
	type SettingsKey,
} from "~/config/constants";
import dbService from "~/services/db/dbService.server";
import type { Route } from "./+types/index";

// Helper to map pathname to settings key
function getSettingsKeyFromPath(pathname: string): SettingsKey {
	if (pathname.endsWith("/education")) return "EDUCATION";
	if (pathname.endsWith("/experience")) return "EXPERIENCE";
	if (pathname.endsWith("/projects")) return "PROJECTS";
	if (pathname.endsWith("/other")) return "OTHER";
	return "CONTACT_INFO";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const key: SettingsKey = getSettingsKeyFromPath(pathname);
	const settingsKey = SETTINGS_KEYS[key];
	const setting = await dbService.getSetting(settingsKey);
	const schema = SETTINGS_SCHEMAS[settingsKey].schema;
	const emptyValue = SETTINGS_SCHEMAS[settingsKey].emptyValue;
	let value = setting?.structuredData ?? emptyValue;
	const parsed = schema.safeParse(value);
	if (!parsed.success) value = emptyValue;
	return {
		key: settingsKey,
		value,
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
	form: any;
	fields: any;
	key: string;
}

export default function SettingsLayout({ loaderData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const lastResult = useActionData();
	const key = loaderData.key as keyof typeof SETTINGS_SCHEMAS;

	const schema = SETTINGS_SCHEMAS[key].schema;
	const emptyValue = SETTINGS_SCHEMAS[key].emptyValue;
	let defaultValue = loaderData.value;
	const parsed = schema.safeParse(defaultValue);
	if (!parsed.success) defaultValue = emptyValue;

	const [form, fields] = useForm({
		id: `${key}-form`,
		lastResult: navigation.state === "idle" ? lastResult : undefined, //@ts-ignore
		defaultValue, //@ts-ignore
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
		constraint: getZodConstraint(schema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	const context = useMemo(() => ({ form, fields, key }), [form, fields, key]);

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
				<NavLink
					to="/settings/experience"
					prefetch="intent"
					className={({ isActive }: { isActive: boolean }) =>
						`py-2 px-4 ${isActive ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`
					}
				>
					Experience
				</NavLink>
				<NavLink
					to="/settings/projects"
					prefetch="intent"
					className={({ isActive }: { isActive: boolean }) =>
						`py-2 px-4 ${isActive ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`
					}
				>
					Projects
				</NavLink>
				<NavLink
					to="/settings/other"
					prefetch="intent"
					className={({ isActive }: { isActive: boolean }) =>
						`py-2 px-4 ${isActive ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"}`
					}
				>
					Other
				</NavLink>
			</nav>
			<div className="mt-4">
				<Outlet context={context} />
			</div>
		</div>
	);
}
