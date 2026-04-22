-- ============================================================
-- Migration 001: Core schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── TENANTS ─────────────────────────────────────────────────
create table public.tenants (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  status      text not null default 'active' check (status in ('active', 'suspended')),
  features    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_tenants_slug on public.tenants(slug);
create index idx_tenants_status on public.tenants(status);

-- ─── USERS (extends Supabase auth.users) ─────────────────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references public.tenants(id) on delete cascade,
  email       text not null,
  role        text not null default 'agent' check (role in ('agent', 'admin')),
  created_at  timestamptz not null default now()
);

create index idx_users_tenant_id on public.users(tenant_id);

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid unique not null references public.tenants(id) on delete cascade,
  logo_url        text,
  cover_url       text,
  bio             text,
  tagline         text,
  licence_no      text,
  primary_color   text not null default '#1a1a1a',
  preferred_lang  text not null default 'en' check (preferred_lang in ('en', 'ar')),
  contact_email   text,
  contact_phone   text,
  address         text,
  working_hours   jsonb not null default '{}',
  social_links    jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_profiles_tenant_id on public.profiles(tenant_id);

-- ─── POSTS ───────────────────────────────────────────────────
create table public.posts (
  id           uuid primary key default uuid_generate_v4(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  type         text not null check (type in ('listing', 'news', 'announcement')),
  title        text not null,
  body         text,
  images       jsonb not null default '[]',
  -- listing-specific fields
  price        numeric,
  location     text,
  bedrooms     integer,
  bathrooms    integer,
  area_sqm     numeric,
  listing_status text check (listing_status in ('available', 'sold', 'rented')),
  -- state
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_posts_tenant_id on public.posts(tenant_id);
create index idx_posts_type on public.posts(type);
create index idx_posts_published on public.posts(published);
create index idx_posts_created_at on public.posts(created_at desc);

-- ─── MEDIA ───────────────────────────────────────────────────
create table public.media (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  url         text not null,
  label       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_media_tenant_id on public.media(tenant_id);
create index idx_media_sort_order on public.media(tenant_id, sort_order);

-- ─── LEADS ───────────────────────────────────────────────────
create table public.leads (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  listing_id  uuid references public.posts(id) on delete set null,
  name        text not null,
  phone       text not null,
  message     text,
  status      text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

create index idx_leads_tenant_id on public.leads(tenant_id);
create index idx_leads_status on public.leads(status);

-- ─── ANALYTICS ───────────────────────────────────────────────
create table public.page_views (
  id          bigserial primary key,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  listing_id  uuid references public.posts(id) on delete set null,
  viewed_at   timestamptz not null default now()
);

create index idx_page_views_tenant_id on public.page_views(tenant_id);
create index idx_page_views_listing_id on public.page_views(listing_id);
create index idx_page_views_date on public.page_views(tenant_id, viewed_at desc);

-- ─── ADMIN AUDIT LOG ─────────────────────────────────────────
create table public.admin_logs (
  id            uuid primary key default uuid_generate_v4(),
  action        text not null,
  target_id     text,
  target_type   text,
  performed_by  text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_admin_logs_created_at on public.admin_logs(created_at desc);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();
