'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { PAGE_THEMES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2, ExternalLink, Copy, Check, Phone, Mail, MapPin,
  Instagram, Twitter, Linkedin, MessageCircle, Palette,
  Image as ImageIcon, FileText, Globe, AlertCircle,
  CheckCircle2, Building2, Hash, Layout, Plus, Trash2, Bed, Bath, Maximize, Clock,
  QrCode, Download, ChevronDown, ChevronUp, Megaphone, Search,
} from 'lucide-react';

type ProfileResponse = {
  profile: Profile | null;
  tenant: (Tenant & { primary_color?: string; theme?: string }) | null;
};

/* ── Reusable image uploader ── */
function ImageUploader({
  value,
  onChange,
  aspect = 'cover', // 'cover' | 'square'
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  aspect?: 'cover' | 'square';
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setErr('');
    // Demo mode: create a local object URL
    if (isDemo) {
      onChange(URL.createObjectURL(file));
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken() ?? null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/dashboard/upload', { method: 'POST', body: fd, headers });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch { /* empty body */ }
      if (!res.ok) throw new Error((data.error as string) ?? `فشل الرفع (${res.status})`);
      const urls = data.urls as string[] | undefined;
      if (urls?.[0]) onChange(urls[0]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  }, [isDemo, onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (aspect === 'square') {
    return (
      <div className="flex gap-3 items-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden hover:border-blue-500 transition-colors relative"
          title={label ?? 'رفع صورة'}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          ) : value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-600" />
          )}
          {value && !uploading && (
            <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-medium">تغيير</span>
          )}
        </button>
        <div className="flex-1 space-y-1">
          <p className="text-xs text-slate-400">{label ?? 'اضغط لاختيار صورة'}</p>
          <p className="text-[11px] text-slate-600">JPG · PNG · WebP · حتى 5 MB</p>
          {err && <p className="text-[11px] text-red-400">{err}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      </div>
    );
  }

  // cover / wide
  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !uploading && inputRef.current?.click()}
      className="w-full cursor-pointer group"
    >
      {value ? (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-700">
          <img src={value} alt="cover preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ImageIcon className="h-4 w-4" /> تغيير الصورة</>}
          </div>
        </div>
      ) : (
        <div className="w-full h-28 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-slate-500" />
              <p className="text-xs text-slate-400">اضغط أو اسحب صورة هنا</p>
              <p className="text-[11px] text-slate-600">JPG · PNG · WebP · حتى 5 MB</p>
            </>
          )}
        </div>
      )}
      {err && <p className="text-[11px] text-red-400 mt-1">{err}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEFAULT_PAGE_SECTIONS: NonNullable<Profile['page_sections']> = {
  hero: true,
  listings: true,
  about: true,
  news: true,
  contact: true,
  footer: true,
};

const DEFAULT_PAGE_CONFIG: NonNullable<Profile['page_config']> = {
  hero_headline: 'مرحباً بكم',
  listings_columns: 3,
  show_listing_filters: true,
  show_listing_search: true,
  hero_style: 'centered',
  hero_cta_text: 'تواصل عبر واتساب',
  button_shape: 'soft',
  seo_title: '',
  seo_description: '',
  announcement_text: '',
  announcement_color: 'accent',
  currency: 'SAR',
  offer_label_1: 'للبيع',
  offer_label_2: 'للإيجار',
};

const EMPTY_PROFILE: Profile = {
  tenant_id: '',
  logo_url: '',
  cover_url: '',
  bio: '',
  tagline: '',
  licence_no: '',
  contact_email: '',
  contact_phone: '',
  extra_phones: [],
  contact_address: '',
  social_links: { instagram: '', x: '', linkedin: '', whatsapp: '', snapchat: '', tiktok: '' },
  working_hours: {
    sun: { enabled: true,  open: '09:00', close: '17:00' },
    mon: { enabled: true,  open: '09:00', close: '17:00' },
    tue: { enabled: true,  open: '09:00', close: '17:00' },
    wed: { enabled: true,  open: '09:00', close: '17:00' },
    thu: { enabled: true,  open: '09:00', close: '17:00' },
    fri: { enabled: false, open: '09:00', close: '17:00' },
    sat: { enabled: false, open: '09:00', close: '17:00' },
  },
  page_sections: DEFAULT_PAGE_SECTIONS,
  page_config: DEFAULT_PAGE_CONFIG,
};

const COLOR_PRESETS = [
  '#2563eb', '#0ea5e9', '#7c3aed', '#9333ea',
  '#db2777', '#dc2626', '#ea580c', '#d97706',
  '#059669', '#0d9488', '#475569', '#1e293b',
  '#e11d48', '#c026d3', '#0284c7', '#14b8a6',
];

const demoListings = [
  { id: '1', title: 'فيلا فاخرة في الخليج', price: 2500000, location: 'Dubai Marina', bedrooms: 4, bathrooms: 3, area_sqm: 450, listing_status: 'available' as const, images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'] },
  { id: '2', title: 'شقة حديثة مع إطلالة', price: 1200000, location: 'Downtown Dubai', bedrooms: 3, bathrooms: 2, area_sqm: 200, listing_status: 'available' as const, images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'] },
  { id: '3', title: 'أرض للاستثمار العقاري', price: 800000, location: 'Business Bay', bedrooms: 0, bathrooms: 0, area_sqm: 1000, listing_status: 'available' as const, images: ['https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg'] },
];

const DAY_ORDER = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_AR: Record<(typeof DAY_ORDER)[number], string> = {
  sun: 'الأحد',
  mon: 'الإثنين',
  tue: 'الثلاثاء',
  wed: 'الأربعاء',
  thu: 'الخميس',
  fri: 'الجمعة',
  sat: 'السبت',
};

const WORKING_HOURS_DEFAULT: NonNullable<Profile['working_hours']> = {
  sun: { enabled: true, open: '09:00', close: '17:00' },
  mon: { enabled: true, open: '09:00', close: '17:00' },
  tue: { enabled: true, open: '09:00', close: '17:00' },
  wed: { enabled: true, open: '09:00', close: '17:00' },
  thu: { enabled: true, open: '09:00', close: '17:00' },
  fri: { enabled: false, open: '09:00', close: '17:00' },
  sat: { enabled: false, open: '09:00', close: '17:00' },
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const isValidUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function PageBuilderPage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [agencyName, setAgencyName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('modern');
  const [businessType, setBusinessType] = useState<string>('real_estate');
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [listingForm, setListingForm] = useState({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', extra_images: [] as string[], card_style: 'standard', status: 'available', offer_type: 'sale', property_type: '' });
  const [listingSaving, setListingSaving] = useState(false);
  const [listingError, setListingError] = useState('');
  const [listingPublished, setListingPublished] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('themes');
  const [showChecklist, setShowChecklist] = useState(false);

  const profileCompletionItems = [
    { key: 'name',      label: 'اسم المنشأة',          done: Boolean(agencyName),                tab: 'branding' },
    { key: 'logo',      label: 'الشعار',               done: Boolean(profile.logo_url),          tab: 'branding' },
    { key: 'cover',     label: 'صورة الغلاف',          done: Boolean(profile.cover_url),         tab: 'branding' },
    { key: 'bio',       label: 'نبذة عن المنشأة',      done: Boolean(profile.bio),               tab: 'content'  },
    { key: 'whatsapp',  label: 'رقم واتساب',           done: Boolean(profile.social_links?.whatsapp), tab: 'social' },
    { key: 'listing',   label: 'عرض واحد على الأقل',   done: listings.filter(l => l.published !== false).length > 0, tab: 'posts' },
    { key: 'theme',     label: 'تصميم مخصص',           done: selectedTheme !== 'modern',         tab: 'themes'   },
  ];

  useEffect(() => {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      const d = { profile: { tenant_id: 'demo', logo_url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=100', cover_url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200', bio: 'وكالة عقارية رائدة متخصصة في العقارات الفاخرة بدبي. بخبرة تمتد أكثر من 15 عامًا، نساعدك على إيجاد منزل أحلامك في أرقى المواقع.', tagline: 'حيث تلتقي الفخامة بالمنزل', contact_email: 'info@luxuryhomesdubai.com', contact_phone: '+971 4 123 4567', contact_address: 'برج A، بزنس باي، دبي، الإمارات', licence_no: 'RE-12345', social_links: { instagram: 'https://instagram.com/luxuryhomesdubai', x: 'https://x.com/luxuryhomesdubai', linkedin: 'https://linkedin.com/company/luxuryhomesdubai', whatsapp: 'https://wa.me/971501234567' } }, tenant: { id: 'demo', slug: 'luxury-homes-dubai', name: 'Luxury Homes Dubai', status: 'active' as const, created_at: '2025-10-15T10:00:00Z', primary_color: '#0ea5e9', theme: 'modern' } };
      setData(d);
      setProfile({
        ...d.profile,
        page_sections: DEFAULT_PAGE_SECTIONS,
        page_config: DEFAULT_PAGE_CONFIG,
      });
      setPrimaryColor(d.tenant.primary_color);
      setAgencyName(d.tenant.name);
      setSelectedTheme(d.tenant.theme);
      setBusinessType((d.tenant as any).business_type || 'real_estate');
      setListings(demoListings);
      setLoading(false);
      return;
    }
    Promise.all([
      authFetch<ProfileResponse>('/api/dashboard/profile'),
      authFetch<{ data: any[] }>('/api/dashboard/listings').catch(() => ({ data: [] })),
    ]).then(([profileRes, listingsRes]) => {
        setData(profileRes);
        if (profileRes.profile) {
          setProfile({
            ...profileRes.profile,
            working_hours: { ...WORKING_HOURS_DEFAULT, ...(profileRes.profile.working_hours ?? {}) },
            page_sections: { ...DEFAULT_PAGE_SECTIONS, ...(profileRes.profile.page_sections ?? {}) },
            page_config: { ...DEFAULT_PAGE_CONFIG, ...(profileRes.profile.page_config ?? {}) },
          });
        }
        setPrimaryColor(profileRes.tenant?.primary_color || '#2563eb');
        setAgencyName(profileRes.tenant?.name || '');
        setSelectedTheme(profileRes.tenant?.theme || 'modern');
        setBusinessType((profileRes.tenant as any)?.business_type || 'real_estate');
        setListings(listingsRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const markDirty = () => {
    setDirty(true);
    setSaveStatus('idle');
    setSaveError('');
  };

  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    markDirty();
  };

  const updateSocial = (key: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
    markDirty();
  };

  const toggleSection = (key: keyof NonNullable<Profile['page_sections']>) => {
    setProfile((prev) => ({
      ...prev,
      page_sections: {
        ...DEFAULT_PAGE_SECTIONS,
        ...(prev.page_sections ?? {}),
        [key]: !(prev.page_sections?.[key] ?? DEFAULT_PAGE_SECTIONS[key]),
      },
    }));
    markDirty();
  };

  const updatePageConfig = (patch: Partial<NonNullable<Profile['page_config']>>) => {
    setProfile((prev) => ({
      ...prev,
      page_config: {
        ...DEFAULT_PAGE_CONFIG,
        ...(prev.page_config ?? {}),
        ...patch,
      },
    }));
    markDirty();
  };

  const resetListingForm = () => {
    setListingForm({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', extra_images: [], card_style: 'standard', status: 'available', offer_type: 'sale', property_type: '' });
    setEditingListing(null);
    setListingError('');
    setListingPublished(true);
  };

  const addListing = async () => {
    if (!listingForm.title || !listingForm.price) return;
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    const payload = {
      title: listingForm.title,
      price: parseInt(listingForm.price),
      location: listingForm.location || null,
      bedrooms: listingForm.bedrooms ? parseInt(listingForm.bedrooms) : null,
      bathrooms: listingForm.bathrooms ? parseInt(listingForm.bathrooms) : null,
      area_sqm: listingForm.area_sqm ? parseInt(listingForm.area_sqm) : null,
      images: [listingForm.image, ...listingForm.extra_images].filter(Boolean),
      card_style: listingForm.card_style as 'standard' | 'featured' | 'compact',
      listing_status: listingForm.status as 'available' | 'sold' | 'rented',
      offer_type: listingForm.offer_type as 'sale' | 'rent',
      property_type: listingForm.property_type || null,
      published: listingPublished,
    };
    if (isDemo) {
      const entry = { id: Date.now().toString(), ...payload };
      if (editingListing) {
        setListings((prev) => prev.map((l) => l.id === editingListing.id ? { ...entry, id: editingListing.id } : l));
      } else {
        setListings((prev) => [entry, ...prev]);
      }
      resetListingForm();
      setShowListingForm(false);
      return;
    }
    setListingSaving(true);
    setListingError('');
    try {
      if (editingListing) {
        const updated = await authFetch<any>(`/api/dashboard/listings/${editingListing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setListings((prev) => prev.map((l) => l.id === editingListing.id ? { ...l, ...updated, images: payload.images, listing_status: payload.listing_status } : l));
      } else {
        const created = await authFetch<any>('/api/dashboard/listings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setListings((prev) => [{ ...created, images: payload.images, listing_status: payload.listing_status }, ...prev]);
      }
      resetListingForm();
      setShowListingForm(false);
    } catch (e) {
      setListingError(e instanceof Error ? e.message : 'حدث خطأ، حاول مجدداً');
    } finally {
      setListingSaving(false);
    }
  };

  const deleteListing = async (id: string) => {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (!isDemo) {
      try {
        await authFetch(`/api/dashboard/listings/${id}`, { method: 'DELETE' });
      } catch {
        authFetch<{ data: any[] }>('/api/dashboard/listings')
          .then((r) => setListings(r.data ?? []))
          .catch(() => {});
      }
    }
  };

  const handleSave = async () => {
    const email = (profile.contact_email || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSaveStatus('error');
      setSaveError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    const urlCandidates: Array<{ label: string; value?: string }> = [
      { label: 'رابط الشعار', value: profile.logo_url || '' },
      { label: 'رابط صورة الغلاف', value: profile.cover_url || '' },
      { label: 'Instagram', value: profile.social_links?.instagram || '' },
      { label: 'X (Twitter)', value: profile.social_links?.x || '' },
      { label: 'LinkedIn', value: profile.social_links?.linkedin || '' },
      { label: 'WhatsApp', value: profile.social_links?.whatsapp || '' },
    ];
    for (const candidate of urlCandidates) {
      const v = candidate.value?.trim();
      if (v && !isValidUrl(v)) {
        setSaveStatus('error');
        setSaveError(`${candidate.label}: الرجاء إدخال رابط صحيح يبدأ بـ http أو https`);
        return;
      }
    }

    for (const day of DAY_ORDER) {
      const h = profile.working_hours?.[day];
      if (!h?.enabled) continue;
      if (!h.open || !h.close || toMinutes(h.open) >= toMinutes(h.close)) {
        setSaveStatus('error');
        setSaveError(`ساعات العمل غير صحيحة ليوم ${DAY_AR[day]}`);
        return;
      }
    }

    setSaveStatus('saving');
    setSaveError('');
    try {
      await authFetch('/api/dashboard/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          profile,
          tenant: { primary_color: primaryColor, name: agencyName || undefined, theme: selectedTheme, business_type: businessType },
        }),
      });
      setSaveStatus('saved');
      setDirty(false);
      setIframeKey(k => k + 1);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
      setSaveError(e instanceof Error ? e.message : 'Save failed. Please try again.');
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (saveStatus !== 'saving' && dirty) {
          void handleSave();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, saveStatus, handleSave]);

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 360; canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, 360, 360); canvas.toBlob((blob) => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `qr-${slug || 'page'}.png`; a.click(); }); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">جاري تحميل إعدادات صفحتك...</p>
        </div>
      </div>
    );
  }

  const slug = data?.tenant?.slug || '';
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  let isConfiguredBaseUrlValid = false;
  if (configuredBaseUrl) {
    try {
      const parsed = new URL(configuredBaseUrl);
      isConfiguredBaseUrlValid = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      isConfiguredBaseUrlValid = false;
    }
  }

  const baseUrl = isConfiguredBaseUrlValid ? configuredBaseUrl : runtimeOrigin;
  const publicUrl = slug ? `${baseUrl}/${slug}` : baseUrl;
  const publicPath = slug ? `/${slug}` : '/';
  const shouldShowInvalidUrlWarning = Boolean(configuredBaseUrl) && !isConfiguredBaseUrlValid;
  const shouldShowMissingUrlInfo = !configuredBaseUrl;
  const sections = { ...DEFAULT_PAGE_SECTIONS, ...(profile.page_sections ?? {}) };
  const pageConfig = { ...DEFAULT_PAGE_CONFIG, ...(profile.page_config ?? {}) };
  const activeTheme = PAGE_THEMES[selectedTheme as keyof typeof PAGE_THEMES] ?? PAGE_THEMES.modern;

  return (
    <div className="space-y-5 pb-10" dir="rtl">

      {/* QR Code Dialog */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-400" /> رمز QR لصفحتك
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                id="qr-svg"
                value={publicUrl}
                size={200}
                fgColor={activeTheme.accent}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-slate-400 font-mono break-all text-center">{publicUrl}</p>
            <div className="flex gap-2 w-full">
              <Button onClick={downloadQr} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4" /> تحميل PNG
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('صفحتي: ' + publicUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2 border-slate-600 text-slate-200 hover:bg-slate-800">
                  <MessageCircle className="h-4 w-4 text-green-400" /> واتساب
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mb-1">
        <h1 className="text-xl font-bold text-white">منشئ الصفحة</h1>
        <p className="text-sm text-slate-400">خصّص صفحتك العامة التي يراها عملاؤك</p>
      </div>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">رابط صفحتك العامة</p>
          <p className="text-blue-400 font-mono text-sm truncate">{publicUrl}</p>
          {shouldShowInvalidUrlWarning && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              قيمة NEXT_PUBLIC_APP_URL غير صالحة — سيتم استخدام رابط البيئة الحالية.
            </p>
          )}
          {shouldShowMissingUrlInfo && (
            <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              لم يتم ضبط NEXT_PUBLIC_APP_URL — يفضّل إضافتها في بيئة التشغيل.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <span className="text-xs text-amber-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              تغييرات غير محفوظة
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowQrModal(true)} className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
            <QrCode className="h-3.5 w-3.5" /> QR
          </Button>
          <Button size="sm" variant="ghost" onClick={copyLink} className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'تم النسخ!' : 'نسخ الرابط'}
          </Button>
          <a href={publicPath} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> فتح الصفحة
            </Button>
          </a>
        </div>
      </div>

      {/* Main three-panel layout */}
      <div className="grid xl:grid-cols-[220px_minmax(320px,0.82fr)_minmax(520px,1.18fr)] lg:grid-cols-[220px_minmax(300px,0.88fr)_minmax(440px,1.12fr)] gap-5 items-start">

        {/* Left sidebar: sections & quick config */}
        <div className="space-y-4 lg:sticky lg:top-4 xl:max-w-[220px]">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-white">إدارة أقسام الصفحة</p>
            <p className="text-xs text-slate-500">تحكّم بما يراه عملاؤك مباشرة</p>
            {([
              ['hero', 'القسم الرئيسي'],
              ['featured', 'المميز'],
              ['listings', 'العروض'],
              ['about', 'من نحن'],
              ['news', 'الأخبار'],
              ['gallery', 'المعرض'],
              ['team', 'الفريق'],
              ['contact', 'تواصل معنا'],
              ['footer', 'التذييل'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between text-sm text-slate-200 hover:text-white"
                aria-label={`Toggle section ${label}`}
                aria-pressed={sections[key]}
              >
                <span>{label}</span>
                <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sections[key] ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sections[key] ? 'translate-x-4' : 'translate-x-1'}`} />
                </span>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-white">إعدادات العرض</p>
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">العنوان الرئيسي</Label>
              <Input
                value={pageConfig.hero_headline || ''}
                onChange={(e) => updatePageConfig({ hero_headline: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white text-sm"
                placeholder="ابحث عن عقارك المثالي"
              />
            </div>

            {/* Hero Style Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">شكل القسم الرئيسي</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 'centered', label: 'وسط', icon: '⬛' },
                  { value: 'split',    label: 'نصفين', icon: '▧' },
                  { value: 'minimal', label: 'بسيط', icon: '▭' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updatePageConfig({ hero_style: value })}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${ pageConfig.hero_style === value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Text */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">نص زر التواصل</Label>
              <Input
                value={pageConfig.hero_cta_text || ''}
                onChange={(e) => updatePageConfig({ hero_cta_text: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white text-sm"
                placeholder="تواصل عبر واتساب"
              />
            </div>

            {/* Button Shape */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">شكل الأزرار</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 'pill',  label: 'دائري' },
                  { value: 'soft',  label: 'ناعم' },
                  { value: 'sharp', label: 'حاد' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updatePageConfig({ button_shape: value })}
                    className={`px-2 py-1.5 text-[11px] font-medium border transition-all ${ pageConfig.button_shape === value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' } ${ value === 'pill' ? 'rounded-full' : value === 'soft' ? 'rounded-lg' : 'rounded-none' }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Announcement text */}
            {sections.hero && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <Label className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Megaphone className="h-3 w-3" /> إعلان مثبّت (اختياري)
                </Label>
                <Input
                  value={pageConfig.announcement_text || ''}
                  onChange={(e) => updatePageConfig({ announcement_text: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                  placeholder="عرض خاص: تخفيض 10% على التقييم..."
                  maxLength={300}
                />
                {pageConfig.announcement_text && (
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'accent',  bg: 'bg-blue-600'   },
                      { id: 'yellow',  bg: 'bg-yellow-500'  },
                      { id: 'green',   bg: 'bg-green-500'   },
                      { id: 'red',     bg: 'bg-red-600'     },
                      { id: 'purple',  bg: 'bg-purple-600'  },
                      { id: 'orange',  bg: 'bg-orange-500'  },
                      { id: 'teal',    bg: 'bg-teal-500'    },
                      { id: 'dark',    bg: 'bg-gray-800'    },
                    ] as const).map(({ id, bg }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updatePageConfig({ announcement_color: id })}
                        className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${pageConfig.announcement_color === id ? 'border-white scale-125 shadow-lg' : 'border-transparent'} ${bg}`}
                        aria-label={id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1 border-t border-slate-800 pt-3">
              <Label className="text-xs text-slate-400">أعمدة شبكة العروض</Label>
              <select
                value={pageConfig.listings_columns || 3}
                onChange={(e) => updatePageConfig({ listings_columns: Number(e.target.value) as 2 | 3 | 4 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
              >
                <option value={2}>2 أعمدة</option>
                <option value={3}>3 أعمدة</option>
                <option value={4}>4 أعمدة</option>
              </select>
            </div>
            <div className="space-y-1 border-t border-slate-800 pt-3">
              <Label className="text-xs text-slate-400">عملة الأسعار</Label>
              <select
                value={pageConfig.currency || 'SAR'}
                onChange={(e) => updatePageConfig({ currency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
              >
                <option value="SAR">ر.س — ريال سعودي</option>
                <option value="AED">د.إ — درهم إماراتي</option>
                <option value="KWD">د.ك — دينار كويتي</option>
                <option value="QAR">ر.ق — ريال قطري</option>
                <option value="BHD">د.ب — دينار بحريني</option>
                <option value="OMR">ر.ع — ريال عُماني</option>
                <option value="EGP">ج.م — جنيه مصري</option>
                <option value="USD">$ — دولار أمريكي</option>
                <option value="EUR">€ — يورو</option>
                <option value="GBP">£ — جنيه إسترليني</option>
              </select>
            </div>
            <div className="space-y-1 border-t border-slate-800 pt-3">
              <Label className="text-xs text-slate-400">تسمية نوع العرض (خيار 1 / خيار 2)</Label>
              <div className="flex gap-2">
                <Input
                  value={pageConfig.offer_label_1 || ''}
                  onChange={(e) => updatePageConfig({ offer_label_1: e.target.value })}
                  placeholder="للبيع"
                  className="bg-slate-800 border-slate-700 text-white text-sm placeholder:text-slate-500"
                />
                <Input
                  value={pageConfig.offer_label_2 || ''}
                  onChange={(e) => updatePageConfig({ offer_label_2: e.target.value })}
                  placeholder="للإيجار"
                  className="bg-slate-800 border-slate-700 text-white text-sm placeholder:text-slate-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => updatePageConfig({ show_listing_filters: !pageConfig.show_listing_filters })}
              className="w-full flex items-center justify-between text-sm text-slate-200"
              aria-label="Toggle listing filters"
              aria-pressed={pageConfig.show_listing_filters}
            >
              <span>إظهار الفلاتر</span>
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pageConfig.show_listing_filters ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${pageConfig.show_listing_filters ? 'translate-x-4' : 'translate-x-1'}`} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => updatePageConfig({ show_listing_search: !pageConfig.show_listing_search })}
              className="w-full flex items-center justify-between text-sm text-slate-200"
              aria-label="Toggle listing search"
              aria-pressed={pageConfig.show_listing_search}
            >
              <span>إظهار البحث</span>
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pageConfig.show_listing_search ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${pageConfig.show_listing_search ? 'translate-x-4' : 'translate-x-1'}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="space-y-5 min-w-0 xl:max-w-[560px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-7 bg-slate-900 border border-slate-800 rounded-xl p-1 h-auto">
              {([
                { value: 'themes',   icon: Layout,         label: 'التصميم'  },
                { value: 'branding', icon: Palette,        label: 'الهوية'   },
                { value: 'content',  icon: FileText,       label: 'المحتوى'  },
                { value: 'posts',    icon: Building2,      label: 'العروض'   },
                { value: 'contact',  icon: Phone,          label: 'التواصل' },
                { value: 'social',   icon: Globe,          label: 'سوشيال'  },
                { value: 'seo',      icon: Search,         label: 'SEO'      },
              ] as const).map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none text-slate-400 hover:text-white rounded-lg py-2 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* THEMES */}
            <TabsContent value="themes" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 xl:p-5">
                <p className="text-sm font-bold text-white mb-1">اختر تصميم صفحتك</p>
                <p className="text-slate-400 text-sm mb-4">سيُطبَّق التصميم فوراً على المعاينة وعلى صفحتك بعد الحفظ</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PAGE_THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => { setSelectedTheme(theme.id); markDirty(); }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                        selectedTheme === theme.id ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-transparent hover:border-slate-500 hover:scale-[1.01]'
                      }`}
                      aria-label={`Select theme ${theme.label}`}
                      aria-pressed={selectedTheme === theme.id}
                    >
                      {/* Full template preview */}
                      <div className="overflow-hidden" style={{ backgroundColor: theme.bg, fontFamily: theme.headingFont }}>

                        {/* Nav bar */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 border-b" style={{ backgroundColor: theme.navBg, borderColor: theme.navBorder }}>
                          <div className="h-2 w-10 rounded-sm opacity-80" style={{ backgroundColor: theme.accent }} />
                          <div className="flex gap-1">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-1.5 w-5 rounded-sm" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' }} />
                            ))}
                          </div>
                        </div>

                        {/* Hero */}
                        <div className="relative h-16" style={{ background: `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}55)` }}>
                          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
                            <div className="h-2 w-20 rounded-sm bg-white/80" />
                            <div className="h-1.5 w-14 rounded-sm bg-white/50" />
                            <div className="mt-1 h-3 w-12 rounded-sm" style={{ backgroundColor: theme.accent, opacity: 0.9, borderRadius: theme.radius }} />
                          </div>
                        </div>

                        {/* Section label */}
                        <div className="px-2.5 pt-2 pb-1" style={{ backgroundColor: theme.bg }}>
                          <div className="h-1.5 w-8 rounded-sm mb-1.5" style={{ backgroundColor: theme.accent }} />
                          {/* 3-col listing grid */}
                          <div className="grid grid-cols-3 gap-1">
                            {[0,1,2].map(i => (
                              <div key={i} className="rounded border overflow-hidden" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderRadius: `calc(${theme.radius} * 0.4)`, boxShadow: theme.cardShadow }}>
                                <div className="h-6" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.06)' : theme.sectionAlt }} />
                                <div className="p-1 space-y-0.5">
                                  <div className="h-1 rounded-sm w-full" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.4)' : '#cbd5e1' }} />
                                  <div className="h-1 rounded-sm w-2/3" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0' }} />
                                  <div className="h-2 w-8 rounded-sm mt-0.5" style={{ backgroundColor: theme.accent, borderRadius: `calc(${theme.radius} * 0.3)`, opacity: 0.85 }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer strip */}
                        <div className="flex items-center justify-between px-2.5 py-1.5" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : theme.sectionAlt, borderTop: `1px solid ${theme.cardBorder}` }}>
                          <div className="flex gap-1">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.6 + i * 0.13 }} />
                            ))}
                          </div>
                          <div className="h-1.5 w-12 rounded-sm" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.15)' : '#cbd5e1' }} />
                        </div>
                      </div>

                      {/* Label overlay at bottom */}
                      <div className="flex items-center justify-between px-2.5 py-2" style={{ backgroundColor: theme.dark ? '#111' : '#f8fafc', borderTop: `1px solid ${theme.cardBorder}` }}>
                        <p className="text-xs font-bold" style={{ color: theme.dark ? '#fff' : '#0f172a', fontFamily: theme.headingFont }}>{theme.label}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: theme.accent + '22', color: theme.accent }}>
                          {theme.labelEn}
                        </span>
                      </div>

                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-0.5 shadow-lg">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* BRANDING */}
            <TabsContent value="branding" className="mt-4 space-y-4">

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Building2 className="h-4 w-4 text-blue-400" /> اسم المنشأة
                </p>
                <Input
                  value={agencyName}
                  onChange={(e) => { setAgencyName(e.target.value); markDirty(); }}
                  placeholder="مثال: مطعم الواحة، مكتب الأفق، صالون نور..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Building2 className="h-4 w-4 text-blue-400" /> نوع النشاط التجاري
                </p>
                <p className="text-xs text-slate-500">يحدد الحقول المتاحة في نماذج العروض</p>
                <select
                  value={businessType}
                  onChange={(e) => { setBusinessType(e.target.value); markDirty(); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="real_estate">🏠 عقارات</option>
                  <option value="restaurant">🍽️ مطعم / كافيه</option>
                  <option value="salon">✂️ صالون / سبا</option>
                  <option value="retail">🛍️ متجر / بيع بالتجزئة</option>
                  <option value="services">⚙️ خدمات</option>
                  <option value="other">📋 أخرى</option>
                </select>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Palette className="h-4 w-4 text-blue-400" /> لون العلامة التجارية
                </p>
                <div className="flex flex-wrap gap-2 mb-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setPrimaryColor(c); markDirty(); }}
                      title={c}
                      aria-label={`Choose brand color ${c}`}
                      className="h-7 w-7 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: primaryColor === c ? 'white' : 'transparent',
                        boxShadow: primaryColor === c ? `0 0 0 1px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => { setPrimaryColor(e.target.value); markDirty(); }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="h-9 w-14 rounded-lg border-2 border-slate-700 cursor-pointer" style={{ backgroundColor: primaryColor }} />
                  </div>
                  <Input
                    value={primaryColor}
                    onChange={(e) => { setPrimaryColor(e.target.value); markDirty(); }}
                    maxLength={7}
                    className="bg-slate-800 border-slate-700 text-white w-28 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500">يُستخدم كلون رئيسي في صفحتك</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <ImageIcon className="h-4 w-4 text-blue-400" /> الشعار (Logo)
                </p>
                <ImageUploader
                  value={profile.logo_url || ''}
                  onChange={(url) => updateProfile({ logo_url: url })}
                  aspect="square"
                  label="شعار المكتب — اضغط لرفع صورة"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <ImageIcon className="h-4 w-4 text-blue-400" /> صورة الغلاف
                </p>
                <ImageUploader
                  value={profile.cover_url || ''}
                  onChange={(url) => updateProfile({ cover_url: url })}
                  aspect="cover"
                />
                <p className="text-xs text-slate-500">مقترح: 1200×400 بكسل أو أوسع</p>
              </div>
            </TabsContent>

            {/* CONTENT */}
            <TabsContent value="content" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <FileText className="h-4 w-4 text-blue-400" /> محتوى الصفحة
                </p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">الشعار النصي</Label>
                  <Input
                    value={profile.tagline || ''}
                    onChange={(e) => updateProfile({ tagline: e.target.value })}
                    placeholder="مثال: شريكك الموثوق، جودة لا تُضاهى..."
                    maxLength={200}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.tagline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">نبذة عنا</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    placeholder="أخبر الزوار عن منشأتك — خبرتك، قيمك، وما يميزك..."
                    rows={6}
                    maxLength={2000}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.bio || '').length}/2000</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1">
                    <Hash className="h-3 w-3" /> رقم الترخيص
                  </Label>
                  <Input
                    value={profile.licence_no || ''}
                    onChange={(e) => updateProfile({ licence_no: e.target.value })}
                    placeholder="مثال: RE-12345"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </TabsContent>

            {/* POSTS */}
            <TabsContent value="posts" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">إدارة العروض</p>
                    <p className="text-xs text-slate-400 mt-0.5">أضف وعدّل عروضك أو منتجاتك أو خدماتك التي تظهر في صفحتك العامة</p>
                  </div>
                  <Button
                    onClick={() => { setShowListingForm(!showListingForm); resetListingForm(); }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> إضافة عرض
                  </Button>
                </div>

                {showListingForm && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-white">{editingListing ? 'تعديل العرض' : 'إضافة عرض جديد'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">نوع العرض</Label>
                        <select value={listingForm.offer_type} onChange={(e) => setListingForm({ ...listingForm, offer_type: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
                          <option value="sale">{pageConfig.offer_label_1 || 'للبيع'}</option>
                          <option value="rent">{pageConfig.offer_label_2 || 'للإيجار'}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">الفئة</Label>
                        <Input value={listingForm.property_type} onChange={(e) => setListingForm({ ...listingForm, property_type: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="مثال: شقة، منتج، خدمة..." />
                      </div>
                    <div className="space-y-1">
                        <Input value={listingForm.title} onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="فيلا فاخرة..." />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">السعر *</Label>
                        <Input type="number" value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="1000000" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">الموقع</Label>
                        <Input value={listingForm.location} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="Dubai Marina" />
                      </div>
                      {(!businessType || businessType === 'real_estate') && (<>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">الغرف</Label>
                        <Input type="number" value={listingForm.bedrooms} onChange={(e) => setListingForm({ ...listingForm, bedrooms: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="4" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">الحمامات</Label>
                        <Input type="number" value={listingForm.bathrooms} onChange={(e) => setListingForm({ ...listingForm, bathrooms: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="3" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">المساحة (م²)</Label>
                        <Input type="number" value={listingForm.area_sqm} onChange={(e) => setListingForm({ ...listingForm, area_sqm: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="450" />
                      </div>
                      </>)}
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-slate-400 text-xs">صورة العقار الرئيسية</Label>
                      <ImageUploader
                        value={listingForm.image}
                        onChange={(url) => setListingForm({ ...listingForm, image: url })}
                        aspect="cover"
                      />
                    </div>

                    {/* Extra photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-400 text-xs">صور إضافية (اختياري)</Label>
                        {listingForm.extra_images.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setListingForm({ ...listingForm, extra_images: [...listingForm.extra_images, ''] })}
                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                          >
                            <Plus className="h-3 w-3" /> إضافة صورة
                          </button>
                        )}
                      </div>
                      {listingForm.extra_images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {listingForm.extra_images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <ImageUploader
                                value={img}
                                onChange={(url) => {
                                  const updated = [...listingForm.extra_images];
                                  updated[idx] = url;
                                  setListingForm({ ...listingForm, extra_images: updated });
                                }}
                                aspect="cover"
                              />
                              <button
                                type="button"
                                onClick={() => setListingForm({ ...listingForm, extra_images: listingForm.extra_images.filter((_, i) => i !== idx) })}
                                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600 z-10"
                                aria-label="حذف الصورة"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card style */}
                    <div className="space-y-2">
                      <Label className="text-slate-400 text-xs">طريقة عرض البطاقة</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'standard', label: 'عادي', desc: 'h-52', icon: '▬' },
                          { value: 'featured', label: 'مميز', desc: 'h-72', icon: '◼' },
                          { value: 'compact', label: 'مضغوط', desc: 'h-32', icon: '▭' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setListingForm({ ...listingForm, card_style: opt.value })}
                            className={`rounded-lg border p-2.5 text-center transition-colors ${listingForm.card_style === opt.value ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'}`}
                          >
                            <div className="text-lg leading-none mb-1">{opt.icon}</div>
                            <div className="text-xs font-medium">{opt.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-400 text-xs">الحالة</Label>
                      <select value={listingForm.status} onChange={(e) => setListingForm({ ...listingForm, status: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
                        <option value="available">متاح</option>
                        <option value="sold">مباع</option>
                        <option value="rented">مؤجر</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm text-white">نشر على الصفحة العامة</p>
                        <p className="text-xs text-slate-500">إيقاف هذا يجعل العقار مسودة فقط</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setListingPublished(!listingPublished)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ listingPublished ? 'bg-blue-600' : 'bg-slate-700' }`}
                        aria-label="Toggle listing publish status"
                        aria-pressed={listingPublished}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ listingPublished ? 'translate-x-4' : 'translate-x-1' }`} />
                      </button>
                    </div>
                    {listingError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />{listingError}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button onClick={addListing} disabled={listingSaving} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                        {listingSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {editingListing ? 'تحديث' : 'إضافة'}
                      </Button>
                      <Button onClick={() => { setShowListingForm(false); resetListingForm(); }} size="sm" variant="outline" className="border-slate-600 text-slate-300">إلغاء</Button>
                    </div>
                  </div>
                )}

                {listings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">لا توجد عروض مضافة بعد</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listings.map((listing) => (
                      <div key={listing.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex gap-3 items-center">
                        {listing.images?.[0] && (
                          <img src={listing.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{listing.title}</p>
                          <p className="text-blue-400 text-sm font-bold">{listing.price?.toLocaleString()} {pageConfig.currency || 'SAR'}</p>
                          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                            {listing.location && <span>{listing.location}</span>}
                            {listing.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{listing.bedrooms}</span>}
                            {listing.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                            {listing.area_sqm > 0 && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{listing.area_sqm}م²</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ listing.listing_status === 'available' ? 'bg-green-500/20 text-green-400' : listing.listing_status === 'sold' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                            {listing.listing_status === 'available' ? 'متاح' : listing.listing_status === 'sold' ? 'مباع' : 'مؤجر'}
                          </span>
                          {listing.published === false && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600/40 text-slate-300">مسودة</span>
                          )}
                          <Button onClick={() => { setEditingListing(listing); setListingForm({ title: listing.title, price: String(listing.price), location: listing.location || '', bedrooms: String(listing.bedrooms || ''), bathrooms: String(listing.bathrooms || ''), area_sqm: String(listing.area_sqm || ''), image: listing.images?.[0] || '', extra_images: listing.images?.slice(1) ?? [], card_style: listing.card_style || 'standard', status: listing.listing_status || 'available', offer_type: listing.offer_type || 'sale', property_type: listing.property_type || '' }); setListingPublished(listing.published !== false); setShowListingForm(true); }} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 px-2 text-xs">تعديل</Button>
                          <Button onClick={() => deleteListing(listing.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-7 w-7 p-0" aria-label={`Delete listing ${listing.title}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* CONTACT */}
            <TabsContent value="contact" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Phone className="h-4 w-4 text-blue-400" /> بيانات التواصل
                </p>

                {([
                  { key: 'contact_email',   icon: Mail,   label: 'البريد الإلكتروني', placeholder: 'agency@example.com',   type: 'email' },
                  { key: 'contact_phone',   icon: Phone,  label: 'رقم الهاتف الرئيسي', placeholder: '+966 50 000 0000',   type: 'tel'   },
                  { key: 'contact_address', icon: MapPin, label: 'العنوان',             placeholder: 'الرياض، المملكة العربية السعودية', type: 'text'  },
                ] as const).map(({ key, icon: Icon, label, placeholder, type }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <Input
                        type={type}
                        value={(profile as unknown as Record<string, string | undefined>)[key] || ''}
                        onChange={(e) => updateProfile({ [key]: e.target.value })}
                        placeholder={placeholder}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}

                {/* Extra phones */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">أرقام إضافية</Label>
                    {(profile.extra_phones?.length ?? 0) < 4 && (
                      <button
                        type="button"
                        onClick={() => updateProfile({ extra_phones: [...(profile.extra_phones ?? []), ''] })}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> إضافة رقم
                      </button>
                    )}
                  </div>
                  {(profile.extra_phones ?? []).map((num, idx) => (
                    <div key={idx} className="relative flex items-center gap-2">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <Input
                        type="tel"
                        value={num}
                        onChange={(e) => {
                          const updated = [...(profile.extra_phones ?? [])];
                          updated[idx] = e.target.value;
                          updateProfile({ extra_phones: updated });
                        }}
                        placeholder="+966 50 000 0000"
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 pr-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.extra_phones ?? []).filter((_, i) => i !== idx);
                          updateProfile({ extra_phones: updated });
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working hours */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Clock className="h-4 w-4 text-blue-400" /> ساعات العمل
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">أيام معطلة يمكن تعطيلها، والأيام المفعلة يجب أن تحتوي وقت فتح/إغلاق صحيح.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-slate-300 hover:text-white"
                    onClick={() => updateProfile({ working_hours: WORKING_HOURS_DEFAULT })}
                  >
                    إعادة الضبط
                  </Button>
                </div>
                {DAY_ORDER.map((day) => {
                  const h = profile.working_hours?.[day] ?? { enabled: false, open: '09:00', close: '17:00' };
                  const setDay = (patch: Partial<{ enabled: boolean; open: string; close: string }>) => {
                    updateProfile({ working_hours: { ...(profile.working_hours ?? {}), [day]: { ...h, ...patch } } });
                  };
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDay({ enabled: !h.enabled })}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${ h.enabled ? 'bg-blue-600' : 'bg-slate-700' }`}
                        aria-label={`Toggle working hours for ${DAY_AR[day]}`}
                        aria-pressed={h.enabled}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ h.enabled ? 'translate-x-4' : 'translate-x-1' }`} />
                      </button>
                      <span className={`w-16 text-sm ${h.enabled ? 'text-white' : 'text-slate-500'}`}>{DAY_AR[day]}</span>
                      {h.enabled ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="time"
                            value={h.open}
                            onChange={(e) => setDay({ open: e.target.value })}
                            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-2 py-1 text-xs"
                          />
                          <span className="text-slate-500 text-xs">–</span>
                          <input
                            type="time"
                            value={h.close}
                            onChange={(e) => setDay({ close: e.target.value })}
                            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-2 py-1 text-xs"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 flex-1">مغلق</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="social" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Globe className="h-4 w-4 text-blue-400" /> روابط التواصل الاجتماعي
                </p>
                <p className="text-xs text-slate-500">الصق روابط ملفاتك الشخصية — ستظهر كأيقونات في صفحتك</p>

                {([
                  { key: 'instagram', icon: Instagram,     label: 'Instagram',   placeholder: 'https://instagram.com/youragency', color: 'text-pink-400'  },
                  { key: 'x',         icon: Twitter,       label: 'X (Twitter)', placeholder: 'https://x.com/youragency',          color: 'text-sky-400'   },
                  { key: 'linkedin',  icon: Linkedin,      label: 'LinkedIn',    placeholder: 'https://linkedin.com/company/...',  color: 'text-blue-400'  },
                  { key: 'whatsapp',  icon: MessageCircle, label: 'WhatsApp',    placeholder: 'https://wa.me/966500000000',         color: 'text-green-400' },
                ] as const).map(({ key, icon: Icon, label, placeholder, color }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
                    <div className="relative">
                      <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${color} pointer-events-none`} />
                      <Input
                        value={profile.social_links?.[key] || ''}
                        onChange={(e) => updateSocial(key, e.target.value)}
                        placeholder={placeholder}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}

                {/* Snapchat */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Snapchat</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none text-sm font-bold">👻</span>
                    <Input
                      value={profile.social_links?.snapchat || ''}
                      onChange={(e) => updateSocial('snapchat', e.target.value)}
                      placeholder="اسم المستخدم أو https://snapchat.com/add/..."
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">TikTok</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-300">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                      </svg>
                    </span>
                    <Input
                      value={profile.social_links?.tiktok || ''}
                      onChange={(e) => updateSocial('tiktok', e.target.value)}
                      placeholder="اسم المستخدم أو https://tiktok.com/@..."
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <Search className="h-4 w-4 text-blue-400" /> محركات البحث والمشاركة
                </p>
                <p className="text-xs text-slate-500">هذه البيانات تظهر عند مشاركة رابطك على واتساب وجوجل</p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">عنوان الصفحة (SEO Title)</Label>
                  <Input
                    value={pageConfig.seo_title || ''}
                    onChange={(e) => updatePageConfig({ seo_title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    placeholder={`${agencyName || 'اسم منشأتك'}`}
                    maxLength={120}
                  />
                  <p className={`text-[11px] text-left ${ (pageConfig.seo_title || '').length > 60 ? 'text-amber-400' : 'text-slate-500' }`}>{(pageConfig.seo_title || '').length}/120 (يُنصح بـ 60 حرفاً)</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">وصف الصفحة (Meta Description)</Label>
                  <Textarea
                    value={pageConfig.seo_description || ''}
                    onChange={(e) => updatePageConfig({ seo_description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                    placeholder="وصف موجز لمنشأتك يظهر في نتائج البحث..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className={`text-[11px] text-left ${ (pageConfig.seo_description || '').length > 160 ? 'text-red-400' : 'text-slate-500' }`}>{(pageConfig.seo_description || '').length}/160</p>
                </div>

                {/* WhatsApp preview */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">معاينة عند المشاركة على واتساب</p>
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-slate-700 text-right">
                    {profile.cover_url && (
                      <img src={profile.cover_url} alt="OG preview" className="w-full h-24 object-cover" />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">
                        {pageConfig.seo_title || agencyName || 'اسم المنشأة'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {pageConfig.seo_description || profile.bio || 'وصف المنشأة يظهر هنا'}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1 truncate">{publicUrl}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save button + status + completion checklist */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saveStatus === 'saving' || !dirty}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2 disabled:opacity-60"
              >
                {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>

              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> تم الحفظ بنجاح!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" /> {saveError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-4 self-start min-w-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">معاينة مباشرة</span>
              <div className="flex items-center gap-3">
                {dirty && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                    احفظ لتحديث المعاينة
                  </span>
                )}
                {!dirty && (
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                    محدّثة
                  </span>
                )}
              </div>
            </div>

            <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500/70 inline-block" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/70 inline-block" />
                <span className="h-2 w-2 rounded-full bg-green-500/70 inline-block" />
              </div>
              <div className="flex-1 rounded text-[10px] px-2 py-0.5 truncate font-mono bg-slate-800 text-slate-400">
                {publicUrl}
              </div>
              {/* Device toggle */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  title="معاينة الجوال"
                  className={`p-1 rounded transition-colors ${previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M8 16.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
                    <path fillRule="evenodd" d="M4 4a3 3 0 013-3h6a3 3 0 013 3v12a3 3 0 01-3 3H7a3 3 0 01-3-3V4zm4-1.5v.75c0 .414.336.75.75.75h2.5a.75.75 0 00.75-.75V2.5h.25A1.5 1.5 0 0113.5 4v12a1.5 1.5 0 01-1.5 1.5H8A1.5 1.5 0 016.5 16V4A1.5 1.5 0 018 2.5h.25v-.75z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  title="معاينة سطح المكتب"
                  className={`p-1 rounded transition-colors ${previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5zm1.5 0v7.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-7.5a.75.75 0 00-.75-.75H4.25a.75.75 0 00-.75.75z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIframeKey(k => k + 1)}
                title="تحديث المعاينة"
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Scaled full-page iframe */}
            <div className="relative overflow-hidden bg-black" style={{ height: previewDevice === 'desktop' ? 700 : 680 }}>
              {slug ? (
                previewDevice === 'desktop' ? (
                  <iframe
                    key={`${iframeKey}-desktop`}
                    src={publicPath}
                    title="معاينة الصفحة"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <iframe
                    key={`${iframeKey}-mobile`}
                    src={publicPath}
                    title="معاينة الصفحة"
                    style={{
                      width: '390px',
                      height: '844px',
                      border: 'none',
                      transformOrigin: 'top right',
                      transform: 'scale(0.78)',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                    }}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  احفظ الإعدادات أولاً لتظهر المعاينة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
