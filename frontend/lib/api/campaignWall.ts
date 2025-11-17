import { authenticatedFetch } from "@/lib/auth-helpers";
import { Campaign } from "@/types/campaign";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || errorBody.error || detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }
  return response.json();
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return query ? `?${query}` : "";
}

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  creator_id: string;
  payment_min?: number;
  payment_max?: number;
  timeline_days?: number;
  timeline_weeks?: number;
  description?: string;
  message?: string;
  proposed_amount?: number;
  status: "applied" | "reviewing" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_profile_picture?: string;
  campaign_title?: string;
}

export interface CampaignApplicationCreate {
  payment_min?: number;
  payment_max?: number;
  timeline_days?: number;
  timeline_weeks?: number;
  description: string;
}

// ============================================================================
// PUBLIC CAMPAIGN WALL API
// ============================================================================

export async function fetchPublicCampaigns(params?: {
  search?: string;
  platform?: string;
  niche?: string;
  budget_min?: number;
  budget_max?: number;
  limit?: number;
  offset?: number;
}): Promise<Campaign[]> {
  const query = buildQuery({
    search: params?.search,
    platform: params?.platform,
    niche: params?.niche,
    budget_min: params?.budget_min,
    budget_max: params?.budget_max,
    limit: params?.limit,
    offset: params?.offset,
  });
  // Use authenticatedFetch even though endpoint is "public" - user needs to be authenticated for Supabase RLS
  const response = await authenticatedFetch(`${API_BASE_URL}/campaigns/public${query}`);
  return parseJson<Campaign[]>(response);
}

export async function fetchCampaignRecommendations(params?: {
  limit?: number;
  use_ai?: boolean;
}): Promise<Campaign[]> {
  const query = buildQuery({
    limit: params?.limit,
    use_ai: params?.use_ai,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/creators/campaign-wall/recommendations${query}`
  );
  return parseJson<Campaign[]>(response);
}

// ============================================================================
// CAMPAIGN APPLICATIONS API
// ============================================================================

export async function createCampaignApplication(
  campaignId: string,
  application: CampaignApplicationCreate
): Promise<CampaignApplication> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/campaigns/${campaignId}/applications`,
    {
      method: "POST",
      body: JSON.stringify(application),
    }
  );
  return parseJson<CampaignApplication>(response);
}

export async function fetchCampaignApplications(
  campaignId: string,
  status?: string
): Promise<CampaignApplication[]> {
  const query = buildQuery({
    status: status,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/campaigns/${campaignId}/applications${query}`
  );
  return parseJson<CampaignApplication[]>(response);
}

export async function updateApplicationStatus(
  campaignId: string,
  applicationId: string,
  newStatus: "reviewing" | "accepted" | "rejected"
): Promise<CampaignApplication> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/campaigns/${campaignId}/applications/${applicationId}/status?new_status=${newStatus}`,
    {
      method: "PUT",
    }
  );
  return parseJson<CampaignApplication>(response);
}

export async function createProposalFromApplication(
  campaignId: string,
  applicationId: string
): Promise<{ proposal: any; application_id: string; message: string }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/campaigns/${campaignId}/applications/${applicationId}/create-proposal`,
    {
      method: "POST",
    }
  );
  return parseJson<{ proposal: any; application_id: string; message: string }>(response);
}

export async function fetchCreatorApplications(
  status?: string
): Promise<CampaignApplication[]> {
  const query = buildQuery({
    status: status,
  });
  const response = await authenticatedFetch(
    `${API_BASE_URL}/creators/applications${query}`
  );
  return parseJson<CampaignApplication[]>(response);
}


