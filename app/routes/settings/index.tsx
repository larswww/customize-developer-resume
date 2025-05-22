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
import { MainHeader } from "~/components/MainHeader";
import {
	SETTINGS_KEYS,
	SETTINGS_SCHEMAS,
	type SettingsKey,
} from "~/config/constants";
import dbService from "~/services/db/dbService.server";
import text from "~/text";
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

function SettingsTabs() {
	const tabs = [
		{ to: "/settings", end: true, label: text.settings.contactInfo.legend },
		{ to: "/settings/education", label: text.settings.education.legend },
		{ to: "/settings/experience", label: text.settings.workHistory.legend },
		{ to: "/settings/projects", label: text.settings.projects.legend },
		{ to: "/settings/other", label: text.settings.other.legend },
	];

	return (
		<nav className="flex items-center gap-2 bg-transparent p-0">
			{tabs.map(({ to, end, label }) => (
				<NavLink key={to} to={to} end={end} prefetch="intent">
					{({ isActive }: { isActive: boolean }) => (
						<h1
							className={`relative px-4 py-2 rounded-md text-base font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 ${
								isActive
									? "text-yellow-700 font-bold after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-1 after:bg-yellow-600 after:rounded-full after:content-['']"
									: "text-gray-400 font-normal opacity-70 hover:text-yellow-700 hover:opacity-100 hover:bg-gray-100"
							}`}
						>
							{label}
						</h1>
					)}
				</NavLink>
			))}
		</nav>
	);
}

export const handle = {
	title: () => text.settings.contactInfo.legend,
	leftSection: <SettingsTabs />,
};

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
		<div className="space-y-4">
			<MainHeader
				title={text.settings.contactInfo.legend}
				leftSection={<SettingsTabs />}
			/>
			<div className="mt-4 px-4">
				<Outlet context={context} />
			</div>
		</div>
	);
}
