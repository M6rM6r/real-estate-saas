-- ============================================================
-- Migration 002: Row Level Security
-- ============================================================

-- ─── TENANTS ─────────────────────────────────────────────────
alter table public.tenants enable row level security;

-- Public read for active tenants (public pages)
create policy "public_read_active_tenants"
  on public.tenants for select
  using (status = 'active');

-- Authenticated users can only see their own tenant
create policy "users_read_own_tenant"
  on public.tenants for select
  to authenticated
  using (id = (select tenant_id from public.users where id = auth.uid()));

-- ─── USERS ───────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "users_read_own_row"
  on public.users for select
  to authenticated
  using (id = auth.uid());

create policy "users_read_same_tenant"
  on public.users for select
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── PROFILES ────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Public can read profiles (for public pages)
create policy "public_read_profiles"
  on public.profiles for select
  using (
    tenant_id in (select id from public.tenants where status = 'active')
  );

-- Authenticated: only own tenant
create policy "tenant_manage_own_profile"
  on public.profiles for all
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
  with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── POSTS ───────────────────────────────────────────────────
alter table public.posts enable row level security;

-- Public can read published posts of active tenants
create policy "public_read_published_posts"
  on public.posts for select
  using (
    published = true
    and tenant_id in (select id from public.tenants where status = 'active')
  );

-- Authenticated: full access scoped to own tenant
create policy "tenant_manage_own_posts"
  on public.posts for all
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
  with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── MEDIA ───────────────────────────────────────────────────
alter table public.media enable row level security;

create policy "public_read_media"
  on public.media for select
  using (
    tenant_id in (select id from public.tenants where status = 'active')
  );

create policy "tenant_manage_own_media"
  on public.media for all
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
  with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── LEADS ───────────────────────────────────────────────────
alter table public.leads enable row level security;

-- Allow public insert (lead capture from public page)
create policy "public_insert_leads"
  on public.leads for insert
  with check (
    tenant_id in (select id from public.tenants where status = 'active')
  );

-- Authenticated: only own tenant leads
create policy "tenant_read_own_leads"
  on public.leads for select
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()));

create policy "tenant_update_own_leads"
  on public.leads for update
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
  with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── ANALYTICS ───────────────────────────────────────────────
alter table public.page_views enable row level security;

-- Allow public insert (anonymous tracking)
create policy "public_insert_views"
  on public.page_views for insert
  with check (
    tenant_id in (select id from public.tenants where status = 'active')
  );

create policy "tenant_read_own_views"
  on public.page_views for select
  to authenticated
  using (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- ─── ADMIN LOGS (no RLS — service role only) ─────────────────
-- admin_logs is intentionally not exposed via anon/authenticated roles.
-- Access is only via SUPABASE_SERVICE_ROLE_KEY on the server.
