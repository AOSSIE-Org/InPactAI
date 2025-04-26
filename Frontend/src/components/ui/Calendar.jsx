import * as React from "react";
import { format } from "date-fns";

// Dummy Calendar component for illustration
export function Calendar({ selected, onSelect, defaultMonth, numberOfMonths }) {
  const handleDateClick = (date) => {
    if (onSelect) {
      onSelect({ from: date, to: date });
    }
  };

  // Example render of a calendar (simple version)
  const renderCalendar = () => {
    const dates = [];
    const startDate = defaultMonth || new Date();
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), day));
    }

    return dates.map((date, index) => (
      <button
        key={index}
        onClick={() => handleDateClick(date)}
        className={`p-2 ${selected?.from && date.toDateString() === selected.from.toDateString() ? 'bg-blue-500' : 'bg-white'}`}
      >
        {format(date, "dd")}
      </button>
    ));
  };

  return (
    <div className="calendar-grid">
      <div className="calendar-header">
        <span>{format(defaultMonth, "MMMM yyyy")}</span>
      </div>
      <div className="calendar-body">
        {renderCalendar()}
      </div>
    </div>
  );
}
