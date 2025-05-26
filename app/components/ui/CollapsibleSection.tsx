import { useState } from "react";
import { AddRemoveButton } from "./button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./collapsible";

export default function CollapsibleSection({
	open: controlledOpen,
	onOpenChange,
	buttonContent,
	children,
	className,
	...props
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	buttonContent: React.ReactNode;
	children: React.ReactNode;
	className?: string;
} & React.ComponentProps<typeof Collapsible>) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	function handleToggle() {
		if (isControlled && onOpenChange) {
			onOpenChange(!open);
		} else {
			setUncontrolledOpen((prev) => !prev);
		}
	}

	return (
		<Collapsible open={open} className={className} {...props}>
			<CollapsibleTrigger asChild>
				<AddRemoveButton
					type={open ? "remove" : "add"}
					className="w-full justify-between text-left"
					onClick={handleToggle}
				>
					{buttonContent}
				</AddRemoveButton>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-4">{children}</CollapsibleContent>
		</Collapsible>
	);
}
