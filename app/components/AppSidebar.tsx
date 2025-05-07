import { BookText, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "~/components/ui/NavLink";
import type { Job } from "~/services/db/dbService.server";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";
interface AppSidebarProps {
	jobs: Job[];
	navLinks: { to: string; label: string }[];
}

export function AppSidebar({ jobs, navLinks }: AppSidebarProps) {
	// Map paths to icons
	const getIconForPath = (path: string) => {
		if (path === "/dashboard")
			return <LayoutDashboard className="mr-2 h-4 w-4" />;
		if (path === "/career") return <BookText className="mr-2 h-4 w-4" />;
		if (path === "/settings") return <User className="mr-2 h-4 w-4" />;
		return null;
	};

	return (
		<Sidebar collapsible="offcanvas" variant="inset">
			<SidebarHeader>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarMenu>
						{navLinks.map((link) => (
							<SidebarMenuItem key={link.to}>
								<SidebarMenuButton>
									<NavLink to={link.to}>
										<span className="flex items-center">
											{getIconForPath(link.to)}
											{link.label}
										</span>
									</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Jobs</SidebarGroupLabel>
					<SidebarMenu>
						{jobs.length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">
								No jobs available
							</div>
						) : (
							jobs.map((job) => (
								<SidebarMenuItem key={job.id}>
									<SidebarMenuButton>
										<NavLink to={`/job/${job.id}`}>{job.title}</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
