import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> 
{
  className?: string;
  variant?: "rect" | "circle";
}


const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = "rect", 
  ...props 
}) => {
  // Base classes for the pulse animation and color
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  // Shape variants
  const variantClasses = variant === "circle" ? "rounded-full" : "rounded-md";

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;