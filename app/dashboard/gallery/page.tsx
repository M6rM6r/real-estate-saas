'use client';

import { useEffect, useState, useRef } from 'react';
import { authFetch } from '@/lib/api';
import type { Media } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Upload, Trash2, Loader as Loader2, Image as ImageIcon } from 'lucide-react';

const demoMedia: Media[] = [
  { id: '1', tenant_id: 'demo', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'villa-exterior.jpg', created_at: '2026-04-01T00:00:00Z', sort_order: 0 },
  { id: '2', tenant_id: 'demo', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'apartment-living.jpg', created_at: '2026-04-02T00:00:00Z', sort_order: 1 },
  { id: '3', tenant_id: 'demo', url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'penthouse-view.jpg', created_at: '2026-04-03T00:00:00Z', sort_order: 2 },
  { id: '4', tenant_id: 'demo', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'marina-studio.jpg', created_at: '2026-04-04T00:00:00Z', sort_order: 3 },
  { id: '5', tenant_id: 'demo', url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'interior-design.jpg', created_at: '2026-04-05T00:00:00Z', sort_order: 4 },
  { id: '6', tenant_id: 'demo', url: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'pool-area.jpg', created_at: '2026-04-06T00:00:00Z', sort_order: 5 },
];

export default function GalleryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    authFetch<Media[]>('/api/dashboard/media')
      .then(setMedia)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const demo = sessionStorage.getItem('demo_auth') === 'true';
    if (demo) {
      setIsDemo(true);
      setMedia(demoMedia);
      setLoading(false);
      return;
    }
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      toast({ title: 'وضع العرض التجريبي', description: 'رفع الصور غير متاح في الوضع التجريبي.' });
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => {
        formData.append('files', f);
      });
      const res = await fetch('/api/dashboard/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await (await import('@/lib/firebase')).auth.currentUser?.getIdToken()}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { urls } = await res.json();
      for (const url of urls) {
        await authFetch('/api/dashboard/media', {
          method: 'POST',
          body: JSON.stringify({ url }),
        });
      }
      fetchMedia();
      toast({ title: 'Upload complete', description: 'Images uploaded successfully.' });
    } catch (e) {
      toast({
        title: 'Upload failed',
        description: e instanceof Error ? e.message : 'Unable to upload images.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (isDemo) {
      setDeleteId(null);
      toast({ title: 'وضع العرض التجريبي', description: 'حذف الصور غير متاح في الوضع التجريبي.' });
      return;
    }
    if (!deleteId) return;
    setDeleting(true);
    try {
      await authFetch(`/api/dashboard/media/${deleteId}`, { method: 'DELETE' });
      setMedia(media.filter((m) => m.id !== deleteId));
      setDeleteId(null);
      toast({ title: 'Deleted', description: 'Image removed from gallery.' });
    } catch {
      toast({ title: 'Delete failed', description: 'Unable to delete image.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-sm text-gray-400">Manage showcase images used across your public agency page.</p>
      </div>

      <div className="sticky top-0 z-20 backdrop-blur bg-[#0a0a0f]/80 border border-gray-800 rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            {media.length} image{media.length === 1 ? '' : 's'}
          </span>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="text-center text-gray-500 py-20 border border-dashed border-gray-700 rounded-2xl bg-[#12121a]">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-300 font-medium">No images yet.</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first set to build an attractive gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <img
                src={item.url}
                alt={item.label || 'Gallery image'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                  aria-label="Delete gallery image"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#12121a] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">Are you sure you want to delete this image? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
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
