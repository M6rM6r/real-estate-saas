'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, Loader as Loader2, Users } from 'lucide-react';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = () => {
    fetch('/api/admin/tenants')
      .then((r) => r.json())
      .then(setTenants)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setStatus('active');
    setModalOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditId(t.id);
    setForm({ name: t.name, slug: t.slug, email: '', tempPassword: '' });
    setStatus(t.status);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await fetch(`/api/admin/tenants/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, slug: form.slug, status }),
        });
      } else {
        await fetch('/api/admin/tenants', {
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
      setModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/tenants/${deleteId}`, { method: 'DELETE' });
      setTenants(tenants.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wider">{'>'} TENANTS</h1>
        <Button
          onClick={openCreate}
          className="bg-[#00ff41] hover:bg-[#00ff41]/80 text-[#0c0c0c] font-bold font-mono"
        >
          <Plus className="h-4 w-4 mr-2" /> CREATE_TENANT
        </Button>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center text-[#00ff41]/40 py-20">
          <Users className="h-12 w-12 mx-auto mb-4 text-[#00ff41]/20" />
          No tenants found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#00ff41]/20 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00ff41]/20 bg-[#111]">
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Name</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Agents</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Posts</th>
                <th className="text-left px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-[#00ff41]/60 font-bold text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5">
                  <td className="px-4 py-3 text-[#00ff41] font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-[#00ff41]/60 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-xs font-bold uppercase ${
                        t.status === 'active'
                          ? 'bg-green-400/20 text-green-400'
                          : 'bg-red-400/20 text-red-400'
                      }`}
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#00ff41]/60">{t.agentCount ?? 0}</td>
                  <td className="px-4 py-3 text-[#00ff41]/60">{t.postCount ?? 0}</td>
                  <td className="px-4 py-3 text-[#00ff41]/40 text-xs">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(t)}
                        className="text-[#00ff41]/60 hover:text-[#00ff41] hover:bg-[#00ff41]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(t.id)}
                        className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#111] border-[#00ff41]/30 text-[#00ff41] font-mono">
          <DialogHeader>
            <DialogTitle className="text-[#00ff41]">
              {editId ? '> EDIT_TENANT' : '> CREATE_TENANT'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[#00ff41]/80 text-xs uppercase">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({
                    ...form,
                    name,
                    slug: editId ? form.slug : slugify(name),
                  });
                }}
                className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#00ff41]/80 text-xs uppercase">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30"
              />
            </div>
            {!editId && (
              <>
                <div className="space-y-2">
                  <Label className="text-[#00ff41]/80 text-xs uppercase">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#00ff41]/80 text-xs uppercase">Temp Password</Label>
                  <Input
                    type="text"
                    value={form.tempPassword}
                    onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                    className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/30"
                  />
                </div>
              </>
            )}
            {editId && (
              <div className="space-y-2">
                <Label className="text-[#00ff41]/80 text-xs uppercase">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'suspended')}>
                  <SelectTrigger className="bg-[#0c0c0c] border-[#00ff41]/30 text-[#00ff41]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-[#00ff41]/30">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="text-[#00ff41]/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.slug}
              className="bg-[#00ff41] hover:bg-[#00ff41]/80 text-[#0c0c0c] font-bold"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? 'UPDATE' : 'CREATE'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#111] border-[#00ff41]/30 text-[#00ff41] font-mono">
          <DialogHeader>
            <DialogTitle className="text-red-400">{'>'} DELETE_TENANT</DialogTitle>
          </DialogHeader>
          <p className="text-[#00ff41]/60 text-sm">
            This will permanently delete the tenant and all associated data. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="text-[#00ff41]/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              DELETE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
