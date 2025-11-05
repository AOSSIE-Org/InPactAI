# Database & Storage Setup Guide

## 🗄️ Database Setup

### 1. Update Profiles Table

Add the `onboarding_completed` column if it doesn't exist:

```sql
-- Add onboarding_completed column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

### 2. Verify Creators Table

Make sure your `creators` table has all required columns:

```sql
-- Check if creators table exists and has correct structure
-- If not, create it:

CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  primary_niche TEXT,
  secondary_niches TEXT[],
  social_platforms JSONB DEFAULT '[]'::jsonb,
  content_types TEXT[],
  posting_frequency TEXT,
  content_language TEXT[],
  collaboration_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_primary_niche ON creators(primary_niche);
```

### 3. Verify Brands Table

Make sure your `brands` table has all required columns:

```sql
-- Check if brands table exists and has correct structure
-- If not, create it:

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_tagline TEXT,
  industry TEXT,
  description TEXT,
  website_url TEXT,
  company_size TEXT,
  logo_url TEXT,
  target_age_groups TEXT[],
  target_genders TEXT[],
  target_locations TEXT[],
  target_interests TEXT[],
  brand_values TEXT[],
  brand_personality TEXT[],
  marketing_goals TEXT[],
  monthly_budget TEXT,
  campaign_budget TEXT,
  campaign_types TEXT[],
  preferred_niches TEXT[],
  creator_sizes TEXT[],
  min_followers INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_industry ON brands(industry);
```

### 4. Set Up Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on creators table
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own creator profile
CREATE POLICY "Users can view own creator profile"
  ON creators
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own creator profile
CREATE POLICY "Users can create own creator profile"
  ON creators
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own creator profile
CREATE POLICY "Users can update own creator profile"
  ON creators
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own brand profile
CREATE POLICY "Users can view own brand profile"
  ON brands
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own brand profile
CREATE POLICY "Users can create own brand profile"
  ON brands
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own brand profile
CREATE POLICY "Users can update own brand profile"
  ON brands
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Update profile policy to allow users to update onboarding_completed
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

---

## 📦 Storage Setup

### 1. Create Storage Buckets

#### Option A: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Create first bucket:
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ **Yes** (check this box)
   - **File size limit**: 5 MB (optional)
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, image/webp`
   - Click **Create bucket**
5. Repeat for second bucket:
   - **Name**: `brand-logos`
   - **Public bucket**: ✅ **Yes**
   - **File size limit**: 5 MB (optional)
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, image/webp`
   - Click **Create bucket**

#### Option B: Using SQL

```sql
-- Create profile-pictures bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true);

-- Create brand-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true);
```

### 2. Set Up Storage Policies

```sql
-- Profile Pictures Bucket Policies

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to profile pictures
CREATE POLICY "Public can view profile pictures"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Brand Logos Bucket Policies

-- Allow authenticated users to upload their own brand logos
CREATE POLICY "Users can upload own brand logo"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to brand logos
CREATE POLICY "Public can view brand logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'brand-logos');

-- Allow users to update their own brand logos
CREATE POLICY "Users can update own brand logo"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own brand logos
CREATE POLICY "Users can delete own brand logo"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 🧪 Testing the Setup

### Test Database

```sql
-- Test 1: Check if onboarding_completed column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'onboarding_completed';

-- Test 2: Check if creators table exists with correct columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'creators'
ORDER BY ordinal_position;

-- Test 3: Check if brands table exists with correct columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'brands'
ORDER BY ordinal_position;

-- Test 4: Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('creators', 'brands', 'profiles');
```

### Test Storage

```sql
-- Test 1: Check if buckets exist
SELECT id, name, public
FROM storage.buckets
WHERE name IN ('profile-pictures', 'brand-logos');

-- Test 2: Check storage policies
SELECT policyname, tablename, cmd, permissive
FROM pg_policies
WHERE schemaname = 'storage';
```

---

## 🚨 Troubleshooting

### Issue: "relation 'creators' does not exist"

**Solution**: Run the CREATE TABLE statement for creators table above.

### Issue: "relation 'brands' does not exist"

**Solution**: Run the CREATE TABLE statement for brands table above.

### Issue: "column 'onboarding_completed' does not exist"

**Solution**: Run the ALTER TABLE statement to add the column.

### Issue: "bucket 'profile-pictures' does not exist"

**Solution**: Create the storage buckets using the dashboard or SQL commands above.

### Issue: "permission denied for table creators/brands"

**Solution**: Make sure RLS policies are set up correctly. Check that you're authenticated.

### Issue: "Failed to upload image"

**Solution**:

1. Verify storage buckets exist and are public
2. Check storage policies are set up
3. Verify file size is under 5MB
4. Check file type is allowed (jpeg, png, jpg, webp)

---

## 📋 Quick Setup Checklist

- [ ] Add `onboarding_completed` column to `profiles` table
- [ ] Create or verify `creators` table with all required columns
- [ ] Create or verify `brands` table with all required columns
- [ ] Enable RLS on creators and brands tables
- [ ] Create RLS policies for creators table
- [ ] Create RLS policies for brands table
- [ ] Create `profile-pictures` storage bucket (public)
- [ ] Create `brand-logos` storage bucket (public)
- [ ] Set up storage policies for profile-pictures
- [ ] Set up storage policies for brand-logos
- [ ] Test database setup with test queries
- [ ] Test storage setup with test upload

---

## 🎯 Verification

After running all setup scripts, verify by:

1. **Sign up** a new user (Creator role)
2. **Login** - should redirect to onboarding
3. **Complete onboarding** - upload profile picture
4. **Check database** - creator record should exist
5. **Check storage** - profile picture should be in bucket
6. **Login again** - should go to home (not onboarding)

If all steps work, your setup is complete! 🎉
