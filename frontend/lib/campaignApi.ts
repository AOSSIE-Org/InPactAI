/**
 * Campaign API utilities
 */

import { Campaign, CampaignFilters, CampaignFormData } from "@/types/campaign";

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
  const userId = await getUserId();

  const params = new URLSearchParams({ user_id: userId });

  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.platform) {
    params.append("platform", filters.platform);
  }
  if (filters?.budget_min !== undefined) {
    params.append("budget_min", String(filters.budget_min));
  }
  if (filters?.budget_max !== undefined) {
    params.append("budget_max", String(filters.budget_max));
  }
  if (filters?.starts_after) {
    params.append("starts_after", filters.starts_after);
  }
  if (filters?.ends_before) {
    params.append("ends_before", filters.ends_before);
  }

  const response = await fetch(`${API_URL}/campaigns?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch campaigns");
  }

  return response.json();
}

/**
 * Fetch a single campaign by ID
 */
export async function fetchCampaignById(campaignId: string): Promise<Campaign> {
  const userId = await getUserId();

  const params = new URLSearchParams({ user_id: userId });

  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
  formData: CampaignFormData
): Promise<Campaign> {
  const userId = await getUserId();

  const params = new URLSearchParams({ user_id: userId });

  // Transform form data to match API schema
  const payload = {
    title: formData.title,
    short_description: formData.short_description || undefined,
    description: formData.description || undefined,
    status: formData.status,
    platforms: formData.platforms,
    deliverables: formData.deliverables,
    target_audience: formData.target_audience,
    budget_min: formData.budget_min
      ? parseFloat(formData.budget_min)
      : undefined,
    budget_max: formData.budget_max
      ? parseFloat(formData.budget_max)
      : undefined,
    preferred_creator_niches: formData.preferred_creator_niches,
    preferred_creator_followers_range:
      formData.preferred_creator_followers_range || undefined,
    starts_at: formData.starts_at || undefined,
    ends_at: formData.ends_at || undefined,
  };

  const response = await fetch(`${API_URL}/campaigns?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  formData: Partial<CampaignFormData>
): Promise<Campaign> {
  const userId = await getUserId();

  const params = new URLSearchParams({ user_id: userId });

  // Transform form data to match API schema
  const payload: any = {};

  if (formData.title) payload.title = formData.title;
  if (formData.short_description !== undefined)
    payload.short_description = formData.short_description;
  if (formData.description !== undefined)
    payload.description = formData.description;
  if (formData.status) payload.status = formData.status;
  if (formData.platforms) payload.platforms = formData.platforms;
  if (formData.deliverables) payload.deliverables = formData.deliverables;
  if (formData.target_audience)
    payload.target_audience = formData.target_audience;
  if (formData.budget_min) payload.budget_min = parseFloat(formData.budget_min);
  if (formData.budget_max) payload.budget_max = parseFloat(formData.budget_max);
  if (formData.preferred_creator_niches)
    payload.preferred_creator_niches = formData.preferred_creator_niches;
  if (formData.preferred_creator_followers_range)
    payload.preferred_creator_followers_range =
      formData.preferred_creator_followers_range;
  if (formData.starts_at) payload.starts_at = formData.starts_at;
  if (formData.ends_at) payload.ends_at = formData.ends_at;

  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
  const userId = await getUserId();

  const params = new URLSearchParams({ user_id: userId });

  const response = await fetch(
    `${API_URL}/campaigns/${campaignId}?${params.toString()}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete campaign");
  }
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
