// src/main.tsx — temporary test entry
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // agar file nahi hai to hata sakte ho (nahin to leave it)

import SponsorshipModal from "./components/SponsorshipModal/SponsorshipModal";

function TestApp() {
  const [open, setOpen] = React.useState(false);

  const sample = {
    id: "c1",
    title: "Festive Promo",
    brandName: "Sparkle Co",
    brandAvatar: "",
    brandEmail: "brand@example.com",
    overview: "This is a sample campaign overview to test the modal.",
    requirements: ["1 Reel", "2 Posts"],
    analytics: { engagementRate: 3.4, avgViews: 12000, matchScore: 80 },
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Local Test: Sponsorship Modal</h1>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 14px",
          background: "#4f46e5",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Open Modal
      </button>

      <SponsorshipModal open={open} onClose={() => setOpen(false)} campaign={sample} />
    </div>
  );
}

const rootEl = document.getElementById("root") || document.body.appendChild(document.createElement("div"));
createRoot(rootEl as HTMLElement).render(<TestApp />);
