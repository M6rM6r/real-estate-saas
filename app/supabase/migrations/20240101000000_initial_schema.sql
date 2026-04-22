-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  features JSONB DEFAULT '{}',
  primary_color TEXT DEFAULT '#1a1a1a'
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  UNIQUE(email)
);

-- Profiles table
CREATE TABLE profiles (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url TEXT,
  cover_url TEXT,
  bio TEXT,
  licence_no TEXT,
  social_links JSONB DEFAULT '{}'
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('listing', 'news', 'announcement')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  listing_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
-- Tenants: only super admin can access
CREATE POLICY "Super admin access to tenants" ON tenants FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users: scoped by tenant_id
CREATE POLICY "Users access own tenant" ON users FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Profiles: scoped by tenant_id
CREATE POLICY "Profiles access own tenant" ON profiles FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Posts: scoped by tenant_id
CREATE POLICY "Posts access own tenant" ON posts FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Media: scoped by tenant_id
CREATE POLICY "Media access own tenant" ON media FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Leads: scoped by tenant_id
CREATE POLICY "Leads access own tenant" ON leads FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Admin logs: only super admin
CREATE POLICY "Super admin access to logs" ON admin_logs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, 'media', true);

-- Storage policies
CREATE POLICY "Avatar access" ON storage.objects FOR ALL USING (bucket_id = 'avatars');
CREATE POLICY "Media access" ON storage.objects FOR ALL USING (bucket_id = 'media');