"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import {
  ProposalsWorkspace,
  TabKey,
} from "@/components/proposals/ProposalsWorkspace";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function BrandProposalsPage() {
  const searchParams = useSearchParams();

  const initialTab = useMemo<TabKey>(() => {
    const section = searchParams?.get("section")?.toLowerCase();
    if (section === "negotiations") {
      return section as TabKey;
    }
    return "proposals";
  }, [searchParams]);

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ProposalsWorkspace role="Brand" initialTab={initialTab} />
        </main>
      </div>
    </AuthGuard>
  );
}
