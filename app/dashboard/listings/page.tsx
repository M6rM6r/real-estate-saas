'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import type { Post, ListingStatus } from '@/lib/types';
import { useLanguage } from '@/app/dashboard/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, MapPin, Bed, Bath, Maximize, Loader as Loader2, X, Sparkles, ChevronLeft, ChevronRight, Search, Copy, Eye, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LISTINGS_T = {
  ar: {
    pageTitle: 'العروض', addListing: 'إضافة عرض', noListings: 'لا توجد عروض بعد',
    noListingsSub: 'أضف أول عرض وابدأ في استقطاب العملاء', addFirst: 'إضافة عرض',
    searchPlaceholder: 'ابحث بالعنوان أو الموقع...', showing: 'عرض', of: 'من', filteredFrom: 'مصفى من',
    prevPage: 'الصفحة السابقة', nextPage: 'الصفحة التالية',
    editListing: 'تعديل العرض', newListing: 'عرض جديد',
    titleLabel: 'العنوان *', priceLabel: 'السعر (SAR)', locationLabel: 'الموقع',
    locationUrlLabel: 'رابط الموقع على الخريطة', bedroomsLabel: 'الغرف', bathroomsLabel: 'الحمامات',
    areaLabel: 'المساحة (م²)', statusLabel: 'الحالة',
    statusAvailable: 'متاح', statusSold: 'مباع', statusRented: 'مؤجر', draft: 'مسودة',
    featuresLabel: 'المميزات', addFeature: 'إضافة ميزة',
    featurePlaceholder: 'مثال: موقع استراتيجي',
    noFeatures: 'لا توجد مميزات — اضغط "إضافة ميزة" لإضافتها',
    descriptionLabel: 'الوصف', notesLabel: 'ملاحظات',
    notesPlaceholder: 'أي ملاحظات خاصة بهذا العقار (للاستخدام الداخلي فقط)',
    publishedLabel: 'منشور', imagesLabel: 'الصور', imageUrlPlaceholder: 'أدخل رابط الصورة',
    cancel: 'إلغاء', update: 'تحديث', create: 'إنشاء',
    deleteListing: 'حذف العرض', deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.', delete: 'حذف',
    dragToSort: 'سحب للترتيب', copyOf: 'نسخة من',
    duplicated: 'تم نسخ العرض', duplicateFailed: 'فشل نسخ العرض', error: 'خطأ',
    aiFailed: 'فشل توليد النص بالذكاء الاصطناعي',
  },
  en: {
    pageTitle: 'Listings', addListing: 'Add Listing', noListings: 'No listings yet',
    noListingsSub: 'Add your first listing to start attracting clients', addFirst: 'Add Listing',
    searchPlaceholder: 'Search by title or location...', showing: 'Showing', of: 'of', filteredFrom: 'filtered from',
    prevPage: 'Previous page', nextPage: 'Next page',
    editListing: 'Edit Listing', newListing: 'New Listing',
    titleLabel: 'Title *', priceLabel: 'Price (SAR)', locationLabel: 'Location',
    locationUrlLabel: 'Map URL', bedroomsLabel: 'Bedrooms', bathroomsLabel: 'Bathrooms',
    areaLabel: 'Area (m²)', statusLabel: 'Status',
    statusAvailable: 'Available', statusSold: 'Sold', statusRented: 'Rented', draft: 'Draft',
    featuresLabel: 'Features', addFeature: 'Add Feature',
    featurePlaceholder: 'e.g. Prime location',
    noFeatures: 'No features — click "Add Feature" to add one',
    descriptionLabel: 'Description', notesLabel: 'Notes',
    notesPlaceholder: 'Any notes about this listing (internal use only)',
    publishedLabel: 'Published', imagesLabel: 'Images', imageUrlPlaceholder: 'Enter image URL',
    cancel: 'Cancel', update: 'Update', create: 'Create',
    deleteListing: 'Delete listing', deleteWarning: 'This action cannot be undone.', delete: 'Delete',
    dragToSort: 'Drag to sort', copyOf: 'Copy of',
    duplicated: 'Listing duplicated', duplicateFailed: 'Failed to duplicate listing', error: 'Error',
    aiFailed: 'Failed to generate AI text',
  },
};

function SortableImage({ url, index, onRemove }: { url: string; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url + index });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="relative group w-16 h-16">
      <img src={url} alt={`Image ${index + 1}`} className="w-full h-full rounded object-cover border border-gray-700" />
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="absolute bottom-0 left-0 w-5 h-5 rounded-tr rounded-bl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        aria-label="Drag to sort"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove image ${index + 1}`}
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}


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
  location_url: '',
  bedrooms: '',
  bathrooms: '',
  area_sqm: '',
  listing_status: 'available' as ListingStatus,
  published: true,
  images: [] as string[],
  features: [] as string[],
  notes: '',
};

export default function ListingsPage() {
  const { lang } = useLanguage();
  const t = LISTINGS_T[lang];
  const [listings, setListings] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyListing);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<{ title?: string; images?: string }>({});
  const [aiGenerating, setAiGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const dndSensors = useSensors(useSensor(PointerSensor));
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const generateWithAI = async () => {
    if (!form.title) return;
    setAiGenerating(true);
    try {
      const result = await authFetch<{ english: string; arabic: string }>('/api/dashboard/ai/listing-copy', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          price: form.price,
          location: form.location,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
          area: form.area_sqm ? Number(form.area_sqm) : undefined,
        }),
      });
      setForm(prev => ({ ...prev, body: result.arabic + '\n\n' + result.english }));
    } catch {
      toast({ title: t.error, description: t.aiFailed, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  const duplicateListing = async (listing: Post) => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    const payload = {
      title: `${t.copyOf} ${listing.title}`,
      body: listing.body || '',
      price: listing.price,
      location: listing.location,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      area_sqm: listing.area_sqm,
      listing_status: listing.listing_status || 'available',
      published: false,
      images: listing.images || [],
      type: 'listing',
    };
    if (isDemo) {
      const fake: Post = { ...listing, id: Date.now().toString(), title: payload.title, published: false, created_at: new Date().toISOString() };
      setListings(prev => [fake, ...prev]);
      toast({ title: t.duplicated });
      return;
    }
    try {
      const created = await authFetch<Post>('/api/dashboard/listings', { method: 'POST', body: JSON.stringify(payload) });
      setListings(prev => [created, ...prev]);
      toast({ title: t.duplicated });
    } catch {
      toast({ title: t.error, description: t.duplicateFailed, variant: 'destructive' });
    }
  };

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

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

  useEffect(() => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) return;
    authFetch<Record<string, number>>('/api/dashboard/listings/views')
      .then(setViewCounts)
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyListing);
    setFormErrors({});
    setImageUrl('');
    setModalOpen(true);
  };

  const openEdit = (listing: Post) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      body: listing.body || '',
      price: listing.price?.toString() || '',
      location: listing.location || '',
      location_url: listing.location_url || '',
      bedrooms: listing.bedrooms?.toString() || '',
      bathrooms: listing.bathrooms?.toString() || '',
      area_sqm: listing.area_sqm?.toString() || '',
      listing_status: listing.listing_status || 'available',
      published: listing.published,
      images: listing.images || [],
      features: listing.features || [],
      notes: listing.notes || '',
    });
    setFormErrors({});
    setImageUrl('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    const nextErrors: { title?: string; images?: string } = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (form.images.some((img) => img && !isValidUrl(img))) {
      nextErrors.images = 'All image URLs must start with http:// or https://';
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body || undefined,
        price: form.price ? Number(form.price) : undefined,
        location: form.location || undefined,
        location_url: form.location_url || undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : undefined,
        listing_status: form.listing_status,
        published: form.published,
        images: form.images,
        features: form.features.filter(f => f.trim()),
        notes: form.notes || undefined,
      };
      const isDemo = sessionStorage.getItem('demo_auth') === 'true';
      if (isDemo) {
        if (editingId) {
          setListings(listings.map((l) => (l.id === editingId ? { ...l, ...payload, body: payload.body || '' } : l)));
          toast({ title: 'Updated', description: 'Listing updated successfully.' });
        } else {
          setListings([...listings, { ...payload, body: payload.body || '', id: Date.now().toString(), tenant_id: 'demo', type: 'listing' as const, created_at: new Date().toISOString() } as Post]);
          toast({ title: 'Created', description: 'Listing added successfully.' });
        }
      } else if (editingId) {
        await authFetch(`/api/dashboard/posts/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Updated', description: 'Listing updated successfully.' });
      } else {
        await authFetch('/api/dashboard/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Created', description: 'Listing added successfully.' });
      }
      setModalOpen(false);
      if (!isDemo) fetchListings();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unable to save listing.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const isDemo = sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setListings(listings.filter((l) => l.id !== id));
      toast({ title: 'Deleted', description: 'Listing removed.' });
      return;
    }
    try {
      await authFetch(`/api/dashboard/posts/${id}`, { method: 'DELETE' });
      fetchListings();
      toast({ title: 'Deleted', description: 'Listing removed.' });
    } catch {
      toast({ title: 'Delete failed', description: 'Unable to delete listing.', variant: 'destructive' });
    }
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      if (!isValidUrl(imageUrl.trim())) {
        setFormErrors((prev) => ({ ...prev, images: 'Enter a valid image URL (http/https).' }));
        return;
      }
      setFormErrors((prev) => ({ ...prev, images: undefined }));
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
    setFormErrors((prev) => ({ ...prev, images: undefined }));
  };

  const statusColor = (s?: string) => {
    if (s === 'available') return 'bg-green-500/20 text-green-400';
    if (s === 'sold') return 'bg-red-500/20 text-red-400';
    if (s === 'rented') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 bg-gray-800" />
          <Skeleton className="h-10 w-32 bg-gray-800" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="bg-[#12121a] border-gray-800 overflow-hidden">
              <Skeleton className="h-52 w-full rounded-none bg-gray-800" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-gray-800" />
                <Skeleton className="h-5 w-1/3 bg-gray-800" />
                <Skeleton className="h-4 w-2/3 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const filtered = searchQuery.trim()
    ? listings.filter(l =>
        `${l.title} ${l.location ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.pageTitle}</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> {t.addListing}
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card className="bg-[#12121a] border-gray-800 border-dashed">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-6xl" role="img" aria-label="منزل">🏠</span>
            <p className="text-lg font-semibold text-gray-200">{t.noListings}</p>
            <p className="text-sm text-gray-500 max-w-xs">{t.noListingsSub}</p>
            <Button onClick={openCreate} className="mt-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> {t.addFirst}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder={t.searchPlaceholder}
              dir="rtl"
              className="bg-[#12121a] border-gray-700 text-white pr-10 placeholder:text-gray-500"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setPage(1); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>
              {t.showing} {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} {t.of} {filtered.length}
              {searchQuery && ` (${t.filteredFrom} ${listings.length})`}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((listing) => (
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
                  {listing.listing_status === 'available' ? t.statusAvailable : listing.listing_status === 'sold' ? t.statusSold : t.statusRented}
                  </Badge>
                )}
                {!listing.published && (
                  <Badge className="absolute top-2 right-2 bg-gray-500/20 text-gray-400">
                    {t.draft}
                  </Badge>
                )}
                {viewCounts[listing.id] != null && viewCounts[listing.id] > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    <Eye className="h-3 w-3" />
                    <span>{viewCounts[listing.id].toLocaleString('en-US')}</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-white truncate mb-1">
                  {listing.title}
                </h3>
                {listing.price != null && (
                  <p className="inline-flex items-center bg-blue-600/15 text-blue-400 font-bold text-base px-2.5 py-0.5 rounded-full mb-2">
                    {listing.price.toLocaleString('en-US')} SAR
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
                    aria-label={`Edit ${listing.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateListing(listing)}
                    className="text-gray-400 hover:text-blue-400"
                    aria-label={`Duplicate ${listing.title}`}
                    title={t.duplicated}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(listing.id)}
                    className="text-gray-400 hover:text-red-400"
                    aria-label={`Delete ${listing.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-700 bg-[#12121a] text-gray-400 hover:text-white"
              disabled={safePage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              aria-label={t.prevPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant="outline"
                size="icon"
                className={`h-8 w-8 border-gray-700 ${p === safePage ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#12121a] text-gray-400 hover:text-white'}`}
                onClick={() => setPage(p)}
                aria-current={p === safePage ? 'page' : undefined}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-700 bg-[#12121a] text-gray-400 hover:text-white"
              disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              aria-label={t.nextPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#12121a] border-gray-800 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t.editListing : t.newListing}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300">{t.titleLabel}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#1a1a2e] border-gray-700 text-white"
              />
              {formErrors.title && <p className="text-xs text-red-400">{formErrors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">{t.priceLabel}</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{t.locationLabel}</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{t.locationUrlLabel}</Label>
                <Input
                  value={form.location_url}
                  onChange={(e) => setForm({ ...form, location_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="bg-[#1a1a2e] border-gray-700 text-white placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">{t.bedroomsLabel}</Label>
                <Input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{t.bathroomsLabel}</Label>
                <Input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{t.areaLabel}</Label>
                <Input
                  type="number"
                  value={form.area_sqm}
                  onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
                  className="bg-[#1a1a2e] border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">{t.statusLabel}</Label>
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
                  <SelectItem value="available">{t.statusAvailable}</SelectItem>
                  <SelectItem value="sold">{t.statusSold}</SelectItem>
                  <SelectItem value="rented">{t.statusRented}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">{t.featuresLabel}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-gray-700 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1"
                  onClick={() => setForm({ ...form, features: [...form.features, ''] })}
                >
                  <Plus className="h-3 w-3" /> {t.addFeature}
                </Button>
              </div>
              <div className="space-y-2">
                {form.features.map((feat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={feat}
                      onChange={(e) => {
                        const next = [...form.features];
                        next[i] = e.target.value;
                        setForm({ ...form, features: next });
                      }}
                      placeholder={t.featurePlaceholder}
                      className="bg-[#1a1a2e] border-gray-700 text-white text-sm h-8"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.features.length === 0 && (
                  <p className="text-xs text-gray-500">{t.noFeatures}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">{t.descriptionLabel}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-gray-700 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1"
                  disabled={!form.title || aiGenerating}
                  onClick={generateWithAI}
                >
                  {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                className="bg-[#1a1a2e] border-gray-700 text-white resize-none"
              />
            </div>
            {/* Notes field */}
            <div className="space-y-2">
              <Label className="text-gray-300">{t.notesLabel}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t.notesPlaceholder}
                rows={3}
                className="bg-[#1a1a2e] border-gray-700 text-white resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label className="text-gray-300">{t.publishedLabel}</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">{t.imagesLabel}</Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t.imageUrlPlaceholder}
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
              {formErrors.images && <p className="text-xs text-red-400">{formErrors.images}</p>}
              {form.images.length > 0 && (
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event: DragEndEvent) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    const oldIndex = form.images.findIndex((url, i) => url + i === active.id);
                    const newIndex = form.images.findIndex((url, i) => url + i === over.id);
                    setForm(prev => ({ ...prev, images: arrayMove(prev.images, oldIndex, newIndex) }));
                  }}
                >
                  <SortableContext items={form.images.map((url, i) => url + i)} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.images.map((url, i) => (
                        <SortableImage key={url + i} url={url} index={i} onRemove={() => removeImage(i)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="text-gray-400"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? t.update : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#12121a] border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteListing}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) {
                  void handleDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
