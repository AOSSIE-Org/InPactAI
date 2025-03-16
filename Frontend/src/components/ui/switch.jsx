import * as React from "react";
import { Primitive } from "@radix-ui/react-primitive";
import { cn } from "../../lib/utils" // optional, if you're using utility classes like Tailwind CSS

// Custom Radix UI Switch component
export const Switch = React.forwardRef((props, ref) => {
  return (
    <Primitive.button
      ref={ref}
      {...props}
      role="switch"
      aria-checked={props.checked ? "true" : "false"}
      className={cn(
        "relative inline-flex items-center cursor-pointer p-2 rounded-full transition-all duration-200 ease-in-out",
        props.checked ? "bg-blue-600" : "bg-gray-300", // Example for checked/unchecked state
        props.className // Additional classes if needed
      )}
    >
      <span
        className={cn(
          "block w-5 h-5 bg-white rounded-full transition-transform duration-200",
          props.checked ? "transform translate-x-5" : "transform translate-x-0"
        )}
      />
    </Primitive.button>
  );
});

Switch.displayName = "Switch";
