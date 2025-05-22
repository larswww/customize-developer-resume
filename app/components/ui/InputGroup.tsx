import { cn } from "~/utils/cn";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
}

const InputGroup = ({
	ref,
	className,
	orientation = "horizontal",
	children,
	...props
}: InputGroupProps & {
	ref?: React.RefObject<HTMLDivElement>;
}) => {
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
};

InputGroup.displayName = "InputGroup";

export { InputGroup };
