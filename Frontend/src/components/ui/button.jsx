import * as React from "react";
import { cn } from "../../lib/utils";
import { Slot } from "@radix-ui/react-slot";

const Button = React.forwardRef(({ asChild, className, variant = "default", size = "md", ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";

const variants = {
          default: "bg-gray-50 text-gray-600 hover:bg-gray-50",
          destructive: "bg-destructive text-gray-600 hover:bg-gray-50",
          outline: "border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-600",
          secondary: "bg-gray-50 text-gray-900 hover:bg-gray-50",
          ghost: "hover:text-gray-900 hover:text-gray-900",
          link: "text-primary underline-offset-4 hover:underline",
};

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};


export { Button };
