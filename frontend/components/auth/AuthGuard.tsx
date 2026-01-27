"use client";

import { getCurrentUser, getUserProfile } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "Creator" | "Brand";
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // If a specific role is required, verify it
        if (requiredRole) {
          const profile = await getUserProfile();

          if (!profile) {
            router.push("/login");
            return;
          }

          if (profile.role !== requiredRole) {
            // Redirect to correct home page based on their actual role
            const correctPath =
              profile.role === "Creator" ? "/creator/home" : "/brand/home";
            router.push(correctPath);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}