"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import BrandAnalyticsDashboard from "@/components/analytics/BrandAnalyticsDashboard";

export default function BrandAnalyticsPage() {
  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <BrandAnalyticsDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
