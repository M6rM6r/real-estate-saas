'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Post } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader as Loader2, X, Newspaper } from 'lucide-react';

const demoNews: Post[] = [
  { id: '1', tenant_id: 'demo', type: 'news', title: 'Dubai Real Estate Market Hits Record High in Q1 2026', body: 'The Dubai property market recorded AED 124 billion in transactions during Q1 2026, a 23% increase year-over-year.', published: true, images: [], created_at: '2026-04-18T10:00:00Z' },
  { id: '2', tenant_id: 'demo', type: 'news', title: 'New Visa Rules Boost Property Investment', body: 'The UAE cabinet has announced extended golden visa durations for property investors.', published: true, images: [], created_at: '2026-04-12T10:00:00Z' },
  { id: '3', tenant_id: 'demo', type: 'news', title: 'Sustainable Building Standards Updated', body: 'Dubai Municipality has released updated green building standards effective from June 2026.', published: false, images: [], created_at: '2026-04-05T10:00:00Z' },
];

const emptyForm = {
  title: '',
  body: '',
  published: true,
  images: [] as string[],
};

export default function NewsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const fetchData = () => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setItems(demoNews);
      setLoading(false);
      return;
    }
    authFetch<Post[]>('/api/dashboard/news')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Post) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body || '',
      published: item.published,
      images: item.images || [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body || undefined,
        published: form.published,
        images: form.images,
      };
      const isDemo = sessionStorage.getItem('demo_auth') === 'true';
      if (isDemo) {
        if (editingId) {
          setItems(items.map((i) => (i.id === editingId ? { ...i, ...payload, body: payload.body || '' } : i)));
        } else {
          setItems([...items, { ...payload, body: payload.body || '', id: Date.now().toString(), tenant_id: 'demo', type: 'news' as const, created_at: new Date().toISOString() } as Post]);
        }
      } else if (editingId) {
        await authFetch(`/api/dashboard/news/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/api/dashboard/news', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      if (!isDemo) fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news article?')) return;
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setItems(items.filter((i) => i.id !== id));
      return;
    }
    try {
      await authFetch(`/api/dashboard/news/${id}`, { method: 'DELETE' });
      fetchData();
    } catch {}
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">News</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          No news articles yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-[#12121a] border-gray-800">
              <CardContent className="p-4 flex items-start gap-4">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt=""
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{item.title}</h3>
                    {!item.published && (
                      <Badge className="bg-gray-500/20 text-gray-400">Draft</Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.body || 'No content'}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(item)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#12121a] border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Article' : 'New Article'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#1a1a2e] border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Content</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={5}
                className="bg-[#1a1a2e] border-gray-700 text-white resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label className="text-gray-300">Published</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Images</Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="bg-[#1a1a2e] border-gray-700 text-white flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  className="border-gray-700 text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt=""
                        className="w-16 h-16 rounded object-cover border border-gray-700"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
