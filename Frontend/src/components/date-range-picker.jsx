import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";  // Updated import for `DayPicker`

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function DateRangePicker({ className }) {
  const [dateRange, setDateRange] = React.useState({ from: null, to: null });

  const handleDateSelect = (range) => {
    setDateRange(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            selected={dateRange}
            onDayClick={handleDateSelect}
            mode="range"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
