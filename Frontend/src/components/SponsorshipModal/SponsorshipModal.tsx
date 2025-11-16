import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  // optional campaign data; you can extend later
  campaign?: {
    title?: string;
    brand?: string;
    overview?: string;
  };
};

export default function SponsorshipModal({ open, onClose, campaign }: Props) {
  const [tab, setTab] = useState<string>("overview");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // keep focus inside modal when open
  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    // focus the modal container
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prevActive?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const t = campaign ?? {
    title: "Festive Promo",
    brand: "Sparkle Co",
    overview: "This is a sample campaign overview to test the modal.",
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "requirements", label: "Requirements" },
    { id: "brand", label: "Brand Info" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    // overlay
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Sponsorship details"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        data-testid="backdrop"
      />

      {/* modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="document"
      >
        {/* header */}
        <div className="bg-gradient-to-r from-indigo-500 to-pink-400 p-4 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
            {t.brand?.slice(0, 1) || "B"}
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">{t.title}</div>
            <div className="text-sm opacity-90">{t.brand}</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-xs">Match Score</div>
            <div className="h-2 w-20 bg-white/30 rounded-full mt-1" />
          </div>
        </div>

        {/* tabs */}
        <div className="p-4">
          <div className="flex gap-2 mb-4 flex-wrap">
            {tabs.map((tt) => {
              const isActive = tab === tt.id;
              return (
                <button
                  key={tt.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tt.id}`}
                  id={`tab-${tt.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setTab(tt.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setTab(tt.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {tt.label}
                </button>
              );
            })}
          </div>

          {/* content box */}
          <div
            id={`tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="bg-gray-50 rounded-xl p-4 shadow-sm"
          >
            {tab === "overview" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <div className="text-sm text-gray-700">{t.overview}</div>
              </div>
            )}

            {tab === "requirements" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>Minimum reach: 50k</li>
                  <li>Deliverable: 1 short + 1 reel</li>
                  <li>Timeline: 7 days</li>
                </ul>
              </div>
            )}

            {tab === "brand" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Brand Info</h3>
                <div className="text-sm text-gray-700">
                  {t.brand} is a sample brand used for local testing.
                </div>
              </div>
            )}

            {tab === "analytics" && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Analytics</h3>
                <div className="text-sm text-gray-700">
                  No analytics available in local test mode.
                </div>
              </div>
            )}
          </div>

          {/* footer buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={() => {
                // example contact behaviour: open mailto (safe)
                const mailto = `mailto:brand@example.com?subject=Interested in ${encodeURIComponent(
                  t.title || "campaign"
                )}`;
                const win = window.open(mailto, "_blank");
                if (!win) window.location.href = mailto;
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow"
            >
              Contact
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
