// Router loaders - middleware-like logic for route protection and data fetching
import { redirect, LoaderFunctionArgs } from "react-router-dom";
import { supabase } from "@/utils/supabase";
import { apiClient } from "./api";

// Check authentication status
async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Auth check error:", error);
    return null;
  }
  
  return session;
}

// Protected route loader - ensures user is authenticated
export async function protectedLoader() {
  const session = await checkAuth();
  
  if (!session) {
    // Redirect to login if not authenticated
    return redirect("/login");
  }
  
  return { session };
}

// Public route loader - redirects authenticated users to dashboard
export async function publicRouteLoader() {
  const session = await checkAuth();
  
  if (session) {
    // Already logged in, redirect to dashboard
    return redirect("/dashboard");
  }
  
  return null;
}

// Role-based route loader - checks if user has required role
export function roleBasedLoader(allowedRoles: string[]) {
  return async function loader() {
    const session = await checkAuth();
    
    if (!session) {
      return redirect("/login");
    }
    
    // Get user profile to check role
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!profile || !allowedRoles.includes(profile.role)) {
        // User doesn't have required role
        return redirect("/dashboard");
      }
      
      return { session, profile };
    } catch (error) {
      console.error("Role check error:", error);
      return redirect("/dashboard");
    }
  };
}

// Dashboard loader - preloads user data and stats
export async function dashboardLoader() {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  try {
    // Preload user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return { session, profile };
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return { session, profile: null };
  }
}

// Sponsorships loader - preloads sponsorship data
export async function sponsorshipsLoader() {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  try {
    // Preload sponsorships data
    const sponsorships = await apiClient.get('/match/sponsorships');
    return { session, sponsorships };
  } catch (error) {
    console.error("Sponsorships loader error:", error);
    return { session, sponsorships: [] };
  }
}

// Messages loader - preloads chat list
export async function messagesLoader() {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  try {
    // Preload chat list
    const chats = await apiClient.get('/chat/list');
    return { session, chats };
  } catch (error) {
    console.error("Messages loader error:", error);
    return { session, chats: [] };
  }
}

// Collaboration details loader - preloads specific collaboration
export async function collaborationDetailsLoader({ params }: LoaderFunctionArgs) {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  const { id } = params;
  
  if (!id) {
    return redirect("/dashboard/collaborations");
  }
  
  try {
    // Preload collaboration details
    const collaboration = await apiClient.get(`/collaborations/${id}`);
    return { session, collaboration };
  } catch (error) {
    console.error("Collaboration loader error:", error);
    return redirect("/dashboard/collaborations");
  }
}

// Analytics loader - preloads analytics data
export async function analyticsLoader() {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  try {
    // Preload analytics data
    const analytics = await apiClient.get('/analytics/overview');
    return { session, analytics };
  } catch (error) {
    console.error("Analytics loader error:", error);
    return { session, analytics: null };
  }
}

// Contracts loader - preloads contracts data
export async function contractsLoader() {
  const session = await checkAuth();
  
  if (!session) {
    return redirect("/login");
  }
  
  try {
    // Preload contracts
    const contracts = await apiClient.get('/contracts');
    return { session, contracts };
  } catch (error) {
    console.error("Contracts loader error:", error);
    return { session, contracts: [] };
  }
}
