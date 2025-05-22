import { LayoutDashboard, User } from "lucide-react";
import { NavLink } from "react-router";
import type { Job } from "~/services/db/dbService.server";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";
interface AppSidebarProps {
	jobs: Job[];
	navLinks: {
		to: string;
		label: string;
		badge?: number;
		indicator?: boolean;
	}[];
}

export function AppSidebar({ jobs, navLinks }: AppSidebarProps) {
	// Map paths to icons
	const getIconForPath = (path: string) => {
		if (path === "/dashboard")
			return <LayoutDashboard className="mr-2 h-4 w-4" />;
		if (path === "/settings") return <User className="mr-2 h-4 w-4" />;
		return null;
	};

	return (
		<Sidebar collapsible="offcanvas" variant="inset">
			<SidebarHeader>
				<SidebarGroup>
					<SidebarGroupLabel>NAVIGATION</SidebarGroupLabel>
					<SidebarMenu>
						{navLinks.map((link) => (
							<SidebarMenuItem key={link.to}>
								<SidebarMenuButton asChild>
									<NavLink to={link.to}>
										<span className="flex items-center">
											{getIconForPath(link.to)}
											{link.label}
											{link.indicator && (
												<span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
											)}
										</span>
									</NavLink>
								</SidebarMenuButton>
								{link.badge && (
									<SidebarMenuBadge>{link.badge}</SidebarMenuBadge>
								)}
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>JOBS</SidebarGroupLabel>
					<SidebarMenu>
						{jobs.length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">
								No jobs available
							</div>
						) : (
							jobs.map((job) => (
								<SidebarMenuItem key={job.id}>
									<NavLink className="truncate" to={`/job/${job.id}`}>
										{({ isActive }) => (
											<SidebarMenuButton isActive={isActive}>
												{job.title}
											</SidebarMenuButton>
										)}
									</NavLink>
								</SidebarMenuItem>
							))
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
