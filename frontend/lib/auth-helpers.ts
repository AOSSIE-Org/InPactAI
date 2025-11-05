import { supabase } from "./supabaseClient";

export interface UserProfile {
  id: string;
  name: string;
  role: "Creator" | "Brand";
  created_at: string;
  onboarding_completed: boolean;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Get the current user's profile from the profiles table
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Check if user has a specific role
 */
export async function checkUserRole(
  requiredRole: "Creator" | "Brand"
): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return profile?.role === requiredRole;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return profile?.onboarding_completed ?? false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}

/**
 * Map Supabase auth errors to user-friendly messages
 */
export function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || error?.message || "";

  if (
    errorCode.includes("email_exists") ||
    errorCode.includes("already_registered")
  ) {
    return "This email is already registered. Please login.";
  }

  if (
    errorCode.includes("invalid_credentials") ||
    errorCode.includes("invalid_login")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (errorCode.includes("weak_password")) {
    return "Password is too weak. Please use a stronger password.";
  }

  if (errorCode.includes("network") || errorCode.includes("fetch")) {
    return "Unable to connect. Please check your internet connection.";
  }

  if (errorCode.includes("Email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }

  // Return the original error message if we don't have a specific mapping
  return error?.message || "An unexpected error occurred. Please try again.";
}
