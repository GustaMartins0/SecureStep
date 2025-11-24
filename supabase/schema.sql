-- Supabase schema for SecureStep app
-- Creates tables for profiles, addresses, predefined locations, location history, and button history.
-- Disables RLS and grants full privileges to anon and authenticated roles (NOT secure; per request).

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Saved addresses (favorites, saved places)
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  formatted_address text,
  latitude double precision,
  longitude double precision,
  is_favorite boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Predefined locations used by the app (Terminal, Praça, etc.)
CREATE TABLE IF NOT EXISTS public.predefined_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE,
  display_name text NOT NULL,
  query text,
  latitude double precision,
  longitude double precision,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Location history (GPS traces / places visited)
CREATE TABLE IF NOT EXISTS public.location_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  address_text text,
  latitude double precision,
  longitude double precision,
  source text,
  occurred_at timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Button history (events when user pressed a button in the app)
CREATE TABLE IF NOT EXISTS public.button_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text,
  occurred_at timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_user ON public.location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_button_history_user ON public.button_history(user_id);
CREATE INDEX IF NOT EXISTS idx_predefined_key ON public.predefined_locations(key);

-- Disable RLS (Row Level Security) explicitly
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.predefined_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.button_history DISABLE ROW LEVEL SECURITY;

-- Grant wide-open permissions (not secure) so the app can read/write without RLS
-- Grant to Supabase-provided DB roles: `anon` and `authenticated`
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Insert the predefined locations used in the app
INSERT INTO public.predefined_locations (key, display_name, query, latitude, longitude)
VALUES
  ('terminal_rodoviaria','Terminal Rodoviária','Terminal Rodoviaria Caçapava, Caçapava, Brasil',-23.1021,-45.7043),
  ('supermercado_shibata','Supermercado Shibata','Supermercado Shibata, Caçapava, São Paulo',-23.1015,-45.7068),
  ('praca_bandeira','Praça da Bandeira','Praça da Bandeira, Caçapava, São Paulo',-23.1003,-45.7059),
  ('igreja_matriz','Igreja Matriz','Igreja Matriz São João Batista - Paróquia Nossa Senhora d''Ajuda, Praça Dr. Pedro de Toledo, s/n - Centro, Caçapava - SP, 12281-500',-23.1008,-45.7055)
ON CONFLICT (key) DO NOTHING;

-- Convenience view to fetch user content counts
CREATE OR REPLACE VIEW public.user_content_counts AS
SELECT
  u.id as user_id,
  COALESCE(count(a.*),0) as address_count,
  COALESCE(count(lh.*),0) as location_history_count,
  COALESCE(count(bh.*),0) as button_history_count
FROM auth.users u
LEFT JOIN public.addresses a ON a.user_id = u.id
LEFT JOIN public.location_history lh ON lh.user_id = u.id
LEFT JOIN public.button_history bh ON bh.user_id = u.id
GROUP BY u.id;

-- End of schema
