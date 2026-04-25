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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader as Loader2, X, Newspaper, Search } from 'lucide-react';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

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
          toast({ title: 'Updated', description: 'Article updated successfully.' });
        } else {
          setItems([...items, { ...payload, body: payload.body || '', id: Date.now().toString(), tenant_id: 'demo', type: 'news' as const, created_at: new Date().toISOString() } as Post]);
          toast({ title: 'Created', description: 'Article created successfully.' });
        }
      } else if (editingId) {
        await authFetch(`/api/dashboard/news/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Updated', description: 'Article updated successfully.' });
      } else {
        await authFetch('/api/dashboard/news', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Created', description: 'Article created successfully.' });
      }
      setModalOpen(false);
      if (!isDemo) fetchData();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unable to save article.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setItems(items.filter((i) => i.id !== id));
      toast({ title: 'Deleted', description: 'Article removed.' });
      return;
    }
    try {
      await authFetch(`/api/dashboard/news/${id}`, { method: 'DELETE' });
      fetchData();
      toast({ title: 'Deleted', description: 'Article removed.' });
    } catch {
      toast({ title: 'Delete failed', description: 'Unable to delete article.', variant: 'destructive' });
    }
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

  const filteredItems = items.filter((item) => {
    const statusMatch =
      filter === 'all' ? true : filter === 'published' ? item.published : !item.published;
    const queryMatch = query.trim()
      ? `${item.title} ${item.body || ''}`.toLowerCase().includes(query.toLowerCase())
      : true;
    return statusMatch && queryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">News</h1>
        <p className="text-sm text-gray-400">Create market updates and agency announcements for your public page.</p>
      </div>

      <div className="sticky top-0 z-20 backdrop-blur bg-[#0a0a0f]/80 border border-gray-800 rounded-xl p-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or content"
              className="pl-9 bg-[#12121a] border-gray-700 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'published' | 'draft')}>
              <SelectTrigger className="w-40 bg-[#12121a] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-gray-700">
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> New Article
            </Button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="bg-[#12121a] border-gray-800 py-16 text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-300 font-medium">No news articles found.</p>
          <p className="text-gray-500 text-sm mt-2">Try clearing your search/filter, or create a new article.</p>
          <Button onClick={openCreate} className="mt-5 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Create Article
          </Button>
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
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
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
                    aria-label={`Edit article ${item.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(item.id)}
                    className="text-gray-400 hover:text-red-400"
                    aria-label={`Delete article ${item.title}`}
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
                        aria-label={`Remove image ${i + 1}`}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#12121a] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) {
                  void handleDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
