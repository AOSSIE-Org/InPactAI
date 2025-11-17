type Nullable<T> = T | null;
import { authenticatedFetch } from "../auth-helpers";

const API_BASE_URL = "https://in-pact-ai-1k47.vercel.app";

export interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_tagline?: Nullable<string>;
  company_description?: Nullable<string>;
  company_logo_url?: Nullable<string>;
  company_cover_image_url?: Nullable<string>;
  industry: string;
  sub_industry?: Nullable<string[]>;
  company_size?: Nullable<string>;
  founded_year?: Nullable<number>;
  headquarters_location?: Nullable<string>;
  company_type?: Nullable<string>;
  website_url: string;
  contact_email?: Nullable<string>;
  contact_phone?: Nullable<string>;
  social_media_links?: Nullable<Record<string, any>>;
  target_audience_age_groups?: Nullable<string[]>;
  target_audience_gender?: Nullable<string[]>;
  target_audience_locations?: Nullable<string[]>;
  target_audience_interests?: Nullable<string[]>;
  target_audience_income_level?: Nullable<string[]>;
  target_audience_description?: Nullable<string>;
  brand_values?: Nullable<string[]>;
  brand_personality?: Nullable<string[]>;
  brand_voice?: Nullable<string>;
  brand_colors?: Nullable<Record<string, any>>;
  marketing_goals?: Nullable<string[]>;
  campaign_types_interested?: Nullable<string[]>;
  preferred_content_types?: Nullable<string[]>;
  preferred_platforms?: Nullable<string[]>;
  campaign_frequency?: Nullable<string>;
  monthly_marketing_budget?: Nullable<number>;
  influencer_budget_percentage?: Nullable<number>;
  budget_per_campaign_min?: Nullable<number>;
  budget_per_campaign_max?: Nullable<number>;
  typical_deal_size?: Nullable<number>;
  payment_terms?: Nullable<string>;
  offers_product_only_deals?: Nullable<boolean>;
  offers_affiliate_programs?: Nullable<boolean>;
  affiliate_commission_rate?: Nullable<number>;
  preferred_creator_niches?: Nullable<string[]>;
  preferred_creator_size?: Nullable<string[]>;
  preferred_creator_locations?: Nullable<string[]>;
  minimum_followers_required?: Nullable<number>;
  minimum_engagement_rate?: Nullable<number>;
  content_dos?: Nullable<string[]>;
  content_donts?: Nullable<string[]>;
  brand_safety_requirements?: Nullable<string[]>;
  competitor_brands?: Nullable<string[]>;
  exclusivity_required?: Nullable<boolean>;
  exclusivity_duration_months?: Nullable<number>;
  past_campaigns_count?: Nullable<number>;
  successful_partnerships?: Nullable<string[]>;
  case_studies?: Nullable<any[]>;
  average_campaign_roi?: Nullable<number>;
  products_services?: Nullable<string[]>;
  product_price_range?: Nullable<string>;
  product_categories?: Nullable<string[]>;
  seasonal_products?: Nullable<boolean>;
  product_catalog_url?: Nullable<string>;
  business_verified?: Nullable<boolean>;
  payment_verified?: Nullable<boolean>;
  tax_id_verified?: Nullable<boolean>;
  profile_completion_percentage: number;
  is_active?: Nullable<boolean>;
  is_featured?: Nullable<boolean>;
  is_verified_brand?: Nullable<boolean>;
  subscription_tier?: Nullable<string>;
  featured_until?: Nullable<string>;
  ai_profile_summary?: Nullable<string>;
  search_keywords?: Nullable<string[]>;
  matching_score_base?: Nullable<number>;
  total_deals_posted?: Nullable<number>;
  total_deals_completed?: Nullable<number>;
  total_spent?: Nullable<number>;
  average_deal_rating?: Nullable<number>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
  last_active_at?: Nullable<string>;
  [key: string]: any;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: Nullable<string>;
  tagline?: Nullable<string>;
  profile_picture_url?: Nullable<string>;
  cover_image_url?: Nullable<string>;
  website_url?: Nullable<string>;
  youtube_url?: Nullable<string>;
  youtube_handle?: Nullable<string>;
  youtube_subscribers?: Nullable<number>;
  instagram_url?: Nullable<string>;
  instagram_handle?: Nullable<string>;
  instagram_followers?: Nullable<number>;
  tiktok_url?: Nullable<string>;
  tiktok_handle?: Nullable<string>;
  tiktok_followers?: Nullable<number>;
  twitter_url?: Nullable<string>;
  twitter_handle?: Nullable<string>;
  twitter_followers?: Nullable<number>;
  twitch_url?: Nullable<string>;
  twitch_handle?: Nullable<string>;
  twitch_followers?: Nullable<number>;
  linkedin_url?: Nullable<string>;
  facebook_url?: Nullable<string>;
  primary_niche: string;
  secondary_niches?: Nullable<string[]>;
  content_types?: Nullable<string[]>;
  content_language?: Nullable<string[]>;
  total_followers: number;
  total_reach?: Nullable<number>;
  average_views?: Nullable<number>;
  engagement_rate?: Nullable<number>;
  audience_age_primary?: Nullable<string>;
  audience_age_secondary?: Nullable<string[]>;
  audience_gender_split?: Nullable<Record<string, any>>;
  audience_locations?: Nullable<Record<string, any>>;
  audience_interests?: Nullable<string[]>;
  average_engagement_per_post?: Nullable<number>;
  posting_frequency?: Nullable<string>;
  best_performing_content_type?: Nullable<string>;
  peak_posting_times?: Nullable<Record<string, any>>;
  years_of_experience?: Nullable<number>;
  content_creation_full_time: boolean;
  team_size: number;
  equipment_quality?: Nullable<string>;
  editing_software?: Nullable<string[]>;
  collaboration_types?: Nullable<string[]>;
  preferred_brands_style?: Nullable<string[]>;
  not_interested_in?: Nullable<string[]>;
  rate_per_post?: Nullable<number>;
  rate_per_video?: Nullable<number>;
  rate_per_story?: Nullable<number>;
  rate_per_reel?: Nullable<number>;
  rate_negotiable: boolean;
  accepts_product_only_deals: boolean;
  minimum_deal_value?: Nullable<number>;
  preferred_payment_terms?: Nullable<string>;
  portfolio_links?: Nullable<string[]>;
  past_brand_collaborations?: Nullable<string[]>;
  case_study_links?: Nullable<string[]>;
  media_kit_url?: Nullable<string>;
  email_verified?: Nullable<boolean>;
  phone_verified?: Nullable<boolean>;
  identity_verified?: Nullable<boolean>;
  profile_completion_percentage: number;
  is_active?: Nullable<boolean>;
  is_featured?: Nullable<boolean>;
  is_verified_creator?: Nullable<boolean>;
  featured_until?: Nullable<string>;
  ai_profile_summary?: Nullable<string>;
  search_keywords?: Nullable<string[]>;
  matching_score_base?: Nullable<number>;
  social_platforms?: Nullable<Record<string, any>>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
  last_active_at?: Nullable<string>;
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
