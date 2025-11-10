import { getAuthToken, supabase } from "./supabaseClient";

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
  if (error || !user) {
    return null;
  }
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

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
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
export async function checkUserRole(): Promise<"Creator" | "Brand" | null> {
  const profile = await getUserProfile();
  return profile?.role || null;
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
 * Token refresh handling (automatic with Supabase)
 */
export async function ensureValidToken() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active session");
  }

  // Supabase automatically refreshes if needed
  return session.access_token;
}

/**
 * Make authenticated API calls to backend
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Try to get token, refresh if needed
  let token = await getAuthToken();

  // If no token, try to refresh session
  if (!token) {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
        // Don't throw here - let the 401 response handle it
        token = undefined;
      } else {
        token = session?.access_token || undefined;
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      token = undefined;
    }
  }

  if (!token) {
    // Return a response that will trigger 401, don't throw
    // This allows the calling code to handle it gracefully
    return new Response(
      JSON.stringify({ error: "No authentication token available" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, try refreshing token once
  if (response.status === 401) {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (!error && session?.access_token) {
        // Retry with new token
        const retryHeaders = {
          ...options.headers,
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        };
        return fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    } catch (err) {
      console.error("Error refreshing token on 401:", err);
    }
  }

  return response;
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
