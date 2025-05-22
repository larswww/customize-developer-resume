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
		icon?: React.ReactNode;
	}[];
}

export function AppSidebar({ jobs, navLinks }: AppSidebarProps) {
	return (
		<Sidebar collapsible="offcanvas" variant="inset">
			<SidebarHeader>
				<SidebarGroup>
					<SidebarMenu>
						{navLinks.map((link) => (
							<NavLink key={link.to} to={link.to}>
								{({ isActive }) => (
									<SidebarMenuItem variant="navigation">
										<SidebarMenuButton
											isActive={isActive}
											variant="default"
											size="lg"
											asChild
										>
											<span className="flex items-center">
												{link.icon}
												{link.label}
												{link.indicator && (
													<span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
												)}
											</span>
										</SidebarMenuButton>
										{link.badge && (
											<SidebarMenuBadge>{link.badge}</SidebarMenuBadge>
										)}
									</SidebarMenuItem>
								)}
							</NavLink>
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
											<SidebarMenuButton
												isActive={isActive}
												variant="default"
												size="sm"
											>
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
