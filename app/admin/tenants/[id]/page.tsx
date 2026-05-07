'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Loader2, Power, RefreshCw, Copy, Check,
  Key, AlertCircle, Pencil, Save, X, Users, Building2, BarChart3,
  Image as ImageIcon, MessageSquare, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

const BUSINESS_TYPES: Record<string, { label: string; icon: string }> = {
  real_estate: { label: 'عقارات', icon: '🏠' },
  car_dealer:  { label: 'سيارات', icon: '🚗' },
  restaurant:  { label: 'مطعم',   icon: '🍽️' },
  salon:       { label: 'صالون',  icon: '✂️' },
  retail:      { label: 'متجر',   icon: '🛍️' },
  services:    { label: 'خدمات',  icon: '⚙️' },
  other:       { label: 'أخرى',   icon: '📋' },
};

const THEMES = ['modern', 'luxury', 'nature', 'ocean', 'desert', 'midnight'];

type RecentLead = { id: string; name: string; phone: string; status: string; created_at: string };
type RecentListing = { id: string; title: string; price: number; currency: string; listing_status: string; created_at: string };

type TenantDetail = {
  id: string;
  name: string;
  slug: string;
  theme?: string;
  status: 'active' | 'suspended';
  business_type?: string;
  primary_color?: string;
  createdAt?: string;
  created_at?: string;
  listingCount?: number;
  leadCount?: number;
  postCount?: number;
  agentCount?: number;
  mediaCount?: number;
  recentLeads?: RecentLead[];
  recentListings?: RecentListing[];
  profile?: {
    tagline?: string;
    bio?: string;
    logo_url?: string;
    cover_url?: string;
    contact_email?: string;
    contact_phone?: string;
    licence_no?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    whatsapp?: string;
  } | null;
};

export default function AdminTenantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TenantDetail>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Actions
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resetLinkModal, setResetLinkModal] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`);
      const json = (await res.json().catch(() => ({}))) as TenantDetail & { error?: string };
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchTenant(); }, [fetchTenant]);

  const createdDate = useMemo(() => {
    const value = data?.createdAt || data?.created_at;
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US');
  }, [data]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const toggleStatus = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    const next = data.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/tenants/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `Failed (${res.status})`);
      }
      setData(prev => prev ? { ...prev, status: next } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    if (!data) return;
    setEditForm({
      name: data.name, slug: data.slug, status: data.status,
      business_type: data.business_type ?? 'real_estate',
      theme: data.theme ?? 'modern',
      primary_color: data.primary_color ?? '#3B82F6',
    });
    setSaveError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true); setSaveError(null);
    try {
      const res = await fetch(`/api/admin/tenants/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveError(json.error ?? `Failed (${res.status})`); return;
      }
      setData(prev => prev ? { ...prev, ...editForm } : prev);
      setEditing(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const generateResetLink = async () => {
    if (!id) return;
    setResetLoading(true); setResetError(null); setResetLink(null);
    try {
      const res = await fetch(`/api/admin/tenants/${id}/reset-password`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { link?: string; email?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
      setResetLink(json.link ?? null);
      setResetEmail(json.email ?? null);
    } catch (e) {
      setResetError(e instanceof Error ? e.message : 'Failed to generate link');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 font-mono">
        <p className="text-red-400">{error ?? 'Tenant not found'}</p>
        <Button onClick={fetchTenant} variant="outline" className="border-[#00ff41]/30 text-[#00ff41]">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-5 font-mono">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/tenants" className="text-[#00ff41]/40 hover:text-[#00ff41] inline-flex items-center gap-1 text-xs mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tenants
          </Link>
          <h1 className="text-2xl font-bold text-[#00ff41]">{'>'} {data.name}</h1>
          <p className="text-[#00ff41]/40 text-xs mt-0.5">/{data.slug} · {data.id}</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button onClick={() => copyToClipboard(`${origin}/${data.slug}`, 'puburl')}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded border border-[#00ff41]/20 text-[#00ff41]/50 hover:text-[#00ff41] hover:border-[#00ff41]/40 transition-colors">
            {copiedField === 'puburl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copy Public URL
          </button>
          <a href={`/${data.slug}`} target="_blank" rel="noopener noreferrer">
            <Button className="h-8 text-xs bg-[#00ff41]/15 hover:bg-[#00ff41]/30 border border-[#00ff41]/40 text-[#00ff41]">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Public Page
            </Button>
          </a>
          <Button onClick={() => { setResetLink(null); setResetError(null); setResetLinkModal(true); }}
            className="h-8 text-xs bg-[#41b8ff]/10 hover:bg-[#41b8ff]/20 border border-[#41b8ff]/30 text-[#41b8ff]">
            <Key className="h-3.5 w-3.5 mr-1.5" /> Reset Password
          </Button>
          <Button onClick={toggleStatus} disabled={saving}
            className={`h-8 text-xs border ${data.status === 'active' ? 'border-[#ffb441]/40 text-[#ffb441] bg-[#ffb441]/10 hover:bg-[#ffb441]/20' : 'border-[#00ff41]/40 text-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/20'}`}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Power className="h-3.5 w-3.5 mr-1.5" />}
            {data.status === 'active' ? 'Suspend' : 'Reactivate'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Listings',   value: data.listingCount ?? 0, icon: <Building2 className="h-4 w-4" />,    color: '#00ff41' },
          { label: 'Leads',      value: data.leadCount ?? 0,    icon: <MessageSquare className="h-4 w-4" />, color: '#41b8ff' },
          { label: 'Posts',      value: data.postCount ?? 0,    icon: <Layers className="h-4 w-4" />,        color: '#00ff41' },
          { label: 'Media',      value: data.mediaCount ?? 0,   icon: <ImageIcon className="h-4 w-4" />,     color: '#b841ff' },
          { label: 'Agents',     value: data.agentCount ?? 0,   icon: <Users className="h-4 w-4" />,         color: '#00ff41' },
          { label: 'Status',     value: data.status,            icon: <BarChart3 className="h-4 w-4" />,     color: data.status === 'active' ? '#00ff41' : '#ffb441' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2" style={{ color: `${s.color}60` }}>
              {s.icon}
              <span className="text-[10px] uppercase tracking-widest text-[#00ff41]/30">{s.label}</span>
            </div>
            <p className="text-xl font-bold capitalize" style={{ color: s.color }}>{String(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Tenant Info + Edit */}
      <div className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#00ff41] font-semibold text-sm uppercase tracking-widest">Tenant Configuration</h2>
          {!editing ? (
            <button onClick={startEdit} className="inline-flex items-center gap-1.5 text-xs text-[#00ff41]/40 hover:text-[#00ff41] transition-colors">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 text-xs text-[#00ff41]/30 hover:text-[#00ff41]/60 transition-colors">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs text-[#00ff41] border border-[#00ff41]/40 px-2.5 py-1 rounded hover:bg-[#00ff41]/10 transition-colors">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </button>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mb-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded px-3 py-2 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />{saveError}
          </div>
        )}

        {!editing ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            {[
              { label: 'Name',         value: data.name },
              { label: 'Slug',         value: `/${data.slug}` },
              { label: 'Status',       value: data.status },
              { label: 'Business Type', value: (() => { const b = BUSINESS_TYPES[data.business_type ?? 'real_estate']; return b ? `${b.icon} ${b.label}` : (data.business_type ?? '—'); })() },
              { label: 'Theme',        value: data.theme ?? 'modern' },
              { label: 'Joined',       value: createdDate },
              { label: 'Tenant ID',    value: data.id },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[#00ff41]/35 text-[10px] uppercase tracking-wider mb-0.5">{f.label}</p>
                <p className="text-[#00ff41] text-xs break-all">{f.value}</p>
              </div>
            ))}
            <div>
              <p className="text-[#00ff41]/35 text-[10px] uppercase tracking-wider mb-0.5">Primary Color</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: data.primary_color ?? '#3B82F6' }} />
                <span className="text-[#00ff41] text-xs">{data.primary_color ?? '#3B82F6'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Name</Label>
              <Input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Slug</Label>
              <Input value={editForm.slug ?? ''} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v as 'active' | 'suspended' }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Business Type</Label>
              <Select value={editForm.business_type} onValueChange={v => setEditForm(f => ({ ...f, business_type: v }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
                  {Object.entries(BUSINESS_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Theme</Label>
              <Select value={editForm.theme} onValueChange={v => setEditForm(f => ({ ...f, theme: v }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
                  {THEMES.map(th => <SelectItem key={th} value={th} className="capitalize">{th}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/50 text-[10px] uppercase">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={editForm.primary_color ?? '#3B82F6'}
                  onChange={e => setEditForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="w-8 h-8 rounded border border-[#00ff41]/20 bg-transparent cursor-pointer p-0.5" />
                <Input value={editForm.primary_color ?? ''} onChange={e => setEditForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono flex-1" maxLength={7} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Snapshot */}
      <div className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-5">
        <h2 className="text-[#00ff41] font-semibold text-sm uppercase tracking-widest mb-4">Profile Snapshot</h2>
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="shrink-0">
            <p className="text-[#00ff41]/35 text-[10px] uppercase tracking-wider mb-1.5">Logo</p>
            {data.profile?.logo_url ? (
              <img src={data.profile.logo_url} alt="logo" className="w-12 h-12 rounded-full object-cover border border-[#00ff41]/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#00ff41]/5 border border-[#00ff41]/15 flex items-center justify-center text-[#00ff41]/20 text-xs">N/A</div>
            )}
          </div>
          {/* Cover */}
          <div className="flex-1 min-w-0">
            <p className="text-[#00ff41]/35 text-[10px] uppercase tracking-wider mb-1.5">Cover</p>
            {data.profile?.cover_url ? (
              <img src={data.profile.cover_url} alt="cover" className="h-16 w-full max-w-xs rounded-lg object-cover border border-[#00ff41]/20" />
            ) : (
              <div className="h-16 w-full max-w-xs rounded-lg bg-[#00ff41]/5 border border-[#00ff41]/15 flex items-center justify-center text-[#00ff41]/20 text-xs">No cover</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-xs">
          {[
            { label: 'Tagline',       value: data.profile?.tagline },
            { label: 'Bio',           value: data.profile?.bio },
            { label: 'Contact Email', value: data.profile?.contact_email },
            { label: 'Contact Phone', value: data.profile?.contact_phone },
            { label: 'Licence No.',   value: data.profile?.licence_no },
            { label: 'Website',       value: data.profile?.website },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[#00ff41]/35 text-[10px] uppercase tracking-wider mb-0.5">{f.label}</p>
              <p className="text-[#00ff41]/80 break-all">{f.value || '—'}</p>
            </div>
          ))}
        </div>

        {/* Social icons */}
        {(data.profile?.instagram || data.profile?.twitter || data.profile?.facebook || data.profile?.whatsapp) && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#00ff41]/10">
            {data.profile.instagram && (
              <a href={`https://instagram.com/${data.profile.instagram}`} target="_blank" rel="noopener noreferrer"
                className="text-[#00ff41]/40 hover:text-[#00ff41] text-xs transition-colors">📸 IG</a>
            )}
            {data.profile.twitter && (
              <a href={`https://twitter.com/${data.profile.twitter}`} target="_blank" rel="noopener noreferrer"
                className="text-[#00ff41]/40 hover:text-[#00ff41] text-xs transition-colors">🐦 TW</a>
            )}
            {data.profile.facebook && (
              <a href={data.profile.facebook} target="_blank" rel="noopener noreferrer"
                className="text-[#00ff41]/40 hover:text-[#00ff41] text-xs transition-colors">📘 FB</a>
            )}
            {data.profile.whatsapp && (
              <a href={`https://wa.me/${data.profile.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="text-[#00ff41]/40 hover:text-[#00ff41] text-xs transition-colors">💬 WA</a>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Leads */}
        <div className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-4">
          <h2 className="text-[#00ff41] font-semibold text-sm uppercase tracking-widest mb-3">Recent Leads</h2>
          {!data.recentLeads || data.recentLeads.length === 0 ? (
            <p className="text-[#00ff41]/25 text-xs py-4 text-center">No leads yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  {['Name', 'Phone', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left pb-2 text-[#00ff41]/30 text-[10px] uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map(l => (
                  <tr key={l.id} className="border-b border-[#00ff41]/[0.06] hover:bg-[#00ff41]/[0.03]">
                    <td className="py-2 text-[#00ff41]/80 pr-2">{l.name || '—'}</td>
                    <td className="py-2 text-[#00ff41]/50 pr-2">{l.phone || '—'}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00ff41]/10 text-[#00ff41]/70 capitalize">{l.status || 'new'}</span>
                    </td>
                    <td className="py-2 text-[#00ff41]/30 whitespace-nowrap">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Listings */}
        <div className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-4">
          <h2 className="text-[#00ff41] font-semibold text-sm uppercase tracking-widest mb-3">Recent Listings</h2>
          {!data.recentListings || data.recentListings.length === 0 ? (
            <p className="text-[#00ff41]/25 text-xs py-4 text-center">No listings yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  {['Title', 'Price', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left pb-2 text-[#00ff41]/30 text-[10px] uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentListings.map(l => (
                  <tr key={l.id} className="border-b border-[#00ff41]/[0.06] hover:bg-[#00ff41]/[0.03]">
                    <td className="py-2 text-[#00ff41]/80 pr-2 truncate max-w-[120px]">{l.title || '—'}</td>
                    <td className="py-2 text-[#00ff41]/60 pr-2 whitespace-nowrap">{l.price ? `${l.price.toLocaleString()} ${l.currency ?? ''}` : '—'}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00ff41]/10 text-[#00ff41]/70 capitalize">{l.listing_status || '—'}</span>
                    </td>
                    <td className="py-2 text-[#00ff41]/30 whitespace-nowrap">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      <Dialog open={resetLinkModal} onOpenChange={(o) => { if (!o) { setResetLinkModal(false); setResetLink(null); setResetError(null); } }}>
        <DialogContent className="bg-[#0d0d0d] border border-[#41b8ff]/20 text-[#00ff41] max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#41b8ff]">{'>'} reset_password_</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {!resetLink && !resetError && (
              <p className="text-sm text-[#00ff41]/60">Generate a Firebase password reset link for this tenant&apos;s primary user account.</p>
            )}
            {resetError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded px-3 py-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />{resetError}
              </div>
            )}
            {resetLink && (
              <div className="space-y-2">
                <p className="text-xs text-[#00ff41]/50">Reset link for <span className="text-[#00ff41]">{resetEmail}</span>:</p>
                <div className="flex items-start gap-2 bg-[#0a0a0a] border border-[#41b8ff]/20 rounded-lg px-3 py-2.5">
                  <p className="text-[#41b8ff] text-xs break-all flex-1">{resetLink}</p>
                  <button onClick={() => copyToClipboard(resetLink, 'resetlink')}
                    className="shrink-0 p-1 text-[#41b8ff]/40 hover:text-[#41b8ff] transition-colors">
                    {copiedField === 'resetlink' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setResetLinkModal(false); setResetLink(null); setResetError(null); }}
              className="text-[#00ff41]/40 hover:text-[#00ff41]">Close</Button>
            {!resetLink && (
              <Button onClick={generateResetLink} disabled={resetLoading}
                className="bg-[#41b8ff]/15 hover:bg-[#41b8ff]/30 text-[#41b8ff] border border-[#41b8ff]/30">
                {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                Generate Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
