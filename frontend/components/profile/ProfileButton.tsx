"use client";

import { getUserProfile } from "@/lib/auth-helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileButtonProps {
  role: "Brand" | "Creator";
}

export default function ProfileButton({ role }: ProfileButtonProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile();
      if (profile) {
        setUserName(profile.name);
      }

      // Fetch profile image based on role
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const { supabase } = await import("@/lib/supabaseClient");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        const endpoint =
          role === "Brand" ? "/brand/profile" : "/creator/profile";
        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl =
            role === "Brand" ? data.company_logo_url : data.profile_picture_url;
          if (imageUrl) {
            setProfileImageUrl(imageUrl);
            setImageLoading(true);
            setImageError(false);
          } else {
            setImageError(true);
            setImageLoading(false);
          }
        } else {
          setImageError(true);
          setImageLoading(false);
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
        setImageError(true);
        setImageLoading(false);
      }
    }
    loadProfile();
  }, [role]);

  // Set timeout for image loading (3 seconds)
  useEffect(() => {
    if (profileImageUrl && imageLoading) {
      const timer = setTimeout(() => {
        setImageError(true);
        setImageLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (!profileImageUrl) {
      setImageError(true);
      setImageLoading(false);
    }
  }, [profileImageUrl, imageLoading]);

  const handleClick = () => {
    const path = role === "Brand" ? "/brand/profile" : "/creator/profile";
    router.push(path);
  };

  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return role === "Brand" ? "B" : "C";
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
    >
      {/* Profile Image/Avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {profileImageUrl && !imageError ? (
          <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-200">
            <Image
              src={profileImageUrl}
              alt={userName || "Profile"}
              fill
              className="object-cover"
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-semibold text-white">
            {getInitial()}
          </div>
        )}
      </div>

      {/* User Name */}
      <span className="font-medium">{userName || role}</span>
    </button>
  );
}
