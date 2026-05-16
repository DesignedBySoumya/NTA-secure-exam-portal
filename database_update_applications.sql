-- Add missing columns to applications table to match the frontend form
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS preferred_center text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS reject_reason text,
ADD COLUMN IF NOT EXISTS exam_date timestamp with time zone;
