"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { ContractsWorkspace } from "@/components/contracts/ContractsWorkspace";
import SlidingMenu from "@/components/SlidingMenu";

export default function CreatorContractsPage() {
  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ContractsWorkspace role="Creator" />
        </main>
      </div>
    </AuthGuard>
  );
}

