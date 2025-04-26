import React from "react";
import { Primitive } from "@radix-ui/react-primitive";
import { cn } from "../../lib/utils" // optional, if you're using utility classes like Tailwind CSS

// Custom Radix UI Textarea component
export const Textarea = React.forwardRef((props, ref) => {
  return (
    <Primitive.textarea
      ref={ref}
      {...props}
      className={cn(
        "resize-none p-2 border rounded-md focus:ring-2 focus:ring-blue-500", // Add your own styling or use Tailwind CSS classes
        props.className // Allow additional custom class names
      )}
    />
  );
});

Textarea.displayName = "Textarea";
