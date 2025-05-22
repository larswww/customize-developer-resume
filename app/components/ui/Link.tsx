import { type VariantProps, cva } from "class-variance-authority";
import type { PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router";

import { cn } from "~/utils/cn";

const linkVariants = cva(
	"inline-flex items-center justify-center font-medium transition-colors rounded-md",
	{
		variants: {
			variant: {
				default: "bg-background text-foreground hover:bg-muted",
				primary: "bg-accent text-accent-foreground hover:bg-accent/90",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20",
				ghost: "text-foreground hover:bg-muted",
				outline:
					"border border-input bg-transparent hover:bg-muted text-foreground",
			},
			size: {
				sm: "text-xs px-3 py-1",
				md: "text-sm px-4 py-2",
				lg: "text-base px-5 py-2.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

function Link({
	className,
	variant,
	size,
	...props
}: React.ComponentPropsWithoutRef<typeof RouterLink> &
	VariantProps<typeof linkVariants>) {
	return (
		<RouterLink
			className={cn(linkVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Link, linkVariants };
