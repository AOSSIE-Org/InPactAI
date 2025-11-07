"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import { getUserProfile, signOut } from "@/lib/auth-helpers";
import { Briefcase, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BrandHomePage() {
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
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
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
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Welcome Message */}
            <div className="mb-8">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 text-4xl font-bold text-gray-900">
                Hello {userName || "Brand"}!
              </h2>
              <p className="text-xl text-gray-600">
                You are a{" "}
                <span className="font-semibold text-blue-600">Brand</span>
              </p>
            </div>

            {/* Info Card */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Welcome to InPactAI Brand Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">
                      Discover and collaborate with talented creators to amplify
                      your brand's message and reach.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Create Campaigns
                    </h3>
                    <p className="text-sm text-gray-600">
                      Launch influencer marketing campaigns, set your budget,
                      and find the perfect creators for your brand.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Measure Impact
                    </h3>
                    <p className="text-sm text-gray-600">
                      Track campaign performance, ROI, and engagement metrics
                      with powerful analytics tools.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <button className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700">
                  Create Your First Campaign
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
