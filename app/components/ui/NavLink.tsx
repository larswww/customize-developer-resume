import { forwardRef } from "react";
import { NavLink as RouterNavLink } from "react-router";
import { cn } from "~/utils/cn";

export interface NavLinkProps
	extends React.ComponentPropsWithoutRef<typeof RouterNavLink> {
	variant?:
		| "default"
		| "primary"
		| "secondary"
		| "destructive"
		| "ghost"
		| "outline";
	size?: "sm" | "md" | "lg";
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
	(
		{ className, variant = "default", size = "md", children, ...props },
		ref,
	) => {
		return (
			<RouterNavLink
				className={({ isActive }) =>
					cn(
						"inline-flex items-center justify-start w-full font-medium transition-colors rounded-md",
						// Size variants
						{
							"text-xs px-3 py-1.5": size === "sm",
							"text-sm px-3 py-2": size === "md",
							"text-base px-4 py-2.5": size === "lg",
						},
						// Style variants (only applies if not active)
						!isActive && {
							"bg-background text-foreground hover:bg-accent hover:text-accent-foreground":
								variant === "default",
							"bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20":
								variant === "primary",
							"border border-border text-foreground hover:bg-accent hover:text-accent-foreground":
								variant === "secondary",
							"bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20":
								variant === "destructive",
							"text-muted-foreground hover:bg-accent hover:text-accent-foreground":
								variant === "ghost",
							"border border-border bg-transparent hover:bg-accent hover:text-accent-foreground":
								variant === "outline",
						},
						// Active state overrides
						isActive && "bg-primary text-primary-foreground",
						className,
					)
				}
				ref={ref}
				{...props}
			>
				{children}
			</RouterNavLink>
		);
	},
);

NavLink.displayName = "NavLink";

export { NavLink };
