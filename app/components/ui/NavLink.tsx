import { NavLink as RouterNavLink } from "react-router";
import { cn } from "~/utils/cn";

export interface NavLinkProps
	extends Omit<
		React.ComponentPropsWithoutRef<typeof RouterNavLink>,
		"children"
	> {
	variant?:
		| "default"
		| "primary"
		| "secondary"
		| "destructive"
		| "ghost"
		| "outline";
	size?: "sm" | "md" | "lg";
	children?: React.ReactNode;
}

const NavLink = ({
	ref,
	className,
	variant = "default",
	size = "md",
	children,
	...props
}: NavLinkProps & {
	ref: React.RefObject<HTMLAnchorElement>;
}) => {
	return (
		<RouterNavLink
			className={({ isActive }: { isActive: boolean }) =>
				cn(
					"inline-flex items-center justify-start w-full font-medium transition-colors",
					// Size variants
					{
						"text-xs px-3 py-1.5": size === "sm",
						"text-sm px-3 py-2": size === "md",
						"text-base px-4 py-2.5": size === "lg",
					},
					// Style variants (only applies if not active)
					!isActive && {
						"text-white hover:bg-accent/20": variant === "default",
						"bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20":
							variant === "primary",
						"border border-border text-foreground hover:bg-accent hover:text-accent-foreground":
							variant === "secondary",
						"bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20":
							variant === "destructive",
						"text-white hover:bg-accent/10": variant === "ghost",
						"border border-border bg-transparent hover:bg-accent hover:text-accent-foreground":
							variant === "outline",
					},
					className,
				)
			}
			ref={ref}
			{...props}
		>
			{children}
		</RouterNavLink>
	);
};

NavLink.displayName = "NavLink";

export { NavLink };
