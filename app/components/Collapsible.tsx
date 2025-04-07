import { useState, type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "./Icons";

interface CollapsibleProps {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  isControlled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Collapsible({
  title,
  defaultOpen = true,
  children,
  className,
  titleClassName,
  contentClassName,
  isControlled = false,
  isOpen: controlledIsOpen,
  onToggle,
}: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  // Use either controlled or uncontrolled state
  const isOpen = isControlled ? controlledIsOpen ?? false : internalIsOpen;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={cn("border rounded-lg shadow-sm", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg",
          titleClassName,
          !isOpen && "rounded-b-lg"
        )}
        aria-expanded={isOpen}
      >
        {typeof title === "string" ? (
          <span className="font-medium text-gray-800">{title}</span>
        ) : (
          title
        )}
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 max-h-0",
          contentClassName
        )}
        style={{
          maxHeight: isOpen ? "100000px" : "0",
          overflow: "hidden",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
