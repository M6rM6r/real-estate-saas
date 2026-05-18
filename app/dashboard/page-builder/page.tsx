'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { authFetch, isApiErrorStatus } from '@/lib/api';
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
  QrCode, Download, ChevronDown, ChevronUp, Megaphone, Search, Crop, SlidersHorizontal, LogOut,
  Sparkles, Eye, EyeOff, Wand2, Zap, Lock,
} from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop as CropType, type PixelCrop } from 'react-image-crop';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'react-image-crop/dist/ReactCrop.css';
import { normalizeWhatsAppTarget } from '@/lib/whatsapp';
import { isBillingPaid } from '@/lib/billing/paytabs';
import { getTenantTrialState } from '@/lib/billing/subscription';
import { buildDomainOptions, pickSelectedDomainUrl } from './utils';
import { useLanguage } from '@/app/dashboard/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { SessionRequiredCard } from '@/components/ui/session-required-card';

const PB_T = {
  ar: {
    cropTitle: 'اقتصاص الصورة', cancel: 'إلغاء', confirmCrop: 'تأكيد الاقتصاص',
    zoomLabel: 'التكبير', resetCrop: 'إعادة الضبط',
    changeImg: 'تغيير', clickUpload: 'اضغط لاختيار صورة', clickOrDrag: 'اضغط أو اسحب صورة هنا',
    changeImage: 'تغيير الصورة', uploadFailed: 'فشل الرفع', uploadHint: 'JPG · PNG · WebP · حتى 5 MB',
    removeImage: 'حذف الصورة', deleteImage: 'حذف',
    reorderSection: 'إعادة ترتيب القسم',
    sectionHero: 'القسم الرئيسي', sectionListings: 'العروض', sectionAbout: 'نبذة',
    sectionContact: 'التواصل', sectionWorkingHours: 'أوقات العمل', sectionFooter: 'التذييل',
    sun: 'الأحد', mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت',
    loadingPage: 'جاري تحميل إعدادات صفحتك...',
    pageBuilderTitle: 'منشئ الصفحة', pageBuilderSub: 'خصّص صفحتك العامة التي يراها عملاؤك',
    publicPageUrl: 'رابط صفحتك العامة',
    invalidBaseUrl: 'قيمة NEXT_PUBLIC_APP_URL غير صالحة — سيتم استخدام رابط البيئة الحالية.',
    missingBaseUrl: 'لم يتم ضبط NEXT_PUBLIC_APP_URL — يفضّل إضافتها في بيئة التشغيل.',
    autoSavingSoon: 'حفظ تلقائي خلال ثوانٍ...', saving: 'جاري الحفظ...', saved: 'تم الحفظ',
    copyLink: 'نسخ الرابط', copied: 'تم النسخ!', openPage: 'فتح الصفحة',
    signOut: 'تسجيل الخروج',
    loginNow: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    loginDialogTitle: 'الدخول إلى حسابك',
    loginEmailLabel: 'البريد الإلكتروني',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordShow: 'إظهار كلمة المرور',
    loginPasswordHide: 'إخفاء كلمة المرور',
    loginSubmit: 'دخول',
    loginWorking: 'جارٍ التحقق...',
    loginErrorFallback: 'تعذّر تسجيل الدخول، تحقق من البيانات وحاول مرة أخرى.',
    sessionRequiredTitle: 'يلزم تسجيل الدخول',
    sessionRequiredDesc: 'انتهت جلستك أو لم تقم بتسجيل الدخول. سجل الدخول للمتابعة.',
    retryLoad: 'إعادة المحاولة',
    qrTitle: 'رمز QR لصفحتك', downloadPng: 'تحميل PNG', whatsapp: 'واتساب',
    tabControl: '🎛️ تحكم', tabDesign: '🎨 التصميم', tabIdentity: '✍️ الهوية', tabListings: '🏠 العروض', tabConnect: '🔗 تواصل',
    pageControlTitle: '🎛️ تحكّم الصفحة', pageControlSub: 'اسحب الأقسام لتحديد ترتيب ظهورها على الصفحة العامة.',
    pageSettingsTitle: '🎛️ إعدادات الصفحة', heroHeadlineLabel: 'العنوان الرئيسي للصفحة',
    heroHeadlinePlaceholder: 'اكتشف أفضل العروض لديك', pageLangLabel: 'لغة الصفحة',
    showListingSortLabel: 'عرض أزرار الترتيب في العروض', showListingSortHint: 'يسمح للزوار بترتيب العروض حسب السعر أو الأحدث',
    chooseDesign: 'اختر تصميم صفحتك', chooseDesignSub: '',
    brandColor: '🎨 لون العلامة التجارية', brandColorHint: 'يُستخدم كلون رئيسي في صفحتك',
    logoLabel: '🖼️ الشعار (Logo)', logoUploadLabel: 'شعار المكتب — اضغط لرفع صورة',
    coverLabel: 'صورة الغلاف', coverHint: 'مقترح: 1200×400 بكسل أو أوسع',
    businessNameLabel: 'اسم المنشأة', businessNamePlaceholder: 'مثال: مطعم الواحة، مكتب الأفق، صالون نور...',
    businessTypeLabel: 'نوع النشاط التجاري', businessTypeSub: 'يحدد الحقول المتاحة في نماذج العروض',
    btRealEstate: 'عقارات', btRestaurant: 'مطعم / كافيه', btSalon: 'صالون / سبا',
    btRetail: 'متجر / بيع بالتجزئة', btServices: 'خدمات', btCarDealer: 'معرض سيارات', btOther: 'أخرى',
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
    fieldBedrooms: 'الغرف', fieldBathrooms: 'الحمامات', fieldArea: 'المساحة (م²)', fieldMake: 'الماركة / الفئة', fieldYear: 'سنة الصنع', fieldMileage: 'الكم (كم)',
    descriptionLabel: 'الوصف (اختياري)', descriptionPlaceholder: 'اكتب وصفاً تفصيلياً لهذا العرض...',
    mainImage: 'الصورة الرئيسية للعرض', extraPhotos: 'صور إضافية (اختياري)', addPhoto: 'إضافة صورة',
    notesLabel: 'ملاحظات (اختياري)', notesPlaceholder: 'أضف ملاحظات خاصة بهذا العرض (للاستخدام الداخلي فقط)...',
    publishLabel: 'نشر على الصفحة العامة', publishSub: 'إيقاف هذا يجعل العرض مسودة فقط',
    update: 'تحديث', noListings: 'لا توجد عروض مضافة بعد',
    statusAvailable: 'متاح', statusSold: 'مباع', statusRented: 'مؤجر', statusDraft: 'مسودة',
    editListing: 'تعديل', listingError: 'حدث خطأ، حاول مجدداً', areaSqm: 'م²',
    categoryPlaceholder: 'مثال: شقة، منتج، خدمة...', categoryPlaceholderCar: 'مثال: تويوتا، هيونداي، فورد...',
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
    zoomLabel: 'Zoom', resetCrop: 'Reset',
    changeImg: 'Change', clickUpload: 'Click to upload', clickOrDrag: 'Click or drag image here',
    changeImage: 'Change Image', uploadFailed: 'Upload failed', uploadHint: 'JPG · PNG · WebP · up to 5 MB',
    removeImage: 'Remove Image', deleteImage: 'Delete',
    reorderSection: 'Reorder section',
    sectionHero: 'Header', sectionListings: 'Listings', sectionAbout: 'About Us',
    sectionContact: 'Contact', sectionWorkingHours: 'Working Hours', sectionFooter: 'Footer',
    sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
    loadingPage: 'Loading your page settings...',
    pageBuilderTitle: 'Page Builder', pageBuilderSub: 'Customize your public page that clients see',
    publicPageUrl: 'Your Public Page URL',
    invalidBaseUrl: 'NEXT_PUBLIC_APP_URL value is invalid — the current environment URL will be used.',
    missingBaseUrl: 'NEXT_PUBLIC_APP_URL is not set — recommended to add it in production.',
    autoSavingSoon: 'Auto-saving in a few seconds...', saving: 'Saving...', saved: 'Saved',
    copyLink: 'Copy Link', copied: 'Copied!', openPage: 'Open Page',
    signOut: 'Sign out',
    loginNow: 'Login',
    createAccount: 'Create account',
    loginDialogTitle: 'Sign in to your account',
    loginEmailLabel: 'Email address',
    loginPasswordLabel: 'Password',
    loginPasswordShow: 'Show password',
    loginPasswordHide: 'Hide password',
    loginSubmit: 'Sign in',
    loginWorking: 'Checking...',
    loginErrorFallback: 'Could not sign in, please check your credentials and try again.',
    sessionRequiredTitle: 'Sign-in required',
    sessionRequiredDesc: 'Your session expired or you are not signed in. Please sign in to continue.',
    retryLoad: 'Retry',
    qrTitle: 'QR Code for Your Page', downloadPng: 'Download PNG', whatsapp: 'WhatsApp',
    tabControl: '🎛️ Control', tabDesign: '🎨 Design', tabIdentity: '✍️ Identity', tabListings: '🏠 Listings', tabConnect: '🔗 Connect',
    pageControlTitle: '🎛️ Page Control', pageControlSub: 'Drag sections to set their order on the public page.',
    pageSettingsTitle: '🎛️ Page Settings', heroHeadlineLabel: 'Main Page Headline',
    heroHeadlinePlaceholder: 'Discover the best listings', pageLangLabel: 'Page Language',
    showListingSortLabel: 'Show Sort Buttons on Listings', showListingSortHint: 'Lets visitors sort listings by price or newest',
    chooseDesign: 'Choose Your Page Design', chooseDesignSub: 'The design will be applied instantly to the preview and saved to your page',
    brandColor: '🎨 Brand Color', brandColorHint: 'Used as the primary color in your page',
    logoLabel: '🖼️ Logo', logoUploadLabel: 'Agency logo — click to upload',
    coverLabel: 'Cover Image', coverHint: 'Recommended: 1200×400 px or wider',
    businessNameLabel: 'Business Name', businessNamePlaceholder: 'e.g. Oasis Restaurant, Horizon Office, Noor Salon...',
    businessTypeLabel: 'Business Type', businessTypeSub: 'Determines available fields in listing forms',
    btRealEstate: 'Real Estate', btRestaurant: 'Restaurant / Café', btSalon: 'Salon / Spa',
    btRetail: 'Store / Retail', btServices: 'Services', btCarDealer: 'Car Dealer', btOther: 'Other',
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
    fieldBedrooms: 'Bedrooms', fieldBathrooms: 'Bathrooms', fieldArea: 'Area (sqm)', fieldMake: 'Make / Brand', fieldYear: 'Year', fieldMileage: 'Mileage (km)',
    descriptionLabel: 'Description (optional)', descriptionPlaceholder: 'Write a detailed description for this listing...',
    mainImage: 'Main Listing Image', extraPhotos: 'Additional Photos (optional)', addPhoto: 'Add Photo',
    notesLabel: 'Notes (optional)', notesPlaceholder: 'Add private notes about this listing (internal use only)...',
    publishLabel: 'Publish to Public Page', publishSub: 'Disabling this makes the listing a draft only',
    update: 'Update', noListings: 'No listings added yet',
    statusAvailable: 'Available', statusSold: 'Sold', statusRented: 'Rented', statusDraft: 'Draft',
    editListing: 'Edit', listingError: 'An error occurred, please try again', areaSqm: 'sqm',
    categoryPlaceholder: 'e.g. Apartment, Product, Service...', categoryPlaceholderCar: 'e.g. Toyota, Hyundai, Ford...',
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
  trial?: {
    isTrialConfigured: boolean;
    isTrialActive: boolean;
    isTrialExpired: boolean;
    daysLeft: number;
    expiresAt: string | null;
    subscriptionStatus: string;
  };
};

/* ── helpers for crop ── */
function centerAspectCrop(imgW: number, imgH: number, aspect: number): CropType {
  const preferredWidth = imgW >= imgH ? 90 : 78;
  return centerCrop(makeAspectCrop({ unit: '%', width: preferredWidth }, aspect, imgW, imgH), imgW, imgH);
}

function getInitialCrop(imgW: number, imgH: number, aspect?: number): CropType {
  if (aspect) return centerAspectCrop(imgW, imgH, aspect);
  return { unit: '%', x: 5, y: 5, width: 90, height: 90 };
}

function normalizeCropMimeType(mimeType?: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const normalized = (mimeType || '').toLowerCase();
  if (normalized.includes('png')) return 'image/png';
  if (normalized.includes('webp')) return 'image/webp';
  return 'image/jpeg';
}

async function getCroppedBlob(imgEl: HTMLImageElement, pixelCrop: PixelCrop, mimeType = 'image/jpeg'): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  const srcW = Math.max(1, Math.round(pixelCrop.width * scaleX));
  const srcH = Math.max(1, Math.round(pixelCrop.height * scaleY));
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is empty');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    imgEl,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    srcW,
    srcH,
    0,
    0,
    srcW,
    srcH,
  );

  const outputMime = normalizeCropMimeType(mimeType);
  const quality = outputMime === 'image/png' ? undefined : 0.98;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas is empty')), outputMime, quality);
  });
}

/* ── Crop modal ── */
function CropModal({
  src,
  aspectRatio,
  sourceMimeType,
  allowAspectChange = true,
  onConfirm,
  onCancel,
}: {
  src: string;
  aspectRatio?: number;
  sourceMimeType?: string;
  allowAspectChange?: boolean;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<CropType>();
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { lang } = useLanguage();
  const t = PB_T[lang as keyof typeof PB_T];

  useEffect(() => {
    setAspect(aspectRatio);
  }, [aspectRatio]);

  const resetCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    setCrop(getInitialCrop(img.naturalWidth, img.naturalHeight, aspect));
    setCompletedCrop(undefined);
  }, [aspect]);

  const applyAspect = useCallback((nextAspect?: number) => {
    setAspect(nextAspect);
    const img = imgRef.current;
    if (!img) return;
    setCrop(getInitialCrop(img.naturalWidth, img.naturalHeight, nextAspect));
    setCompletedCrop(undefined);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const nextCrop = getInitialCrop(naturalWidth, naturalHeight, aspect);
    setCrop(nextCrop);
  }, [aspect]);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop, sourceMimeType);
      onConfirm(blob);
    } catch {
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#12121a] border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Crop className="h-4 w-4 text-blue-400" />
          <span>{t.cropTitle}</span>
        </div>
        <div className="max-h-[72vh] overflow-auto rounded-xl border border-slate-800 bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(nextCrop) => setCrop(nextCrop)}
            onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
            aspect={aspect}
            keepSelection
            ruleOfThirds
            minWidth={80}
            minHeight={80}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="crop preview"
              onLoad={onImageLoad}
              className="block max-w-full w-auto h-auto max-h-[64vh] object-contain select-none"
            />
          </ReactCrop>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {allowAspectChange && (
              <>
                <span className="text-[11px] text-slate-500">{lang === 'ar' ? 'النسبة' : 'Aspect'}</span>
                {[
                  { label: lang === 'ar' ? 'حر' : 'Free', value: undefined as number | undefined },
                  { label: '16:9', value: 16 / 9 },
                  { label: '4:3', value: 4 / 3 },
                  { label: '1:1', value: 1 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => applyAspect(item.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${aspect === item.value ? 'text-white border-blue-500 bg-blue-500/20' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
            {!allowAspectChange && (
              <span className="text-xs text-slate-500">{aspectRatio === 1 ? '1:1' : '16:9'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetCrop}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {t.resetCrop}
            </button>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!completedCrop || isSubmitting}
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors inline-flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.confirmCrop}
              </button>
            </div>
          </div>
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
  const t = PB_T[lang as keyof typeof PB_T];

  const aspectRatio = aspect === 'square' ? 1 : 16 / 9;
  const allowAspectChange = aspect !== 'square';

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
  }, [isDemo, onChange, t.uploadFailed]);

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
          sourceMimeType={pendingFile?.type}
          allowAspectChange={allowAspectChange}
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
                <Image src={value} alt="preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" />
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
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              title={t.removeImage}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e: React.DragEvent) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="w-full cursor-pointer group"
        >
          {value ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-700">
              <Image src={value} alt="cover preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 640px" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ImageIcon className="h-4 w-4" /> {t.changeImage}</>}
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                  title={t.removeImage}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-40 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-2">
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
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
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
  about: { icon: '👥', label: 'نبذة' },
  contact: { icon: '📞', label: 'التواصل' },
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
  const t = PB_T[lang as keyof typeof PB_T];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`px-4 py-3 flex items-center justify-between gap-3 border-b last:border-b-0 border-white/[0.05] transition-colors ${isDragging ? 'bg-indigo-500/10' : 'hover:bg-white/[0.025]'}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t.reorderSection}
          className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing transition-colors p-0.5"
          {...attributes}
          {...listeners}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <circle cx="5" cy="3.5" r="1.3"/><circle cx="11" cy="3.5" r="1.3"/>
            <circle cx="5" cy="8" r="1.3"/><circle cx="11" cy="8" r="1.3"/>
            <circle cx="5" cy="12.5" r="1.3"/><circle cx="11" cy="12.5" r="1.3"/>
          </svg>
        </button>
        <span className="text-base select-none">{SECTION_ORDER_LABELS[sectionKey].icon}</span>
        <span className={`text-sm font-medium ${enabled ? 'text-slate-200' : 'text-slate-500'}`}>{t[SECTION_LABEL_KEY[sectionKey]]}</span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 ${enabled ? 'bg-indigo-600' : 'bg-slate-700/80'}`}
        style={enabled ? {boxShadow:'0 0 10px rgba(99,102,241,0.45)'} : {}}
        aria-pressed={enabled}
      >
        <span className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} style={{width:'18px',height:'18px'}} />
      </button>
    </div>
  );
}

const DEFAULT_PAGE_CONFIG: NonNullable<Profile['page_config']> = {
  hero_headline: 'مرحباً بكم',
  listings_columns: 3,
  show_listing_filters: true,
  show_listing_search: true,
  show_listing_sort: true,
  filter_label_all: 'الكل',
  filter_label_all_types: 'كل الأنواع',
  filter_label_all_status: 'كل الحالات',
  hero_style: 'centered',
  hero_cta_text: 'تواصل عبر واتساب',
  button_shape: 'soft',
  headingFont: 'inherit',
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
  { id: 'l1', title: 'قصر ملكي في حي الملقا', body: 'قصر فاخر بتشطيبات كلاسيكية راقية، مجالس فسيحة وحدائق خاصة في أرقى أحياء الرياض.', price: 18500000, location: 'حي الملقا، الرياض', bedrooms: 7, bathrooms: 8, area_sqm: 1100, listing_status: 'available' as const, offer_type: 'sale', property_type: 'قصر', images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l2', title: 'فيلا فاخرة في حي النرجس', body: 'فيلا حديثة بتصميم عربي أصيل، مسبح خاص ومجلس رجال مستقل في موقع متميز.', price: 6800000, location: 'حي النرجس، الرياض', bedrooms: 5, bathrooms: 6, area_sqm: 580, listing_status: 'available' as const, offer_type: 'sale', property_type: 'فيلا', images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l3', title: 'شقة فندقية في برج المملكة', body: 'شقة راقية في أيقونة الرياض المعمارية مع إطلالات خلابة على مدينة الرياض وخدمة فندقية على مدار الساعة.', price: 3400000, location: 'برج المملكة، الرياض', bedrooms: 3, bathrooms: 3, area_sqm: 210, listing_status: 'available' as const, offer_type: 'sale', property_type: 'شقة', images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l4', title: 'دوبلكس في حي السفارات', body: 'دوبلكس واسع في الحي الدبلوماسي بتشطيبات أوروبية فاخرة وموقع استراتيجي قرب الخدمات.', price: 4200000, location: 'حي السفارات، الرياض', bedrooms: 4, bathrooms: 4, area_sqm: 320, listing_status: 'available' as const, offer_type: 'rent', property_type: 'دوبلكس', images: ['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l5', title: 'فيلا بحرية في كورنيش جدة', body: 'فيلا على الكورنيش مباشرة مع إطلالة بحرية ساحرة، تراس خاص وتشطيبات مودرن فاخرة.', price: 9200000, location: 'كورنيش جدة، جدة', bedrooms: 5, bathrooms: 5, area_sqm: 620, listing_status: 'available' as const, offer_type: 'sale', property_type: 'فيلا', images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
  { id: 'l6', title: 'عمارة سكنية في حي العليا', body: 'عمارة سكنية كاملة في قلب حي العليا التجاري، فرصة استثمارية ذهبية بعائد إيجاري مرتفع.', price: 22000000, location: 'حي العليا، الرياض', bedrooms: 0, bathrooms: 0, area_sqm: 2400, listing_status: 'available' as const, offer_type: 'sale', property_type: 'عمارة', images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'], published: true, created_at: new Date().toISOString() },
];

const demoNews = [
  { id: 'n1', title: 'سوق العقارات السعودي يشهد نمواً قياسياً في 2026', body: 'ارتفعت صفقات العقارات في الرياض وجدة بنسبة 28% مقارنة بالعام الماضي، مدفوعةً برؤية 2030 ومشاريع التطوير الكبرى في مختلف مناطق المملكة.', image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  { id: 'n2', title: 'مشاريع نيوم تُعيد رسم خريطة الاستثمار العقاري في المملكة', body: 'أعلنت هيئة تطوير منطقة تبوك عن طرح وحدات سكنية فاخرة في مشروع ذا لاين، مما أشعل شهية المستثمرين المحليين والدوليين.', image_url: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
  { id: 'n3', title: 'الدرعية تتصدر قائمة أكثر المناطق طلباً للسكن الفاخر', body: 'كشف تقرير وزارة الإسكان أن حي الدرعية التراثي يستقطب أعلى نسبة من طلبات الشراء للعقارات الفاخرة خلال الربع الأول من 2026.', image_url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600', images: [], published: true, created_at: new Date().toISOString(), price: null, location: null, bedrooms: null, bathrooms: null, area_sqm: null, listing_status: null },
];

const demoGallery = [
  { id: 'g1', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'قصر الملقا من الخارج', sort_order: 0 },
  { id: 'g2', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'صالة استقبال فاخرة', sort_order: 1 },
  { id: 'g3', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'فيلا النرجس - المسبح', sort_order: 2 },
  { id: 'g4', url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'إطلالة الرياض الليلية', sort_order: 3 },
  { id: 'g5', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'كورنيش جدة', sort_order: 4 },
  { id: 'g6', url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800', label: 'شقة برج المملكة', sort_order: 5 },
];

const demoTeam = [
  { id: 't1', email: 'khalid@alazizia-properties.sa', role: 'agent', display_name: 'خالد العتيبي', photo_url: '', phone: '+966500000001' },
  { id: 't2', email: 'noura@alazizia-properties.sa', role: 'agent', display_name: 'نورة الشمري', photo_url: '', phone: '+966500000002' },
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

const BUILDER_THEME_IDS = ['modern', 'luxury', 'nature', 'ocean', 'desert', 'midnight'] as const;
type BuilderThemeId = (typeof BUILDER_THEME_IDS)[number];

function normalizeBuilderThemeId(theme?: string): BuilderThemeId {
  if (!theme) return 'modern';
  if (BUILDER_THEME_IDS.includes(theme as BuilderThemeId)) return theme as BuilderThemeId;

  const aliases: Record<string, BuilderThemeId> = {
    minimal: 'modern',
    vintage: 'luxury',
    neon: 'ocean',
    cosmic: 'midnight',
  };

  return aliases[theme] ?? 'modern';
}

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
  const router = useRouter();
  const { lang, toggleLang } = useLanguage();
  const { toast } = useToast();
  const t = PB_T[lang as keyof typeof PB_T];
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
  const [selectedTheme, setSelectedTheme] = useState<BuilderThemeId>('modern');
  const [businessType, setBusinessType] = useState<string>('real_estate');
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTrigger = useRef(false);
  const [autoSavePending, setAutoSavePending] = useState(0);
  const pendingImageAutoSave = useRef(false);
  const handleSaveRef = useRef<(() => Promise<void>) | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [teamItems, setTeamItems] = useState<any[]>([]);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [listingForm, setListingForm] = useState({ title: '', price: '', location: '', bedrooms: '', bathrooms: '', area_sqm: '', image: '', extra_images: [] as string[], card_style: 'standard', status: 'available', offer_type: 'sale', property_type: '', body: '', notes: '' });
  const [listingSaving, setListingSaving] = useState(false);
  const [listingError, setListingError] = useState('');
  const [listingPublished, setListingPublished] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [selectedDomainUrl, setSelectedDomainUrl] = useState('');
  const [activeTab, setActiveTab] = useState('design');
  const [showChecklist, setShowChecklist] = useState(false);
  const isPaymentLockEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENT_LOCK === 'true';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const isCarDealer = businessType === 'car_dealer';
  const usesRealEstateFields = !businessType || businessType === 'real_estate';

  const refreshTenantBillingState = useCallback(async () => {
    const res = await authFetch<ProfileResponse>('/api/dashboard/profile')
    setData((prev) => {
      if (!prev) return res
      return {
        ...prev,
        tenant: {
          ...(prev.tenant ?? {}),
          ...(res.tenant ?? {}),
        } as ProfileResponse['tenant'],
      }
    })
    return res
  }, [])

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
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalHost) return;
    if (!('serviceWorker' in navigator) || !('caches' in window)) return;

    const resetKey = 'wa9l_local_sw_reset_v1';

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        if (!registrations.length) return;

        await Promise.all(registrations.map((registration) => registration.unregister()));

        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));

        if (!sessionStorage.getItem(resetKey)) {
          sessionStorage.setItem(resetKey, '1');
          window.location.reload();
        }
      })
      .catch(() => {
        // Best effort only.
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applyDemoState = () => {
      if (cancelled) return;
      setIsDemoSession(true);
      const d = {
        profile: {
          tenant_id: 'demo',
          logo_url: '',
          cover_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600',
          bio: 'العزيزية للعقارات وكالة متخصصة في العقارات السكنية والتجارية الفاخرة في الرياض وجدة، نقدم خدمات احترافية بخبرة تمتد لأكثر من 15 عاماً.',
          tagline: 'اعثر على منزل أحلامك',
          contact_email: 'info@alazizia-properties.sa',
          contact_phone: '+966500000000',
          extra_phones: ['+966559707955'],
          contact_address: 'حي العليا، الرياض، المملكة العربية السعودية',
          licence_no: 'فال-٢٠٢٣-١٢٣٤',
          licence_numbers: [{ label: 'رقم الفال', number: 'فال-٢٠٢٣-١٢٣٤' }],
          social_links: {
            instagram: 'alazizia_properties',
            x: '',
            linkedin: '',
            whatsapp: '966500000000',
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
            news: false,
            contact: true,
            working_hours: true,
            footer: true,
          },
          page_config: {
            hero_headline: 'اعثر على منزل أحلامك',
            hero_style: 'centered' as 'centered' | 'split' | 'minimal',
            hero_cta_text: 'تصفح العروض',
            show_listing_filters: true,
            show_listing_search: true,
            listings_columns: 3 as 2 | 3 | 4,
            currency: 'SAR',
          },
        },
        tenant: {
          id: 'demo',
          slug: 'demo',
          name: 'العزيزية للعقارات',
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
      setSelectedTheme(normalizeBuilderThemeId(d.tenant.theme));
      setBusinessType((d.tenant as any).business_type || 'real_estate');
      setListings(demoListings);
      setNewsItems(demoNews);
      setGalleryItems(demoGallery);
      setTeamItems(demoTeam);
      setLoading(false);
    };

    const hasDemoStorage = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo_auth') === 'true';
    const hasDemoCookie = typeof document !== 'undefined' && /(?:^|;\s*)demo_session=1(?:;|$)/.test(document.cookie);
    if (hasDemoStorage || hasDemoCookie) {
      applyDemoState();
      return;
    }

    (async () => {
      try {
        const profileRes = await authFetch<ProfileResponse>('/api/dashboard/profile');
        const [listingsRes, newsRes, mediaRes] = await Promise.all([
          authFetch<{ data: any[] }>('/api/dashboard/listings').catch(() => ({ data: [] })),
          authFetch<any[]>('/api/dashboard/news').catch(() => []),
          authFetch<any[]>('/api/dashboard/media').catch(() => []),
        ]);

        if (cancelled) return;
        setAuthRequired(false);
        setIsDemoSession(false);
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
        setSelectedTheme(normalizeBuilderThemeId(profileRes.tenant?.theme));
        setBusinessType((profileRes.tenant as any)?.business_type || 'real_estate');
        setListings(listingsRes.data ?? []);
        setNewsItems(Array.isArray(newsRes) ? newsRes : []);
        setGalleryItems(Array.isArray(mediaRes) ? mediaRes : []);
        setTeamItems([]);
      } catch (error) {
        if (cancelled) return;
        if (isApiErrorStatus(error, 401)) {
          setAuthRequired(true);
          setShowLoginModal(true);
          setIsDemoSession(false);
          setData(null);
          setListings([]);
          setNewsItems([]);
          setGalleryItems([]);
          setTeamItems([]);
          return;
        }

        toast({
          title: lang === 'ar' ? 'تعذر تحميل البيانات' : 'Could not load data',
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, toast, loadNonce]);

  useEffect(() => {
    if (isDemoSession) return
    if ((data?.tenant as any)?.billing_status !== 'pending') return

    let attempts = 0
    const maxAttempts = 8
    const interval = setInterval(() => {
      attempts += 1
      void refreshTenantBillingState()
        .then((res) => {
          if (isBillingPaid((res.tenant as any)?.billing_status)) {
            toast({
              title: lang === 'ar' ? 'تم تفعيل الرابط' : 'URL unlocked',
              description: lang === 'ar' ? 'اكتملت عملية الدفع بنجاح.' : 'Payment completed successfully.',
            })
            clearInterval(interval)
          }
        })
        .catch(() => {})

      if (attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [data?.tenant, isDemoSession, lang, refreshTenantBillingState, toast]);

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
    setProfile((prev: Profile) => ({ ...prev, ...patch }));
    markDirty();
    if ('logo_url' in patch || 'cover_url' in patch) {
      pendingImageAutoSave.current = true;
    }
    const keys = Object.keys(patch);
    if (keys.length) setFieldErrors((prev: Record<string, string>) => { const n = { ...prev }; keys.forEach(k => delete n[k]); return n; });
  };

  const updateSocial = (key: string, value: string) => {
    setProfile((prev: Profile) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
    markDirty();
    setFieldErrors((prev: Record<string, string>) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const normalizeWhatsappInput = () => {
    const current = profile.social_links?.whatsapp || '';
    const normalized = normalizeWhatsAppTarget(current) || '';
    if (normalized === current) return;
    setProfile((prev: Profile) => ({
      ...prev,
      social_links: { ...prev.social_links, whatsapp: normalized },
    }));
    markDirty();
  };

  const toggleSection = (key: SectionOrderKey) => {
    setProfile((prev: Profile) => ({
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
    setListings((prev: any[]) => prev.filter((l) => l.id !== id));
    if (!isDemo) {
      try {
        await authFetch(`/api/dashboard/listings/${id}`, { method: 'DELETE' });
      } catch {
        authFetch<{ data: any[] }>('/api/dashboard/listings')
          .then((r: any) => setListings(r.data ?? []))
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
      toast({
        title: lang === 'ar' ? 'فشل الحفظ التلقائي' : 'Auto-save failed',
        description: lang === 'ar' ? 'تعذّر حفظ التغييرات، حاول مجدداً.' : 'Could not save changes, please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    handleSaveRef.current = handleSave;
  }); // no dep array — syncs ref every render, intentional

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (saveStatus !== 'saving' && dirty && handleSaveRef.current) {
          void handleSaveRef.current();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, saveStatus]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

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
    navigator.clipboard.writeText(selectedPublicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlockUrls = async () => {
    setPaying(true);
    try {
      const res = await authFetch<{ checkoutUrl?: string; alreadyPaid?: boolean }>('/api/billing/paytabs/create-session', {
        method: 'POST',
      });

      if (res.alreadyPaid) {
        toast({
          title: lang === 'ar' ? 'الرابط مفعل بالفعل' : 'URL already unlocked',
          description: lang === 'ar' ? 'يمكنك الآن مشاركة رابط صفحتك.' : 'You can now share your public page URL.',
        });
        return;
      }

      if (!res.checkoutUrl) {
        throw new Error(lang === 'ar' ? 'تعذر إنشاء رابط الدفع' : 'Unable to create payment link')
      }

      window.location.assign(res.checkoutUrl);
    } catch (error) {
      toast({
        title: lang === 'ar' ? 'تعذر بدء عملية الدفع' : 'Could not start payment',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setPaying(false);
    }
  };

  const handleSignOut = async () => {
    const logout = (window as any).__dashboardLogout;
    if (typeof logout === 'function') {
      await logout();
    }
  };

  const handleDemoLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const cred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const token = await cred.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(data.error || t.loginErrorFallback);
      }

      sessionStorage.removeItem('demo_auth');
      document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
      setShowLoginModal(false);
      setLoginPassword('');
      router.push('/dashboard/page-builder');
      router.refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : t.loginErrorFallback);
    } finally {
      setLoginLoading(false);
    }
  };

  const downloadQr = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 360; canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, 360, 360); canvas.toBlob((blob) => { if (!blob) return; const a = document.createElement('a'); const objUrl = URL.createObjectURL(blob); a.href = objUrl; a.download = `qr-${slug || 'page'}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(objUrl), 1000); }); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const slug = data?.tenant?.slug || '';
  const customDomain = data?.tenant?.custom_domain || '';
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

  const hostedUrl = slug ? `https://wa9l.website/${slug}` : 'https://wa9l.website';

  const tenantAny = data?.tenant as any;
  const extraRawDomains = [
    ...(Array.isArray(tenantAny?.domains) ? tenantAny.domains : []),
    ...(Array.isArray(tenantAny?.custom_domains) ? tenantAny.custom_domains : []),
    ...(Array.isArray(tenantAny?.domain_aliases) ? tenantAny.domain_aliases : []),
  ];

  const domainOptions = buildDomainOptions({
    customDomain,
    extraDomains: customDomain ? extraRawDomains : [],
    hostedUrl,
    runtimeOrigin,
    slug,
  });

  const selectedPublicUrl = pickSelectedDomainUrl(selectedDomainUrl, domainOptions, hostedUrl);
  const selectedDisplayUrl = selectedPublicUrl.replace(/^https?:\/\//, '');
  const billingStatus = (data?.tenant as any)?.billing_status;
  const trialState = data?.trial ?? getTenantTrialState((data?.tenant as any) ?? {});
  const isTenantPaid = isBillingPaid(billingStatus) || Boolean((data?.tenant as any)?.paid);
  const isUrlUnlocked = !isPaymentLockEnabled || isDemoSession || isTenantPaid || trialState.isTrialActive;

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

  if (authRequired && !isDemoSession) {
    return (
      <SessionRequiredCard
        className="mx-auto w-full max-w-xl py-12 px-4"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        title={t.sessionRequiredTitle}
        description={t.sessionRequiredDesc}
        retryLabel={t.retryLoad}
        loginLabel={t.loginNow}
        signupLabel={t.createAccount}
        onRetry={() => {
          setAuthRequired(false);
          setLoading(true);
          setLoadNonce((v) => v + 1);
        }}
      />
    );
  }

  const shouldShowInvalidUrlWarning = Boolean(configuredBaseUrl) && !isConfiguredBaseUrlValid;
  const shouldShowMissingUrlInfo = !configuredBaseUrl;
  const sections = { ...DEFAULT_PAGE_SECTIONS, ...(profile.page_sections ?? {}) };
  const pageConfig = { ...DEFAULT_PAGE_CONFIG, ...(profile.page_config ?? {}) };
  const activeTheme = PAGE_THEMES[selectedTheme] ?? PAGE_THEMES.modern;
  const displayCurrency = pageConfig.currency === 'SAR' || pageConfig.currency === 'ر.س' ? '⃁' : (pageConfig.currency || 'SAR');
  const enabledPreviewSections = SECTION_ORDER_KEYS.reduce((count, key) => {
    return count + ((sections[key] ?? DEFAULT_PAGE_SECTIONS[key]) ? 1 : 0);
  }, 0);
  const previewMinHeightClass = enabledPreviewSections <= 3
    ? 'min-h-[420px]'
    : enabledPreviewSections <= 4
      ? 'min-h-[500px]'
      : 'min-h-[620px]';

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 pb-10 relative" dir="rtl">
      <style>{`
        @keyframes wa9l-orb-a { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-40px) scale(1.08)} 66%{transform:translate(-30px,25px) scale(0.95)} }
        @keyframes wa9l-orb-b { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,30px) scale(1.06)} 66%{transform:translate(35px,-25px) scale(0.97)} }
        @keyframes wa9l-orb-c { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,40px) scale(1.04)} }
        @keyframes wa9l-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes wa9l-pulse-ring { 0%{transform:scale(.95);opacity:.6} 50%{opacity:.25} 100%{transform:scale(1.4);opacity:0} }
        @keyframes wa9l-fade-up { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        .wa9l-fade { animation: wa9l-fade-up .35s ease-out both; }
        .wa9l-glass {
          background: rgba(5,5,18,0.64);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.055), 0 4px 28px rgba(0,0,0,0.28);
        }
        .wa9l-glass-strong {
          background: linear-gradient(135deg, rgba(13,13,32,0.85), rgba(8,8,22,0.78));
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 12px 40px rgba(0,0,0,0.45), 0 0 60px rgba(99,102,241,0.05);
        }
        .wa9l-tab-trigger { position: relative; overflow: hidden; }
        .wa9l-tab-trigger[data-state="active"]::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(circle at 50% 120%, rgba(255,255,255,0.18), transparent 60%);
          pointer-events:none;
        }
        .wa9l-phone-frame {
          background: linear-gradient(180deg, #1a1a2e, #0a0a18);
          border-radius: 38px;
          padding: 12px;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.6), 0 0 100px rgba(99,102,241,0.12);
        }
        .wa9l-pulse-dot { position: relative; }
        .wa9l-pulse-dot::after {
          content:''; position:absolute; inset:-4px; border-radius:9999px;
          background: currentColor; opacity:.5;
          animation: wa9l-pulse-ring 1.8s ease-out infinite;
        }
        .wa9l-card {
          background: linear-gradient(160deg, rgba(15,23,42,0.82) 0%, rgba(3,7,18,0.76) 100%);
          border: 1px solid rgba(148,163,184,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.28);
        }
        .wa9l-gradient-text {
          background: linear-gradient(135deg,#38bdf8 0%,#60a5fa 50%,#93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .wa9l-field {
          background: rgba(8,15,28,0.85) !important;
          border-color: rgba(71,85,105,0.6) !important;
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .wa9l-field:focus,.wa9l-field:focus-visible {
          border-color: rgba(56,189,248,0.75) !important;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15) !important;
          outline: none;
        }
        /* Builder panel readability bump (does NOT affect built/public page preview) */
        .builder-panel .text-xs { font-size: 0.84rem; line-height: 1.25rem; }
        .builder-panel .text-[10px] { font-size: 0.74rem; line-height: 1.1rem; }
        .builder-panel .text-[11px] { font-size: 0.78rem; line-height: 1.15rem; }
        .builder-panel .wa9l-field { font-size: 0.95rem; line-height: 1.45rem; }
        .builder-panel .wa9l-tab-trigger { font-size: 0.92rem; }
        /* thin scrollbar for editor panel */
        .pb-scroll { scrollbar-width: thin; scrollbar-color: rgba(71,85,105,0.5) transparent; }
        .pb-scroll::-webkit-scrollbar { width: 3px; }
        .pb-scroll::-webkit-scrollbar-track { background: transparent; }
        .pb-scroll::-webkit-scrollbar-thumb { background: rgba(71,85,105,0.55); border-radius: 99px; }
        .pb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.75); }
      `}</style>
      {/* ambient orbs */}
      <div aria-hidden="true" style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-8%',right:'12%',width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle,rgba(14,165,233,0.14) 0%,transparent 70%)',filter:'blur(70px)',animation:'wa9l-orb-a 18s ease-in-out infinite'}} />
        <div style={{position:'absolute',top:'35%',left:'3%',width:'450px',height:'450px',borderRadius:'50%',background:'radial-gradient(circle,rgba(30,58,138,0.18) 0%,transparent 70%)',filter:'blur(60px)',animation:'wa9l-orb-b 22s ease-in-out infinite'}} />
        <div style={{position:'absolute',bottom:'8%',right:'28%',width:'380px',height:'380px',borderRadius:'50%',background:'radial-gradient(circle,rgba(51,65,85,0.22) 0%,transparent 70%)',filter:'blur(55px)',animation:'wa9l-orb-c 26s ease-in-out infinite'}} />
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrModal && isUrlUnlocked} onOpenChange={setShowQrModal}>
        <DialogContent className="wa9l-glass text-white max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-400" /> {t.qrTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                id="qr-svg"
                value={selectedPublicUrl}
                size={200}
                fgColor={activeTheme.accent}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-slate-400 font-mono break-all text-center">{selectedDisplayUrl}</p>
            <div className="flex gap-2 w-full">
              <Button onClick={downloadQr} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4" /> {t.downloadPng}
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('صفحتي: ' + selectedPublicUrl)}`}
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

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="wa9l-glass text-white max-w-md" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-white">{t.loginDialogTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="builder-login-email" className="text-slate-300 text-xs uppercase tracking-wider">{t.loginEmailLabel}</Label>
              <Input
                id="builder-login-email"
                type="email"
                value={loginEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
                required
                dir="ltr"
                autoComplete="email"
                className="wa9l-field text-white"
                placeholder="you@agency.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="builder-login-password" className="text-slate-300 text-xs uppercase tracking-wider">{t.loginPasswordLabel}</Label>
              <div className="relative">
                <Input
                  id="builder-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                  className="wa9l-field text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                  aria-label={showPassword ? t.loginPasswordHide : t.loginPasswordShow}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loginLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                {loginLoading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t.loginWorking}</span>
                ) : t.loginSubmit}
              </Button>
              <Link href="/signup" className="text-center text-xs text-cyan-300 hover:text-cyan-200 transition-colors">
                {t.createAccount}
              </Link>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="mb-1 relative z-10 wa9l-fade flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold wa9l-gradient-text tracking-tight leading-tight">{t.pageBuilderTitle}</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{t.pageBuilderSub}</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemoSession && (
            <>
              <span className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-emerald-300/25 bg-emerald-500/10 text-emerald-200 text-xs font-semibold tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {lang === 'ar' ? 'عرض مباشر' : 'LIVE DEMO'}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setLoginError('');
                  setShowLoginModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 text-white gap-2 text-sm font-semibold transition-all shadow-[0_0_24px_rgba(99,102,241,0.45)] ring-1 ring-indigo-300/25 hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                {t.loginNow}
              </Button>
              <Link href="/signup">
                <Button size="sm" variant="ghost" className="h-10 px-3.5 rounded-xl border border-cyan-300/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-300/40 text-xs font-medium transition-all">
                  {t.createAccount}
                </Button>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-blue-200 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all text-sm font-medium"
            title={lang === 'ar' ? 'Switch to English' : 'تبديل إلى العربية'}
          >
            {lang === 'ar' ? '🇬🇧 EN' : '🇸🇦 AR'}
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 wa9l-glass rounded-3xl px-5 py-4 relative z-10">
        <div className="min-w-0 flex items-center gap-3">
          {isUrlUnlocked ? (
            <>
              <div className="flex items-center gap-2 bg-black/25 border border-blue-400/15 rounded-2xl px-3 py-2 min-w-0 max-w-xs sm:max-w-md">
                <Globe className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                {domainOptions.length > 1 ? (
                  <select
                    value={selectedPublicUrl}
                    onChange={(e) => setSelectedDomainUrl(e.target.value)}
                    className="bg-transparent text-blue-200 font-mono text-xs truncate outline-none border-none max-w-[220px]"
                    title={lang === 'ar' ? 'اختر النطاق' : 'Choose domain'}
                  >
                    {domainOptions.map((d) => (
                      <option key={d.url} value={d.url} className="bg-slate-900 text-slate-100">
                        {d.display}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-blue-200 font-mono text-xs truncate">{selectedDisplayUrl}</p>
                )}
              </div>
              {shouldShowInvalidUrlWarning && (
                <p className="text-xs text-red-400 flex items-center gap-1 shrink-0">
                  <AlertCircle className="h-3 w-3" />{t.invalidBaseUrl}
                </p>
              )}
              {shouldShowMissingUrlInfo && (
                <p className="text-xs text-amber-400 flex items-center gap-1 shrink-0">
                  <AlertCircle className="h-3 w-3" />{t.missingBaseUrl}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl px-3 py-2 min-w-0">
              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <p className="text-xs text-amber-200">
                {trialState.isTrialExpired
                  ? (lang === 'ar' ? 'انتهت الفترة التجريبية — أكمل الدفع لإظهار رابط صفحتك.' : 'Trial expired — complete payment to unlock your page URL.')
                  : (lang === 'ar' ? 'رابط صفحتك مخفي حتى إتمام الدفع لمرة واحدة.' : 'Your page URL is hidden until one-time payment is completed.')}
              </p>
            </div>
          )}

          {!isDemoSession && trialState.isTrialActive && (
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/25 rounded-2xl px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-xs text-blue-200">
                {lang === 'ar' ? `فترة تجريبية: ${trialState.daysLeft} يوم متبقي` : `Trial: ${trialState.daysLeft} day(s) left`}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {dirty && saveStatus !== 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {lang === 'ar' ? 'حفظ تلقائي...' : 'Saving soon...'}
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/40 rounded-full px-3 py-1">
              <Loader2 className="h-3 w-3 animate-spin" />{t.saving}
            </span>
          )}
          {saveStatus === 'saved' && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
              <Check className="h-3 w-3" />{t.saved}
            </span>
          )}
          <div className="flex items-center gap-1">
            {isUrlUnlocked ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setShowQrModal(true)} className="h-8 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] gap-1.5 text-xs transition-all">
                  <QrCode className="h-3.5 w-3.5" /> QR
                </Button>
                <Button size="sm" variant="ghost" onClick={copyLink} className="h-8 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] gap-1.5 text-xs transition-all">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t.copied : t.copyLink}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(selectedPublicUrl, '_blank', 'noopener,noreferrer')} className="h-8 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/20 gap-1.5 text-xs transition-all">
                  <ExternalLink className="h-3.5 w-3.5" /> {t.openPage}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleUnlockUrls}
                disabled={paying}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs transition-all"
              >
                {paying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                {lang === 'ar' ? 'ادفع الآن لإظهار الرابط' : 'Pay now to unlock URL'}
              </Button>
            )}
            {!isDemoSession && (
              <Button size="sm" variant="ghost" onClick={() => void handleSignOut()} className="h-8 px-2.5 rounded-xl text-slate-500 hover:text-red-300 hover:bg-red-500/10 transition-all">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main artistic square workspace */}
      <div className="relative z-10 w-full rounded-[2rem] overflow-hidden xl:min-h-[840px] p-3 md:p-4 lg:p-5" style={{background:'linear-gradient(145deg,rgba(5,5,20,0.78),rgba(12,16,36,0.68))',backdropFilter:'blur(28px)',WebkitBackdropFilter:'blur(28px)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 0 60px rgba(99,102,241,0.10),0 0 120px rgba(139,92,246,0.07),inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div className="grid h-full xl:grid-cols-[minmax(500px,1fr)_minmax(620px,1.2fr)] gap-4 lg:gap-5 items-stretch">

        {/* Editor panel */}
        <div className="builder-panel space-y-5 min-w-0 relative z-20 xl:col-start-1 xl:row-start-1 xl:h-full xl:overflow-y-auto xl:pr-2 pb-scroll">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <TabsList className="sticky top-0 z-30 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 wa9l-glass-strong rounded-2xl p-1.5 h-auto gap-1">
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
                  className="wa9l-tab-trigger flex items-center justify-center gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-600 data-[state=active]:via-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/40 data-[state=active]:scale-[1.02] text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl py-2.5 px-3 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── CONTROL: unified page control panel ── */}
            <TabsContent value="control" className="mt-4 space-y-4">
              <div className="wa9l-card rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] space-y-2">
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

              <div className="wa9l-card rounded-2xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.pageSettingsTitle}
                </p>

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
              <div className="wa9l-card rounded-2xl p-4 xl:p-5">
                <p className="text-sm font-bold text-white mb-1">{t.chooseDesign}</p>
                <p className="text-slate-400 text-sm mb-4">{t.chooseDesignSub}</p>
                <div className="grid grid-cols-2 gap-3">
                  {BUILDER_THEME_IDS.map((themeId) => PAGE_THEMES[themeId]).map((theme: any) => (
                    <button
                      key={theme.id}
                      onClick={() => { 
                        setSelectedTheme(theme.id as BuilderThemeId); 
                        updatePageConfig({ 
                          button_shape: theme.buttonShape
                        });
                        markDirty(); 
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 group ${
                        selectedTheme === theme.id ? 'border-indigo-400 shadow-xl shadow-indigo-500/25 scale-[1.02] ring-1 ring-indigo-400/30' : 'border-slate-700/60 hover:border-slate-500 hover:scale-[1.01]'
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
                        <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}55)` }}>
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

                      {/* Label overlay with emoji at bottom */}
                      <div className="flex items-center justify-between px-2.5 py-2" style={{ backgroundColor: theme.dark ? '#111' : '#f8fafc', borderTop: `1px solid ${theme.cardBorder}` }}>
                        <div className="flex flex-col gap-0.5 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">{theme.emoji}</span>
                            <p className="text-xs font-bold" style={{ color: theme.dark ? '#fff' : '#0f172a', fontFamily: theme.headingFont }}>{theme.label}</p>
                          </div>
                          <p className="text-[10px] text-gray-400">{theme.description}</p>
                        </div>
                      </div>

                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 left-2 bg-indigo-500 rounded-full p-1 shadow-lg shadow-indigo-500/40">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.brandColor}
                </p>
                <div className="flex flex-wrap gap-2 mb-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setPrimaryColor(c); markDirty(); }}
                      title={c}
                      aria-label={`Choose brand color ${c}`}
                      className="h-8 w-8 rounded-full border-2 transition-all hover:scale-110 hover:shadow-lg"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPrimaryColor(e.target.value); markDirty(); }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="h-9 w-14 rounded-lg border-2 border-slate-700 cursor-pointer" style={{ backgroundColor: primaryColor }} />
                  </div>
                  <Input
                    value={primaryColor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPrimaryColor(e.target.value); markDirty(); }}
                    maxLength={7}
                    className="wa9l-field text-white w-28 font-mono text-sm"
                  />
                  <span className="text-xs text-slate-500">{t.brandColorHint}</span>
                </div>
              </div>

              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.logoLabel}
                </p>
                <ImageUploader
                  value={profile.logo_url || ''}
                  onChange={(url) => updateProfile({ logo_url: url })}
                  aspect="square"
                  label={t.logoUploadLabel}
                />
              </div>

              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
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

              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.businessNameLabel}
                </p>
                <Input
                  value={agencyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAgencyName(e.target.value); markDirty(); }}
                  placeholder={t.businessNamePlaceholder}
                  className="wa9l-field text-white placeholder:text-slate-600"
                />
              </div>

              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.businessTypeLabel}
                </p>
                <p className="text-xs text-slate-500">{t.businessTypeSub}</p>
                <select
                  value={businessType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
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
                  } else if (bt === 'car_dealer') {
                    updatePageConfig({ offer_label_1: 'متاح', offer_label_2: 'مباع' });
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
                  <option value="car_dealer">{t.btCarDealer}</option>
                  <option value="other">{t.btOther}</option>
                </select>
              </div>

              <div className="wa9l-card rounded-2xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.pageContentLabel}
                </p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.heroHeadlineLabel}</Label>
                  <Input
                    value={pageConfig.hero_headline || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePageConfig({ hero_headline: e.target.value })}
                    placeholder={t.heroHeadlinePlaceholder}
                    maxLength={200}
                    className="wa9l-field text-white placeholder:text-slate-600"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(pageConfig.hero_headline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.taglineLabel}</Label>
                  <Input
                    value={profile.tagline || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile({ tagline: e.target.value })}
                    placeholder={t.taglinePlaceholder}
                    maxLength={200}
                    className="wa9l-field text-white placeholder:text-slate-600"
                  />
                  <p className="text-[11px] text-slate-500 text-left">{(profile.tagline || '').length}/200</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.bioLabel}</Label>
                  <Textarea
                    value={profile.bio || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateProfile({ bio: e.target.value })}
                    placeholder={t.bioPlaceholder}
                    rows={6}
                    maxLength={2000}
                    className="wa9l-field text-white placeholder:text-slate-600 resize-none"
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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const updated = [...(profile.licence_numbers ?? [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            updateProfile({ licence_numbers: updated });
                          }}
                          placeholder={t.licenceTypePlaceholder}
                          className="wa9l-field text-white text-xs placeholder:text-slate-600"
                        />
                        <Input
                          value={entry.number}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const updated = [...(profile.licence_numbers ?? [])];
                            updated[idx] = { ...updated[idx], number: e.target.value };
                            updateProfile({ licence_numbers: updated });
                          }}
                          placeholder={t.licenceNumPlaceholder}
                          className="wa9l-field text-white placeholder:text-slate-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.licence_numbers ?? []).filter((_: any, i: number) => i !== idx);
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

              <div className="wa9l-card rounded-2xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.seoLabel}
                </p>
                <p className="text-xs text-slate-500">{t.seoSub}</p>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.seoTitleLabel}</Label>
                  <Input
                    value={pageConfig.seo_title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePageConfig({ seo_title: e.target.value })}
                    className="wa9l-field text-white placeholder:text-slate-600"
                    placeholder={`${agencyName || t.businessNameFallback}`}
                    maxLength={120}
                  />
                  <p className={`text-[11px] text-left ${ (pageConfig.seo_title || '').length > 60 ? 'text-amber-400' : 'text-slate-500' }`}>{(pageConfig.seo_title || '').length}/120 ({t.seoCharsHint})</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.seoDescLabel}</Label>
                  <Textarea
                    value={pageConfig.seo_description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePageConfig({ seo_description: e.target.value })}
                    className="wa9l-field text-white placeholder:text-slate-600 resize-none"
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
                      <div className="relative w-full h-24">
                        <Image src={profile.cover_url} alt="OG preview" fill className="object-cover" sizes="400px" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">
                        {pageConfig.seo_title || agencyName || t.businessNameFallback}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {pageConfig.seo_description || profile.bio || t.bizDescFallback}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1 truncate">{selectedDisplayUrl}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* POSTS */}
            <TabsContent value="posts" className="mt-4 space-y-4">
              <div className="wa9l-card rounded-2xl p-5 space-y-4">
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
                  <div className="wa9l-card rounded-2xl p-4 space-y-4">
                    <p className="text-sm font-medium text-white">{editingListing ? t.editListingTitle : t.newListingTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{isCarDealer ? t.fieldMake : t.fieldCategory}</Label>
                        <Input value={listingForm.property_type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, property_type: e.target.value })} className="wa9l-field text-white text-sm" placeholder={isCarDealer ? t.categoryPlaceholderCar : t.categoryPlaceholder} />
                      </div>
                    <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldName}</Label>
                        <Input
                          value={listingForm.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, title: e.target.value })}
                          className="wa9l-field text-white text-sm"
                          placeholder={t.fieldName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldPrice}</Label>
                        <Input type="number" value={listingForm.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, price: e.target.value })} className="wa9l-field text-white text-sm" placeholder="1000000" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldLocation}</Label>
                        <Input value={listingForm.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, location: e.target.value })} className="wa9l-field text-white text-sm" placeholder="Dubai Marina" />
                      </div>
                      {usesRealEstateFields && (<>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldBedrooms}</Label>
                        <Input type="number" value={listingForm.bedrooms} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, bedrooms: e.target.value })} className="wa9l-field text-white text-sm" placeholder="4" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldBathrooms}</Label>
                        <Input type="number" value={listingForm.bathrooms} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, bathrooms: e.target.value })} className="wa9l-field text-white text-sm" placeholder="3" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldArea}</Label>
                        <Input type="number" value={listingForm.area_sqm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, area_sqm: e.target.value })} className="wa9l-field text-white text-sm" placeholder="450" />
                      </div>
                      </>)}
                      {isCarDealer && (<>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldYear}</Label>
                        <Input type="number" value={listingForm.bedrooms} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, bedrooms: e.target.value })} className="wa9l-field text-white text-sm" placeholder="2024" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">{t.fieldMileage}</Label>
                        <Input type="number" value={listingForm.bathrooms} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setListingForm({ ...listingForm, bathrooms: e.target.value })} className="wa9l-field text-white text-sm" placeholder="85000" />
                      </div>
                      </>)}
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t.descriptionLabel}</label>
                      <textarea
                        value={listingForm.body}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setListingForm({ ...listingForm, body: e.target.value })}
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
                      <div key={listing.id} className={`bg-slate-800 rounded-lg p-3 border border-slate-700 flex gap-3 items-center transition-opacity ${listing.published === false ? 'opacity-60' : ''}`}>
                        {listing.images?.[0] && (
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={listing.images[0]} alt="" fill className="object-cover" sizes="200px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm truncate">{listing.title}</p>
                            {listing.published === false && (
                              <span className="shrink-0 inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                {lang === 'en' ? 'Draft' : 'مسودة'}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-400 text-sm font-bold">{listing.price?.toLocaleString('en-US')} {displayCurrency}</p>
                          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                            {listing.location && <span>{listing.location}</span>}
                            {isCarDealer ? (
                              <>
                                {listing.bedrooms > 0 && <span className="flex items-center gap-0.5">📅 {listing.bedrooms}</span>}
                                {listing.bathrooms > 0 && <span className="flex items-center gap-0.5">🛣️ {listing.bathrooms} km</span>}
                                {listing.property_type && <span className="flex items-center gap-0.5">🏷️ {listing.property_type}</span>}
                              </>
                            ) : (
                              <>
                                {listing.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{listing.bedrooms}</span>}
                                {listing.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{listing.bathrooms}</span>}
                                {listing.area_sqm > 0 && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" />{listing.area_sqm}{t.areaSqm}</span>}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
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
              <div className="wa9l-card rounded-2xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile({ [key]: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updated = [...(profile.extra_phones ?? [])];
                          updated[idx] = e.target.value;
                          updateProfile({ extra_phones: updated });
                        }}
                        placeholder="+966 50 000 0000"
                        className="wa9l-field text-white placeholder:text-slate-600 pl-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.extra_phones ?? []).filter((_: any, i: number) => i !== idx);
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
              <div className="wa9l-card rounded-2xl p-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
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
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 ${ h.enabled ? 'bg-indigo-600' : 'bg-slate-700/80' }`}
                        style={h.enabled ? {boxShadow:'0 0 8px rgba(99,102,241,0.4)'} : {}}
                        aria-label={`Toggle working hours for ${DAY_LABELS[day]}`}
                        aria-pressed={h.enabled}
                      >
                        <span className={`inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ${ h.enabled ? 'translate-x-5' : 'translate-x-1' }`} style={{width:'18px',height:'18px'}} />
                      </button>
                      <span className={`w-16 text-sm ${h.enabled ? 'text-white' : 'text-slate-500'}`}>{DAY_LABELS[day]}</span>
                      {h.enabled ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="time"
                            value={h.open}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDay({ open: e.target.value })}
                            className="flex-1 wa9l-field text-white rounded-md px-2 py-1 text-xs"
                          />
                          <span className="text-slate-500 text-xs">–</span>
                          <input
                            type="time"
                            value={h.close}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDay({ close: e.target.value })}
                            className="flex-1 wa9l-field text-white rounded-md px-2 py-1 text-xs"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 flex-1">{t.closed}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="wa9l-card rounded-2xl p-5 space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-white/95">
                  {t.socialTitle}
                </p>
                <p className="text-xs text-slate-500">{t.socialSub}</p>

                {([
                  { key: 'instagram', icon: Instagram,     label: 'Instagram',   placeholder: 'username',              color: 'text-pink-400'  },
                  { key: 'x',         icon: Twitter,       label: 'X (Twitter)', placeholder: 'username',              color: 'text-sky-400'   },
                  { key: 'linkedin',  icon: Linkedin,      label: 'LinkedIn',    placeholder: 'username', color: 'text-blue-400'  },
                  { key: 'whatsapp',  icon: MessageCircle, label: 'WhatsApp',    placeholder: '966500000000',         color: 'text-green-400' },
                ] as const).map(({ key, icon: Icon, label, placeholder, color }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
                    <div className="relative">
                      <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${color} pointer-events-none`} />
                      <Input
                        value={profile.social_links?.[key] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocial(key, e.target.value)}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocial('snapchat', e.target.value)}
                      placeholder="username"
                      className="wa9l-field text-white placeholder:text-slate-600 pl-9"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocial('tiktok', e.target.value)}
                      placeholder="username"
                      className="wa9l-field text-white placeholder:text-slate-600 pl-9"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocial('telegram', e.target.value)}
                      placeholder="username"
                      className="wa9l-field text-white placeholder:text-slate-600 pl-9"
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocial('discord', e.target.value)}
                      placeholder="username"
                      className="wa9l-field text-white placeholder:text-slate-600 pl-9"
                    />
                  </div>
                </div>
              </div>

            </TabsContent>
          </Tabs>

          {/* Save status */}
          <div className="wa9l-card rounded-2xl px-5 py-4 flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.saving}
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t.autoSaved}
                </span>
              )}
              {saveStatus === 'error' && saveError && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
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
          <div className="wa9l-card rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Live inline preview — renders theme component directly, no save needed */}
            <div className={`relative overflow-hidden bg-black flex-1 ${previewMinHeightClass} xl:min-h-0`}>
              {/* onClick capture blocks link navigation; scroll still works */}
              <div
                className="overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.preventDefault()}
                style={{
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
                  key={`preview-${selectedTheme}-${pageConfig.page_lang ?? 'ar'}`}
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
                      body: l.body ?? null,
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
      {dirty && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-white/[0.08] bg-slate-900/95 backdrop-blur px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-amber-300">{lang === 'ar' ? 'تغييرات غير محفوظة' : 'Unsaved changes'}</span>
          <Button onClick={handleSave} disabled={saveStatus === 'saving'} size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 rounded-xl">
            {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === 'ar' ? 'حفظ' : 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
}
