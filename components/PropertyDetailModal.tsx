'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Bed, Bath, Maximize, MapPin, CircleCheck as CheckCircle, Copy, Check, MessageCircle, Share2, Tag, CalendarDays, Gauge } from 'lucide-react';
import type { Post } from '@/lib/types';

const MODAL_LABELS = {
  ar: {
    statusAvailable: 'متاح',
    statusSold: 'مباع',
    statusRented: 'مؤجر',
    bedrooms: 'غرف النوم',
    bathrooms: 'الحمامات',
    area: 'المساحة',
    description: 'الوصف',
    location: 'الموقع',
    viewMap: 'عرض على الخريطة',
    viewMapShort: 'عرض الموقع على الخريطة',
    price: 'السعر',
    priceUnset: 'غير محدد',
    features: 'المميزات',
    share: 'مشاركة العرض',
    shareWhatsApp: 'واتساب',
    shareCopy: 'نسخ',
    shareCopied: 'تم النسخ',
    shareNative: 'مشاركة',
    details: 'تفاصيل العقار',
    offerType: 'نوع العرض',
    propertyType: 'نوع العقار',
    listingStatus: 'الحالة',
    carMake: 'الماركة',
    carYear: 'سنة الصنع',
    carMileage: 'الكم',
  },
  en: {
    statusAvailable: 'Available',
    statusSold: 'Sold',
    statusRented: 'Rented',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    area: 'Area',
    description: 'Description',
    location: 'Location',
    viewMap: 'View on Map',
    viewMapShort: 'View location on map',
    price: 'Price',
    priceUnset: 'Not specified',
    features: 'Features',
    share: 'Share Listing',
    shareWhatsApp: 'WhatsApp',
    shareCopy: 'Copy',
    shareCopied: 'Copied!',
    shareNative: 'Share',
    details: 'Property Details',
    offerType: 'Offer Type',
    propertyType: 'Property Type',
    listingStatus: 'Status',
    carMake: 'Make',
    carYear: 'Year',
    carMileage: 'Mileage',
  },
} as const

interface PropertyDetailModalProps {
  property: Post;
  onClose: () => void;
  slug: string;
  tenantId?: string;
  accentColor?: string;
  bgColor?: string;
  lang?: 'ar' | 'en';
  businessType?: string | null;
}

export function PropertyDetailModal({
  property,
  onClose,
  slug,
  tenantId,
  accentColor = '#2563eb',
  bgColor = '#0f0f0f',
  lang = 'ar',
  businessType,
}: PropertyDetailModalProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const L = MODAL_LABELS[lang];
  const isCarDealer = businessType === 'car_dealer';

  // Track listing view
  useEffect(() => {
    if (!tenantId || !property.id) return;
    fetch(`/api/${slug}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, listingId: property.id }),
    }).catch(() => {});
  }, [property.id, tenantId, slug]);

  const images = property.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (!hasImages) return;
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!hasImages) return;
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${slug}#listing-${property.id}`;
  };

  const shareText = useMemo(() => {
    const priceSegment = property.price ? ` — ${property.currency ?? 'SAR'} ${property.price.toLocaleString('en-US')}` : '';
    return `${property.title}${priceSegment}`;
  }, [property.currency, property.price, property.title]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = getShareUrl();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text: shareText, url });
        return;
      } catch {
        // no-op; fallback below
      }
    }
    await handleCopyLink();
  };

  const statusColor: Record<string, string> = {
    available: 'bg-emerald-500',
    sold: 'bg-red-500',
    rented: 'bg-amber-500',
  };

  const statusLabel: Record<string, string> = {
    available: L.statusAvailable,
    sold: L.statusSold,
    rented: L.statusRented,
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') nextImage();
      if (event.key === 'ArrowRight') prevImage();
    };

    const firstFocusable = modalRef.current?.querySelector<HTMLElement>('button, a, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  });

  const metaBadges = [
    property.offer_type ? { label: L.offerType, value: property.offer_type } : null,
    property.property_type ? { label: isCarDealer ? L.carMake : L.propertyType, value: property.property_type } : null,
    property.listing_status ? { label: L.listingStatus, value: statusLabel[property.listing_status] || property.listing_status } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const mapEmbedUrl = property.location_url && property.location_url.includes('google.com/maps')
    ? property.location_url.replace('/maps/', '/maps/embed?')
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      dir={lang === 'en' ? 'ltr' : 'rtl'}
      role="dialog"
      aria-modal="true"
      aria-label={property.title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 z-40" style={{ backgroundColor: bgColor }}>
          <h2 className="text-2xl font-bold text-white">{property.title}</h2>
          <button
            onClick={onClose}
            aria-label={lang === 'en' ? 'Close dialog' : 'إغلاق النافذة'}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Image Gallery */}
          <div className="flex-1">
            <div className="relative">
              {hasImages ? (
                <>
                  <div className="relative w-full h-96 overflow-hidden rounded-xl">
                    <Image
                      src={images[currentImageIdx]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority={currentImageIdx === 0}
                    />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        aria-label={lang === 'en' ? 'Previous image' : 'الصورة السابقة'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        aria-label={lang === 'en' ? 'Next image' : 'الصورة التالية'}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIdx + 1} / {images.length}
                      </div>
                    </>
                  )}
                  {property.listing_status && (
                    <span
                      className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold text-sm ${
                        statusColor[property.listing_status] || 'bg-gray-600'
                      }`}
                    >
                      {statusLabel[property.listing_status] || property.listing_status}
                    </span>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-96 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#1a1a2e' }}
                >
                  <MapPin className="h-16 w-16 text-gray-700" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIdx ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${property.title} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {isCarDealer && property.property_type && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.carMake}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.property_type}</p>
                </div>
              )}
              {isCarDealer && property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.carYear}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bedrooms}</p>
                </div>
              )}
              {isCarDealer && property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.carMileage}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bathrooms} km</p>
                </div>
              )}
              {!isCarDealer && property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Bed className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.bedrooms}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bedrooms}</p>
                </div>
              )}
              {!isCarDealer && property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Bath className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.bathrooms}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bathrooms}</p>
                </div>
              )}
              {!isCarDealer && property.area_sqm !== undefined && property.area_sqm > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Maximize className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.area}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.area_sqm}{lang === 'en' ? ' sqm' : ' م²'}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.body && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">{L.description}</h3>
              <p className="text-gray-300 leading-relaxed">{property.body}</p>
            </div>
            )}

            {mapEmbedUrl && (
              <div className="mt-6 rounded-xl border border-gray-700 overflow-hidden">
                <iframe
                  title={L.viewMap}
                  src={mapEmbedUrl}
                  className="w-full h-64"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}

            {/* Location */}
            {property.location && (
              <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm mb-1">{L.location}</p>
                    <p className="text-white font-semibold">{property.location}</p>
                    {property.location_url && (
                      <a
                        href={property.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        {L.viewMap}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!property.location && property.location_url && (
              <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <a
                  href={property.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  {L.viewMapShort}
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Price */}
            <div className="bg-gradient-to-br rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`, borderColor: accentColor, borderWidth: '1px' }}>
              <p className="text-gray-300 text-sm mb-2">{L.price}</p>
              <p className="text-5xl font-bold flex items-baseline gap-2">
                <span className="text-2xl font-semibold opacity-80">{property.currency ?? 'SAR'}</span>
                {property.price ? property.price.toLocaleString('en-US') : L.priceUnset}
              </p>
            </div>

            {/* Features */}
            {(property.features && property.features.length > 0) && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2">
              <p className="font-semibold text-white text-sm mb-3">{L.features}</p>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feat, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 rounded-full border border-gray-600 bg-gray-800 px-3 py-1.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor }} />
                    <span className="text-gray-200 text-xs">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            )}



            {/* Share */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="font-semibold text-white text-sm mb-3">{L.share}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNativeShare}
                  className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:text-white"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  {L.shareNative}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsApp}
                  className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:text-white hover:bg-green-500/10 hover:border-green-500/40"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5 text-green-400" />
                  {L.shareWhatsApp}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4 mr-1.5 text-green-400" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {copied ? L.shareCopied : L.shareCopy}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}