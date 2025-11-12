"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
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
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                InPactAI
              </h1>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg border border-transparent bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-60"
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
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-2 text-4xl font-bold text-gray-900">
                Hello {userName || "Creator"}!
              </h2>
              <p className="text-xl text-gray-600">
                You are a{" "}
                <span className="font-semibold text-purple-600">Creator</span>
              </p>
            </div>

            {/* Info Card */}
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-md p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Welcome to InPactAI Creator Dashboard
                    </h3>
                    <p className="text-sm text-gray-600">
                      This is your creative space where you can connect with
                      brands, manage campaigns, and grow your influence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Get Started
                    </h3>
                    <p className="text-sm text-gray-600">
                      Complete your profile, browse available campaigns, and
                      start collaborating with top brands.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-600"></div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      Track Your Success
                    </h3>
                    <p className="text-sm text-gray-600">
                      Monitor your campaign performance, earnings, and audience
                      engagement all in one place.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <button className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-blue-700 active:scale-[0.98]">
                  Complete Your Profile
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
