"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import BrandAnalyticsDashboard from "@/components/analytics/BrandAnalyticsDashboard";
import AIAnalyticsDashboard from "@/components/analytics/AIAnalyticsDashboard";
import { useState } from "react";

export default function BrandAnalyticsPage() {
  const [activeView, setActiveView] = useState<"standard" | "ai">("ai");

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveView("ai")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === "ai"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              AI Analytics
            </button>
            <button
              onClick={() => setActiveView("standard")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === "standard"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Standard Analytics
            </button>
          </div>
          {activeView === "ai" ? (
            <AIAnalyticsDashboard role="brand" />
          ) : (
            <BrandAnalyticsDashboard />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
