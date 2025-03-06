"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/utils";

const Separator = ({ className, orientation = "horizontal", ...props }) => (
  <SeparatorPrimitive.Root
    decorative
    orientation={orientation}
    className={cn(
      "bg-gray-300",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
);

export { Separator };
