'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Loader2, Users, Search, ExternalLink,
  AlertCircle, Copy, Check, Download, LayoutGrid, SlidersHorizontal,
  ArrowUpDown, MoreHorizontal, Star, MessageSquare, X,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

type TenantNote = { text: string; ts: string };

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  paid?: boolean;
  business_type?: string;
  theme?: string;
  primary_color?: string;
  agentCount?: number;
  postCount?: number;
  listingCount?: number;
  leadCount?: number;
  created_at: string;
};

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

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'name',     label: 'Name A–Z' },
  { value: 'listings', label: 'Most Listings' },
  { value: 'leads',    label: 'Most Leads' },
  { value: 'starred',  label: 'Starred First' },
];

const emptyForm = {
  name: '', slug: '', email: '', tempPassword: '',
  primary_color: '#3B82F6', business_type: 'real_estate', theme: 'modern',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function downloadCSV(tenants: Tenant[]) {
  const headers = ['Name', 'Slug', 'Status', 'Type', 'Theme', 'Agents', 'Listings', 'Leads', 'Posts', 'Joined'];
  const rows = tenants.map(t => [
    `"${t.name}"`, t.slug, t.status, t.business_type ?? '', t.theme ?? '',
    t.agentCount ?? 0, t.listingCount ?? 0, t.leadCount ?? 0, t.postCount ?? 0,
    t.created_at ? new Date(t.created_at).toLocaleDateString('en-US') : '',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `tenants-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [credentials, setCredentials] = useState<{ name: string; slug: string; email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Stars & Notes (persisted in localStorage)
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [tenantNotes, setTenantNotes] = useState<Record<string, TenantNote[]>>({});
  const [starredFilter, setStarredFilter] = useState(false);
  const [noteModal, setNoteModal] = useState<string | null>(null); // tenant id
  const [noteInput, setNoteInput] = useState('');

  const fetchData = useCallback(() => {
    setError(null);
    setLoading(true);
    fetch('/api/admin/tenants')
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? `Error ${r.status}`);
        }
        return r.json() as Promise<Tenant[]>;
      })
      .then(data => { setTenants(data); setSelected(new Set()); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load stars & notes from localStorage on mount
  useEffect(() => {
    try {
      const s = localStorage.getItem('admin_tenant_stars');
      if (s) setStarred(new Set(JSON.parse(s) as string[]));
      const n = localStorage.getItem('admin_tenant_notes');
      if (n) setTenantNotes(JSON.parse(n) as Record<string, TenantNote[]>);
    } catch { /* ignore */ }
  }, []);

  const toggleStar = (id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('admin_tenant_stars', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const saveNote = () => {
    if (!noteModal || !noteInput.trim()) return;
    setTenantNotes(prev => {
      const existing = prev[noteModal] ?? [];
      const updated = { ...prev, [noteModal]: [{ text: noteInput.trim(), ts: new Date().toISOString() }, ...existing] };
      localStorage.setItem('admin_tenant_notes', JSON.stringify(updated));
      return updated;
    });
    setNoteInput('');
  };

  const deleteNote = (tenantId: string, idx: number) => {
    setTenantNotes(prev => {
      const updated = { ...prev, [tenantId]: (prev[tenantId] ?? []).filter((_, i) => i !== idx) };
      localStorage.setItem('admin_tenant_notes', JSON.stringify(updated));
      return updated;
    });
  };

  const stats = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      suspended: tenants.filter(t => t.status === 'suspended').length,
      thisWeek: tenants.filter(t => t.created_at && new Date(t.created_at) >= weekAgo).length,
    };
  }, [tenants]);

  const filtered = useMemo(() => {
    let list = tenants.filter(t => {
      const q = search.toLowerCase();
      if (q && !t.name.toLowerCase().includes(q) && !t.slug.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (paymentFilter === 'paid' && !Boolean(t.paid)) return false;
      if (paymentFilter === 'unpaid' && Boolean(t.paid)) return false;
      if (typeFilter !== 'all' && (t.business_type ?? 'real_estate') !== typeFilter) return false;
      if (starredFilter && !starred.has(t.id)) return false;
      return true;
    });
    switch (sortBy) {
      case 'oldest':   list = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'name':     list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'listings': list = [...list].sort((a, b) => (b.listingCount ?? 0) - (a.listingCount ?? 0)); break;
      case 'leads':    list = [...list].sort((a, b) => (b.leadCount ?? 0) - (a.leadCount ?? 0)); break;
      case 'starred':  list = [...list].sort((a, b) => (starred.has(b.id) ? 1 : 0) - (starred.has(a.id) ? 1 : 0)); break;
      default:         list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [tenants, search, statusFilter, paymentFilter, typeFilter, sortBy, starredFilter, starred]);

  const allSelected = filtered.length > 0 && filtered.every(t => selected.has(t.id));

  const activeTenants = useMemo(() => filtered.filter(t => t.status === 'active'), [filtered]);
  const suspendedTenants = useMemo(() => filtered.filter(t => t.status === 'suspended'), [filtered]);

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(t => t.id)));
  };

  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const toggleStatus = async (t: Tenant) => {
    const next = t.status === 'active' ? 'suspended' : 'active';
    setTenants(prev => prev.map(x => x.id === t.id ? { ...x, status: next } : x));
    await fetch(`/api/admin/tenants/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    }).catch(() => fetchData());
  };

  const togglePaid = async (t: Tenant) => {
    const next = !Boolean(t.paid);
    setTenants(prev => prev.map(x => x.id === t.id ? { ...x, paid: next } : x));
    await fetch(`/api/admin/tenants/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid: next }),
    }).catch(() => fetchData());
  };

  const executeBulk = async () => {
    if (!bulkAction) return;
    setBulkProcessing(true);
    const ids = Array.from(selected);
    if (bulkAction === 'delete') {
      await Promise.all(ids.map(id => fetch(`/api/admin/tenants/${id}`, { method: 'DELETE' })));
    } else {
      await Promise.all(ids.map(id => fetch(`/api/admin/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: bulkAction }),
      })));
    }
    setBulkProcessing(false);
    setBulkConfirm(false);
    setBulkAction(null);
    setSelected(new Set());
    fetchData();
  };

  const openCreate = () => {
    setEditId(null); setForm(emptyForm); setFormStatus('active'); setSaveError(null); setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditId(t.id);
    setForm({ name: t.name, slug: t.slug, email: '', tempPassword: '', primary_color: t.primary_color ?? '#3B82F6', business_type: t.business_type ?? 'real_estate', theme: t.theme ?? 'modern' });
    setFormStatus(t.status);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    try {
      let res: Response;
      if (editId) {
        res = await fetch(`/api/admin/tenants/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, slug: form.slug, status: formStatus, business_type: form.business_type, theme: form.theme, primary_color: form.primary_color }),
        });
      } else {
        res = await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, slug: form.slug, email: form.email, tempPassword: form.tempPassword, primary_color: form.primary_color, business_type: form.business_type, theme: form.theme }),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setSaveError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      setModalOpen(false);
      if (!editId) setCredentials({ name: form.name, slug: form.slug, email: form.email, password: form.tempPassword });
      fetchData();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/tenants/${deleteId}`, { method: 'DELETE' }).catch(() => {});
    setTenants(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 font-mono">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#00ff41]">{'<'} _Tenants</h1>
          <p className="text-[#00ff41]/40 text-sm mt-0.5">{tenants.length} agencies registered</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => downloadCSV(filtered)} variant="ghost"
            className="text-[#00ff41]/50 hover:text-[#00ff41] border border-[#00ff41]/10 hover:border-[#00ff41]/30 text-xs gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button onClick={openCreate}
            className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] font-medium border border-[#00ff41]/40 gap-1.5">
            <Plus className="h-4 w-4" /> New Tenant +
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tenants',    value: stats.total,     color: '#00ff41' },
          { label: 'Active',           value: stats.active,    color: '#00ff41' },
          { label: 'Suspended',        value: stats.suspended, color: '#ffb441' },
          { label: 'Joined This Week', value: stats.thisWeek,  color: '#41b8ff' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#00ff41]/40 mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <button onClick={fetchData} className="ml-auto underline text-xs hover:text-red-300">Retry</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00ff41]/30" />
          <Input placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/25 focus:border-[#00ff41]/40 font-mono" />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-8 w-[130px] text-xs bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41]/70 font-mono">
            <SlidersHorizontal className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41]/70 font-mono">
            <LayoutGrid className="h-3 w-3 mr-1" /><SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(BUSINESS_TYPES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
          <SelectTrigger className="h-8 w-[140px] text-xs bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41]/70 font-mono">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-[150px] text-xs bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41]/70 font-mono">
            <ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-md border border-[#00ff41]/20 overflow-hidden">
            <button
              onClick={() => setViewMode('board')}
              className={`h-8 px-3 text-xs font-mono transition-colors ${viewMode === 'board' ? 'bg-[#00ff41]/15 text-[#00ff41]' : 'text-[#00ff41]/40 hover:text-[#00ff41]/70 hover:bg-[#00ff41]/5'}`}>
              Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`h-8 px-3 text-xs font-mono border-l border-[#00ff41]/20 transition-colors ${viewMode === 'table' ? 'bg-[#00ff41]/15 text-[#00ff41]' : 'text-[#00ff41]/40 hover:text-[#00ff41]/70 hover:bg-[#00ff41]/5'}`}>
              Table
            </button>
          </div>
          <span className="text-[#00ff41]/30 text-xs">{filtered.length} results</span>
        </div>
        <button
          onClick={() => setStarredFilter(v => !v)}
          title="Show starred only"
          className={`h-8 px-3 text-xs rounded border font-mono flex items-center gap-1.5 transition-all ${
            starredFilter
              ? 'bg-[#ffd700]/15 border-[#ffd700]/50 text-[#ffd700]'
              : 'bg-transparent border-[#00ff41]/20 text-[#00ff41]/40 hover:text-[#ffd700]/70 hover:border-[#ffd700]/30'
          }`}>
          <Star className={`h-3.5 w-3.5 ${starredFilter ? 'fill-[#ffd700]' : ''}`} />
          Starred
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#00ff41]/5 border border-[#00ff41]/20 rounded-lg px-4 py-2.5">
          <span className="text-[#00ff41] text-xs font-semibold">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={() => { setBulkAction('active'); setBulkConfirm(true); }}
              className="px-3 py-1 text-xs rounded border border-[#00ff41]/30 text-[#00ff41]/70 hover:text-[#00ff41] hover:border-[#00ff41]/60 transition-colors">
              Activate All
            </button>
            <button onClick={() => { setBulkAction('suspended'); setBulkConfirm(true); }}
              className="px-3 py-1 text-xs rounded border border-[#ffb441]/30 text-[#ffb441]/70 hover:text-[#ffb441] hover:border-[#ffb441]/60 transition-colors">
              Suspend All
            </button>
            <button onClick={() => { setBulkAction('delete'); setBulkConfirm(true); }}
              className="px-3 py-1 text-xs rounded border border-[#ff4141]/30 text-[#ff4141]/70 hover:text-[#ff4141] hover:border-[#ff4141]/60 transition-colors">
              Delete All
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[#00ff41]/30 hover:text-[#00ff41]/60 text-xs">✕ clear</button>
        </div>
      )}

      {/* Tenant Views */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#00ff41]/30">
          <Users className="h-12 w-12 mb-4 text-[#00ff41]/20" />
          <p className="text-sm">{search ? '> no tenants match your search' : '> no tenants yet.'}</p>
        </div>
      ) : viewMode === 'board' ? (
        <div className="space-y-4">
          {[{ key: 'active', title: 'Active Tenants', items: activeTenants, color: '#00ff41' }, { key: 'suspended', title: 'Suspended Tenants', items: suspendedTenants, color: '#ffb441' }].map(section => (
            <div key={section.key} className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm uppercase tracking-wider font-semibold" style={{ color: section.color }}>{section.title}</h3>
                <span className="text-xs text-[#00ff41]/35">{section.items.length} tenants</span>
              </div>
              {section.items.length === 0 ? (
                <p className="text-xs text-[#00ff41]/25 py-3">No tenants in this section.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {section.items.map((t) => {
                    const btype = BUSINESS_TYPES[t.business_type ?? 'real_estate'];
                    return (
                      <div key={t.id} className={`rounded-lg border p-3 ${selected.has(t.id) ? 'bg-[#00ff41]/10 border-[#00ff41]/40' : 'bg-[#0a0a0a] border-[#00ff41]/15'} ${starred.has(t.id) ? 'shadow-[0_0_0_1px_rgba(255,215,0,0.45)]' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} className="accent-[#00ff41] cursor-pointer" />
                            <button onClick={() => toggleStar(t.id)} className="p-1 rounded hover:bg-[#ffd700]/10" title={starred.has(t.id) ? 'Unstar' : 'Star'}>
                              <Star className={`h-3.5 w-3.5 ${starred.has(t.id) ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[#00ff41]/25'}`} />
                            </button>
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${t.status === 'active' ? 'text-[#00ff41] border-[#00ff41]/30 bg-[#00ff41]/10' : 'text-[#ffb441] border-[#ffb441]/30 bg-[#ffb441]/10'}`}>
                              {t.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePaid(t)}
                              title={Boolean(t.paid) ? 'Mark tenant as unpaid' : 'Mark tenant as paid'}
                              className={`px-2 py-0.5 rounded text-[10px] border ${Boolean(t.paid) ? 'text-[#00ff41] border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20' : 'text-[#ff6b6b] border-[#ff6b6b]/35 bg-[#ff6b6b]/10 hover:bg-[#ff6b6b]/20'}`}>
                              {Boolean(t.paid) ? 'Paid' : 'Unpaid'}
                            </button>
                            <button
                              onClick={() => toggleStatus(t)}
                              title={t.status === 'active' ? 'Set tenant to suspended' : 'Set tenant to active'}
                              className={`px-2 py-0.5 rounded text-[10px] border ${t.status === 'active' ? 'text-[#ffb441] border-[#ffb441]/35 bg-[#ffb441]/10 hover:bg-[#ffb441]/20' : 'text-[#00ff41] border-[#00ff41]/35 bg-[#00ff41]/10 hover:bg-[#00ff41]/20'}`}>
                              {t.status === 'active' ? 'Set Suspended' : 'Set Active'}
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <Link href={`/admin/tenants/${t.id}`} className="text-[#00ff41] font-semibold hover:underline block truncate">{t.name}</Link>
                          <div className="flex items-center gap-1 mt-1">
                            <code className="text-[#00ff41]/45 bg-[#00ff41]/5 border border-[#00ff41]/10 px-1.5 py-0.5 rounded text-[10px]">{t.slug}</code>
                            <button onClick={() => copyToClipboard(t.slug, `slug-${t.id}`)} className="p-0.5 text-[#00ff41]/20 hover:text-[#00ff41]/60" title="Copy slug">
                              {copiedField === `slug-${t.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] mb-3">
                          <span className="px-2 py-0.5 rounded border border-[#00ff41]/20 text-[#00ff41]/60">{btype ? `${btype.icon} ${btype.label}` : (t.business_type ?? '—')}</span>
                          <span className="px-2 py-0.5 rounded border border-[#00ff41]/20 text-[#00ff41]/40 capitalize">{t.theme ?? 'modern'}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center mb-3">
                          <div className="rounded border border-[#00ff41]/10 py-1"><p className="text-[9px] text-[#00ff41]/30">Listings</p><p className="text-[#00ff41] text-xs">{t.listingCount ?? 0}</p></div>
                          <div className="rounded border border-[#00ff41]/10 py-1"><p className="text-[9px] text-[#00ff41]/30">Leads</p><p className="text-[#00ff41] text-xs">{t.leadCount ?? 0}</p></div>
                          <div className="rounded border border-[#00ff41]/10 py-1"><p className="text-[9px] text-[#00ff41]/30">Agents</p><p className="text-[#00ff41] text-xs">{t.agentCount ?? 0}</p></div>
                          <div className="rounded border border-[#00ff41]/10 py-1"><p className="text-[9px] text-[#00ff41]/30">Posts</p><p className="text-[#00ff41] text-xs">{t.postCount ?? 0}</p></div>
                        </div>

                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setNoteModal(t.id); setNoteInput(''); }} className="p-1.5 rounded text-[#41b8ff]/40 hover:text-[#41b8ff] hover:bg-[#41b8ff]/10" title="Notes">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <a href={`/${t.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-[#00ff41]/30 hover:text-[#00ff41] hover:bg-[#00ff41]/10" title="View public page">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Link href={`/admin/tenants/${t.id}`} className="p-1.5 rounded text-[#41b8ff]/30 hover:text-[#41b8ff] hover:bg-[#41b8ff]/10" title="Open detail">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Link>
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded text-[#00ff41]/30 hover:text-[#00ff41] hover:bg-[#00ff41]/10" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded text-[#ff4141]/30 hover:text-[#ff4141] hover:bg-[#ff4141]/10" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/15 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#00ff41]/10 bg-[#00ff41]/[0.03]">
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#00ff41] cursor-pointer" />
                  </th>
                  <th className="px-2 py-3 w-6"></th>
                  <th className="px-2 py-3 text-[#00ff41]/30 font-medium text-left w-8">#</th>
                  {['Agency', 'Slug', 'Type', 'Theme', 'Listings', 'Leads', 'Agents', 'Payment', 'Notes', 'Joined', 'Actions'].map(h => (
                    <th key={h} className={`px-3 py-3 text-[10px] font-semibold text-[#00ff41]/40 uppercase tracking-wider whitespace-nowrap ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const btype = BUSINESS_TYPES[t.business_type ?? 'real_estate'];
                  return (
                    <tr key={t.id}
                      className={`border-b border-[#00ff41]/[0.07] hover:bg-[#00ff41]/[0.04] transition-colors ${selected.has(t.id) ? 'bg-[#00ff41]/[0.06]' : ''} ${starred.has(t.id) ? 'border-l-2 border-l-[#ffd700]/60' : ''}`}>
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} className="accent-[#00ff41] cursor-pointer" />
                      </td>
                      <td className="px-1 py-3">
                        <button onClick={() => toggleStar(t.id)} title={starred.has(t.id) ? 'Unstar' : 'Star'} className="p-1 rounded transition-colors hover:bg-[#ffd700]/10">
                          <Star className={`h-3.5 w-3.5 transition-colors ${starred.has(t.id) ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[#00ff41]/15 hover:text-[#ffd700]/50'}`} />
                        </button>
                      </td>
                      <td className="px-2 py-3 text-[#00ff41]/25">{idx + 1}</td>
                      <td className="px-3 py-3 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0" style={{ backgroundColor: t.primary_color ?? '#00ff41' }}>
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <Link href={`/admin/tenants/${t.id}`} className="text-[#00ff41] font-medium hover:underline truncate max-w-[140px]">{t.name}</Link>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <code className="text-[#00ff41]/50 bg-[#00ff41]/5 border border-[#00ff41]/10 px-1.5 py-0.5 rounded text-[11px]">{t.slug}</code>
                          <button onClick={() => copyToClipboard(t.slug, `slug-${t.id}`)} className="p-0.5 text-[#00ff41]/20 hover:text-[#00ff41]/60 transition-colors" title="Copy slug">
                            {copiedField === `slug-${t.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#00ff41]/60 whitespace-nowrap">{btype ? `${btype.icon} ${btype.label}` : (t.business_type ?? '—')}</td>
                      <td className="px-3 py-3 text-[#00ff41]/40 capitalize">{t.theme ?? 'modern'}</td>
                      <td className="px-3 py-3 text-[#00ff41]/60 text-center">{t.listingCount ?? 0}</td>
                      <td className="px-3 py-3 text-[#00ff41]/60 text-center">{t.leadCount ?? 0}</td>
                      <td className="px-3 py-3 text-[#00ff41]/60 text-center">{t.agentCount ?? 0}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <button
                          onClick={() => togglePaid(t)}
                          className={`px-2 py-1 text-[10px] rounded border ${Boolean(t.paid) ? 'text-[#00ff41] border-[#00ff41]/30 bg-[#00ff41]/10 hover:bg-[#00ff41]/20' : 'text-[#ff6b6b] border-[#ff6b6b]/30 bg-[#ff6b6b]/10 hover:bg-[#ff6b6b]/20'}`}
                          title={Boolean(t.paid) ? 'Mark tenant as unpaid' : 'Mark tenant as paid'}
                        >
                          {Boolean(t.paid) ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => { setNoteModal(t.id); setNoteInput(''); }} title="View/add notes" className="relative p-1.5 rounded text-[#41b8ff]/30 hover:text-[#41b8ff] hover:bg-[#41b8ff]/10 transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {(tenantNotes[t.id]?.length ?? 0) > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#41b8ff] text-black text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                              {tenantNotes[t.id].length > 9 ? '9+' : tenantNotes[t.id].length}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-[#00ff41]/35 whitespace-nowrap">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-US') : '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end items-center gap-0.5">
                          <span className={`px-2 py-1 text-[10px] rounded border mr-1 ${t.status === 'active' ? 'text-[#00ff41] border-[#00ff41]/30 bg-[#00ff41]/10' : 'text-[#ffb441] border-[#ffb441]/30 bg-[#ffb441]/10'}`}>
                            {t.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                          <button onClick={() => toggleStatus(t)} className={`px-2 py-1 text-[10px] rounded border mr-1 ${t.status === 'active' ? 'text-[#ffb441] border-[#ffb441]/30 hover:bg-[#ffb441]/10' : 'text-[#00ff41] border-[#00ff41]/30 hover:bg-[#00ff41]/10'}`} title={t.status === 'active' ? 'Set tenant to suspended' : 'Set tenant to active'}>
                            {t.status === 'active' ? 'Set Suspended' : 'Set Active'}
                          </button>
                          <a href={`/${t.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-[#00ff41]/30 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors" title="View public page">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Link href={`/admin/tenants/${t.id}`} className="p-1.5 rounded text-[#41b8ff]/30 hover:text-[#41b8ff] hover:bg-[#41b8ff]/10 transition-colors" title="Open detail">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Link>
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded text-[#00ff41]/30 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded text-[#ff4141]/30 hover:text-[#ff4141] hover:bg-[#ff4141]/10 transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-[#00ff41]/20 text-[#00ff41] max-w-lg font-mono max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#00ff41]">{editId ? '> edit_tenant' : '> new_tenant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-[#00ff41]/60 text-xs">Agency Name</Label>
              <Input placeholder="e.g. Prime Realty" value={form.name}
                onChange={(e) => { const name = e.target.value; setForm({ ...form, name, slug: editId ? form.slug : slugify(name) }); }}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50 h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[#00ff41]/60 text-xs">URL Slug</Label>
              <Input placeholder="e.g. prime-realty" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50 h-8 text-sm" />
              {form.slug && <p className="text-[10px] text-[#00ff41]/30">Public: /{form.slug}</p>}
            </div>

            {!editId && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[#00ff41]/60 text-xs">Admin Email</Label>
                  <Input type="email" placeholder="admin@agency.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50 h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[#00ff41]/60 text-xs">Temp Password</Label>
                  <Input type="text" placeholder="Min 6 chars" value={form.tempPassword}
                    onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                    className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50 h-8 text-sm" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[#00ff41]/60 text-xs">Business Type</Label>
                <Select value={form.business_type} onValueChange={(v) => setForm({ ...form, business_type: v })}>
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
                <Label className="text-[#00ff41]/60 text-xs">Theme</Label>
                <Select value={form.theme} onValueChange={(v) => setForm({ ...form, theme: v })}>
                  <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
                    {THEMES.map(th => <SelectItem key={th} value={th} className="capitalize">{th}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[#00ff41]/60 text-xs">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="w-8 h-8 rounded border border-[#00ff41]/20 bg-transparent cursor-pointer p-0.5" />
                  <Input value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50 h-8 text-xs font-mono flex-1"
                    maxLength={7} />
                </div>
              </div>
              {editId && (
                <div className="space-y-1">
                  <Label className="text-[#00ff41]/60 text-xs">Status</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'active' | 'suspended')}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] h-8 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41] font-mono text-xs">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {saveError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{saveError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-[#00ff41]/40 hover:text-[#00ff41] text-sm">Cancel</Button>
            <Button onClick={handleSave}
              disabled={saving || !form.name || !form.slug || (!editId && (!form.email || !form.tempPassword))}
              className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] border border-[#00ff41]/40 font-medium text-sm">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'Save Changes' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="bg-[#0d0d0d] border border-[#ff4141]/30 text-[#00ff41] max-w-sm font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#ff4141]">{'>'} confirm_delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#00ff41]/70 py-2">
            Permanently deletes the tenant and all associated data.{' '}
            <span className="text-[#ff4141] font-bold">Cannot be undone.</span>
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-[#00ff41]/40 hover:text-[#00ff41]">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting}
              className="bg-[#ff4141]/20 hover:bg-[#ff4141]/40 text-[#ff4141] border border-[#ff4141]/40">
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirm */}
      <Dialog open={bulkConfirm} onOpenChange={(o) => !o && setBulkConfirm(false)}>
        <DialogContent className="bg-[#0d0d0d] border border-[#ffb441]/30 text-[#00ff41] max-w-sm font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#ffb441]">{'>'} bulk_{bulkAction}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#00ff41]/70 py-2">
            Apply <span className="text-white font-bold">{bulkAction}</span> to{' '}
            <span className="text-[#00ff41] font-bold">{selected.size}</span> tenants?
            {bulkAction === 'delete' && (
              <span className="block mt-2 text-[#ff4141]">⚠ Permanently deletes all selected tenants and their data.</span>
            )}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkConfirm(false)} className="text-[#00ff41]/40 hover:text-[#00ff41]">Cancel</Button>
            <Button onClick={executeBulk} disabled={bulkProcessing}
              className={`border font-medium ${bulkAction === 'delete' ? 'bg-[#ff4141]/20 hover:bg-[#ff4141]/40 text-[#ff4141] border-[#ff4141]/40' : 'bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] border-[#00ff41]/40'}`}>
              {bulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent className="bg-[#0d0d0d] border border-[#00ff41]/30 text-[#00ff41] max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#00ff41]">{'>'} tenant_created_</DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="space-y-2 py-2 text-sm">
              {([
                { label: 'Agency',      key: 'name',     value: credentials.name },
                { label: 'Public Page', key: 'url',      value: `https://wa9l.website/${credentials.slug}` },
                { label: 'Login URL',   key: 'login',    value: `${typeof window !== 'undefined' ? window.location.origin : ''}/login` },
                { label: 'Email',       key: 'email',    value: credentials.email },
                { label: 'Password',    key: 'password', value: credentials.password },
              ] as Array<{ label: string; key: string; value: string }>).map(item => (
                <div key={item.key} className="flex items-center justify-between bg-[#0a0a0a] border border-[#00ff41]/10 rounded-lg px-3 py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-[#00ff41]/40 text-[10px] uppercase tracking-wider">{item.label}</p>
                    <p className="text-[#00ff41] text-xs mt-0.5 break-all">{item.value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.value, item.key)}
                    className="shrink-0 p-1.5 rounded text-[#00ff41]/30 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors">
                    {copiedField === item.key ? <Check className="h-3.5 w-3.5 text-[#00ff41]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentials(null)} className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] border border-[#00ff41]/40">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={!!noteModal} onOpenChange={(o) => !o && setNoteModal(null)}>
        <DialogContent className="bg-[#0d0d0d] border border-[#41b8ff]/30 text-[#00ff41] max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#41b8ff]">
              {'>'} notes_{noteModal ? (tenants.find(t => t.id === noteModal)?.slug ?? noteModal) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {/* Add note input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note… (e.g. 'Promised renewal May 15', 'High-value client – priority support')"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) saveNote(); }}
                rows={3}
                className="bg-[#0a0a0a] border-[#41b8ff]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#41b8ff]/50 text-xs font-mono resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#00ff41]/25">Ctrl+Enter to save</span>
                <Button onClick={saveNote} disabled={!noteInput.trim()}
                  className="h-7 text-xs bg-[#41b8ff]/20 hover:bg-[#41b8ff]/40 text-[#41b8ff] border border-[#41b8ff]/40">
                  + Add Note
                </Button>
              </div>
            </div>
            {/* Notes list */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {noteModal && (tenantNotes[noteModal]?.length ?? 0) === 0 && (
                <p className="text-[#00ff41]/25 text-xs text-center py-4">No notes yet. Track anything relevant here.</p>
              )}
              {noteModal && (tenantNotes[noteModal] ?? []).map((note, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-[#41b8ff]/10 rounded-lg px-3 py-2.5 group relative">
                  <p className="text-[#00ff41]/80 text-xs leading-relaxed pr-5">{note.text}</p>
                  <p className="text-[10px] text-[#00ff41]/25 mt-1">
                    {new Date(note.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button onClick={() => noteModal && deleteNote(noteModal, i)}
                    className="absolute top-2 right-2 p-0.5 text-[#ff4141]/0 group-hover:text-[#ff4141]/50 hover:!text-[#ff4141] transition-colors rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteModal(null)} className="text-[#00ff41]/40 hover:text-[#00ff41] text-sm">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

