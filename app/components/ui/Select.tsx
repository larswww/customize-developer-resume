import React, { forwardRef } from "react";
import { cn } from "~/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    label, 
    variant = "default", 
    size = "md", 
    fullWidth = false, 
    className = "",
    containerClassName = "",
    labelClassName = "",
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "h-8 text-sm px-2",
      md: "h-10 text-base px-3",
      lg: "h-12 text-lg px-4",
    };

    const variantClasses = {
      default: "border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500",
      outline: "border-gray-300 bg-transparent hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500",
    };

    const baseClasses = 
      "block rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none pr-8";
    
    const widthClass = fullWidth ? "w-full" : "";

    const selectClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      widthClass,
      className
    );

    // Icon positioning classes
    const iconClasses = "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700";

    return (
      <div className={cn("relative", fullWidth && "w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id} 
            className={cn("block mb-2 font-medium text-gray-700", labelClassName)}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className={iconClasses}>
            <svg
              className="h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <title>Dropdown arrow</title>
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select }; 