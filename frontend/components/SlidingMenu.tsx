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
  const proposalsPath = `${basePath}/proposals`;
  const contractsPath = `${basePath}/contracts`;
  const analyticsPath = `${basePath}/analytics`;

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
        <div className="flex flex-col border-b p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              href={`${basePath}/home`}
              className="text-2xl font-extrabold text-blue-700 hover:underline focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Go to InpactAI home"
            >
              InpactAI
            </Link>
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
          <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            Menu
          </h3>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {normalizedRole === "creator" && (
              <>
                <li>
                  <Link
                    href="/creator/collaborations"
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Collaborations</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/creator/campaign-wall"
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span>CampaignWall</span>
                  </Link>
                </li>
              </>
            )}
            {normalizedRole === "brand" && (
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
            )}
            <li>
              <Link
                href={proposalsPath}
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Proposals</span>
              </Link>
            </li>
            <li>
              <Link
                href={contractsPath}
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
                    d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Contracts</span>
              </Link>
            </li>
            <li>
              <Link
                href={analyticsPath}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Analytics</span>
              </Link>
            </li>
            {/* future actions listed here */}
          </ul>
        </nav>

        <div className="mb-0 p-4 text-sm text-slate-500">
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
