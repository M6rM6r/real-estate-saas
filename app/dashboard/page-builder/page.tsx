'use client';

import { useEffect, useState, useRef } from 'react';
import { authFetch } from '@/lib/api';
import type { Profile, Tenant } from '@/lib/types';
import { PAGE_THEMES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, ExternalLink, Copy, Check, Phone, Mail, MapPin,
  Instagram, Twitter, Linkedin, MessageCircle, Palette,
  Image as ImageIcon, FileText, Globe, AlertCircle,
  CheckCircle2, Building2, Hash, Layout, Plus, Trash2, Bed, Bath, Maximize, Clock,
} from 'lucide-react';

type ProfileResponse = {
  profile: Profile | null;
  tenant: (Tenant & { primary_color?: string; theme?: string }) | null;
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEFAULT_PAGE_SECTIONS: NonNullable<Profile['page_sections']> = {
  hero: true,
  featured: true,
  listings: true,
  about: true,
  news: true,
  gallery: false,
  team: false,
  footer: true,
};

const DEFAULT_PAGE_CONFIG: NonNullable<Profile['page_config']> = {
  hero_headline: 'ابحث عن عقارك المثالي',
  featured_count: 6,
  listings_columns: 3,
  show_listing_filters: true,
  show_listing_search: true,
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
  contact_address: '',
  social_links: { instagram: '', x: '', linkedin: '', whatsapp: '' },
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
  '#2563eb', '#7c3aed', '#dc2626', '#d97706',
  '#059669', '#0891b2', '#db2777', '#475569',
];

const THEME_DESCRIPTIONS: Record<string, string> = {
  modern: 'واجهة نظيفة وعملية تناسب معظم المكاتب العقارية.',
  luxury: 'ستايل داكن ولمسات ذهبية لعرض العقارات الفاخرة.',
  nature: 'ألوان هادئة ومنعشة تمنح الصفحة طابعاً ودوداً.',
  ocean: 'طابع أنيق ومستوحى من البحر بإحساس خفيف ومشرق.',
  desert: 'دفء بصري ولمسات ترابية مناسبة للهوية المحلية.',
};

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
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [listingForm, setListingForm] = useState({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', status: 'available' });
  const [listingSaving, setListingSaving] = useState(false);
  const [listingError, setListingError] = useState('');
  const [listingPublished, setListingPublished] = useState(true);
  const [previewSearch, setPreviewSearch] = useState('');

  const profileCompletionCount = [
    agencyName,
    profile.tagline,
    profile.bio,
    profile.logo_url,
    profile.contact_phone,
    profile.contact_email,
  ].filter(Boolean).length;
  const profileCompletionPct = Math.round((profileCompletionCount / 6) * 100);

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
    setListingForm({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', status: 'available' });
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
      images: listingForm.image ? [listingForm.image] : [],
      listing_status: listingForm.status as 'available' | 'sold' | 'rented',
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
          tenant: { primary_color: primaryColor, name: agencyName || undefined, theme: selectedTheme },
        }),
      });
      setSaveStatus('saved');
      setDirty(false);
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
  const previewIsDark = activeTheme.dark;
  const previewTextClass = previewIsDark ? 'text-slate-100' : 'text-gray-800';
  const previewMutedClass = previewIsDark ? 'text-slate-400' : 'text-gray-500';
  const previewBorderClass = previewIsDark ? 'border-white/10' : 'border-gray-200';
  const previewInactiveChipClass = previewIsDark ? 'bg-white/5 text-slate-400' : 'bg-gray-100 text-gray-500';
  const previewListings = listings.filter((listing) => listing.published !== false);
  const previewFeaturedListings = previewListings.slice(0, pageConfig.featured_count || 6);
  const getListingImage = (listing: any) => listing.images?.[0] || listing.image_url || '';
  const previewListingsFiltered = previewSearch.trim()
    ? previewListings.filter((listing) =>
      `${listing.title || ''} ${listing.location || ''}`.toLowerCase().includes(previewSearch.toLowerCase()),
    )
    : previewListings;

  return (
    <div className="space-y-5 pb-10" dir="rtl">

      {/* Arabic heading */}
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
              ['featured', 'العقارات المميزة'],
              ['listings', 'كل العقارات'],
              ['about', 'من نحن'],
              ['news', 'الأخبار'],
              ['gallery', 'المعرض'],
              ['team', 'الفريق'],
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
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">عدد العقارات المميزة</Label>
              <Input
                type="number"
                min={3}
                max={12}
                value={pageConfig.featured_count || 6}
                onChange={(e) => updatePageConfig({ featured_count: Math.min(12, Math.max(3, Number(e.target.value) || 6)) })}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">أعمدة شبكة العقارات</Label>
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
          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="w-full grid grid-cols-6 bg-slate-900 border border-slate-800 rounded-xl p-1 h-auto">
              {([
                { value: 'themes',   icon: Layout,         label: 'التصميم'  },
                { value: 'branding', icon: Palette,        label: 'الهوية'   },
                { value: 'content',  icon: FileText,       label: 'المحتوى'  },
                { value: 'posts',    icon: Building2,      label: 'العقارات' },
                { value: 'contact',  icon: Phone,          label: 'التواصل' },
                { value: 'social',   icon: Globe,          label: 'سوشيال'  },
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
                      className={`relative rounded-xl p-3 cursor-pointer transition-all border-2 ${
                        selectedTheme === theme.id ? 'border-blue-500 shadow-lg shadow-blue-500/10 -translate-y-0.5' : 'border-slate-700 hover:border-slate-500 hover:-translate-y-0.5'
                      } bg-slate-800 text-right`}
                      aria-label={`Select theme ${theme.label}`}
                      aria-pressed={selectedTheme === theme.id}
                    >
                        selectedTheme === theme.id ? 'border-blue-500 shadow-lg shadow-blue-500/10 -translate-y-0.5' : 'border-slate-700 hover:border-slate-500 hover:-translate-y-0.5'
                      } bg-slate-800 text-right`}
                    >
                      <div className="h-20 rounded-lg mb-3 overflow-hidden border" style={{ backgroundColor: theme.bg, borderColor: theme.dark ? 'rgba(255,255,255,0.12)' : '#dbe4ee' }}>
                        <div className="h-3 rounded-t-lg" style={{ backgroundColor: theme.accent }} />
                        <div className="px-2 py-2 h-full" style={{ backgroundColor: theme.card }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.9 }} />
                            <div className="h-1.5 rounded w-3/4" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.75)' : '#cbd5e1' }} />
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 rounded w-5/6" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.78)' : '#d1d5db' }} />
                            <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.5)' : '#e5e7eb' }} />
                            <div className="flex gap-1 pt-1.5">
                              <div className="h-5 w-14 rounded-full" style={{ backgroundColor: theme.accent, opacity: theme.dark ? 0.95 : 0.85 }} />
                              <div className="h-5 w-10 rounded-full" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : '#eef2f7' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{theme.label}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.dark ? 'bg-white/10 text-slate-300' : 'bg-slate-700 text-slate-200'}`}>
                          {theme.labelEn}
                        </span>
                      </div>
                      <p className="text-[10px] leading-4 text-slate-400 min-h-[2.25rem]">{THEME_DESCRIPTIONS[theme.id]}</p>
                      {selectedTheme === theme.id && (
                        <CheckCircle2 className="absolute top-2 left-2 h-4 w-4 text-blue-400" />
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
                  <Building2 className="h-4 w-4 text-blue-400" /> اسم المكتب
                </p>
                <Input
                  value={agencyName}
                  onChange={(e) => { setAgencyName(e.target.value); markDirty(); }}
                  placeholder="مثال: مكتب الأفق للعقارات"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
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
                <div className="flex gap-3 items-start">
                  <div className="h-14 w-14 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {profile.logo_url ? (
                      <img src={profile.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input
                      value={profile.logo_url || ''}
                      onChange={(e) => updateProfile({ logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500">الصق رابط الصورة مباشرة (PNG, JPG, SVG)</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <ImageIcon className="h-4 w-4 text-blue-400" /> صورة الغلاف
                </p>
                {profile.cover_url && (
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-700">
                    <img src={profile.cover_url} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <Input
                  value={profile.cover_url || ''}
                  onChange={(e) => updateProfile({ cover_url: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    placeholder="مثال: شريكك الموثوق في العقارات"
                    maxLength={200}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.tagline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">نبذة عن المكتب</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    placeholder="أخبر الزوار عن مكتبك — خبرتك، قيمك، وما يميزك..."
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
                    <p className="text-sm font-bold text-white">إدارة العقارات المعروضة</p>
                    <p className="text-xs text-slate-400 mt-0.5">أضف وعدّل عقاراتك التي تظهر في صفحتك العامة</p>
                  </div>
                  <Button
                    onClick={() => { setShowListingForm(!showListingForm); resetListingForm(); }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> إضافة عقار
                  </Button>
                </div>

                {showListingForm && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-white">{editingListing ? 'تعديل العقار' : 'إضافة عقار جديد'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">العنوان *</Label>
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
                    </div>
                    <div className="space-y-1">
                      <Label className="text-slate-400 text-xs">رابط الصورة</Label>
                      <Input value={listingForm.image} onChange={(e) => setListingForm({ ...listingForm, image: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="https://..." />
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
                    <p className="text-sm">لا توجد عقارات مضافة بعد</p>
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
                          <p className="text-blue-400 text-sm font-bold">{listing.price?.toLocaleString()} ر.س</p>
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
                          <Button onClick={() => { setEditingListing(listing); setListingForm({ title: listing.title, price: String(listing.price), location: listing.location || '', bedrooms: String(listing.bedrooms || ''), bathrooms: String(listing.bathrooms || ''), area_sqm: String(listing.area_sqm || ''), image: listing.images?.[0] || '', status: listing.listing_status || 'available' }); setListingPublished(listing.published !== false); setShowListingForm(true); }} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 px-2 text-xs">تعديل</Button>
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
                  { key: 'contact_phone',   icon: Phone,  label: 'رقم الهاتف',         placeholder: '+966 50 000 0000',     type: 'tel'   },
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
              </div>
            </TabsContent>
          </Tabs>

          {/* Save button + status */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || !dirty}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2 disabled:opacity-60"
            >
              {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
              {saveStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>

            <span className="text-xs text-slate-500">اختصار الحفظ: Ctrl/Cmd + S</span>
            <span className="text-xs text-slate-400">اكتمال الملف: {profileCompletionPct}%</span>

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

        {/* Live Preview */}
        <div className="lg:sticky lg:top-4 self-start min-w-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">معاينة مباشرة</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                يتحدث فورياً
              </span>
            </div>

            <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: activeTheme.card, borderBottom: `1px solid ${previewIsDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}` }}>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500/70 inline-block" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/70 inline-block" />
                <span className="h-2 w-2 rounded-full bg-green-500/70 inline-block" />
              </div>
              <div className="flex-1 rounded text-[10px] px-2 py-0.5 truncate font-mono" style={{ backgroundColor: previewIsDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: previewIsDark ? '#94a3b8' : '#64748b' }}>
                {publicUrl}
              </div>
            </div>

            <div className="overflow-y-auto transition-colors" style={{ maxHeight: 720, backgroundColor: activeTheme.bg }}>

              {sections.hero && (
                <div className="relative h-40 overflow-hidden">
                  {profile.cover_url ? (
                    <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${activeTheme.accent}dd, ${primaryColor}55)` }} />
                  )}
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
                    {profile.logo_url && (
                      <img src={profile.logo_url} alt="Logo" className="w-12 h-12 rounded-lg object-cover mb-2 border-2 border-white/30 shadow-lg" />
                    )}
                    <p className="font-bold text-base leading-tight">
                      {agencyName || data?.tenant?.name || 'اسم المكتب'}
                    </p>
                    <p className="text-xs text-white/75 mt-1 line-clamp-2 max-w-md">{pageConfig.hero_headline || profile.tagline || 'ابحث عن عقارك المثالي'}</p>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-4" dir="rtl">

                {sections.featured && previewFeaturedListings.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: primaryColor }}>العقارات المميزة</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {previewFeaturedListings.slice(0, 4).map((listing) => (
                        <div key={listing.id} className={`border rounded-lg p-2 transition-colors ${previewBorderClass}`} style={{ backgroundColor: activeTheme.card }}>
                          {getListingImage(listing) ? (
                            <img
                              src={getListingImage(listing)}
                              alt={listing.title || 'listing'}
                              className="w-full h-14 rounded-md object-cover mb-1.5"
                            />
                          ) : (
                            <div className={`w-full h-14 rounded-md mb-1.5 flex items-center justify-center text-[10px] ${previewMutedClass}`} style={{ backgroundColor: previewIsDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                              بدون صورة
                            </div>
                          )}
                          <p className={`text-[11px] font-semibold truncate ${previewTextClass}`}>{listing.title}</p>
                          <p className={`text-[10px] truncate mt-0.5 ${previewMutedClass}`}>{listing.location || 'بدون موقع'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sections.listings && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: primaryColor }}>قائمة العقارات</p>
                    {pageConfig.show_listing_search && (
                      <Input
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="h-8 text-[11px] mb-2.5"
                        placeholder="ابحث بالاسم أو الموقع"
                      />
                    )}
                    {pageConfig.show_listing_filters && (
                      <div className="flex gap-1.5 mb-2.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: primaryColor }}>الكل</span>
                        <span className={`px-2 py-0.5 rounded-full ${previewInactiveChipClass}`}>متاح</span>
                        <span className={`px-2 py-0.5 rounded-full ${previewInactiveChipClass}`}>مباع</span>
                      </div>
                    )}
                    <div className={`grid gap-1 ${pageConfig.listings_columns === 2 ? 'grid-cols-2' : pageConfig.listings_columns === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      {previewListingsFiltered.slice(0, 8).map((listing) => (
                        <div key={listing.id} className={`border rounded p-1.5 text-center ${previewBorderClass}`} style={{ backgroundColor: activeTheme.card }}>
                          {getListingImage(listing) ? (
                            <img
                              src={getListingImage(listing)}
                              alt={listing.title || 'listing'}
                              className="w-full h-10 rounded object-cover mb-1"
                            />
                          ) : (
                            <div className={`w-full h-10 rounded mb-1 flex items-center justify-center text-[9px] ${previewMutedClass}`} style={{ backgroundColor: previewIsDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                              بدون صورة
                            </div>
                          )}
                          <p className={`text-[10px] truncate ${previewTextClass}`}>{listing.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sections.about && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: primaryColor }}>من نحن</p>
                  <p className={`text-xs leading-relaxed line-clamp-4 ${previewMutedClass}`}>
                    {profile.bio || 'نبذة مكتبك ستظهر هنا...'}
                  </p>
                  {profile.licence_no && (
                    <p className={`text-[10px] mt-1.5 flex items-center gap-0.5 ${previewMutedClass}`}>
                      <Hash className="h-2.5 w-2.5 inline" /> رقم الترخيص: {profile.licence_no}
                    </p>
                  )}
                </div>
                )}

                {sections.about && (profile.contact_email || profile.contact_phone || profile.contact_address) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: primaryColor }}>التواصل</p>
                    <div className="space-y-1">
                      {profile.contact_phone && (
                        <div className={`flex items-center gap-1.5 text-[11px] ${previewMutedClass}`}>
                          <Phone className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
                          {profile.contact_phone}
                        </div>
                      )}
                      {profile.contact_email && (
                        <div className={`flex items-center gap-1.5 text-[11px] ${previewMutedClass}`}>
                          <Mail className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
                          {profile.contact_email}
                        </div>
                      )}
                      {profile.contact_address && (
                        <div className={`flex items-center gap-1.5 text-[11px] ${previewMutedClass}`}>
                          <MapPin className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
                          {profile.contact_address}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sections.footer && (profile.social_links?.whatsapp || profile.social_links?.instagram || profile.social_links?.x || profile.social_links?.linkedin) && (
                  <div className="flex gap-1.5 pt-0.5">
                    {profile.social_links?.whatsapp && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {profile.social_links?.instagram && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <Instagram className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {profile.social_links?.x && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <Twitter className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {profile.social_links?.linkedin && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <Linkedin className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                )}

                {sections.footer && (
                  <div className="rounded-lg p-2.5 text-center text-white text-[11px] font-semibold mt-1" style={{ backgroundColor: primaryColor }}>
                    استعرض عقاراتنا
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
