// Skip to Main Content - Enhanced Accessibility Component
import { useEffect } from "react";

export function SkipToContent() {
  useEffect(() => {
    // Handle skip link click
    const handleSkipClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash === "#main-content") {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Handle keyboard shortcut (Ctrl+/)
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("click", handleSkipClick);
    document.addEventListener("keydown", handleKeyboardShortcut);
    
    return () => {
      document.removeEventListener("click", handleSkipClick);
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="skip-to-content"
        aria-label="Skip to main content"
        role="navigation"
        style={{
          position: "absolute",
          left: "-9999px",
          zIndex: 999,
          padding: "1rem 1.5rem",
          backgroundColor: "hsl(262.1, 83.3%, 57.8%)",
          color: "white",
          textDecoration: "none",
          borderRadius: "0 0 0.375rem 0.375rem",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "left 0.2s ease-in-out",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = "1rem";
          e.currentTarget.style.top = "1rem";
          e.currentTarget.style.outline = "3px solid hsl(262.1, 83.3%, 57.8%)";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = "-9999px";
          e.currentTarget.style.outline = "none";
        }}
      >
        Skip to Main Content (Ctrl+/)
      </a>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Press Tab to navigate, Ctrl+/ to skip to main content
      </div>
    </>
  );
}
