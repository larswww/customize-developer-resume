import { Briefcase, FileText } from "lucide-react";
import { Outlet, useMatches } from "react-router";
import { AppSidebar } from "~/components/AppSidebar";
import { MainHeader } from "~/components/MainHeader";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import dbService from "~/services/db/dbService.server";
import text from "~/text";
import type { Route } from "./+types/AppLayout";

const navLinks = [
	{
		to: "/dashboard",
		label: text.nav.dashboard,
		icon: <FileText className="mr-2 h-4 w-4" />,
	},
	{
		to: "/settings",
		label: text.nav.career,
		icon: <Briefcase className="mr-2 h-4 w-4" />,
	},
];

export async function loader() {
	const jobs = dbService.getAllJobs();
	return { jobs };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
	const { jobs } = loaderData;
	const matches = useMatches();
	const lastMatch = matches[matches.length - 1];
	const title =
		lastMatch &&
		typeof lastMatch.handle === "object" &&
		lastMatch.handle &&
		"title" in lastMatch.handle &&
		typeof lastMatch.handle.title === "function"
			? lastMatch.handle.title
			: undefined;
	const rightSection =
		lastMatch &&
		typeof lastMatch.handle === "object" &&
		lastMatch.handle &&
		"rightSection" in lastMatch.handle
			? lastMatch.handle.rightSection
			: undefined;
	const leftSection =
		lastMatch &&
		typeof lastMatch.handle === "object" &&
		lastMatch.handle &&
		"leftSection" in lastMatch.handle
			? lastMatch.handle.leftSection
			: undefined;

	const safeTitle = title ? title(lastMatch, matches) : "";
	const safeRightSection = rightSection as React.ReactNode | undefined;
	const safeLeftSection = leftSection as React.ReactNode | undefined;

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 52)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar jobs={jobs} navLinks={navLinks} />
			<SidebarInset>
				{(safeTitle || safeRightSection || safeLeftSection) && (
					<MainHeader
						title={safeTitle}
						rightSection={safeRightSection}
						leftSection={safeLeftSection}
					/>
				)}
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
