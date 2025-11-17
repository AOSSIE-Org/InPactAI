-- Migration SQL for Campaign Wall Feature
-- Run this SQL in your Supabase SQL editor

-- 1. Add new columns to campaigns table for campaign wall feature
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS is_open_for_applications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_on_campaign_wall boolean DEFAULT false;

-- 2. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_is_open_for_applications ON public.campaigns(is_open_for_applications) WHERE is_open_for_applications = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_is_on_campaign_wall ON public.campaigns(is_on_campaign_wall) WHERE is_on_campaign_wall = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_open_and_wall ON public.campaigns(is_open_for_applications, is_on_campaign_wall) WHERE is_open_for_applications = true AND is_on_campaign_wall = true;

-- 3. Add new columns to campaign_applications table
ALTER TABLE public.campaign_applications
ADD COLUMN IF NOT EXISTS payment_min numeric,
ADD COLUMN IF NOT EXISTS payment_max numeric,
ADD COLUMN IF NOT EXISTS timeline_days integer,
ADD COLUMN IF NOT EXISTS timeline_weeks integer,
ADD COLUMN IF NOT EXISTS description text;

-- 4. Add index for campaign_applications status filtering
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON public.campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_status ON public.campaign_applications(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator_status ON public.campaign_applications(creator_id, status);

-- 5. Add 'reviewing' to application_status enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'reviewing' value exists in the enum
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'reviewing'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_status')
    ) THEN
        -- Add 'reviewing' to the enum
        -- Note: PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE
        -- So we check first, then add if needed
        ALTER TYPE application_status ADD VALUE 'reviewing';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Value already exists, ignore
        NULL;
END $$;

-- 6. Add comment for documentation
COMMENT ON COLUMN public.campaigns.is_open_for_applications IS 'Whether this campaign accepts applications from creators';
COMMENT ON COLUMN public.campaigns.is_on_campaign_wall IS 'Whether this campaign is visible on the public campaign wall';
COMMENT ON COLUMN public.campaign_applications.payment_min IS 'Minimum payment amount the creator is requesting';
COMMENT ON COLUMN public.campaign_applications.payment_max IS 'Maximum payment amount the creator is requesting';
COMMENT ON COLUMN public.campaign_applications.timeline_days IS 'Number of days the creator estimates to complete the campaign';
COMMENT ON COLUMN public.campaign_applications.timeline_weeks IS 'Number of weeks the creator estimates to complete the campaign';
COMMENT ON COLUMN public.campaign_applications.description IS 'Creator description explaining why they should be chosen for this campaign';

