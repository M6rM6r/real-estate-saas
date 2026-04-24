'use client';

import { useEffect, useState, useMemo } from 'react';
import { authFetch } from '@/lib/api';
import type { Post } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader as Loader2, X, Megaphone, Search } from 'lucide-react';

const demoAnnouncements: Post[] = [
  { id: 'da1', title: 'Office Closed on National Day', body: 'Our offices will be closed on December 2nd for UAE National Day. We wish everyone a joyful celebration!', published: true, images: [], created_at: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'announcement', tenantId: 'demo' },
  { id: 'da2', title: 'New Property Listings Now Available', body: 'We have just added 12 new premium listings in Dubai Marina and Palm Jumeirah. Browse them now in our latest collection.', published: true, images: [], created_at: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'announcement', tenantId: 'demo' },
  { id: 'da3', title: 'Upcoming Open House — Emirates Hills', body: 'Join us this Friday for an exclusive open house at our Emirates Hills mansion listing. RSVP to reserve your spot.', published: false, images: [], created_at: new Date(Date.now() - 86400000 * 8).toISOString(), type: 'announcement', tenantId: 'demo' },
];

const emptyForm = {
  title: '',
  body: '',
  published: true,
  images: [] as string[],
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchData = () => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setItems(demoAnnouncements);
      setLoading(false);
      return;
    }
    authFetch<Post[]>('/api/dashboard/announcements')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch = filter === 'all' ? true : filter === 'published' ? item.published : !item.published;
      const queryMatch = query.trim()
        ? `${item.title} ${item.body || ''}`.toLowerCase().includes(query.toLowerCase())
        : true;
      return statusMatch && queryMatch;
    });
  }, [items, query, filter]);

  const publishedCount = items.filter((i) => i.published).length;
  const draftCount = items.filter((i) => !i.published).length;

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
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body || undefined,
        published: form.published,
        images: form.images,
      };
      if (isDemo) {
        if (editingId) {
          setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, ...payload } : i));
        } else {
          const newItem: Post = { id: `da${Date.now()}`, ...payload, images: form.images, created_at: new Date().toISOString(), type: 'announcement', tenantId: 'demo' };
          setItems((prev) => [newItem, ...prev]);
        }
        setModalOpen(false);
        setSaving(false);
        return;
      }
      if (editingId) {
        await authFetch(`/api/dashboard/announcements/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/api/dashboard/announcements', {
          method: 'POST',
          body: JSON.stringify(payload),
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

  const handleDelete = async (id: string) => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (!confirm('Delete this announcement?')) return;
    if (isDemo) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    try {
      await authFetch(`/api/dashboard/announcements/${id}`, { method: 'DELETE' });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length} total · {publishedCount} published · {draftCount} draft
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </div>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-sm py-3 -mx-1 px-1 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <Input
            placeholder="Search announcements…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-[#12121a] border-gray-800 text-white placeholder:text-gray-600"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40 bg-[#12121a] border-gray-800 text-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-gray-700 text-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="bg-[#12121a] border-gray-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">
              {query || filter !== 'all' ? 'No announcements match your filters' : 'No announcements yet'}
            </p>
            {!query && filter === 'all' && (
              <p className="text-gray-600 text-sm mt-1">Click "New Announcement" to get started</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-[#12121a] border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-4 flex items-start gap-4">
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{item.title}</h3>
                    <Badge className={item.published ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-gray-500/20 text-gray-400 border-0'}>
                      {item.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.body || 'No content'}</p>
                  <p className="text-gray-600 text-xs mt-1.5">
                    {new Date(item.created_at).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })}
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
              {editingId ? 'Edit Announcement' : 'New Announcement'}
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
