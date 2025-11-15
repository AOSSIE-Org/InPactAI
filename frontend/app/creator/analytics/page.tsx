"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import CreatorAnalyticsDashboard from "@/components/analytics/CreatorAnalyticsDashboard";

export default function CreatorAnalyticsPage() {
  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CreatorAnalyticsDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
