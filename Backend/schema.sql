-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE deal_status AS ENUM ('open', 'closed', 'in_progress');

-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- 'creator' or 'brand'
    profile_image TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Audience Insights Table
CREATE TABLE IF NOT EXISTS public.audience_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    audience_age_group JSONB,
    audience_location JSONB,
    engagement_rate FLOAT,
    average_views INTEGER,
    time_of_attention INTEGER, -- in seconds
    price_expectation DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sponsorships Table
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_audience JSONB, -- {"age": ["18-24"], "location": ["USA", "UK"]}
    budget DECIMAL(10, 2),
    engagement_minimum FLOAT,
    status deal_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Posts Table
CREATE TABLE IF NOT EXISTS public.user_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_url TEXT,
    category TEXT,
    engagement_metrics JSONB, -- {"likes": 500, "comments": 100, "shares": 50}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sponsorship Applications Table
CREATE TABLE IF NOT EXISTS public.sponsorship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sponsorship_id UUID NOT NULL REFERENCES public.sponsorships(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.user_posts(id) ON DELETE SET NULL,
    proposal TEXT NOT NULL,
    status application_status DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Collaborations Table
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    creator_2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    collaboration_details TEXT NOT NULL,
    status invite_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sponsorship Payments Table
CREATE TABLE IF NOT EXISTS public.sponsorship_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sponsorship_id UUID NOT NULL REFERENCES public.sponsorships(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
