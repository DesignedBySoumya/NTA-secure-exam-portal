-- Create Enum Types
CREATE TYPE user_role_enum AS ENUM ('student', 'center_staff', 'super_admin');
CREATE TYPE application_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed');

-- Table: exam_centers
CREATE TABLE public.exam_centers (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  city text NOT NULL,
  state text NOT NULL,
  capacity integer NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: students
CREATE TABLE public.students (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id text NOT NULL UNIQUE, -- Currently using email as identifier for demo
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  category text,
  photo_url text,
  signature_url text,
  id_proof_url text,
  dob date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: applications
CREATE TABLE public.applications (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  student_id text REFERENCES public.students(id) ON DELETE CASCADE,
  exam_post text NOT NULL,
  status application_status_enum DEFAULT 'pending',
  center_id text REFERENCES public.exam_centers(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: payments
CREATE TABLE public.payments (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  application_id text REFERENCES public.applications(id) ON DELETE CASCADE,
  status payment_status_enum DEFAULT 'pending',
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: user_roles
CREATE TABLE public.user_roles (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id text NOT NULL UNIQUE, -- Email for now
  role user_role_enum NOT NULL,
  center_id text REFERENCES public.exam_centers(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: audit_logs
CREATE TABLE public.audit_logs (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: admit_cards
CREATE TABLE public.admit_cards (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  application_id text REFERENCES public.applications(id) ON DELETE CASCADE,
  roll_number text UNIQUE,
  exam_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: attendance
CREATE TABLE public.attendance (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  application_id text REFERENCES public.applications(id) ON DELETE CASCADE,
  status text,
  biometric_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: results
CREATE TABLE public.results (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  application_id text REFERENCES public.applications(id) ON DELETE CASCADE,
  marks_obtained numeric,
  total_marks numeric,
  status text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for demo purposes (In production, enable RLS and add proper policies)
ALTER TABLE public.exam_centers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admit_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.results DISABLE ROW LEVEL SECURITY;

-- Insert Mock Data
INSERT INTO public.exam_centers (id, name, code, city, state, capacity, address)
VALUES 
  ('c1', 'Delhi Public School', 'DEL01', 'New Delhi', 'Delhi', 500, 'Sector 12, RK Puram'),
  ('c2', 'KV Mumbai', 'MUM02', 'Mumbai', 'Maharashtra', 300, 'Colaba');

INSERT INTO public.students (id, user_id, full_name, email, phone, category, photo_url, signature_url, id_proof_url, dob)
VALUES
  ('s1', 'student@demo.com', 'Rahul Kumar', 'student@demo.com', '9876543210', 'General', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/John_Hancock_Signature.svg', 'mock', '2000-05-15');

INSERT INTO public.applications (id, student_id, exam_post, status, center_id)
VALUES
  ('a1', 's1', 'Group A – State Administrative Service', 'approved', 'c1');

INSERT INTO public.payments (id, application_id, status, amount)
VALUES
  ('p1', 'a1', 'completed', 500);

INSERT INTO public.user_roles (user_id, role, center_id)
VALUES
  ('staff@demo.com', 'center_staff', 'c1'),
  ('admin@demo.com', 'super_admin', NULL);
