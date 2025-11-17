/**
 * Campaign Types - matching database schema
 */

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  status: CampaignStatus;
  platforms: string[];
  deliverables: CampaignDeliverable[];
  target_audience: TargetAudience;
  budget_min?: number;
  budget_max?: number;
  preferred_creator_niches: string[];
  preferred_creator_followers_range?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  starts_at?: string;
  ends_at?: string;
  is_featured: boolean;
  is_open_for_applications?: boolean;
  is_on_campaign_wall?: boolean;
}

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface CampaignDeliverable {
  platform: string;
  content_type: string;
  quantity: number;
  guidance?: string;
  required: boolean;
}

export interface TargetAudience {
  age_groups?: string[];
  gender?: string[];
  locations?: string[];
  interests?: string[];
  income_level?: string[];
  description?: string;
}

// For form state (input fields)
export interface CampaignFormData {
  title: string;
  short_description: string;
  description: string;
  status: CampaignStatus;
  platforms: string[];
  deliverables: CampaignDeliverable[];
  target_audience: TargetAudience;
  budget_min: string;
  budget_max: string;
  preferred_creator_niches: string[];
  preferred_creator_followers_range: string;
  starts_at: string;
  ends_at: string;
}

// For API payloads
export interface CampaignPayload {
  title: string;
  short_description?: string;
  description?: string;
  status: CampaignStatus;
  platforms: string[];
  deliverables: CampaignDeliverable[];
  target_audience: TargetAudience;
  budget_min?: number;
  budget_max?: number;
  preferred_creator_niches: string[];
  preferred_creator_followers_range?: string;
  starts_at?: string;
  ends_at?: string;
  is_open_for_applications?: boolean;
  is_on_campaign_wall?: boolean;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  search?: string;
  platform?: string;
  budget_min?: number;
  budget_max?: number;
  starts_after?: string; // ISO string
  ends_before?: string; // ISO string
}

// Platform options
export const PLATFORM_OPTIONS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter",
  "LinkedIn",
  "Facebook",
  "Twitch",
  "Blog",
  "Podcast",
] as const;

// Content type options
export const CONTENT_TYPE_OPTIONS = [
  "Post",
  "Story",
  "Reel",
  "Video",
  "Short",
  "Live Stream",
  "Article",
  "Review",
  "Tutorial",
  "Unboxing",
] as const;

// Niche options
export const NICHE_OPTIONS = [
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Travel",
  "Food",
  "Fitness",
  "Gaming",
  "Tech",
  "Finance",
  "Education",
  "Entertainment",
  "Health",
  "Parenting",
  "Business",
  "Art",
  "Music",
  "Sports",
] as const;

// Follower range options
export const FOLLOWER_RANGE_OPTIONS = [
  "1K-10K (Nano)",
  "10K-50K (Micro)",
  "50K-100K (Mid-tier)",
  "100K-500K (Macro)",
  "500K+ (Mega)",
] as const;

// Status options with display labels
export const STATUS_OPTIONS: {
  value: CampaignStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "active", label: "Active", color: "green" },
  { value: "paused", label: "Paused", color: "yellow" },
  { value: "completed", label: "Completed", color: "blue" },
  { value: "archived", label: "Archived", color: "slate" },
];

// Age group options
export const AGE_GROUP_OPTIONS = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;

// Gender options
export const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "All"] as const;

// Income level options
export const INCOME_LEVEL_OPTIONS = [
  "Low (<$25K)",
  "Lower-middle ($25K-$50K)",
  "Middle ($50K-$75K)",
  "Upper-middle ($75K-$100K)",
  "High ($100K+)",
] as const;
