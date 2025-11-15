"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import { getUserProfile, signOut } from "@/lib/auth-helpers";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatorHomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile();
      if (profile) {
        setUserName(profile.name);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                InPactAI
              </h1>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {userName || "Creator"}!
            </h2>
            <p className="mt-2 text-gray-600">
              Here's an overview of your campaigns, earnings, and performance
            </p>
          </div>

          {/* Dashboard */}
          <CreatorDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
