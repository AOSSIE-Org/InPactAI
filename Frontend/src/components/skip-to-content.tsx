// Skip to Main Content - Enhanced Accessibility Component
import { useEffect, useState } from "react";

export function SkipToContent() {
  const [announcement, setAnnouncement] = useState("");

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
          setAnnouncement("Navigated to main content");
          setTimeout(() => setAnnouncement(""), 3000);
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
          setAnnouncement("Jumped to main content using keyboard shortcut");
          setTimeout(() => setAnnouncement(""), 3000);
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

  const skipLinkStyle = {
    position: "absolute" as const,
    left: "-9999px",
    top: "1rem",
    zIndex: 9999,
    padding: "0.875rem 1.5rem",
    backgroundColor: "hsl(262.1, 83.3%, 57.8%)",
    color: "white",
    textDecoration: "none",
    borderRadius: "0.5rem",
    fontWeight: 600,
    fontSize: "0.875rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "2px solid transparent",
  };

  const focusedStyle = {
    left: "1rem",
    outline: "3px solid white",
    outlineOffset: "2px",
    border: "2px solid hsl(262.1, 83.3%, 70%)",
    transform: "scale(1.05)",
  };

  return (
    <>
      <a
        href="#main-content"
        className="skip-to-content"
        aria-label="Skip to main content - Press Enter or Ctrl+/"
        style={skipLinkStyle}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, focusedStyle);
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = "-9999px";
          e.currentTarget.style.outline = "none";
          e.currentTarget.style.border = "2px solid transparent";
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseEnter={(e) => {
          if (document.activeElement === e.currentTarget) {
            e.currentTarget.style.backgroundColor = "hsl(262.1, 83.3%, 65%)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "hsl(262.1, 83.3%, 57.8%)";
        }}
      >
        ⚡ Skip to Main Content <kbd style={{ 
          marginLeft: "0.5rem", 
          padding: "0.125rem 0.375rem", 
          backgroundColor: "rgba(255,255,255,0.2)", 
          borderRadius: "0.25rem",
          fontSize: "0.75rem",
          fontWeight: 400
        }}>Ctrl+/</kbd>
      </a>
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement || "Press Tab to navigate, Ctrl+/ to skip to main content"}
      </div>
    </>
  );
}
