CREATE TABLE IF NOT EXISTS public.exams (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;

INSERT INTO public.exams (name) VALUES 
('NEET (National Eligibility cum Entrance Test)'),
('Group A – State Administrative Service'),
('Group B – Revenue Inspector'),
('Group C – Sub-Inspector Police'),
('Group D – Clerk / LDC'),
('Junior Engineer (Civil)'),
('Junior Engineer (Electrical)')
ON CONFLICT DO NOTHING;
