-- Add availability status to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS availability_message TEXT DEFAULT NULL;

-- Add check constraint to ensure valid status values
ALTER TABLE public.users 
ADD CONSTRAINT check_availability_status 
CHECK (availability_status IN ('available', 'busy', 'not_looking'));

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_availability ON public.users(availability_status);

-- Add comment for documentation
COMMENT ON COLUMN public.users.availability_status IS 'Creator availability: available, busy, or not_looking';
COMMENT ON COLUMN public.users.availability_message IS 'Optional custom message shown to brands (e.g., "Available starting Jan 2026")';
