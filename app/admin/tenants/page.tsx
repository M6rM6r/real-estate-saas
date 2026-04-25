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
import { Plus, Pencil, Trash2, Loader2, Users, Search, ExternalLink, AlertCircle } from 'lucide-react';

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
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenants</h1>
          <p className="text-slate-400 text-sm mt-1">
            {tenants.length} {tenants.length === 1 ? 'agency' : 'agencies'} registered
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Users className="h-12 w-12 mb-4 text-slate-700" />
          <p className="text-sm">
            {search
              ? 'No tenants match your search.'
              : 'No tenants yet. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Agency', 'Slug', 'Status', 'Agents', 'Posts', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}
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
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-slate-400 text-xs bg-slate-800 px-2 py-0.5 rounded">
                        {t.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          t.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {t.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{t.agentCount ?? 0}</td>
                    <td className="px-6 py-4 text-slate-400">{t.postCount ?? 0}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <a
                          href={`/${t.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="View public page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          aria-label={`تعديل ${t.name}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(t.id)}
                          aria-label={`حذف ${t.name}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editId ? 'Edit Tenant' : 'Create New Tenant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Agency Name</Label>
              <Input
                placeholder="e.g. Prime Realty"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({
                    ...form,
                    name,
                    slug: editId ? form.slug : slugify(name),
                  });
                }}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">URL Slug</Label>
              <Input
                placeholder="e.g. prime-realty"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
              {form.slug && (
                <p className="text-xs text-slate-500">Public page: /{form.slug}</p>
              )}
            </div>
            {!editId && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Admin Email</Label>
                  <Input
                    type="email"
                    placeholder="admin@agency.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Temporary Password</Label>
                  <Input
                    type="text"
                    placeholder="Min 8 characters"
                    value={form.tempPassword}
                    onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </>
            )}
            {editId && (
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as 'active' | 'suspended')}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
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
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !form.name ||
                !form.slug ||
                (!editId && (!form.email || !form.tempPassword))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'Save Changes' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Tenant?</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm">
            This will permanently delete the tenant and all associated data. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
