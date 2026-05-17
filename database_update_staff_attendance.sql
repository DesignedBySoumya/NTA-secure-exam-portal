-- Table: staff_attendance
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id text NOT NULL, -- references user_roles.user_id
  center_id text REFERENCES public.exam_centers(id),
  status text DEFAULT 'present',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.staff_attendance DISABLE ROW LEVEL SECURITY;
