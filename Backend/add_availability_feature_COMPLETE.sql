-- ================================================
-- AVAILABILITY STATUS FEATURE - DATABASE SETUP
-- ================================================
-- Run this ENTIRE script in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query
-- Copy and paste this entire file, then click "Run"
-- ================================================

-- Step 1: Add the new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS availability_message TEXT DEFAULT NULL;

-- Step 2: Add validation constraint
-- Drop existing constraint if it exists (in case you're re-running this)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_availability_status;

-- Add the constraint with valid values
ALTER TABLE public.users 
ADD CONSTRAINT check_availability_status 
CHECK (availability_status IN ('available', 'busy', 'not_looking'));

-- Step 3: Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_availability 
ON public.users(availability_status);

-- Step 4: Add helpful comments for documentation
COMMENT ON COLUMN public.users.availability_status IS 
  'Creator availability status: available (open for work), busy (booked but visible), not_looking (hidden from search)';

COMMENT ON COLUMN public.users.availability_message IS 
  'Optional custom message shown to brands (max 150 chars). Example: "Available starting January 2026"';

-- Step 5: Update existing users to have default availability
-- This ensures all existing creators show as "available" by default
UPDATE public.users 
SET availability_status = 'available' 
WHERE availability_status IS NULL;

-- ================================================
-- VERIFICATION: Check if it worked
-- ================================================
-- After running the above, run this query to verify:
-- SELECT id, username, availability_status, availability_message FROM public.users LIMIT 5;

-- ================================================
-- SUCCESS! 
-- ================================================
-- You should see:
-- ✓ availability_status column added
-- ✓ availability_message column added
-- ✓ All existing users set to 'available'
--
-- Now refresh your frontend and the feature will work!
-- ================================================
