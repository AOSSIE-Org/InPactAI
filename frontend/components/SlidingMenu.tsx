"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Role = "creator" | "brand";

type Props = {
  role: Role;
};

export default function SlidingMenu({ role }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Strict role comparison for reliable routing
  const normalizedRole = String(role).trim().toLowerCase();
  const basePath = normalizedRole === "brand" ? "/brand" : "/creator";
  const createCampaignPath = `${basePath}/createcampaign`;

  return (
    <>
      {/* Hamburger Button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="fixed top-4 left-4 z-50 inline-flex transform items-center justify-center rounded-md border bg-white/90 p-2 shadow-sm transition hover:scale-105 dark:bg-slate-900/90"
        onClick={() => setOpen((s) => !s)}
      >
        {/* simple hamburger icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />

      {/* Sliding panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out sm:w-64 dark:bg-slate-900 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded p-1 hover:bg-slate-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href={createCampaignPath}
                className="flex items-center gap-3 rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Create Campaign</span>
              </Link>
            </li>
            {/* future actions listed here */}
          </ul>
        </nav>

        <div className="mt-auto p-4 text-sm text-slate-500">
          <p>
            Logged in as{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {role}
            </strong>
          </p>
        </div>
      </aside>
    </>
  );
}
