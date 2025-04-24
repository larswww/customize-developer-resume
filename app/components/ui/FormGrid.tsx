import { cn } from "~/utils/cn";

export interface FormGridProps {
	children: React.ReactNode;
	columns?: 1 | 2 | 3 | 4;
	className?: string;
}

export function FormGrid({ children, columns = 1, className }: FormGridProps) {
	const gridCols = {
		1: "",
		2: "sm:grid-cols-2",
		3: "sm:grid-cols-3",
		4: "sm:grid-cols-4",
	};

	return (
		<div className={cn("grid gap-4 grid-cols-1", gridCols[columns], className)}>
			{children}
		</div>
	);
}
