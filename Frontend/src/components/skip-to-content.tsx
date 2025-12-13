// Skip to Main Content - Accessibility Component
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

    document.addEventListener("click", handleSkipClick);
    return () => document.removeEventListener("click", handleSkipClick);
  }, []);

  return (
    <a
      href="#main-content"
      className="skip-to-content"
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
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "1rem";
        e.currentTarget.style.top = "1rem";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
      }}
    >
      Skip to Main Content
    </a>
  );
}
