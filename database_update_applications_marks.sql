-- Add new required columns for student application marks and city preferences
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS class_10_marks text,
ADD COLUMN IF NOT EXISTS class_12_marks text,
ADD COLUMN IF NOT EXISTS graduation_marks text,
ADD COLUMN IF NOT EXISTS city_pref_1 text,
ADD COLUMN IF NOT EXISTS city_pref_2 text,
ADD COLUMN IF NOT EXISTS city_pref_3 text;
