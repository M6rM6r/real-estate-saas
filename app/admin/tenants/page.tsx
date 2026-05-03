'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Users, Search, ExternalLink, AlertCircle, Copy, Check, KeyRound } from 'lucide-react';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  agentCount?: number;
  postCount?: number;
  created_at: string;
};

const emptyForm = { name: '', slug: '', email: '', tempPassword: '' };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string; slug: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = () => {
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
      .then(setTenants)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setStatus('active');
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditId(t.id);
    setForm({ name: t.name, slug: t.slug, email: '', tempPassword: '' });
    setStatus(t.status);
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let res: Response;
      if (editId) {
        res = await fetch(`/api/admin/tenants/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, slug: form.slug, status }),
        });
      } else {
        res = await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            email: form.email,
            tempPassword: form.tempPassword,
          }),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setSaveError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      setModalOpen(false);
      if (!editId) {
        setCredentials({ name: form.name, slug: form.slug, email: form.email, password: form.tempPassword });
      }
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
    try {
      await fetch(`/api/admin/tenants/${deleteId}`, { method: 'DELETE' });
      setTenants((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41]/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#00ff41]">{'>'} Tenants_</h1>
          <p className="text-[#00ff41]/40 text-sm mt-1">
            {tenants.length} {tenants.length === 1 ? 'agency' : 'agencies'} registered
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] font-medium border border-[#00ff41]/40"
        >
          <Plus className="h-4 w-4 mr-2" /> New Tenant
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={fetchData} className="ml-auto underline text-xs hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00ff41]/40" />
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#0d0d0d] border border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/30 focus:border-[#00ff41]/40 font-mono"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#00ff41]/30">
          <Users className="h-12 w-12 mb-4 text-[#00ff41]/20" />
          <p className="text-sm">
            {search ? '> no tenants match your search' : '> no tenants yet. create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-[#00ff41]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00ff41]/10">
                  {['Agency', 'Slug', 'Status', 'Agents', 'Posts', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-medium text-[#00ff41]/40 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/40 flex items-center justify-center text-[#00ff41] text-xs font-bold shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#00ff41] font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-[#00ff41]/60 text-xs bg-[#00ff41]/5 border border-[#00ff41]/10 px-2 py-0.5 rounded">
                        {t.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                          t.status === 'active'
                            ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30'
                            : 'bg-[#ffb441]/10 text-[#ffb441] border border-[#ffb441]/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'active' ? 'bg-[#00ff41] animate-pulse' : 'bg-[#ffb441]'
                          }`}
                        />
                        {t.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#00ff41]/60">{t.agentCount ?? 0}</td>
                    <td className="px-6 py-4 text-[#00ff41]/60">{t.postCount ?? 0}</td>
                    <td className="px-6 py-4 text-[#00ff41]/40 text-xs">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('en-US') : ''}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <a
                          href={`/${t.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-[#00ff41]/40 hover:text-[#00ff41] hover:bg-[#00ff41]/10 border border-transparent transition-colors"
                          title="View public page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          aria-label={`edit ${t.name}`}
                          className="p-1.5 rounded-md text-[#00ff41]/40 hover:text-[#00ff41] hover:bg-[#00ff41]/10 border border-transparent transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(t.id)}
                          aria-label={`delete ${t.name}`}
                          className="p-1.5 rounded-md text-[#ff4141]/40 hover:text-[#ff4141] hover:bg-[#ff4141]/10 border border-transparent transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0d0d0d] border border-[#00ff41]/20 text-[#00ff41] max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#00ff41]">
              {editId ? '> edit_tenant' : '> new_tenant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[#00ff41]/60 text-sm">Agency Name</Label>
              <Input
                placeholder="e.g. Prime Realty"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: editId ? form.slug : slugify(name) });
                }}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#00ff41]/60 text-sm">URL Slug</Label>
              <Input
                placeholder="e.g. prime-realty"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50"
              />
              {form.slug && (
                <p className="text-xs text-[#00ff41]/40">Public page: /{form.slug}</p>
              )}
            </div>
            {!editId && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[#00ff41]/60 text-sm">Admin Email</Label>
                  <Input
                    type="email"
                    placeholder="admin@agency.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#00ff41]/60 text-sm">Temporary Password</Label>
                  <Input
                    type="text"
                    placeholder="Min 6 characters"
                    value={form.tempPassword}
                    onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                    className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41] placeholder:text-[#00ff41]/20 focus:border-[#00ff41]/50"
                  />
                </div>
              </>
            )}
            {editId && (
              <div className="space-y-1.5">
                <Label className="text-[#00ff41]/60 text-sm">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'suspended')}>
                  <SelectTrigger className="bg-[#0a0a0a] border-[#00ff41]/20 text-[#00ff41]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d0d] border-[#00ff41]/20 text-[#00ff41]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {saveError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-[#00ff41]/40 hover:text-[#00ff41]">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.slug || (!editId && (!form.email || !form.tempPassword))}
              className="bg-[#00ff41]/20 hover:bg-[#00ff41]/40 text-[#00ff41] border border-[#00ff41]/40 font-medium"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'Save Changes' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#0d0d0d] border border-[#ff4141]/30 text-[#00ff41] max-w-sm font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#ff4141]">{'>'} confirm_delete</DialogTitle>
          </DialogHeader>
          <p className="text-[#00ff41]/50 text-sm">
            This will permanently delete the tenant and all associated data. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-[#00ff41]/40 hover:text-[#00ff41]">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#ff4141]/20 hover:bg-[#ff4141]/30 text-[#ff4141] border border-[#ff4141]/40 font-medium"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credential Card Modal */}
      <Dialog open={!!credentials} onOpenChange={() => { setCredentials(null); setCopied(false); }}>
        <DialogContent className="bg-[#0d0d0d] border border-[#00ff41]/20 text-[#00ff41] max-w-md font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#00ff41] flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#00ff41]" />
              Account Created
            </DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4 py-2">
              <p className="text-[#00ff41]/40 text-sm">Screenshot or copy credentials before closing.</p>
              <div className="bg-[#0a0a0a] border border-[#00ff41]/20 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#00ff41]/40">Agency</span>
                  <span className="text-[#00ff41] font-semibold">{credentials.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#00ff41]/40">Public Page</span>
                  <a href={`/${credentials.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#00ff41]/70 hover:text-[#00ff41] hover:underline">
                    /{credentials.slug}
                  </a>
                </div>
                <div className="h-px bg-[#00ff41]/10" />
                <div className="flex justify-between items-center">
                  <span className="text-[#00ff41]/40">Login URL</span>
                  <span className="text-[#00ff41]/60">{typeof window !== 'undefined' ? window.location.origin : ''}/login</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#00ff41]/40">Email</span>
                  <span className="text-[#00ff41]">{credentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#00ff41]/40">Password</span>
                  <span className="text-[#00ff41] font-bold tracking-widest">{credentials.password}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const text = `Agency: ${credentials.name}\nPublic Page: ${typeof window !== 'undefined' ? window.location.origin : ''}/${credentials.slug}\nLogin: ${typeof window !== 'undefined' ? window.location.origin : ''}/login\nEmail: ${credentials.email}\nPassword: ${credentials.password}`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#00ff41]/20 hover:bg-[#00ff41]/30 text-[#00ff41] border border-[#00ff41]/40 rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy All Credentials'}
              </button>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => { setCredentials(null); setCopied(false); }}
              className="bg-[#00ff41]/20 hover:bg-[#00ff41]/30 text-[#00ff41] border border-[#00ff41]/30 w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
