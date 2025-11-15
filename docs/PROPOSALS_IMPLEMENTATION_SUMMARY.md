# Proposals & Find Creators Feature Implementation Summary

## Overview

This document summarizes the implementation of the Find Creators and Proposals features for the InPactAI platform. These features allow brands to find matching creators using AI and send collaboration proposals.

## Features Implemented

### 1. Find Creators Feature

**Location**: `/brand/campaigns/[campaign_id]/find-creators`

**Functionality**:
- AI-powered creator matching using Groq LLM
- Displays top 4 matching creators based on campaign requirements and brand profile
- Shows match scores and reasoning for each creator
- Expandable creator details view
- Direct proposal sending from the find creators page

**Key Components**:
- Backend endpoint: `GET /campaigns/{campaign_id}/find-creators`
- Frontend page: `frontend/app/brand/campaigns/[campaign_id]/find-creators/page.tsx`
- Uses rule-based scoring + AI refinement for better matches

### 2. Proposals System

**Functionality**:
- Brands can send proposals to creators
- Creators can view and respond to proposals (accept/decline)
- AI-powered proposal content drafting
- Status tracking (pending, accepted, declined, withdrawn)

**Key Components**:
- Backend endpoints in `backend/app/api/routes/proposals.py`
- Brand proposals page: `frontend/app/brand/proposals/page.tsx`
- Creator proposals page: `frontend/app/creator/proposals/page.tsx`
- Sliding menu updated with Proposals link

### 3. AI Proposal Drafting

**Endpoint**: `POST /proposals/draft`

**Functionality**:
- Uses Groq LLM to draft professional proposal content
- Considers brand profile, campaign details, and creator profile
- Generates subject line and message body
- Takes into account content ideas and ideal pricing

## Database Schema

### New Table: `proposals`

**Location**: Added to `backend/SQL` file

**Columns**:
- `id` (uuid, primary key)
- `campaign_id` (uuid, foreign key → campaigns)
- `brand_id` (uuid, foreign key → brands)
- `creator_id` (uuid, foreign key → creators)
- `subject` (text, required)
- `message` (text, required)
- `proposed_amount` (numeric, optional)
- `content_ideas` (text[], optional)
- `ideal_pricing` (text, optional)
- `status` (text, default: 'pending', check: pending|accepted|declined|withdrawn)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Constraints**:
- Unique constraint on `(campaign_id, creator_id, brand_id)` to prevent duplicates
- Foreign keys with CASCADE delete
- Check constraint on status field

**Indexes**:
- `idx_proposals_campaign_id`
- `idx_proposals_brand_id`
- `idx_proposals_creator_id`
- `idx_proposals_status`
- `idx_proposals_created_at`

**Triggers**:
- `update_proposals_updated_at` - Auto-updates `updated_at` on row changes

## Supabase Setup Instructions

### 1. Create the Proposals Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Proposals table for brand-to-creator collaboration proposals
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  proposed_amount numeric,
  content_ideas text[] DEFAULT ARRAY[]::text[],
  ideal_pricing text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proposals_pkey PRIMARY KEY (id),
  CONSTRAINT proposals_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE,
  CONSTRAINT proposals_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE,
  CONSTRAINT proposals_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE,
  CONSTRAINT proposals_unique_campaign_creator UNIQUE (campaign_id, creator_id, brand_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposals_campaign_id ON public.proposals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_proposals_brand_id ON public.proposals(brand_id);
CREATE INDEX IF NOT EXISTS idx_proposals_creator_id ON public.proposals(creator_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();
```

### 2. Set Up Row Level Security (RLS)

Add RLS policies for the proposals table:

```sql
-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Brands can view their own sent proposals
CREATE POLICY "Brands can view their sent proposals"
  ON public.proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = proposals.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Policy: Creators can view their received proposals
CREATE POLICY "Creators can view their received proposals"
  ON public.proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creators
      WHERE creators.id = proposals.creator_id
      AND creators.user_id = auth.uid()
    )
  );

-- Policy: Brands can create proposals
CREATE POLICY "Brands can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = proposals.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Policy: Brands can update their own proposals (to withdraw)
CREATE POLICY "Brands can update their proposals"
  ON public.proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.brands
      WHERE brands.id = proposals.brand_id
      AND brands.user_id = auth.uid()
    )
  );

-- Policy: Creators can update proposals they received (to accept/decline)
CREATE POLICY "Creators can update received proposals"
  ON public.proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.creators
      WHERE creators.id = proposals.creator_id
      AND creators.user_id = auth.uid()
    )
  );
```

## API Endpoints

### Find Creators
- `GET /campaigns/{campaign_id}/find-creators?limit=4&use_ai=true`
  - Returns top matching creators for a campaign
  - Uses AI (Groq) to refine matches and generate reasoning

### Proposals
- `POST /proposals` - Create a new proposal
- `GET /proposals/sent` - Get proposals sent by current brand
- `GET /proposals/received` - Get proposals received by current creator
- `PUT /proposals/{proposal_id}/status` - Update proposal status
- `POST /proposals/draft?campaign_id={id}&creator_id={id}` - AI-draft proposal content

## Frontend Routes

### Brand Routes
- `/brand/campaigns` - Campaigns list (now includes "Find Creators" button)
- `/brand/campaigns/[campaign_id]/find-creators` - Find matching creators page
- `/brand/proposals` - View sent proposals

### Creator Routes
- `/creator/proposals` - View received proposals

## UI Components

### Updated Components
- `SlidingMenu.tsx` - Added Proposals link for both brands and creators
- `frontend/app/brand/campaigns/page.tsx` - Added "Find Creators" button

### New Components
- `frontend/app/brand/campaigns/[campaign_id]/find-creators/page.tsx`
- `frontend/app/brand/proposals/page.tsx`
- `frontend/app/creator/proposals/page.tsx`

## Configuration Required

### Environment Variables
Ensure these are set in your backend `.env`:
- `GROQ_API_KEY` - Required for AI matching and proposal drafting

### Backend Dependencies
The following Python packages are used (should already be in requirements.txt):
- `groq` - For AI-powered matching and content generation

## Testing Checklist

- [ ] Create proposals table in Supabase
- [ ] Set up RLS policies
- [ ] Test finding creators for a campaign
- [ ] Test sending a proposal
- [ ] Test AI proposal drafting
- [ ] Test viewing sent proposals (brand)
- [ ] Test viewing received proposals (creator)
- [ ] Test accepting a proposal (creator)
- [ ] Test declining a proposal (creator)
- [ ] Test withdrawing a proposal (brand)

## Notes

- The Find Creators feature uses a hybrid approach: rule-based initial scoring + AI refinement
- Proposals prevent duplicates via unique constraint on (campaign_id, creator_id, brand_id)
- All proposal operations respect RLS policies for security
- The AI drafting feature requires Groq API key to be configured

