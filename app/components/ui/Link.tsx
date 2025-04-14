import { forwardRef } from "react";
import { Link as RouterLink } from "react-router";
import { cn } from "~/utils/cn";

export interface LinkProps
	extends React.ComponentPropsWithoutRef<typeof RouterLink> {
	variant?:
		| "default"
		| "primary"
		| "secondary"
		| "destructive"
		| "ghost"
		| "outline";
	size?: "sm" | "md" | "lg";
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{ className, variant = "default", size = "md", children, ...props },
		ref,
	) => {
		return (
			<RouterLink
				className={cn(
					"inline-flex items-center justify-center font-medium transition-colors rounded-md",
					// Size variants
					{
						"text-xs px-3 py-1": size === "sm",
						"text-sm px-4 py-2": size === "md",
						"text-base px-5 py-2.5": size === "lg",
					},
					// Style variants
					{
						"bg-gray-50 text-gray-700 hover:bg-gray-100": variant === "default",
						"bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100":
							variant === "primary",
						"border border-gray-300 text-gray-700 hover:bg-gray-50":
							variant === "secondary",
						"bg-red-50 text-red-700 border border-red-200 hover:bg-red-100":
							variant === "destructive",
						"text-gray-700 hover:bg-gray-100 hover:text-gray-900":
							variant === "ghost",
						"border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700":
							variant === "outline",
					},
					className,
				)}
				ref={ref}
				{...props}
			>
				{children}
			</RouterLink>
		);
	},
);

Link.displayName = "Link";

export { Link };
