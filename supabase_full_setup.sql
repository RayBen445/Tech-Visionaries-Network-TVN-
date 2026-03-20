-- ==============================================================================
-- TECH VISIONARIES NETWORK (TVN) - FULL SUPABASE SETUP
-- ==============================================================================
-- Run this script in your Supabase SQL Editor.
-- It initializes the entire schema, row-level security policies, storage buckets,
-- and triggers required for the TVN platform.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- ADMIN USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins are viewable by everyone" ON public.admin_users FOR SELECT USING (true);
-- Only superusers or manual DB inserts can add admins

-- ------------------------------------------------------------------------------
-- 1. CMS & SITE SETTINGS SCHEMA
-- ------------------------------------------------------------------------------

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Tech Visionaries Network',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#00D1FF',
  secondary_color TEXT DEFAULT '#7C3AED',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for feature flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update feature flags" ON public.feature_flags FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Site Content (Text Key-Value Store)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update site content" ON public.site_content FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Announcements Banner
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage announcements" ON public.announcements FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  publish_to_social BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for published posts" ON public.content_posts FOR SELECT USING (status = 'published' OR EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Authenticated users can manage posts" ON public.content_posts FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & CONNECTIONS SCHEMA
-- ------------------------------------------------------------------------------

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT,
  bio TEXT,
  skills TEXT[],
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Connections (Peer-to-Peer Network)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (requester_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Only receivers can update connection status" ON public.connections FOR UPDATE USING (auth.uid() = receiver_id);

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS
-- ------------------------------------------------------------------------------

-- Auto-create profile trigger on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    SPLIT_PART(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. STORAGE BUCKETS
-- ------------------------------------------------------------------------------

-- Insert buckets (requires superuser, or create manually in the dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage RLS Policies for 'assets' (Admin uploads like logos, favicons, post covers)
CREATE POLICY "Public access to assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Authenticated users can manage assets" ON storage.objects FOR ALL USING (bucket_id = 'assets' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Storage RLS Policies for 'avatars' (User profile pictures)
CREATE POLICY "Public access to avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- ==============================================================================
-- ADMIN SETUP INSTRUCTIONS
-- ==============================================================================
-- The application relies on standard Supabase Authentication for the /admin panel.
-- Since the frontend handles "Is the user authenticated?" for updating site settings,
-- you simply need to create an account through the Supabase Dashboard:
--
-- 1. Go to Authentication -> Users in your Supabase Dashboard.
-- 2. Click "Add user" -> "Create new user".
-- 3. Enter the admin email (e.g., admin@tvnetwork.zone.id) and a secure password.
-- 4. Use these credentials to log in at your deployed site's /admin route.
-- ==============================================================================
