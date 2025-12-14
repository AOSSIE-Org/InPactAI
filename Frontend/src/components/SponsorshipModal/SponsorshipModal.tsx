import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  campaign?: {
    title?: string;
    brand?: string;
    overview?: string;
  };
};

type Tab = {
  id: string;
  label: string;
};

export default function SponsorshipModal({
  open,
  onClose,
  campaign,
}: Props) {
  const [tab, setTab] = useState<string>("overview");

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const tabs: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "requirements", label: "Requirements" },
    { id: "brand", label: "Brand Info" },
    { id: "analytics", label: "Analytics" },
  ];

  // 🔹 Focus management (open / close)
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;

      // Focus first tab button
      document.getElementById(`tab-${tabs[0].id}`)?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open, tabs]);

  // 🔹 Escape key handling
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // 🔹 Keyboard navigation for tabs
  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex = index;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setTab(tabs[nextIndex].id);
    document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
  };

  if (!open) return null;

  const t = campaign ?? {
    title: "Festive Promo",
    brand: "Sparkle Co",
    overview: "Sample overview text",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sponsorship details"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white rounded-t-2xl">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <p className="text-sm opacity-90">{t.brand}</p>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="flex gap-2 mb-4 flex-wrap"
          >
            {tabs.map((tt, index) => (
              <button
                key={tt.id}
                id={`tab-${tt.id}`}
                role="tab"
                aria-selected={tab === tt.id}
                aria-controls={`tabpanel-${tt.id}`}
                tabIndex={tab === tt.id ? 0 : -1}
                onClick={() => setTab(tt.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`px-4 py-2 rounded-full text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${
                    tab === tt.id
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-200 text-gray-800"
                  }`}
              >
                {tt.label}
              </button>
            ))}
          </div>

          {/* Tab Panel */}
          <div
            id={`tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="bg-gray-50 p-4 rounded-xl"
          >
            {tab === "overview" && <p>{t.overview}</p>}
            {tab === "requirements" && <p>Requirements content</p>}
            {tab === "brand" && <p>Brand info content</p>}
            {tab === "analytics" && <p>Analytics content</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}