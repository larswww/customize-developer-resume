import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { MinusIcon, PlusIcon } from "../icons";
import { LoadingSpinnerIcon } from "../icons";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				action:
					"bg-[var(--color-yellow-500)] text-[var(--color-yellow-900)] shadow-xs font-bold hover:bg-[var(--color-yellow-400)] hover:text-[var(--color-yellow-900)] focus-visible:ring-[var(--color-yellow-400)] active:bg-[var(--color-yellow-600)] dark:bg-[var(--color-yellow-400)] dark:text-[var(--color-yellow-900)] dark:hover:bg-[var(--color-yellow-300)] dark:hover:text-[var(--color-yellow-900)] border-2 border-[var(--color-yellow-700)]",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
			active: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			{
				variant: "default",
				active: true,
				className: "bg-primary/80",
			},
			{
				variant: "destructive",
				active: true,
				className: "bg-destructive/80",
			},
			{
				variant: "outline",
				active: true,
				className: "border-primary bg-accent/20 text-primary",
			},
			{
				variant: "secondary",
				active: true,
				className: "bg-secondary/70",
			},
			{
				variant: "ghost",
				active: true,
				className: "bg-accent/30 text-accent-foreground",
			},
			{
				variant: "link",
				active: true,
				className: "underline text-primary/80",
			},
			{
				variant: "action",
				active: true,
				className:
					"bg-[var(--color-yellow-400)] text-[var(--color-yellow-900)] border-[var(--color-yellow-800)]",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
			active: false,
		},
	},
);

function Button({
	className,
	variant,
	size,
	isActive = false,
	isLoading,
	disabled = false,
	asChild = false,
	children,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		isActive?: boolean;
		isLoading?: boolean;
		disabled?: boolean;
		children?: React.ReactNode;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(
				buttonVariants({ variant, size, active: isActive, className }),
				isLoading !== undefined ? "min-w-[120px]" : undefined,
				"relative",
			)}
			disabled={disabled || isLoading}
			aria-pressed={typeof isActive === "boolean" ? isActive : undefined}
			{...props}
		>
			<span className="flex items-center justify-center gap-2 w-full">
				{isLoading && (
					<LoadingSpinnerIcon size={size === "icon" ? "sm" : undefined} />
				)}
				{children}
			</span>
		</Comp>
	);
}

export const AddRemoveButton = React.forwardRef<
	HTMLButtonElement,
	Omit<React.ComponentProps<typeof Button>, "type"> & { type: "add" | "remove" }
>(({ type, children, ...props }, ref) => (
	<Button
		ref={ref}
		type="button"
		variant="outline"
		className="justify-between text-left"
		{...props}
	>
		<span className="flex items-center gap-2">
			{type === "add" ? <PlusIcon size="sm" /> : <MinusIcon size="sm" />}
			{children}
		</span>
	</Button>
));
AddRemoveButton.displayName = "AddRemoveButton";

export { Button, buttonVariants };
