# Supabase Database Schema Reference

> **Note:** This file is for reference/documentation only. It is not intended to be run as a migration or executed directly. The SQL below is a snapshot of the schema as exported from Supabase for context and developer understanding.

---

## About

This file contains the exported DDL (Data Definition Language) statements for the database schema used in this project. It is provided for documentation and onboarding purposes. For actual migrations and schema changes, use the project's migration tool and scripts.

---

## Schema

```sql
-- Table for user profiles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade,
  name text not null,
  role text check (role in ('Creator', 'Brand')) not null,
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (id)
);

-- Table: brands
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_tagline text,
  company_description text,
  company_logo_url text,
  company_cover_image_url text,
  industry text NOT NULL,
  sub_industry text[] DEFAULT ARRAY[]::text[],
  company_size text,
  founded_year integer,
  headquarters_location text,
  company_type text,
  website_url text NOT NULL,
  contact_email text,
  contact_phone text,
  social_media_links jsonb,
  target_audience_age_groups text[] DEFAULT ARRAY[]::text[],
  target_audience_gender text[] DEFAULT ARRAY[]::text[],
  target_audience_locations text[] DEFAULT ARRAY[]::text[],
  target_audience_interests text[] DEFAULT ARRAY[]::text[],
  target_audience_income_level text[] DEFAULT ARRAY[]::text[],
  target_audience_description text,
  brand_values text[] DEFAULT ARRAY[]::text[],
  brand_personality text[] DEFAULT ARRAY[]::text[],
  brand_voice text,
  brand_colors jsonb,
  marketing_goals text[] DEFAULT ARRAY[]::text[],
  campaign_types_interested text[] DEFAULT ARRAY[]::text[],
  preferred_content_types text[] DEFAULT ARRAY[]::text[],
  preferred_platforms text[] DEFAULT ARRAY[]::text[],
  campaign_frequency text,
  monthly_marketing_budget numeric,
  influencer_budget_percentage double precision,
  budget_per_campaign_min numeric,
  budget_per_campaign_max numeric,
  typical_deal_size numeric,
  payment_terms text,
  offers_product_only_deals boolean DEFAULT false,
  offers_affiliate_programs boolean DEFAULT false,
  affiliate_commission_rate double precision,
  preferred_creator_niches text[] DEFAULT ARRAY[]::text[],
  preferred_creator_size text[] DEFAULT ARRAY[]::text[],
  preferred_creator_locations text[] DEFAULT ARRAY[]::text[],
  minimum_followers_required integer,
  minimum_engagement_rate double precision,
  content_dos text[] DEFAULT ARRAY[]::text[],
  content_donts text[] DEFAULT ARRAY[]::text[],
  brand_safety_requirements text[] DEFAULT ARRAY[]::text[],
  competitor_brands text[] DEFAULT ARRAY[]::text[],
  exclusivity_required boolean DEFAULT false,
  exclusivity_duration_months integer,
  past_campaigns_count integer DEFAULT 0,
  successful_partnerships text[] DEFAULT ARRAY[]::text[],
  case_studies text[] DEFAULT ARRAY[]::text[],
  average_campaign_roi double precision,
  products_services text[] DEFAULT ARRAY[]::text[],
  product_price_range text,
  product_categories text[] DEFAULT ARRAY[]::text[],
  seasonal_products boolean DEFAULT false,
  product_catalog_url text,
  business_verified boolean DEFAULT false,
  payment_verified boolean DEFAULT false,
  tax_id_verified boolean DEFAULT false,
  profile_completion_percentage integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_verified_brand boolean DEFAULT false,
  subscription_tier text DEFAULT 'free'::text,
  featured_until timestamp with time zone,
  ai_profile_summary text,
  search_keywords text[] DEFAULT ARRAY[]::text[],
  matching_score_base double precision DEFAULT 50.0,
  total_deals_posted integer DEFAULT 0,
  total_deals_completed integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  average_deal_rating double precision,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_active_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id),
  CONSTRAINT brands_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- ...existing code for other tables...
```

---

## How to Use

- Use this file for reference only. Do not run directly against your database.
- For schema changes, use the migration scripts and tools defined in this project.
- If you need to restore or migrate, use the official migration pipeline or tools.

---

## Source

This schema was exported from Supabase using the "Save as SQL" feature for developer context.
