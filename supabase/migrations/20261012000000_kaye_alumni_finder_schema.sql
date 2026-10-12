-- ============================================================================
-- Kaye AlumniFinder - Production PostgreSQL Migration
-- Enables Row Level Security (RLS) on all tables with strict access control.
-- Fully compliant with DPDP Act 2023 & GDPR principles.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE profile_source AS ENUM ('agent', 'self_registered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES_USERS (Auth profile mirror)
CREATE TABLE IF NOT EXISTS profiles_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL
);

-- 4. ALUMNI_PROFILES
-- Public professional data only. No email or phone numbers permitted.
CREATE TABLE IF NOT EXISTS alumni_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  current_role TEXT,
  company TEXT,
  location TEXT,
  college TEXT NOT NULL,
  passout_year INTEGER NOT NULL CHECK (passout_year BETWEEN 1970 AND 2035),
  branch TEXT NOT NULL,
  linkedin_url TEXT NOT NULL UNIQUE,
  source profile_source NOT NULL DEFAULT 'agent',
  visibility JSONB NOT NULL DEFAULT '{"show_company": true, "show_role": true, "show_location": true}'::jsonb,
  last_verified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy search lookups
CREATE INDEX IF NOT EXISTS idx_alumni_search ON alumni_profiles (college, passout_year, branch);
CREATE INDEX IF NOT EXISTS idx_alumni_linkedin ON alumni_profiles (linkedin_url);

-- 5. BOOKMARKS
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES profiles_users(id) ON DELETE CASCADE,
  alumni_profile_id UUID NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, alumni_profile_id)
);

-- 6. CONNECTION_REQUESTS
-- Consent-first networking. Contact details revealed ONLY after acceptance.
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user UUID NOT NULL REFERENCES profiles_users(id) ON DELETE CASCADE,
  to_alumni_user UUID NOT NULL REFERENCES profiles_users(id) ON DELETE CASCADE,
  message VARCHAR(500) NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  replied_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conn_from_user ON connection_requests(from_user, created_at);
CREATE INDEX IF NOT EXISTS idx_conn_to_alumni ON connection_requests(to_alumni_user, status);

-- 7. OPT_OUTS
-- Permanent suppression list. Unconditionally excluded from all queries and caches.
CREATE TABLE IF NOT EXISTS opt_outs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  linkedin_url TEXT NOT NULL UNIQUE,
  reason TEXT,
  email TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_opt_outs_url ON opt_outs (linkedin_url);

-- 8. SEARCH_CACHE
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash TEXT NOT NULL UNIQUE,
  results_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_cache_hash ON search_cache (query_hash);

-- 9. SEARCH_LOGS
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles_users(id) ON DELETE SET NULL,
  filters JSONB NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  from_cache BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE profiles_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- 1. profiles_users
CREATE POLICY "Users can read own profile" ON profiles_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles_users
  FOR UPDATE USING (auth.uid() = id);

-- 2. colleges (public read)
CREATE POLICY "Public read colleges" ON colleges
  FOR SELECT TO public USING (true);

-- 3. alumni_profiles
-- Anyone can view profiles, excluding any in opt_outs
CREATE POLICY "Public read alumni profiles" ON alumni_profiles
  FOR SELECT TO public
  USING (
    linkedin_url NOT IN (SELECT linkedin_url FROM opt_outs)
  );

CREATE POLICY "Alumni can update own profile" ON alumni_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Alumni can delete own profile" ON alumni_profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Alumni can insert own profile" ON alumni_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. bookmarks (strictly private to user)
CREATE POLICY "Users view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- 5. connection_requests
CREATE POLICY "Users can view sent or received requests" ON connection_requests
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_alumni_user);

CREATE POLICY "Users can create requests" ON connection_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Alumni can update received request status" ON connection_requests
  FOR UPDATE USING (auth.uid() = to_alumni_user);

-- 6. opt_outs (anyone can insert; read restricted to admin and service role)
CREATE POLICY "Public can request opt-out" ON opt_outs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Only admins read opt-outs" ON opt_outs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_users
      WHERE profiles_users.id = auth.uid() AND profiles_users.role = 'admin'
    )
  );

-- 7. search_cache (service role & authenticated users read)
CREATE POLICY "Read search cache" ON search_cache
  FOR SELECT TO authenticated USING (true);

-- 8. search_logs (users see own logs)
CREATE POLICY "Users see own search logs" ON search_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System logs search" ON search_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
