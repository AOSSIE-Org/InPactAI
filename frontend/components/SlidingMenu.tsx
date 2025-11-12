"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X, Menu, Plus, Users } from "lucide-react";

export type Role = "creator" | "brand";

type Props = {
  role: Role;
};

export default function SlidingMenu({ role }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open || !panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const normalizedRole = String(role).trim().toLowerCase();
  const basePath = normalizedRole === "brand" ? "/brand" : "/creator";
  const createCampaignPath = `${basePath}/createcampaign`;

  return (
    <>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-md ring-1 ring-gray-200 transition-all duration-100 hover:scale-105 hover:shadow-lg active:scale-95"
      >
        {open ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-gray-800/40 backdrop-blur-sm transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-gray-100 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-semibold text-transparent tracking-tight">
            Menu
          </h3>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1 text-gray-700">
            {normalizedRole === "creator" && (
              <li>
                <Link
                  href="/creator/collaborations"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700"
                >
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>Collaborations</span>
                </Link>
              </li>
            )}

            <li>
              <Link
                href={createCampaignPath}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-blue-700"
              >
                <Plus className="h-5 w-5 text-blue-500" />
                <span>Create Campaign</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-gray-100 p-4 text-sm text-gray-500">
          Logged in as{" "}
          <strong className="text-gray-800 capitalize">{role}</strong>
        </div>
      </aside>
    </>
  );
}
