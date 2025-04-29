import { forwardRef } from "react";
import { cn } from "~/utils/cn";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
}

const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
	({ className, orientation = "horizontal", children, ...props }, ref) => {
		return (
			<div
				className={cn(
					"flex gap-1",
					{
						"flex-row items-center": orientation === "horizontal",
						"flex-col": orientation === "vertical",
					},
					className,
				)}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		);
	},
);

InputGroup.displayName = "InputGroup";

export { InputGroup };
