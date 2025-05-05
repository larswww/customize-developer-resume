import { Outlet, useLoaderData } from "react-router";
import { NavLink } from "~/components/ui/NavLink";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarTrigger,
	SidebarInset,
	SidebarProvider,
} from "~/components/ui/sidebar";
import type { Job } from "~/services/db/dbService.server";
import dbService from "~/services/db/dbService.server";

import text from "~/text";

const navLinks = [
	{ to: "/dashboard", label: text.nav.dashboard },
	{ to: "/settings/work-history", label: text.nav.settings },
	{ to: "/settings", label: text.nav.info },
];

export async function loader() {
	const jobs = dbService.getAllJobs();
	return { jobs };
}

export default function AppLayout() {
	const { jobs } = useLoaderData<{ jobs: Job[] }>();

	return (
		<SidebarProvider defaultOpen={true}>
			<Sidebar variant="floating" collapsible="icon">
				<SidebarContent className="pt-4">
					<SidebarGroup className="px-2">
						<SidebarGroupLabel className="px-2 mb-1">
							Navigation
						</SidebarGroupLabel>
						<SidebarMenu>
							{navLinks.map((link) => (
								<SidebarMenuItem key={link.to} className="mb-1">
									<NavLink to={link.to} size="md">
										{link.label}
									</NavLink>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>

					<SidebarGroup className="mt-6 px-2">
						<SidebarGroupLabel className="px-2 mb-1">Jobs</SidebarGroupLabel>
						<SidebarMenu>
							{jobs.length === 0 ? (
								<div className="px-3 py-2 text-sm text-muted-foreground">
									No jobs available
								</div>
							) : (
								jobs.map((job) => (
									<SidebarMenuItem key={job.id} className="mb-1">
										<NavLink to={`/job/${job.id}`} size="sm" variant="ghost">
											{job.title}
										</NavLink>
									</SidebarMenuItem>
								))
							)}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<main className="flex-1">
				<SidebarTrigger />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
