-- Add missing columns to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS father_name text,
ADD COLUMN IF NOT EXISTS mother_name text;

-- Create papers table which was missing
CREATE TABLE IF NOT EXISTS public.papers (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  exam_id text NOT NULL,
  subject text NOT NULL,
  release_time timestamp with time zone NOT NULL,
  description text,
  file_path text NOT NULL,
  access_status text,
  uploaded_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS on the new papers table for the local demo to work
ALTER TABLE public.papers DISABLE ROW LEVEL SECURITY;
