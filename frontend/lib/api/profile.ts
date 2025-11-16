import { authenticatedFetch } from "../auth-helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_tagline?: string;
  company_description?: string;
  company_logo_url?: string;
  company_cover_image_url?: string;
  industry: string;
  sub_industry?: string[];
  company_size?: string;
  founded_year?: number;
  headquarters_location?: string;
  company_type?: string;
  website_url: string;
  contact_email?: string;
  contact_phone?: string;
  social_media_links?: Record<string, any>;
  target_audience_age_groups?: string[];
  target_audience_gender?: string[];
  target_audience_locations?: string[];
  target_audience_interests?: string[];
  target_audience_income_level?: string[];
  target_audience_description?: string;
  brand_values?: string[];
  brand_personality?: string[];
  brand_voice?: string;
  brand_colors?: Record<string, any>;
  marketing_goals?: string[];
  campaign_types_interested?: string[];
  preferred_content_types?: string[];
  preferred_platforms?: string[];
  campaign_frequency?: string;
  monthly_marketing_budget?: number;
  influencer_budget_percentage?: number;
  budget_per_campaign_min?: number;
  budget_per_campaign_max?: number;
  typical_deal_size?: number;
  payment_terms?: string;
  offers_product_only_deals?: boolean;
  offers_affiliate_programs?: boolean;
  affiliate_commission_rate?: number;
  preferred_creator_niches?: string[];
  preferred_creator_size?: string[];
  preferred_creator_locations?: string[];
  minimum_followers_required?: number;
  minimum_engagement_rate?: number;
  content_dos?: string[];
  content_donts?: string[];
  brand_safety_requirements?: string[];
  competitor_brands?: string[];
  exclusivity_required?: boolean;
  exclusivity_duration_months?: number;
  past_campaigns_count?: number;
  successful_partnerships?: string[];
  case_studies?: any[];
  average_campaign_roi?: number;
  products_services?: string[];
  product_price_range?: string;
  product_categories?: string[];
  seasonal_products?: boolean;
  product_catalog_url?: string;
  business_verified?: boolean;
  payment_verified?: boolean;
  tax_id_verified?: boolean;
  profile_completion_percentage: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_verified_brand?: boolean;
  subscription_tier?: string;
  featured_until?: string;
  ai_profile_summary?: string;
  search_keywords?: string[];
  matching_score_base?: number;
  total_deals_posted?: number;
  total_deals_completed?: number;
  total_spent?: number;
  average_deal_rating?: number;
  created_at?: string;
  updated_at?: string;
  last_active_at?: string;
  [key: string]: any;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  tagline?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  website_url?: string;
  youtube_url?: string;
  youtube_handle?: string;
  youtube_subscribers?: number;
  instagram_url?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  tiktok_url?: string;
  tiktok_handle?: string;
  tiktok_followers?: number;
  twitter_url?: string;
  twitter_handle?: string;
  twitter_followers?: number;
  twitch_url?: string;
  twitch_handle?: string;
  twitch_followers?: number;
  linkedin_url?: string;
  facebook_url?: string;
  primary_niche: string;
  secondary_niches?: string[];
  content_types?: string[];
  content_language?: string[];
  total_followers: number;
  total_reach?: number;
  average_views?: number;
  engagement_rate?: number;
  audience_age_primary?: string;
  audience_age_secondary?: string[];
  audience_gender_split?: Record<string, any>;
  audience_locations?: Record<string, any>;
  audience_interests?: string[];
  average_engagement_per_post?: number;
  posting_frequency?: string;
  best_performing_content_type?: string;
  peak_posting_times?: Record<string, any>;
  years_of_experience?: number;
  content_creation_full_time: boolean;
  team_size: number;
  equipment_quality?: string;
  editing_software?: string[];
  collaboration_types?: string[];
  preferred_brands_style?: string[];
  not_interested_in?: string[];
  rate_per_post?: number;
  rate_per_video?: number;
  rate_per_story?: number;
  rate_per_reel?: number;
  rate_negotiable: boolean;
  accepts_product_only_deals: boolean;
  minimum_deal_value?: number;
  preferred_payment_terms?: string;
  portfolio_links?: string[];
  past_brand_collaborations?: string[];
  case_study_links?: string[];
  media_kit_url?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  identity_verified?: boolean;
  profile_completion_percentage: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_verified_creator?: boolean;
  featured_until?: string;
  ai_profile_summary?: string;
  search_keywords?: string[];
  matching_score_base?: number;
  social_platforms?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  last_active_at?: string;
  [key: string]: any;
}

/**
 * Get brand profile
 */
export async function getBrandProfile(): Promise<BrandProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/brand/profile`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch brand profile");
  }

  return response.json();
}

/**
 * Update brand profile
 */
export async function updateBrandProfile(
  data: Partial<BrandProfile>
): Promise<BrandProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/brand/profile`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update brand profile");
  }

  return response.json();
}

/**
 * Get creator profile
 */
export async function getCreatorProfile(): Promise<CreatorProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/creator/profile`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch creator profile");
  }

  return response.json();
}

/**
 * Update creator profile
 */
export async function updateCreatorProfile(
  data: Partial<CreatorProfile>
): Promise<CreatorProfile> {
  const response = await authenticatedFetch(`${API_BASE_URL}/creator/profile`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update creator profile");
  }

  return response.json();
}

/**
 * Use AI to fill brand profile
 */
export async function aiFillBrandProfile(
  userInput: string
): Promise<{ message: string; data: Partial<BrandProfile> }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/brand/profile/ai-fill`,
    {
      method: "POST",
      body: JSON.stringify({ user_input: userInput }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate profile data");
  }

  return response.json();
}

/**
 * Use AI to fill creator profile
 */
export async function aiFillCreatorProfile(
  userInput: string
): Promise<{ message: string; data: Partial<CreatorProfile> }> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/creator/profile/ai-fill`,
    {
      method: "POST",
      body: JSON.stringify({ user_input: userInput }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate profile data");
  }

  return response.json();
}

