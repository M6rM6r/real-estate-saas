'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Post, ListingStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, MapPin, Bed, Bath, Maximize, Loader as Loader2, X } from 'lucide-react';

const demoListings: Post[] = [
  {
    id: '1', tenant_id: 'demo', type: 'listing',
    title: 'Luxury Villa in Palm Jumeirah', body: 'Stunning 4-bedroom villa with private beach access and panoramic sea views.',
    price: 12500000, location: 'Palm Jumeirah, Dubai', bedrooms: 4, bathrooms: 5, area_sqm: 450,
    listing_status: 'available', published: true,
    images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
    created_at: '2026-03-15T10:00:00Z',
  },
  {
    id: '2', tenant_id: 'demo', type: 'listing',
    title: 'Modern Downtown Apartment', body: 'Sleek 2-bedroom apartment in the heart of Downtown with Burj Khalifa views.',
    price: 3200000, location: 'Downtown Dubai', bedrooms: 2, bathrooms: 2, area_sqm: 120,
    listing_status: 'available', published: true,
    images: ['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'],
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: '3', tenant_id: 'demo', type: 'listing',
    title: 'Beachfront Penthouse', body: 'Exclusive penthouse with rooftop terrace and direct beach access.',
    price: 8900000, location: 'JBR, Dubai', bedrooms: 3, bathrooms: 4, area_sqm: 280,
    listing_status: 'sold', published: true,
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'],
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: '4', tenant_id: 'demo', type: 'listing',
    title: 'Cozy Studio in Marina', body: 'Perfect investment studio with high rental yield in Dubai Marina.',
    price: 950000, location: 'Dubai Marina', bedrooms: 1, bathrooms: 1, area_sqm: 45,
    listing_status: 'rented', published: true,
    images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'],
    created_at: '2026-01-05T10:00:00Z',
  },
];

const emptyListing = {
  title: '',
  body: '',
  price: '',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area_sqm: '',
  listing_status: 'available' as ListingStatus,
  published: true,
  images: [] as string[],
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyListing);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const fetchListings = () => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setListings(demoListings);
      setLoading(false);
      return;
    }
    authFetch<{ data: Post[] }>('/api/dashboard/listings')
      .then((res) => setListings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchListings, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyListing);
    setModalOpen(true);
  };

  const openEdit = (listing: Post) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      body: listing.body || '',
      price: listing.price?.toString() || '',
      location: listing.location || '',
      bedrooms: listing.bedrooms?.toString() || '',
      bathrooms: listing.bathrooms?.toString() || '',
      area_sqm: listing.area_sqm?.toString() || '',
      listing_status: listing.listing_status || 'available',
      published: listing.published,
      images: listing.images || [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body || undefined,
        price: form.price ? Number(form.price) : undefined,
        location: form.location || undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : undefined,
        listing_status: form.listing_status,
        published: form.published,
        images: form.images,
      };
      const isDemo = sessionStorage.getItem('demo_auth') === 'true';
      if (isDemo) {
        if (editingId) {
          setListings(listings.map((l) => (l.id === editingId ? { ...l, ...payload, body: payload.body || '' } : l)));
        } else {
          setListings([...listings, { ...payload, body: payload.body || '', id: Date.now().toString(), tenant_id: 'demo', type: 'listing' as const, created_at: new Date().toISOString() } as Post]);
        }
      } else if (editingId) {
        await authFetch(`/api/dashboard/posts/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await authFetch('/api/dashboard/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      if (!isDemo) fetchListings();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setListings(listings.filter((l) => l.id !== id));
      return;
    }
    try {
      await authFetch(`/api/dashboard/posts/${id}`, { method: 'DELETE' });
      fetchListings();
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

  const statusColor = (s?: string) => {
    if (s === 'available') return 'bg-green-500/20 text-green-400';
    if (s === 'sold') return 'bg-red-500/20 text-red-400';
    if (s === 'rented') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
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
        <h1 className="text-2xl font-bold">Listings</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          No listings yet. Create your first one!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="bg-[#12121a] border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative h-52 bg-gray-900">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-700" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                {listing.listing_status && (
                  <Badge
                    className={`absolute top-2 left-2 ${statusColor(listing.listing_status)}`}
                  >
                    {listing.listing_status}
                  </Badge>
                )}
                {!listing.published && (
                  <Badge className="absolute top-2 right-2 bg-gray-500/20 text-gray-400">
                    Draft
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-white truncate mb-1">
                  {listing.title}
                </h3>
                {listing.price != null && (
                  <p className="inline-flex items-center bg-blue-600/15 text-blue-400 font-bold text-base px-2.5 py-0.5 rounded-full mb-2">
                    {listing.price.toLocaleString()} SAR
                  </p>
                )}
                {listing.location && (
                  <p className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{listing.location}</span>
                  </p>
                )}
                <div className="flex gap-3 text-gray-500 text-xs mb-3">
                  {listing.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" /> {listing.bedrooms}
                    </span>
                  )}
                  {listing.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" /> {listing.bathrooms}
                    </span>
                  )}
                  {listing.area_sqm != null && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3 w-3" /> {listing.area_sqm}m&sup2;
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(listing)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(listing.id)}
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

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#12121a] border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Listing' : 'New Listing'}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Price (SAR)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Bedrooms</Label>
                <Input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Bathrooms</Label>
                <Input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Area (m&sup2;)</Label>
                <Input
                  type="number"
                  value={form.area_sqm}
                  onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={form.listing_status}
                onValueChange={(v) =>
                  setForm({ ...form, listing_status: v as ListingStatus })
                }
              >
                <SelectTrigger className="bg-[#1a1a2e] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-gray-700">
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
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
                        alt={`Image ${i + 1}`}
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
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="text-gray-400"
            >
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
