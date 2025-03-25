// src/components/ui/progress.jsx
import * as React from "react";
import { cn } from "../../lib/utils"; // Optional: Utility for handling classnames

// Progress component using Radix primitives
export const Progress = React.forwardRef(({ value, max = 100, className }, ref) => {
  const percentage = (value / max) * 100; // Calculate the percentage
  
  return (
    <div
      ref={ref}
      className={cn("relative w-full bg-gray-200 rounded-full", className)} // Container styling
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      role="progressbar"
    >
      <div
        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }} // Dynamic width based on value
      />
    </div>
  );
});

Progress.displayName = "Progress";
