'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authFetch } from '@/lib/api';
import PublicAgencyPage from '@/components/PublicAgencyPage';
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
  QrCode, Download, ChevronDown, ChevronUp, Megaphone, Search, Crop, SlidersHorizontal,
} from 'lucide-react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop, type PixelCrop } from 'react-image-crop';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'react-image-crop/dist/ReactCrop.css';
import { normalizeWhatsAppTarget } from '@/lib/whatsapp';
import { useLanguage } from '@/app/dashboard/LanguageContext';

const PB_T = {
  ar: {
    cropTitle: 'اقتصاص الصورة', cancel: 'إلغاء', confirmCrop: 'تأكيد الاقتصاص',
    changeImg: 'تغيير', clickUpload: 'اضغط لاختيار صورة', clickOrDrag: 'اضغط أو اسحب صورة هنا',
    changeImage: 'تغيير الصورة', uploadFailed: 'فشل الرفع', uploadHint: 'JPG · PNG · WebP · حتى 5 MB',
    reorderSection: 'إعادة ترتيب القسم',
    sectionHero: 'القسم الرئيسي', sectionListings: 'العروض', sectionAbout: 'من نحن',
    sectionContact: 'تواصل معنا', sectionWorkingHours: 'أوقات العمل', sectionFooter: 'التذييل',
    sun: 'الأحد', mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت',
    loadingPage: 'جاري تحميل إعدادات صفحتك...',
    pageBuilderTitle: 'منشئ الصفحة', pageBuilderSub: 'خصّص صفحتك العامة التي يراها عملاؤك',
    publicPageUrl: 'رابط صفحتك العامة',
    invalidBaseUrl: 'قيمة NEXT_PUBLIC_APP_URL غير صالحة — سيتم استخدام رابط البيئة الحالية.',
    missingBaseUrl: 'لم يتم ضبط NEXT_PUBLIC_APP_URL — يفضّل إضافتها في بيئة التشغيل.',
    autoSavingSoon: 'حفظ تلقائي خلال ثوانٍ...', saving: 'جاري الحفظ...', saved: 'تم الحفظ',
    copyLink: 'نسخ الرابط', copied: 'تم النسخ!', openPage: 'فتح الصفحة',
    qrTitle: 'رمز QR لصفحتك', downloadPng: 'تحميل PNG', whatsapp: 'واتساب',
    tabControl: '🎛️ تحكم', tabDesign: '🎨 التصميم', tabIdentity: '✍️ الهوية', tabListings: '🏠 العروض', tabConnect: '🔗 تواصل',
    pageControlTitle: '🎛️ تحكّم الصفحة', pageControlSub: 'اسحب الأقسام لتحديد ترتيب ظهورها على الصفحة العامة.',
    pageSettingsTitle: '🎛️ إعدادات الصفحة', heroHeadlineLabel: 'العنوان الرئيسي للصفحة',
    heroHeadlinePlaceholder: 'اكتشف أفضل العروض لديك', pageLangLabel: 'لغة الصفحة',
    chooseDesign: 'اختر تصميم صفحتك', chooseDesignSub: 'سيُطبَّق التصميم فوراً على المعاينة وعلى صفحتك بعد الحفظ',
    brandColor: '🎨 لون العلامة التجارية', brandColorHint: 'يُستخدم كلون رئيسي في صفحتك',
    logoLabel: '🖼️ الشعار (Logo)', logoUploadLabel: 'شعار المكتب — اضغط لرفع صورة',
    coverLabel: '🖼️ صورة الغلاف', coverHint: 'مقترح: 1200×400 بكسل أو أوسع',
    businessNameLabel: '🏢 اسم المنشأة', businessNamePlaceholder: 'مثال: مطعم الواحة، مكتب الأفق، صالون نور...',
    businessTypeLabel: '💼 نوع النشاط التجاري', businessTypeSub: 'يحدد الحقول المتاحة في نماذج العروض',
    btRealEstate: '🏠 عقارات', btRestaurant: '🍽️ مطعم / كافيه', btSalon: '✂️ صالون / سبا',
    btRetail: '🛍️ متجر / بيع بالتجزئة', btServices: '⚙️ خدمات', btOther: '📋 أخرى',
    pageContentLabel: '✍️ محتوى الصفحة', taglineLabel: 'الشعار النصي',
    taglinePlaceholder: 'مثال: شريكك الموثوق، جودة لا تُضاهى...',
    bioLabel: 'نبذة عنا', bioPlaceholder: 'أخبر الزوار عن منشأتك — خبرتك، قيمك، وما يميزك...',
    licenceLabel: 'أرقام التراخيص', addLicence: 'إضافة رقم ترخيص',
    noLicences: 'لا توجد أرقام ترخيص — اضغط "إضافة" لإضافة رقم',
    licenceTypePlaceholder: 'نوع الترخيص (مثال: وساطة عقارية)', licenceNumPlaceholder: 'رقم الترخيص (مثال: RE-12345)',
    seoLabel: '🔍 محركات البحث والمشاركة', seoSub: 'هذه البيانات تظهر عند مشاركة رابطك على واتساب وجوجل',
    seoTitleLabel: 'عنوان الصفحة (SEO Title)', seoCharsHint: 'يُنصح بـ 60 حرفاً',
    seoDescLabel: 'وصف الصفحة (Meta Description)', seoDescPlaceholder: 'وصف موجز لمنشأتك يظهر في نتائج البحث...',
    ogPreviewLabel: 'معاينة عند المشاركة على واتساب', businessNameFallback: 'اسم المنشأة', bizDescFallback: 'وصف المنشأة يظهر هنا',
    manageListings: 'إدارة العروض', manageListingsSub: 'أضف وعدّل عروضك أو منتجاتك أو خدماتك التي تظهر في صفحتك العامة',
    addListing: 'إضافة عرض', editListingTitle: 'تعديل العرض', newListingTitle: 'إضافة عرض جديد',
    fieldCategory: 'الفئة', fieldName: 'الاسم', fieldPrice: 'السعر', fieldLocation: 'الموقع',
    fieldBedrooms: 'الغرف', fieldBathrooms: 'الحمامات', fieldArea: 'المساحة (م²)',
    descriptionLabel: 'الوصف (اختياري)', descriptionPlaceholder: 'اكتب وصفاً تفصيلياً لهذا العرض...',
    mainImage: 'الصورة الرئيسية للعرض', extraPhotos: 'صور إضافية (اختياري)', addPhoto: 'إضافة صورة',
    notesLabel: 'ملاحظات (اختياري)', notesPlaceholder: 'أضف ملاحظات خاصة بهذا العرض (للاستخدام الداخلي فقط)...',
    publishLabel: 'نشر على الصفحة العامة', publishSub: 'إيقاف هذا يجعل العرض مسودة فقط',
    update: 'تحديث', noListings: 'لا توجد عروض مضافة بعد',
    statusAvailable: 'متاح', statusSold: 'مباع', statusRented: 'مؤجر', statusDraft: 'مسودة',
    editListing: 'تعديل', listingError: 'حدث خطأ، حاول مجدداً', areaSqm: 'م²',
    categoryPlaceholder: 'مثال: شقة، منتج، خدمة...',
    contactTitle: '📞 بيانات التواصل', contactEmail: 'البريد الإلكتروني',
    contactPhone: 'رقم الهاتف الرئيسي', contactAddress: 'العنوان',
    extraNumbers: 'أرقام إضافية', addNumber: 'إضافة رقم',
    workingHoursTitle: '🕐 ساعات العمل',
    workingHoursSub: 'أيام معطلة يمكن تعطيلها، والأيام المفعلة يجب أن تحتوي وقت فتح/إغلاق صحيح.',
    resetHours: 'إعادة الضبط', closed: 'مغلق',
    socialTitle: '🌐 روابط التواصل الاجتماعي',
    socialSub: 'اكتب اسم المستخدم فقط (بدون رابط) — التطبيق يبني الرابط تلقائياً عند الضغط على الأيقونة',
    whatsappHint: 'يمكنك إدخال رقم الهاتف أو رابط واتساب، وسيتم تحويله تلقائياً.',
    saveNow: 'حفظ الآن', autoSaved: 'تم الحفظ تلقائياً', autoSaveHint: 'يُحفظ تلقائياً بعد 2.5 ثانية من آخر تغيير',
    livePreview: 'معاينة مباشرة', live: 'مباشر',
    emailInvalidMsg: 'البريد الإلكتروني — الصيغة غير صحيحة', emailInvalidField: 'صيغة غير صحيحة',
    logoUrlLabel: 'رابط الشعار', coverUrlLabel: 'رابط صورة الغلاف',
    invalidUrlMsg: 'الرجاء إدخال رابط صحيح يبدأ بـ http أو https', invalidUrlField: 'رابط غير صحيح',
    workingHoursError: 'ساعات العمل — تحقق من توقيت يوم',
  },
  en: {
    cropTitle: 'Crop Image', cancel: 'Cancel', confirmCrop: 'Confirm Crop',
    changeImg: 'Change', clickUpload: 'Click to upload', clickOrDrag: 'Click or drag image here',
    changeImage: 'Change Image', uploadFailed: 'Upload failed', uploadHint: 'JPG · PNG · WebP · up to 5 MB',
    reorderSection: 'Reorder section',
    sectionHero: 'Hero', sectionListings: 'Listings', sectionAbout: 'About Us',
    sectionContact: 'Contact', sectionWorkingHours: 'Working Hours', sectionFooter: 'Footer',
    sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
    loadingPage: 'Loading your page settings...',
    pageBuilderTitle: 'Page Builder', pageBuilderSub: 'Customize your public page that clients see',
    publicPageUrl: 'Your Public Page URL',
    invalidBaseUrl: 'NEXT_PUBLIC_APP_URL value is invalid — the current environment URL will be used.',
    missingBaseUrl: 'NEXT_PUBLIC_APP_URL is not set — recommended to add it in production.',
    autoSavingSoon: 'Auto-saving in a few seconds...', saving: 'Saving...', saved: 'Saved',
    copyLink: 'Copy Link', copied: 'Copied!', openPage: 'Open Page',
    qrTitle: 'QR Code for Your Page', downloadPng: 'Download PNG', whatsapp: 'WhatsApp',
    tabControl: '🎛️ Control', tabDesign: '🎨 Design', tabIdentity: '✍️ Identity', tabListings: '🏠 Listings', tabConnect: '🔗 Connect',
    pageControlTitle: '🎛️ Page Control', pageControlSub: 'Drag sections to set their order on the public page.',
    pageSettingsTitle: '🎛️ Page Settings', heroHeadlineLabel: 'Main Page Headline',
    heroHeadlinePlaceholder: 'Discover the best listings', pageLangLabel: 'Page Language',
    chooseDesign: 'Choose Your Page Design', chooseDesignSub: 'The design will be applied instantly to the preview and saved to your page',
    brandColor: '🎨 Brand Color', brandColorHint: 'Used as the primary color in your page',
    logoLabel: '🖼️ Logo', logoUploadLabel: 'Agency logo — click to upload',
    coverLabel: '🖼️ Cover Image', coverHint: 'Recommended: 1200×400 px or wider',
    businessNameLabel: '🏢 Business Name', businessNamePlaceholder: 'e.g. Oasis Restaurant, Horizon Office, Noor Salon...',
    businessTypeLabel: '💼 Business Type', businessTypeSub: 'Determines available fields in listing forms',
    btRealEstate: '🏠 Real Estate', btRestaurant: '🍽️ Restaurant / Café', btSalon: '✂️ Salon / Spa',
    btRetail: '🛍️ Store / Retail', btServices: '⚙️ Services', btOther: '📋 Other',
    pageContentLabel: '✍️ Page Content', taglineLabel: 'Tagline',
    taglinePlaceholder: 'e.g. Your trusted partner, unmatched quality...',
    bioLabel: 'About Us', bioPlaceholder: 'Tell visitors about your business — your experience, values, and what sets you apart...',
    licenceLabel: 'License Numbers', addLicence: 'Add License Number',
    noLicences: 'No license numbers — click "Add" to add one',
    licenceTypePlaceholder: 'License type (e.g. Real Estate Broker)', licenceNumPlaceholder: 'License number (e.g. RE-12345)',
    seoLabel: '🔍 SEO & Sharing', seoSub: 'This data appears when sharing your link on WhatsApp and Google',
    seoTitleLabel: 'Page Title (SEO Title)', seoCharsHint: '60 chars recommended',
    seoDescLabel: 'Page Description (Meta Description)', seoDescPlaceholder: 'A brief description of your business for search results...',
    ogPreviewLabel: 'WhatsApp Share Preview', businessNameFallback: 'Business Name', bizDescFallback: 'Business description appears here',
    manageListings: 'Manage Listings', manageListingsSub: 'Add and edit your listings, products, or services shown on your public page',
    addListing: 'Add Listing', editListingTitle: 'Edit Listing', newListingTitle: 'Add New Listing',
    fieldCategory: 'Category', fieldName: 'Name', fieldPrice: 'Price', fieldLocation: 'Location',
    fieldBedrooms: 'Bedrooms', fieldBathrooms: 'Bathrooms', fieldArea: 'Area (sqm)',
    descriptionLabel: 'Description (optional)', descriptionPlaceholder: 'Write a detailed description for this listing...',
    mainImage: 'Main Listing Image', extraPhotos: 'Additional Photos (optional)', addPhoto: 'Add Photo',
    notesLabel: 'Notes (optional)', notesPlaceholder: 'Add private notes about this listing (internal use only)...',
    publishLabel: 'Publish to Public Page', publishSub: 'Disabling this makes the listing a draft only',
    update: 'Update', noListings: 'No listings added yet',
    statusAvailable: 'Available', statusSold: 'Sold', statusRented: 'Rented', statusDraft: 'Draft',
    editListing: 'Edit', listingError: 'An error occurred, please try again', areaSqm: 'sqm',
    categoryPlaceholder: 'e.g. Apartment, Product, Service...',
    contactTitle: '📞 Contact Details', contactEmail: 'Email Address',
    contactPhone: 'Primary Phone', contactAddress: 'Address',
    extraNumbers: 'Additional Numbers', addNumber: 'Add Number',
    workingHoursTitle: '🕐 Working Hours',
    workingHoursSub: 'Disabled days can be turned off; enabled days must have valid open/close times.',
    resetHours: 'Reset', closed: 'Closed',
    socialTitle: '🌐 Social Links',
    socialSub: 'Enter username only (without URL) — the app builds the link automatically when clicked',
    whatsappHint: 'You can enter a phone number or WhatsApp link, it will be converted automatically.',
    saveNow: 'Save Now', autoSaved: 'Auto-saved', autoSaveHint: 'Auto-saves 2.5s after the last change',
    livePreview: 'Live Preview', live: 'Live',
    emailInvalidMsg: 'Email — invalid format', emailInvalidField: 'Invalid format',
    logoUrlLabel: 'Logo URL', coverUrlLabel: 'Cover Image URL',
    invalidUrlMsg: 'Please enter a valid URL starting with http or https', invalidUrlField: 'Invalid URL',
    workingHoursError: 'Working hours — check timing for',
  },
} as const;

type PBTranslations = typeof PB_T['en'];

const SECTION_LABEL_KEY: Record<SectionOrderKey, keyof PBTranslations> = {
  hero: 'sectionHero',
  listings: 'sectionListings',
  about: 'sectionAbout',
  contact: 'sectionContact',
  working_hours: 'sectionWorkingHours',
  footer: 'sectionFooter',
};

type ProfileResponse = {
  profile: Profile | null;
  tenant: (Tenant & { primary_color?: string; theme?: string }) | null;
};

/* ── helpers for crop ── */
function centerAspectCrop(imgW: number, imgH: number, aspect: number): CropType {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, imgW, imgH), imgW, imgH);
}

async function getCroppedBlob(imgEl: HTMLImageElement, pixelCrop: PixelCrop, mimeType = 'image/jpeg'): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgEl, pixelCrop.x * scaleX, pixelCrop.y * scaleY, pixelCrop.width * scaleX, pixelCrop.height * scaleY, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas is empty')), mimeType, 0.92);
  });
}

/* ── Crop modal ── */
function CropModal({
  src,
  aspectRatio,
  onConfirm,
  onCancel,
}: {
  src: string;
  aspectRatio: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const { lang } = useLanguage();
  const t = PB_T[lang];

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop);
      onConfirm(blob);
    } catch {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#12121a] border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Crop className="h-4 w-4 text-blue-400" />
          <span>{t.cropTitle}</span>
        </div>
        <div className="overflow-auto max-h-[60vh] flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={50}
            minHeight={50}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="crop preview" onLoad={onImageLoad} style={{ maxHeight: '56vh', maxWidth: '100%' }} />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {t.confirmCrop}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const demoObjUrl = useRef<string | null>(null);
  const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
  const { lang } = useLanguage();
  const t = PB_T[lang];

  const aspectRatio = aspect === 'square' ? 1 : 16 / 9;

  useEffect(() => {
    return () => {
      if (demoObjUrl.current) URL.revokeObjectURL(demoObjUrl.current);
    };
  }, []);

  // Open crop modal when a file is selected
  const handleFile = useCallback((file: File) => {
    if (!file) return;
    setErr('');
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const uploadBlob = useCallback(async (blob: Blob, originalFile: File) => {
    setErr('');
    if (isDemo) {
      if (demoObjUrl.current) URL.revokeObjectURL(demoObjUrl.current);
      const url = URL.createObjectURL(blob);
      demoObjUrl.current = url;
      onChange(url);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      const ext = originalFile.name.split('.').pop() ?? 'jpg';
      fd.append('files', new File([blob], `upload.${ext}`, { type: blob.type || 'image/jpeg' }));
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
      setErr(e instanceof Error ? e.message : t.uploadFailed);
    } finally {
      setUploading(false);
    }
  }, [isDemo, onChange]);

  const handleCropConfirm = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    if (pendingFile) await uploadBlob(blob, pendingFile);
    setPendingFile(null);
  }, [pendingFile, uploadBlob]);

  const handleCropCancel = useCallback(() => {
    setCropSrc(null);
    setPendingFile(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {aspect === 'square' ? (
        <div className="flex gap-3 items-start">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors relative"
              title={label ?? t.clickUpload}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              ) : value ? (
                <img src={value} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-600" />
              )}
              {value && !uploading && (
                <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-medium">{t.changeImg}</span>
              )}
            </button>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs text-slate-400">{label ?? t.clickUpload}</p>
            <p className="text-[11px] text-slate-600">{t.uploadHint}</p>
            {err && <p className="text-[11px] text-red-400">{err}</p>}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>
      ) : (
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
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ImageIcon className="h-4 w-4" /> {t.changeImage}</>}
              </div>
            </div>
          ) : (
            <div className="w-full h-28 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-2">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-slate-500" />
                  <p className="text-xs text-slate-400">{t.clickOrDrag}</p>
                  <p className="text-[11px] text-slate-600">{t.uploadHint}</p>
                </>
              )}
            </div>
          )}
          {err && <p className="text-[11px] text-red-400 mt-1">{err}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>
      )}
    </>
  );
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEFAULT_PAGE_SECTIONS: NonNullable<Profile['page_sections']> = {
  hero: true,
  listings: true,
  about: true,
  news: false,
  contact: true,
  working_hours: true,
  footer: true,
  order: ['hero', 'listings', 'about', 'contact', 'working_hours', 'footer'],
};

const SECTION_ORDER_KEYS = ['hero', 'listings', 'about', 'contact', 'working_hours', 'footer'] as const;
type SectionOrderKey = (typeof SECTION_ORDER_KEYS)[number];

const SECTION_ORDER_LABELS: Record<SectionOrderKey, { icon: string; label: string }> = {
  hero: { icon: '🏠', label: 'القسم الرئيسي' },
  listings: { icon: '🏘️', label: 'العروض' },
  about: { icon: '👥', label: 'من نحن' },
  contact: { icon: '📞', label: 'تواصل معنا' },
  working_hours: { icon: '🕒', label: 'أوقات العمل' },
  footer: { icon: '▬', label: 'التذييل' },
};

function normalizeSectionOrder(order?: string[]): SectionOrderKey[] {
  const fromProfile = Array.isArray(order)
    ? order.filter((k): k is SectionOrderKey => SECTION_ORDER_KEYS.includes(k as SectionOrderKey))
    : [];

  return Array.from(new Set([...fromProfile, ...SECTION_ORDER_KEYS]));
}

function SortableSectionRow({
  sectionKey,
  enabled,
  onToggle,
}: {
  sectionKey: SectionOrderKey;
  enabled: boolean;
  onToggle: (key: SectionOrderKey) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionKey });
  const { lang } = useLanguage();
  const t = PB_T[lang];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="px-4 py-2.5 flex items-center justify-between gap-3 border-b last:border-b-0 border-slate-800/60"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t.reorderSection}
          className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ☰
        </button>
        <span className="w-5 text-center">{SECTION_ORDER_LABELS[sectionKey].icon}</span>
        <span className="text-sm text-slate-200">{t[SECTION_LABEL_KEY[sectionKey]]}</span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-700'}`}
        aria-pressed={enabled}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

const DEFAULT_PAGE_CONFIG: NonNullable<Profile['page_config']> = {
  hero_headline: 'مرحباً بكم',
  listings_columns: 3,
  show_listing_filters: true,
  show_listing_search: true,
  filter_label_all: 'الكل',
  filter_label_all_types: 'كل الأنواع',
  filter_label_all_status: 'كل الحالات',
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
  page_lang: 'ar' as 'ar' | 'en',
};

const EMPTY_PROFILE: Profile = {
  tenant_id: '',
  logo_url: '',
  cover_url: '',
  bio: '',
  tagline: '',
  licence_no: '',
  licence_numbers: [],
  contact_email: '',
  contact_phone: '',
  extra_phones: [],
  contact_address: '',
  social_links: { instagram: '', x: '', linkedin: '', whatsapp: '', snapchat: '', tiktok: '', telegram: '', discord: '' },
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

const CURRENCY_OPTIONS = [
  { code: 'SAR', symbol: '⃁', nameAr: 'ريال سعودي' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي' },
  { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي' },
  { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري' },
  { code: 'BHD', symbol: 'د.ب', nameAr: 'دينار بحريني' },
  { code: 'OMR', symbol: 'ر.ع', nameAr: 'ريال عُماني' },
  { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري' },
  { code: 'USD', symbol: '$', nameAr: 'دولار' },
  { code: 'EUR', symbol: '€', nameAr: 'يورو' },
  { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني' },
] as const;

const demoListings = [
  { id: 'l1', title: 'بنتهاوس مارينا', body: 'إطلالات بانورامية على المرسى من كل غرفة. تراس خاص على السطح مع مسبح لا نهاية له.', price: 12500000, location: 'Dubai Marina', bedrooms: 4, bathrooms: 4, area_sqm: 390, listing_status: 'available' as const, offer_type: 'sale', property_type: 'penthouse', images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l2', title: 'فيلا نخلة جميرا', body: 'فيلا على الشاطئ في جزيرة النخلة الشهيرة مع شاطئ خاص ومسبح ووصول مباشر للبحر.', price: 28000000, location: 'Palm Jumeirah', bedrooms: 6, bathrooms: 7, area_sqm: 790, listing_status: 'available' as const, offer_type: 'sale', property_type: 'villa', images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l3', title: 'جناح وسط المدينة', body: 'إطلالات بانورامية على برج خليفة والنافورة. تشطيبات فاخرة ونظام منزل ذكي.', price: 5800000, location: 'Downtown Dubai', bedrooms: 2, bathrooms: 2, area_sqm: 167, listing_status: 'available' as const, offer_type: 'sale', property_type: 'apartment', images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l4', title: 'شقة بزنس باي', body: 'معيشة عصرية في قلب الحي التجاري. إطلالات على القناة، صالة رياضية وخدمة كونسيرج.', price: 3200000, location: 'Business Bay', bedrooms: 3, bathrooms: 3, area_sqm: 195, listing_status: 'sold' as const, offer_type: 'sale', property_type: 'apartment', images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l5', title: 'دوبلكس جي بي آر', body: 'على بُعد خطوات من الشاطئ، يجمع هذا الدوبلكس بين الفخامة الداخلية والمعيشة في الهواء الطلق.', price: 9100000, location: 'Jumeirah Beach Residence', bedrooms: 3, bathrooms: 3, area_sqm: 279, listing_status: 'available' as const, offer_type: 'rent', property_type: 'duplex', images: ['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l6', title: 'قصر إمارات هيلز', body: 'قصر فاخر في أرقى عنوان في دبي. إطلالات على ملعب الغولف، غرفة سينما ومرافق للموظفين.', price: 45000000, location: 'Emirates Hills', bedrooms: 8, bathrooms: 9, area_sqm: 1300, listing_status: 'available' as const, offer_type: 'sale', property_type: 'mansion', images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
];

const demoNews = [
  { id: 'n1', title: 'سوق العقارات في دبي يسجل أرقاماً قياسية في الربع الأول 2026', body: 'ارتفعت أحجام المعاملات بنسبة 34% على أساس سنوي مع تدفق استثمارات المستثمرين الدوليين إلى مناطق دبي مارينا وداون تاون والنخلة.', image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  { id: 'n2', title: 'قواعد التأشيرة الذهبية الجديدة تعزز الطلب على العقارات الفاخرة', body: 'يُحفز برنامج التأشيرة لمدة 10 سنوات لملاك العقارات بقيمة 2 مليون درهم+ موجةً من الاستثمارات الأجنبية طويلة الأجل في الإمارات.', image_url: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  { id: 'n3', title: 'Luxury Homes Dubai تفوز بجائزة أفضل وكالة 2025', body: 'نفخر بحصولنا على لقب أفضل وكالة عقارات سكنية فاخرة في دبي للعام الثاني على التوالي في حفل جوائز الخليج للعقارات.', image_url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
];

const demoGallery = [
  { id: 'g1', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Marina Penthouse Living Room', sort_order: 0 },
  { id: 'g2', url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Palm Jumeirah Aerial View', sort_order: 1 },
  { id: 'g3', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Beachfront Villa Exterior', sort_order: 2 },
  { id: 'g4', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Downtown Skyline at Night', sort_order: 3 },
  { id: 'g5', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'JBR Beachfront Terrace', sort_order: 4 },
  { id: 'g6', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'Emirates Hills Mansion Pool', sort_order: 5 },
];

const demoTeam = [
  { id: 't1', email: 'sarah@luxuryhomesdubai.ae', role: 'agent', display_name: 'Sarah Al-Mansouri', photo_url: '', phone: '+971500000001' },
  { id: 't2', email: 'james@luxuryhomesdubai.ae', role: 'agent', display_name: 'James Porter', photo_url: '', phone: '+971500000002' },
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
  const { lang } = useLanguage();
  const t = PB_T[lang];
  const DAY_LABELS = { sun: t.sun, mon: t.mon, tue: t.tue, wed: t.wed, thu: t.thu, fri: t.fri, sat: t.sat };
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [agencyName, setAgencyName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('modern');
  const [businessType, setBusinessType] = useState<string>('real_estate');
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTrigger = useRef(false);
  const [autoSavePending, setAutoSavePending] = useState(0);
  const pendingImageAutoSave = useRef(false);
  const [listings, setListings] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [teamItems, setTeamItems] = useState<any[]>([]);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [listingForm, setListingForm] = useState({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', extra_images: [] as string[], card_style: 'standard', status: 'available', offer_type: 'sale', property_type: '', body: '', notes: '' });
  const [listingSaving, setListingSaving] = useState(false);
  const [listingError, setListingError] = useState('');
  const [listingPublished, setListingPublished] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [showChecklist, setShowChecklist] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const profileCompletionItems = [
    { key: 'name',      label: t.businessNameLabel,    done: Boolean(agencyName),                tab: 'identity' },
    { key: 'logo',      label: t.logoLabel,            done: Boolean(profile.logo_url),          tab: 'design'   },
    { key: 'cover',     label: t.coverLabel,           done: Boolean(profile.cover_url),         tab: 'design'   },
    { key: 'bio',       label: t.bioLabel,             done: Boolean(profile.bio),               tab: 'identity' },
    { key: 'whatsapp',  label: 'WhatsApp',             done: Boolean(profile.social_links?.whatsapp), tab: 'connect' },
    { key: 'listing',   label: t.tabListings,          done: listings.filter(l => l.published !== false).length > 0, tab: 'posts' },
    { key: 'theme',     label: t.tabDesign,            done: selectedTheme !== 'modern',         tab: 'design'   },
  ];

  useEffect(() => {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    if (isDemo) {
      setIsDemoSession(true);
      const d = {
        profile: {
          tenant_id: 'demo',
          logo_url: '',
          cover_url: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1600',
          bio: 'Luxury Homes Dubai is an award-winning agency specialising in premium residential and commercial properties across Dubai.',
          tagline: 'اعثر على منزل أحلامك في دبي',
          contact_email: 'hello@luxuryhomesdubai.ae',
          contact_phone: '+971500000000',
          extra_phones: ['+966559707955'],
          contact_address: 'Dubai Marina, Dubai, UAE',
          licence_no: 'RE-12345',
          licence_numbers: [{ label: 'رقم الرخصة', number: 'RE-12345' }],
          social_links: {
            instagram: 'luxuryhomesdubai',
            x: '',
            linkedin: '',
            whatsapp: '971500000000',
            snapchat: '',
            tiktok: '',
          },
          working_hours: {
            sun: { enabled: true,  open: '09:00', close: '18:00' },
            mon: { enabled: true,  open: '09:00', close: '18:00' },
            tue: { enabled: true,  open: '09:00', close: '18:00' },
            wed: { enabled: true,  open: '09:00', close: '18:00' },
            thu: { enabled: true,  open: '09:00', close: '18:00' },
            fri: { enabled: false, open: '09:00', close: '13:00' },
            sat: { enabled: false, open: '09:00', close: '13:00' },
          },
          page_sections: {
            hero: true,
            listings: true,
            about: true,
            news: true,
            contact: true,
            working_hours: true,
            footer: true,
          },
          page_config: {
            hero_headline: 'اعثر على منزل أحلامك في دبي',
            hero_style: 'centered' as 'centered' | 'split' | 'minimal',
            hero_cta_text: 'تصفح العروض',
            show_listing_filters: true,
            show_listing_search: true,
            listings_columns: 3 as 2 | 3 | 4,
            currency: 'AED',
          },
        },
        tenant: {
          id: 'demo',
          slug: 'demo',
          name: 'Luxury Homes Dubai',
          status: 'active' as const,
          created_at: '2025-10-15T10:00:00Z',
          primary_color: '#8b5cf6',
          theme: 'midnight',
          business_type: 'real_estate',
        },
      };
      setData(d as ProfileResponse);
      setProfile({
        ...d.profile,
        page_sections: { ...DEFAULT_PAGE_SECTIONS, ...(d.profile.page_sections ?? {}) },
        page_config: { ...DEFAULT_PAGE_CONFIG, ...((d.profile.page_config ?? {}) as NonNullable<Profile['page_config']>) },
      });
      setPrimaryColor(d.tenant.primary_color);
      setAgencyName(d.tenant.name);
      setSelectedTheme(d.tenant.theme);
      setBusinessType((d.tenant as any).business_type || 'real_estate');
      setListings(demoListings);
      setNewsItems(demoNews);
      setGalleryItems(demoGallery);
      setTeamItems(demoTeam);
      setLoading(false);
      return;
    }
    Promise.all([
      authFetch<ProfileResponse>('/api/dashboard/profile'),
      authFetch<{ data: any[] }>('/api/dashboard/listings').catch(() => ({ data: [] })),
      authFetch<any[]>('/api/dashboard/news').catch(() => []),
      authFetch<any[]>('/api/dashboard/media').catch(() => []),
    ]).then(([profileRes, listingsRes, newsRes, mediaRes]) => {
        setIsDemoSession(false);
        setData(profileRes);
        if (profileRes.profile) {
          setProfile({
            ...profileRes.profile,
            working_hours: { ...WORKING_HOURS_DEFAULT, ...(profileRes.profile.working_hours ?? {}) },
            page_sections: { ...DEFAULT_PAGE_SECTIONS, ...(profileRes.profile.page_sections ?? {}), news: false },
            page_config: { ...DEFAULT_PAGE_CONFIG, ...(profileRes.profile.page_config ?? {}) },
          });
        }
        setPrimaryColor(profileRes.tenant?.primary_color || '#2563eb');
        setAgencyName(profileRes.tenant?.name || '');
        setSelectedTheme(profileRes.tenant?.theme || 'modern');
        setBusinessType((profileRes.tenant as any)?.business_type || 'real_estate');
        setListings(listingsRes.data ?? []);
        setNewsItems(Array.isArray(newsRes) ? newsRes : []);
        setGalleryItems(Array.isArray(mediaRes) ? mediaRes : []);
        setTeamItems([]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDirty = () => {
    setDirty(true);
    setSaveStatus('idle');
    setSaveError('');
    // Debounced auto-save: fires 2.5 s after the last change
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      // handleSave is stable after its own useCallback, read via ref below
      autoSaveTimer.current = null;
      autoSaveTrigger.current = true;
      setAutoSavePending((v) => v + 1);
    }, 2500);
  };

  const updateProfile = (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    markDirty();
    if ('logo_url' in patch || 'cover_url' in patch) {
      pendingImageAutoSave.current = true;
    }
    const keys = Object.keys(patch);
    if (keys.length) setFieldErrors((prev) => { const n = { ...prev }; keys.forEach(k => delete n[k]); return n; });
  };

  const updateSocial = (key: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
    markDirty();
    setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const normalizeWhatsappInput = () => {
    const current = profile.social_links?.whatsapp || '';
    const normalized = normalizeWhatsAppTarget(current) || '';
    if (normalized === current) return;
    setProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, whatsapp: normalized },
    }));
    markDirty();
  };

  const toggleSection = (key: SectionOrderKey) => {
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

  const getCurrentSectionOrder = () => normalizeSectionOrder(profile.page_sections?.order as string[] | undefined);

  const setSectionOrder = (nextOrder: SectionOrderKey[]) => {
    setProfile((prev) => ({
      ...prev,
      page_sections: {
        ...DEFAULT_PAGE_SECTIONS,
        ...(prev.page_sections ?? {}),
        order: nextOrder,
      },
    }));
    markDirty();
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = getCurrentSectionOrder();
    const oldIndex = current.indexOf(active.id as SectionOrderKey);
    const newIndex = current.indexOf(over.id as SectionOrderKey);
    if (oldIndex < 0 || newIndex < 0) return;
    setSectionOrder(arrayMove(current, oldIndex, newIndex));
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
    setListingForm({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', extra_images: [], card_style: 'standard', status: 'available', offer_type: 'sale', property_type: '', body: '', notes: '' });
    setEditingListing(null);
    setListingError('');
    setListingPublished(true);
  };

  const addListing = async () => {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    const payload = {
      title: listingForm.title,
      price: listingForm.price ? parseInt(listingForm.price) : null,
      location: listingForm.location || null,
      bedrooms: listingForm.bedrooms ? parseInt(listingForm.bedrooms) : null,
      bathrooms: listingForm.bathrooms ? parseInt(listingForm.bathrooms) : null,
      area_sqm: listingForm.area_sqm ? parseInt(listingForm.area_sqm) : null,
      images: [listingForm.image, ...listingForm.extra_images].filter(Boolean),
      card_style: listingForm.card_style as 'standard' | 'featured' | 'compact',
      listing_status: listingForm.status as 'available' | 'sold' | 'rented',
      offer_type: listingForm.offer_type as 'sale' | 'rent',
      property_type: listingForm.property_type || null,
      body: listingForm.body || undefined,
      notes: listingForm.notes || undefined,
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
      setListingError(e instanceof Error ? e.message : t.listingError);
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
    setFieldErrors({});
    const email = (profile.contact_email || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSaveStatus('error');
      setSaveError(t.emailInvalidMsg);
      setFieldErrors({ contact_email: t.emailInvalidField });
      setActiveTab('connect');
      return;
    }

    const urlCandidates: Array<{ label: string; value?: string; field: string; tab: string }> = [
      { label: t.logoUrlLabel,  value: profile.logo_url || '',  field: 'logo_url',  tab: 'design' },
      { label: t.coverUrlLabel, value: profile.cover_url || '', field: 'cover_url', tab: 'design' },
    ];
    for (const candidate of urlCandidates) {
      const v = candidate.value?.trim();
      if (v && !isValidUrl(v)) {
        setSaveStatus('error');
        setSaveError(`${candidate.label} — ${t.invalidUrlMsg}`);
        setFieldErrors({ [candidate.field]: t.invalidUrlField });
        setActiveTab(candidate.tab);
        return;
      }
    }

    for (const day of DAY_ORDER) {
      const h = profile.working_hours?.[day];
      if (!h?.enabled) continue;
      if (!h.open || !h.close || toMinutes(h.open) >= toMinutes(h.close)) {
        setSaveStatus('error');
        setSaveError(`${t.workingHoursError} ${DAY_LABELS[day]}`);
        setActiveTab('connect');
        return;
      }
    }

    setSaveStatus('saving');
    setSaveError('');
    setFieldErrors({});
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
      if (autoSaveTimer.current) { clearTimeout(autoSaveTimer.current); autoSaveTimer.current = null; }
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

  // Fire the debounced auto-save when the timer triggers
  useEffect(() => {
    if (!autoSaveTrigger.current || saveStatus === 'saving') return;
    autoSaveTrigger.current = false;
    void handleSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSavePending]);

  // Auto-save immediately when a profile image (logo or cover) is uploaded
  useEffect(() => {
    if (!pendingImageAutoSave.current || loading || saveStatus === 'saving') return;
    pendingImageAutoSave.current = false;
    void handleSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.logo_url, profile.cover_url]);

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
    img.onload = () => { ctx.drawImage(img, 0, 0, 360, 360); canvas.toBlob((blob) => { if (!blob) return; const a = document.createElement('a'); const objUrl = URL.createObjectURL(blob); a.href = objUrl; a.download = `qr-${slug || 'page'}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(objUrl), 1000); }); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">{t.loadingPage}</p>
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
  const displayCurrency = pageConfig.currency === 'SAR' || pageConfig.currency === 'ر.س' ? '⃁' : (pageConfig.currency || 'SAR');

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 pb-10" dir="rtl">

      {/* QR Code Dialog */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-400" /> {t.qrTitle}
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
                <Download className="h-4 w-4" /> {t.downloadPng}
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
        <h1 className="text-2xl font-bold text-white">{t.pageBuilderTitle}</h1>
        <p className="text-sm text-slate-400">{t.pageBuilderSub}</p>
      </div>

      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{t.publicPageUrl}</p>
          <p className="text-blue-400 font-mono text-sm truncate">{publicUrl}</p>
          {shouldShowInvalidUrlWarning && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t.invalidBaseUrl}
            </p>
          )}
          {shouldShowMissingUrlInfo && (
            <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t.missingBaseUrl}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {dirty && saveStatus !== 'saving' && (
            <span className="text-xs text-amber-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              حفظ تلقائي خلال ثوانٍ...
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t.saving}
            </span>
          )}
          {saveStatus === 'saved' && !dirty && (
            <span className="text-xs text-green-400 flex items-center gap-1.5">
              <Check className="h-3 w-3" />
              {t.saved}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowQrModal(true)} className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
            <QrCode className="h-3.5 w-3.5" /> QR
          </Button>
          <Button size="sm" variant="ghost" onClick={copyLink} className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.copied : t.copyLink}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.open(publicPath, '_blank', 'noopener,noreferrer')} className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" /> {t.openPage}
          </Button>
        </div>
      </div>

      {/* Main artistic square workspace */}
      <div className="relative w-full rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.14),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_32%),#020617] p-3 md:p-4 lg:p-5 overflow-hidden xl:min-h-[820px]">
        <div className="grid h-full xl:grid-cols-[minmax(500px,1fr)_minmax(620px,1.2fr)] gap-4 lg:gap-5 items-stretch">

        {/* Editor panel */}
        <div className="space-y-5 min-w-0 relative z-20 xl:col-start-1 xl:row-start-1 xl:h-full xl:overflow-y-auto xl:pr-1.5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-slate-900 border border-slate-800 rounded-xl p-1.5 h-auto gap-1">
              {([
                { value: 'control', icon: SlidersHorizontal, label: t.tabControl },
                { value: 'design',   icon: Layout,   label: t.tabDesign   },
                { value: 'identity', icon: Palette,  label: t.tabIdentity },
                { value: 'posts',    icon: Building2, label: t.tabListings },
                { value: 'connect',  icon: Phone,    label: t.tabConnect  },
              ] as const).map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none text-slate-400 hover:text-white rounded-lg py-2 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── CONTROL: unified page control panel ── */}
            <TabsContent value="control" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{t.pageControlTitle}</p>
                  </div>
                  <p className="text-xs text-slate-500">{t.pageControlSub}</p>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                  <SortableContext items={getCurrentSectionOrder()} strategy={verticalListSortingStrategy}>
                    <div>
                      {getCurrentSectionOrder().map((sectionKey) => (
                        <SortableSectionRow
                          key={sectionKey}
                          sectionKey={sectionKey}
                          enabled={Boolean(sections[sectionKey])}
                          onToggle={(key) => toggleSection(key)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.pageSettingsTitle}
                </p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.heroHeadlineLabel}</Label>
                  <Input
                    value={pageConfig.hero_headline || ''}
                    onChange={(e) => updatePageConfig({ hero_headline: e.target.value })}
                    placeholder={t.heroHeadlinePlaceholder}
                    maxLength={200}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(pageConfig.hero_headline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.pageLangLabel}</Label>
                  <div className="flex gap-2">
                    {(['ar', 'en'] as const).map(l => (
                      <button key={l} type="button"
                        onClick={() => updatePageConfig({ page_lang: l })}
                        className={`flex-1 py-2 rounded-md text-sm font-semibold border transition-colors ${
                          (pageConfig.page_lang ?? 'ar') === l
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {l === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── DESIGN: themes + visual brand ── */}
            <TabsContent value="design" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 xl:p-5">
                <p className="text-sm font-bold text-white mb-1">{t.chooseDesign}</p>
                <p className="text-slate-400 text-sm mb-4">{t.chooseDesignSub}</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PAGE_THEMES).filter((theme) => theme.dark).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => { setSelectedTheme(theme.id); markDirty(); }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                        selectedTheme === theme.id ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' : 'border-slate-600 hover:border-slate-400 hover:scale-[1.01]'
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

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.brandColor}
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
                  <span className="text-xs text-slate-500">{t.brandColorHint}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.logoLabel}
                </p>
                <ImageUploader
                  value={profile.logo_url || ''}
                  onChange={(url) => updateProfile({ logo_url: url })}
                  aspect="square"
                  label={t.logoUploadLabel}
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.coverLabel}
                </p>
                <ImageUploader
                  value={profile.cover_url || ''}
                  onChange={(url) => updateProfile({ cover_url: url })}
                  aspect="cover"
                />
                <p className="text-xs text-slate-500">{t.coverHint}</p>
              </div>
            </TabsContent>

            {/* ── IDENTITY: name + biz type + tagline + bio + licences ── */}
            <TabsContent value="identity" className="mt-4 space-y-4">

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.businessNameLabel}
                </p>
                <Input
                  value={agencyName}
                  onChange={(e) => { setAgencyName(e.target.value); markDirty(); }}
                  placeholder={t.businessNamePlaceholder}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.businessTypeLabel}
                </p>
                <p className="text-xs text-slate-500">{t.businessTypeSub}</p>
                <select
                  value={businessType}
                  onChange={(e) => {
                  const bt = e.target.value;
                  setBusinessType(bt);
                  markDirty();
                  if (bt === 'real_estate') {
                    updatePageConfig({ offer_label_1: 'للبيع', offer_label_2: 'للإيجار' });
                  } else if (bt === 'restaurant') {
                    updatePageConfig({ offer_label_1: 'متاح', offer_label_2: 'خاص' });
                  } else if (bt === 'retail') {
                    updatePageConfig({ offer_label_1: 'للبيع', offer_label_2: 'نفذ' });
                  } else if (bt === 'salon' || bt === 'services') {
                    updatePageConfig({ offer_label_1: 'متاح', offer_label_2: 'محجوز' });
                  } else {
                    updatePageConfig({ offer_label_1: 'متاح', offer_label_2: 'غير متاح' });
                  }
                }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="real_estate">{t.btRealEstate}</option>
                  <option value="restaurant">{t.btRestaurant}</option>
                  <option value="salon">{t.btSalon}</option>
                  <option value="retail">{t.btRetail}</option>
                  <option value="services">{t.btServices}</option>
                  <option value="other">{t.btOther}</option>
                </select>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.pageContentLabel}
                </p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.taglineLabel}</Label>
                  <Input
                    value={profile.tagline || ''}
                    onChange={(e) => updateProfile({ tagline: e.target.value })}
                    placeholder={t.taglinePlaceholder}
                    maxLength={200}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.tagline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.bioLabel}</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    placeholder={t.bioPlaceholder}
                    rows={6}
                    maxLength={2000}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.bio || '').length}/2000</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3" /> {t.licenceLabel}
                    </Label>
                    {(profile.licence_numbers?.length ?? 0) < 6 && (
                      <button
                        type="button"
                        onClick={() => updateProfile({ licence_numbers: [...(profile.licence_numbers ?? []), { label: '', number: '' }] })}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> {t.addLicence}
                      </button>
                    )}
                  </div>
                  {(profile.licence_numbers ?? []).length === 0 && (
                    <p className="text-xs text-slate-500 italic">{t.noLicences}</p>
                  )}
                  {(profile.licence_numbers ?? []).map((entry, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex flex-col gap-1 flex-1">
                        <Input
                          value={entry.label}
                          onChange={(e) => {
                            const updated = [...(profile.licence_numbers ?? [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            updateProfile({ licence_numbers: updated });
                          }}
                          placeholder={t.licenceTypePlaceholder}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <Input
                          value={entry.number}
                          onChange={(e) => {
                            const updated = [...(profile.licence_numbers ?? [])];
                            updated[idx] = { ...updated[idx], number: e.target.value };
                            updateProfile({ licence_numbers: updated });
                          }}
                          placeholder={t.licenceNumPlaceholder}
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.licence_numbers ?? []).filter((_, i) => i !== idx);
                          updateProfile({ licence_numbers: updated });
                        }}
                        className="mt-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.seoLabel}
                </p>
                <p className="text-xs text-slate-500">{t.seoSub}</p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.seoTitleLabel}</Label>
                  <Input
                    value={pageConfig.seo_title || ''}
                    onChange={(e) => updatePageConfig({ seo_title: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    placeholder={`${agencyName || t.businessNameFallback}`}
                    maxLength={120}
                  />
                  <p className={`text-[11px] text-left ${ (pageConfig.seo_title || '').length > 60 ? 'text-amber-400' : 'text-slate-500' }`}>{(pageConfig.seo_title || '').length}/120 ({t.seoCharsHint})</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.seoDescLabel}</Label>
                  <Textarea
                    value={pageConfig.seo_description || ''}
                    onChange={(e) => updatePageConfig({ seo_description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                    placeholder={t.seoDescPlaceholder}
                    rows={3}
                    maxLength={160}
                  />
                  <p className={`text-[11px] text-left ${ (pageConfig.seo_description || '').length > 160 ? 'text-red-400' : 'text-slate-500' }`}>{(pageConfig.seo_description || '').length}/160</p>
                </div>

                {/* WhatsApp preview */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">{t.ogPreviewLabel}</p>
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-slate-700 text-right">
                    {profile.cover_url && (
                      <img src={profile.cover_url} alt="OG preview" className="w-full h-24 object-cover" />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">
                        {pageConfig.seo_title || agencyName || t.businessNameFallback}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {pageConfig.seo_description || profile.bio || t.bizDescFallback}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1 truncate">{publicUrl}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* POSTS */}
            <TabsContent value="posts" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{t.manageListings}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.manageListingsSub}</p>
                  </div>
                  <Button
                    onClick={() => { setShowListingForm(!showListingForm); resetListingForm(); }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> {t.addListing}
                  </Button>
                </div>

                {showListingForm && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-white">{editingListing ? t.editListingTitle : t.newListingTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldCategory}</Label>
                        <Input value={listingForm.property_type} onChange={(e) => setListingForm({ ...listingForm, property_type: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder={t.categoryPlaceholder} />
                      </div>
                    <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldName}</Label>
                        <Input
                          value={listingForm.title}
                          onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white text-sm"
                          placeholder={t.fieldName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldPrice}</Label>
                        <Input type="number" value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="1000000" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldLocation}</Label>
                        <Input value={listingForm.location} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="Dubai Marina" />
                      </div>
                      {(!businessType || businessType === 'real_estate') && (<>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldBedrooms}</Label>
                        <Input type="number" value={listingForm.bedrooms} onChange={(e) => setListingForm({ ...listingForm, bedrooms: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="4" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldBathrooms}</Label>
                        <Input type="number" value={listingForm.bathrooms} onChange={(e) => setListingForm({ ...listingForm, bathrooms: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="3" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldArea}</Label>
                        <Input type="number" value={listingForm.area_sqm} onChange={(e) => setListingForm({ ...listingForm, area_sqm: e.target.value })} className="bg-slate-900 border-slate-700 text-white text-sm" placeholder="450" />
                      </div>
                      </>)}
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t.descriptionLabel}</label>
                      <textarea
                        value={listingForm.body}
                        onChange={(e) => setListingForm({ ...listingForm, body: e.target.value })}
                        placeholder={t.descriptionPlaceholder}
                        rows={3}
                        className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-slate-400 text-xs">{t.mainImage}</Label>
                      <ImageUploader
                        value={listingForm.image}
                        onChange={(url) => setListingForm({ ...listingForm, image: url })}
                        aspect="cover"
                      />
                    </div>

                    {/* Extra photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-400 text-xs">{t.extraPhotos}</Label>
                        {listingForm.extra_images.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setListingForm({ ...listingForm, extra_images: [...listingForm.extra_images, ''] })}
                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                          >
                            <Plus className="h-3 w-3" /> {t.addPhoto}
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

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t.notesLabel}</label>
                      <textarea
                        value={listingForm.notes}
                        onChange={(e) => setListingForm({ ...listingForm, notes: e.target.value })}
                        placeholder={t.notesPlaceholder}
                        rows={2}
                        className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm text-white">{t.publishLabel}</p>
                        <p className="text-xs text-slate-500">{t.publishSub}</p>
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
                        {editingListing ? t.update : t.addListing}
                      </Button>
                      <Button onClick={() => { setShowListingForm(false); resetListingForm(); }} size="sm" variant="outline" className="border-slate-600 text-slate-300">{t.cancel}</Button>
                    </div>
                  </div>
                )}

                {listings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t.noListings}</p>
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
                          <p className="text-blue-400 text-sm font-bold">{listing.price?.toLocaleString('en-US')} {displayCurrency}</p>
                          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                            {listing.location && <span>{listing.location}</span>}
                            {listing.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{listing.bedrooms}</span>}
                            {listing.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                            {listing.area_sqm > 0 && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{listing.area_sqm}{t.areaSqm}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ listing.listing_status === 'available' ? 'bg-green-500/20 text-green-400' : listing.listing_status === 'sold' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                            {listing.listing_status === 'available' ? t.statusAvailable : listing.listing_status === 'sold' ? t.statusSold : t.statusRented}
                          </span>
                          {listing.published === false && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600/40 text-slate-300">{t.statusDraft}</span>
                          )}
                          <Button onClick={() => { setEditingListing(listing); setListingForm({ title: listing.title, price: String(listing.price), location: listing.location || '', bedrooms: String(listing.bedrooms || ''), bathrooms: String(listing.bathrooms || ''), area_sqm: String(listing.area_sqm || ''), image: listing.images?.[0] || '', extra_images: listing.images?.slice(1) ?? [], card_style: listing.card_style || 'standard', status: listing.listing_status || 'available', offer_type: listing.offer_type || 'sale', property_type: listing.property_type || '', body: listing.body || '', notes: listing.notes || '' }); setListingPublished(listing.published !== false); setShowListingForm(true); }} variant="ghost" size="sm" className="text-slate-400 hover:text-white h-7 px-2 text-xs">{t.editListing}</Button>
                          <Button onClick={() => deleteListing(listing.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-7 w-7 p-0" aria-label={`Delete listing ${listing.title}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── CONNECT: contact + social + SEO ── */}
            <TabsContent value="connect" className="mt-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.contactTitle}
                </p>

                {([
                  { key: 'contact_email',   icon: Mail,   label: t.contactEmail, placeholder: 'agency@example.com',   type: 'email' },
                  { key: 'contact_phone',   icon: Phone,  label: t.contactPhone, placeholder: '+966 50 000 0000',   type: 'tel'   },
                  { key: 'contact_address', icon: MapPin, label: t.contactAddress,             placeholder: 'Riyadh, Saudi Arabia', type: 'text'  },
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
                        className={`bg-slate-800 text-white placeholder:text-slate-500 pl-9 focus:ring-1 transition-colors ${fieldErrors[key] ? 'border-amber-400 ring-1 ring-amber-400/30 focus:border-amber-400 focus:ring-amber-400/30' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      {fieldErrors[key] && (
                        <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
                          <span>⚠</span> {fieldErrors[key]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Extra phones */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.extraNumbers}</Label>
                    {(profile.extra_phones?.length ?? 0) < 4 && (
                      <button
                        type="button"
                        onClick={() => updateProfile({ extra_phones: [...(profile.extra_phones ?? []), ''] })}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> {t.addNumber}
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
                  {t.workingHoursTitle}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{t.workingHoursSub}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-slate-300 hover:text-white"
                    onClick={() => updateProfile({ working_hours: WORKING_HOURS_DEFAULT })}
                  >
                    {t.resetHours}
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
                        aria-label={`Toggle working hours for ${DAY_LABELS[day]}`}
                        aria-pressed={h.enabled}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ h.enabled ? 'translate-x-4' : 'translate-x-1' }`} />
                      </button>
                      <span className={`w-16 text-sm ${h.enabled ? 'text-white' : 'text-slate-500'}`}>{DAY_LABELS[day]}</span>
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
                        <span className="text-xs text-slate-600 flex-1">{t.closed}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  {t.socialTitle}
                </p>
                <p className="text-xs text-slate-500">{t.socialSub}</p>

                {([
                  { key: 'instagram', icon: Instagram,     label: 'Instagram',   placeholder: 'username',              color: 'text-pink-400'  },
                  { key: 'x',         icon: Twitter,       label: 'X (Twitter)', placeholder: 'username',              color: 'text-sky-400'   },
                  { key: 'linkedin',  icon: Linkedin,      label: 'LinkedIn',    placeholder: 'username or company/..', color: 'text-blue-400'  },
                  { key: 'whatsapp',  icon: MessageCircle, label: 'WhatsApp',    placeholder: '966500000000',         color: 'text-green-400' },
                ] as const).map(({ key, icon: Icon, label, placeholder, color }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
                    <div className="relative">
                      <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${color} pointer-events-none`} />
                      <Input
                        value={profile.social_links?.[key] || ''}
                        onChange={(e) => updateSocial(key, e.target.value)}
                        onBlur={() => {
                          if (key === 'whatsapp') normalizeWhatsappInput();
                        }}
                        placeholder={placeholder}
                        className={`bg-slate-800 text-white placeholder:text-slate-500 pl-9 focus:ring-1 transition-colors ${fieldErrors[key] ? 'border-amber-400 ring-1 ring-amber-400/30 focus:border-amber-400 focus:ring-amber-400/30' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'}`}
                      />
                      {key === 'whatsapp' && (
                        <p className="mt-1 text-[11px] text-slate-500">{t.whatsappHint}</p>
                      )}
                      {fieldErrors[key] && (
                        <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
                          <span>⚠</span> {fieldErrors[key]}
                        </p>
                      )}
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
                      placeholder="username"
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
                      placeholder="username"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Telegram */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Telegram</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sky-400">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </span>
                    <Input
                      value={profile.social_links?.telegram || ''}
                      onChange={(e) => updateSocial('telegram', e.target.value)}
                      placeholder="username"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Discord */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Discord</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-400">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </span>
                    <Input
                      value={profile.social_links?.discord || ''}
                      onChange={(e) => updateSocial('discord', e.target.value)}
                      placeholder="username or server invite"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
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
                disabled={saveStatus === 'saving'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2 disabled:opacity-60"
              >
                {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveStatus === 'saving' ? t.saving : t.saveNow}
              </Button>

              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> {t.autoSaved}
                </span>
              )}
              {saveStatus === 'error' && saveError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm max-w-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{saveError}</span>
                </div>
              )}
              {dirty && saveStatus === 'idle' && (
                <span className="text-xs text-slate-500">{t.autoSaveHint}</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="min-w-0 relative z-0 xl:col-start-2 xl:row-start-1 xl:h-full">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">

            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.livePreview}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                    {t.live}
                  </span>
              </div>
            </div>

            <div className="px-3 py-2 flex items-center justify-end gap-2" style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
            </div>

            {/* Live inline preview — renders theme component directly, no save needed */}
            <div className="relative overflow-hidden bg-black flex-1 min-h-[540px] xl:min-h-0">
              {/* onClick capture blocks link navigation; scroll still works */}
              <div
                className="overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.preventDefault()}
                style={previewDevice === 'mobile' ? {
                  width: '390px',
                  height: '844px',
                  transform: 'scale(0.78)',
                  transformOrigin: 'top right',
                  isolation: 'isolate',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                } : {
                  position: 'relative',
                  isolation: 'isolate',
                  transform: 'translateZ(0)',
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* CSS-var wrapper: overrides :root --primary instantly without save */}
                <div style={{ '--primary': primaryColor, '--accent': primaryColor } as React.CSSProperties}>
                <PublicAgencyPage
                  tenant={{
                    id: data?.tenant?.id ?? 'preview',
                    name: agencyName,
                    slug: data?.tenant?.slug ?? '',
                    primary_color: primaryColor,
                    theme: selectedTheme,
                    business_type: businessType,
                  }}
                  profile={profile as any}
                  listings={listings
                    .filter((l) => l.published !== false)
                    .sort((a, b) => {
                      const ta = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
                      const tb = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
                      return tb - ta;
                    })
                    .slice(0, 9)
                    .map((l) => ({
                      id: l.id,
                      title: l.title,
                      body: null,
                      image_url: l.images?.[0] ?? null,
                      images: l.images ?? [],
                      price: l.price ?? null,
                      location: l.location ?? null,
                      bedrooms: l.bedrooms ?? null,
                      bathrooms: l.bathrooms ?? null,
                      area_sqm: l.area_sqm ?? null,
                      listing_status: l.listing_status ?? null,
                      offer_type: l.offer_type ?? null,
                      property_type: l.property_type ?? null,
                      card_style: l.card_style ?? null,
                      published: l.published !== false,
                      created_at: l.created_at ?? new Date().toISOString(),
                    }))}
                  news={(isDemoSession ? demoNews : newsItems)
                    .filter((n) => n.published !== false)
                    .sort((a, b) => {
                      const ta = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
                      const tb = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
                      return tb - ta;
                    })
                    .slice(0, 6)
                    .map((n) => ({
                      id: n.id,
                      title: n.title,
                      body: n.body ?? null,
                      image_url: n.image_url ?? n.images?.[0] ?? null,
                      images: n.images ?? [],
                      published: n.published !== false,
                      created_at: n.created_at ?? n.createdAt ?? new Date().toISOString(),
                      price: null,
                      location: null,
                      bedrooms: null,
                      bathrooms: null,
                      area_sqm: null,
                      listing_status: null,
                    }))}
                  gallery={(isDemoSession ? demoGallery : galleryItems)
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))}
                  team={isDemoSession ? demoTeam : teamItems}
                  isPreview={true}
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
