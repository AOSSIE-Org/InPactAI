import { authenticatedFetch } from "../auth-helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreatorBasic {
  id: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  primary_niche: string;
  secondary_niches: string[] | null;
  total_followers: number;
  engagement_rate: number | null;
  is_verified_creator: boolean;
  profile_completion_percentage: number;
}

export interface CreatorFull extends CreatorBasic {
  user_id: string;
  cover_image_url: string | null;
  website_url: string | null;
  youtube_url: string | null;
  youtube_handle: string | null;
  youtube_subscribers: number | null;
  instagram_url: string | null;
  instagram_handle: string | null;
  instagram_followers: number | null;
  tiktok_url: string | null;
  tiktok_handle: string | null;
  tiktok_followers: number | null;
  twitter_url: string | null;
  twitter_handle: string | null;
  twitter_followers: number | null;
  twitch_url: string | null;
  twitch_handle: string | null;
  twitch_followers: number | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  content_types: string[] | null;
  content_language: string[] | null;
  total_reach: number | null;
  average_views: number | null;
  audience_age_primary: string | null;
  audience_gender_split: Record<string, any> | null;
  audience_locations: Record<string, any> | null;
  audience_interests: string[] | null;
  average_engagement_per_post: number | null;
  posting_frequency: string | null;
  best_performing_content_type: string | null;
  years_of_experience: number | null;
  content_creation_full_time: boolean;
  team_size: number;
  equipment_quality: string | null;
  editing_software: string[] | null;
  collaboration_types: string[] | null;
  preferred_brands_style: string[] | null;
  rate_per_post: number | null;
  rate_per_video: number | null;
  rate_per_story: number | null;
  rate_per_reel: number | null;
  rate_negotiable: boolean;
  accepts_product_only_deals: boolean;
  minimum_deal_value: number | null;
  preferred_payment_terms: string | null;
  portfolio_links: string[] | null;
  past_brand_collaborations: string[] | null;
  case_study_links: string[] | null;
  media_kit_url: string | null;
  created_at: string | null;
  last_active_at: string | null;
}

export interface ListCreatorsParams {
  search?: string;
  niche?: string;
  limit?: number;
  offset?: number;
}

/**
 * List all creators with optional search and filters
 */
export async function listCreators(
  params: ListCreatorsParams = {}
): Promise<CreatorBasic[]> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.niche) queryParams.append("niche", params.niche);
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());

  const url = `${API_BASE_URL}/creators?${queryParams.toString()}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    // Try to get error details from response
    let errorMessage = `Failed to fetch creators: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // If response is not JSON, use status text
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Get full details of a specific creator
 */
export async function getCreatorDetails(creatorId: string): Promise<CreatorFull> {
  const url = `${API_BASE_URL}/creators/${creatorId}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch creator details: ${response.statusText}`);
  }

  return response.json();
}

export interface CreatorRecommendation {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  primary_niche: string | null;
  total_followers: number | null;
  engagement_rate: number | null;
  top_platforms?: string[] | null;
  match_score: number;
  reason: string;
}

export async function getCreatorRecommendations(limit = 4): Promise<CreatorRecommendation[]> {
  const url = `${API_BASE_URL}/creators/recommendations?limit=${limit}`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Failed to fetch recommendations: ${response.status} ${errText}`);
  }
  return response.json();
}

/**
 * Get list of all unique niches
 */
export async function listNiches(): Promise<string[]> {
  const url = `${API_BASE_URL}/creators/niches/list`;
  const response = await authenticatedFetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch niches: ${response.statusText}`);
  }

  const data = await response.json();
  return data.niches || [];
}

