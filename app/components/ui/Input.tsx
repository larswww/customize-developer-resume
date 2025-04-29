import { forwardRef } from "react";
import { cn } from "~/utils/cn";

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	size?: "sm" | "md" | "lg";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, size = "md", type = "text", ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex w-full rounded-md border border-gray-300 bg-white text-gray-700 transition-colors",
					"focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100",
					"disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
					{
						"text-xs px-3 py-1": size === "sm",
						"text-sm px-4 py-2": size === "md",
						"text-base px-5 py-2.5": size === "lg",
					},
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

export { Input };
