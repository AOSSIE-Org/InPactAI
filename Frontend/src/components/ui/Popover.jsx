import * as React from "react";

// Popover Trigger component (used to activate the popover)
export function PopoverTrigger({ children, asChild }) {
  return <div onClick={asChild ? null : () => {}}>{children}</div>;
}

// Popover Content component (the content displayed within the popover)
export function PopoverContent({ children, className, align }) {
  return (
    <div className={`popover-content ${className}`} style={{ textAlign: align || 'left' }}>
      {children}
    </div>
  );
}

// Popover component (wrapper that controls the popover behavior)
export function Popover({ children }) {
  const [open, setOpen] = React.useState(false);

  const togglePopover = () => setOpen(!open);

  return (
    <div className="popover-wrapper">
      <PopoverTrigger asChild>
        <button onClick={togglePopover} className="popover-trigger">
          Toggle Popover
        </button>
      </PopoverTrigger>
      {open && (
        <PopoverContent className="popover-open" align="start">
          {children}
        </PopoverContent>
      )}
    </div>
  );
}
