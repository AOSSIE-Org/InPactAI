"use client";

import { getCurrentUser, getUserProfile } from "@/lib/auth-helpers";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        const user = await getCurrentUser();

        if (user) {
          // User is logged in, fetch their profile and redirect to appropriate home
          const profile = await getUserProfile();
          if (profile) {
            if (profile.role === "Creator") {
              router.push("/creator/home");
            } else if (profile.role === "Brand") {
              router.push("/brand/home");
            }
          } else {
            // Profile not found, redirect to login
            router.push("/login");
          }
        } else {
          // User is not logged in, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/login");
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
