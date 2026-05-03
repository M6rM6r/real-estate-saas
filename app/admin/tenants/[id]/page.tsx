'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2, Power, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TenantDetail = {
  id: string;
  name: string;
  slug: string;
  theme?: string;
  status: 'active' | 'suspended';
  createdAt?: string;
  created_at?: string;
  listingCount?: number;
  leadCount?: number;
  profile?: {
    tagline?: string;
    bio?: string;
    logo_url?: string;
    cover_url?: string;
  } | null;
};

export default function AdminTenantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`);
      const json = (await res.json().catch(() => ({}))) as TenantDetail & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? `Failed (${res.status})`);
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTenant();
  }, [fetchTenant]);

  const createdDate = useMemo(() => {
    const value = data?.createdAt || data?.created_at;
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US');
  }, [data]);

  const toggleStatus = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    const nextStatus = data.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/tenants/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `Failed (${res.status})`);
      }
      setData((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update tenant status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff41]" />
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

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/admin/tenants" className="text-[#00ff41]/60 hover:text-[#00ff41] inline-flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to tenants
          </Link>
          <h1 className="text-2xl font-bold text-[#00ff41] mt-2">&gt; tenant_profile_{data.slug}</h1>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${data.slug}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#00ff41]/15 hover:bg-[#00ff41]/30 border border-[#00ff41]/40 text-[#00ff41]">
              <ExternalLink className="h-4 w-4 mr-2" /> Open Public Page
            </Button>
          </a>
          <Button
            onClick={toggleStatus}
            disabled={saving}
            className={`border ${data.status === 'active' ? 'border-[#ffb441]/40 text-[#ffb441] bg-[#ffb441]/10 hover:bg-[#ffb441]/20' : 'border-[#00ff41]/40 text-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/20'}`}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
            {data.status === 'active' ? 'Suspend tenant' : 'Reactivate tenant'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: 'Listings', value: data.listingCount ?? 0 },
          { label: 'Leads', value: data.leadCount ?? 0 },
          { label: 'Theme', value: data.theme ?? 'modern' },
          { label: 'Status', value: data.status },
        ].map((item) => (
          <div key={item.label} className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-4">
            <p className="text-[#00ff41]/45 text-xs uppercase">{item.label}</p>
            <p className="text-[#00ff41] text-xl font-semibold mt-1">{String(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-5 space-y-4">
        <h2 className="text-[#00ff41] text-lg font-semibold">Tenant Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#00ff41]/45">Name</p>
            <p className="text-[#00ff41]">{data.name}</p>
          </div>
          <div>
            <p className="text-[#00ff41]/45">Slug</p>
            <p className="text-[#00ff41]">/{data.slug}</p>
          </div>
          <div>
            <p className="text-[#00ff41]/45">Created</p>
            <p className="text-[#00ff41]">{createdDate}</p>
          </div>
          <div>
            <p className="text-[#00ff41]/45">Tenant ID</p>
            <p className="text-[#00ff41] break-all">{data.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl p-5 space-y-4">
        <h2 className="text-[#00ff41] text-lg font-semibold">Profile Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[#00ff41]/45 text-xs uppercase">Tagline</p>
            <p className="text-[#00ff41] text-sm">{data.profile?.tagline || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#00ff41]/45 text-xs uppercase">Bio</p>
            <p className="text-[#00ff41] text-sm">{data.profile?.bio || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[#00ff41]/45 text-xs uppercase">Logo</p>
            {data.profile?.logo_url ? (
              <a href={data.profile.logo_url} target="_blank" rel="noopener noreferrer" className="text-[#00ff41] hover:underline text-sm break-all">
                {data.profile.logo_url}
              </a>
            ) : (
              <p className="text-[#00ff41] text-sm">—</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[#00ff41]/45 text-xs uppercase">Cover</p>
            {data.profile?.cover_url ? (
              <a href={data.profile.cover_url} target="_blank" rel="noopener noreferrer" className="text-[#00ff41] hover:underline text-sm break-all">
                {data.profile.cover_url}
              </a>
            ) : (
              <p className="text-[#00ff41] text-sm">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
