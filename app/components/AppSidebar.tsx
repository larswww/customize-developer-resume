import { NavLink } from "react-router";
import type { Job } from "~/services/db/schemas";
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
		<Sidebar collapsible="offcanvas" className="px-2 pb-4 pt-1">
			<SidebarHeader>
				<NavLink
					to="/"
					viewTransition
					className="w-full pt-1 flex justify-center"
				>
					<div className="flex items-center h-[var(--header-height)] text-primary">
						<span className="text-3xl underline">
							&nbsp;&nbsp;&nbsp;📄 résumé &nbsp;&nbsp;&nbsp;
						</span>
					</div>
				</NavLink>
				<SidebarGroup>
					<SidebarMenu>
						{navLinks.map((link) => (
							<NavLink key={link.to} to={link.to} viewTransition>
								{({ isActive }) => (
									<SidebarMenuItem variant="navigation">
										<SidebarMenuButton
											isActive={isActive}
											variant="default"
											size="lg"
											asChild
											className="pl-2 mb-1"
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
									<NavLink
										className="truncate"
										to={`/job/${job.id}`}
										viewTransition
									>
										{({ isActive }) => (
											<SidebarMenuButton
												isActive={isActive}
												variant="default"
												size="sm"
												className={`text-xs px-2 py-1 mb-0.5 ${isActive ? "bg-yellow-50 text-yellow-700" : ""}`}
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
