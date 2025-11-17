/**
 * Campaign API utilities
 */

import { Campaign, CampaignFilters, CampaignPayload } from "@/types/campaign";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get user ID from Supabase session
 */
async function getUserId(): Promise<string> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

/**
 * Fetch all campaigns for the current brand
 */
export async function fetchCampaigns(
  filters?: CampaignFilters
): Promise<Campaign[]> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;

  const params = new URLSearchParams({ user_id: userId });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.platform) params.append("platform", filters.platform);
  if (filters?.budget_min !== undefined)
    params.append("budget_min", String(filters.budget_min));
  if (filters?.budget_max !== undefined)
    params.append("budget_max", String(filters.budget_max));
  if (filters?.starts_after)
    params.append("starts_after", filters.starts_after);
  if (filters?.ends_before) params.append("ends_before", filters.ends_before);

  const response = await fetch(`${API_URL}/campaigns?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch campaigns");
  }
  return response.json();
}

/**
 * Fetch campaigns for the current creator (through contracts/deals)
 */
export async function fetchCreatorCampaigns(): Promise<Campaign[]> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const response = await fetch(`${API_URL}/analytics/creator/campaigns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch campaigns");
  }
  const result = await response.json();
  return result.campaigns || [];
}

/**
 * Fetch a single campaign by ID
 */
export async function fetchCampaignById(campaignId: string): Promise<Campaign> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch campaign");
  }
  return response.json();
}

/**
 * Create a new campaign
 */
export async function createCampaign(
  formData: CampaignPayload
): Promise<Campaign> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;
  const params = new URLSearchParams({ user_id: userId });
  // Normalize budget fields to handle zero and cleared values
  let budget_min: number | undefined = undefined;
  let budget_max: number | undefined = undefined;
  if (typeof formData.budget_min === "string") {
    const minStr: string = formData.budget_min;
    budget_min = minStr.trim() === "" ? undefined : Number(minStr);
  } else if (typeof formData.budget_min === "number") {
    budget_min = formData.budget_min;
  }
  if (typeof formData.budget_max === "string") {
    const maxStr: string = formData.budget_max;
    budget_max = maxStr.trim() === "" ? undefined : Number(maxStr);
  } else if (typeof formData.budget_max === "number") {
    budget_max = formData.budget_max;
  }
  const payload: CampaignPayload = {
    ...formData,
    budget_min,
    budget_max,
  };
  const response = await fetch(`${API_URL}/campaigns?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create campaign");
  }
  return response.json();
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
  campaignId: string,
  formData: Partial<CampaignPayload>
): Promise<Campaign> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;
  const params = new URLSearchParams({ user_id: userId });
  // Normalize budget fields to handle zero and cleared values
  const payload: Partial<CampaignPayload> = { ...formData };
  if (formData.budget_min !== undefined) {
    if (typeof formData.budget_min === "string") {
      const minStr: string = formData.budget_min;
      payload.budget_min = minStr.trim() === "" ? undefined : Number(minStr);
    } else if (typeof formData.budget_min === "number") {
      payload.budget_min = formData.budget_min;
    } else {
      payload.budget_min = undefined;
    }
  }
  if (formData.budget_max !== undefined) {
    if (typeof formData.budget_max === "string") {
      const maxStr: string = formData.budget_max;
      payload.budget_max = maxStr.trim() === "" ? undefined : Number(maxStr);
    } else if (typeof formData.budget_max === "number") {
      payload.budget_max = formData.budget_max;
    } else {
      payload.budget_max = undefined;
    }
  }
  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update campaign");
  }
  return response.json();
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete campaign");
  }
}

/**
 * Fetch deliverables for a campaign
 */
export async function fetchCampaignDeliverables(
  campaignId: string
): Promise<{ deliverables: any[] }> {
  const { supabase } = await import("@/lib/supabaseClient");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const userId = user.id;
  const params = new URLSearchParams({ user_id: userId });
  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}/deliverables?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch deliverables");
  }
  return response.json();
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    archived: "bg-slate-100 text-slate-800",
  };
  return colors[status] || colors.draft;
}
