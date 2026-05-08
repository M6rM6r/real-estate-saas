'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  X, ChevronLeft, ChevronRight, Bed, Bath, Maximize, MapPin,
  CircleCheck as CheckCircle, Copy, Check, MessageCircle, Share2,
  Tag, CalendarDays, Gauge, ExternalLink, Images,
} from 'lucide-react';
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
    shareCopy: 'نسخ الرابط',
    shareCopied: '✓ تم النسخ',
    shareNative: 'مشاركة',
    details: 'تفاصيل العقار',
    offerType: 'نوع العرض',
    propertyType: 'نوع العقار',
    listingStatus: 'الحالة',
    carMake: 'الماركة',
    carYear: 'سنة الصنع',
    carMileage: 'الكم',
    offerRent: 'إيجار',
    offerSale: 'بيع',
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
    shareCopy: 'Copy link',
    shareCopied: '✓ Copied!',
    shareNative: 'Share',
    details: 'Property Details',
    offerType: 'Offer Type',
    propertyType: 'Property Type',
    listingStatus: 'Status',
    carMake: 'Make',
    carYear: 'Year',
    carMileage: 'Mileage',
    offerRent: 'Rent',
    offerSale: 'Sale',
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
  bgColor = '#0f172a',
  lang = 'ar',
  businessType,
}: PropertyDetailModalProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imgFading, setImgFading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const L = MODAL_LABELS[lang];
  const isCarDealer = businessType === 'car_dealer';
  const isRTL = lang === 'ar';

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

  const goToImage = (idx: number) => {
    if (idx === currentImageIdx) return;
    setImgFading(true);
    setTimeout(() => {
      setCurrentImageIdx(idx);
      setImgFading(false);
    }, 150);
  };

  const nextImage = () => goToImage((currentImageIdx + 1) % images.length);
  const prevImage = () => goToImage((currentImageIdx - 1 + images.length) % images.length);

  const getShareUrl = () => `https://wa9l.website/${slug}#listing-${property.id}`;

  const shareText = useMemo(() => {
    const priceSegment = property.price ? ` — ${property.currency ?? 'SAR'} ${property.price.toLocaleString('en-US')}` : '';
    return `${property.title}${priceSegment}`;
  }, [property.currency, property.price, property.title]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
    } catch {
      const ta = document.createElement('textarea');
      ta.value = getShareUrl();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try { await navigator.share({ title: property.title, text: shareText, url }); return; }
      catch { /* fallback */ }
    }
    await handleCopyLink();
  };

  const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
    available: { label: L.statusAvailable, dot: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    sold:      { label: L.statusSold,      dot: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    rented:    { label: L.statusRented,    dot: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  };
  const statusCfg = property.listing_status ? STATUS_CONFIG[property.listing_status] : null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') { if (!isRTL) prevImage(); else nextImage(); }
      if (e.key === 'ArrowRight') { if (!isRTL) nextImage(); else prevImage(); }
    };
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>('button,[tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  });

  const mapEmbedUrl = property.location_url && property.location_url.includes('google.com/maps')
    ? property.location_url.replace('/maps/', '/maps/embed?')
    : null;

  type StatItem = { icon: React.ReactNode; label: string; value: string | number };
  const statItems: StatItem[] = [];
  if (isCarDealer) {
    if (property.property_type) statItems.push({ icon: <Tag className="w-4 h-4" />, label: L.carMake, value: property.property_type });
    if ((property.bedrooms ?? 0) > 0) statItems.push({ icon: <CalendarDays className="w-4 h-4" />, label: L.carYear, value: property.bedrooms! });
    if ((property.bathrooms ?? 0) > 0) statItems.push({ icon: <Gauge className="w-4 h-4" />, label: L.carMileage, value: `${property.bathrooms!} km` });
  } else {
    if ((property.bedrooms ?? 0) > 0) statItems.push({ icon: <Bed className="w-4 h-4" />, label: L.bedrooms, value: property.bedrooms! });
    if ((property.bathrooms ?? 0) > 0) statItems.push({ icon: <Bath className="w-4 h-4" />, label: L.bathrooms, value: property.bathrooms! });
    if ((property.area_sqm ?? 0) > 0) statItems.push({ icon: <Maximize className="w-4 h-4" />, label: L.area, value: `${property.area_sqm}${lang === 'en' ? ' sqm' : ' م²'}` });
  }

  return (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .pdm-enter { animation: modal-in 0.22s cubic-bezier(.22,.68,0,1.2) forwards; }
        .pdm-img-fade { transition: opacity 0.15s ease; }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={property.title}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          ref={modalRef}
          className="pdm-enter relative w-full sm:max-w-5xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: bgColor,
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
            maxHeight: '96dvh',
          }}
        >
          {/* On sm+ screens, round all corners */}
          <style>{`@media (min-width: 640px) { .pdm-enter { border-radius: 20px !important; } }`}</style>

          {/* ── Sticky Header ── */}
          <div
            className="flex items-start justify-between gap-3 px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', backgroundColor: bgColor }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {statusCfg && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ color: statusCfg.dot, backgroundColor: statusCfg.bg }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: statusCfg.dot }} />
                    {statusCfg.label}
                  </span>
                )}
                {property.offer_type && (
                  <span
                    className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      color: property.offer_type === 'rent' ? '#34d399' : '#60a5fa',
                      backgroundColor: property.offer_type === 'rent' ? 'rgba(52,211,153,0.12)' : 'rgba(96,165,250,0.12)',
                    }}
                  >
                    {property.offer_type === 'rent' ? L.offerRent : L.offerSale}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">{property.title}</h2>
              {property.location && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {property.location}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={isRTL ? 'إغلاق النافذة' : 'Close dialog'}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.13)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto overscroll-contain flex-1">
            <div className="flex flex-col lg:flex-row">

              {/* ── Left: Gallery + Details ── */}
              <div className="flex-1 min-w-0">

                {/* Image gallery — 16:9 */}
                <div className="relative bg-black w-full" style={{ aspectRatio: '16/9' }}>
                  {hasImages ? (
                    <>
                      <Image
                        src={images[currentImageIdx]}
                        alt={`${property.title} ${currentImageIdx + 1}`}
                        fill
                        className={`object-cover pdm-img-fade ${imgFading ? 'opacity-0' : 'opacity-100'}`}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority={currentImageIdx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 pointer-events-none" />

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={isRTL ? nextImage : prevImage}
                            aria-label={isRTL ? 'الصورة التالية' : 'Previous'}
                            className="absolute top-1/2 -translate-y-1/2 start-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors backdrop-blur-sm"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={isRTL ? prevImage : nextImage}
                            aria-label={isRTL ? 'الصورة السابقة' : 'Next'}
                            className="absolute top-1/2 -translate-y-1/2 end-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors backdrop-blur-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          {/* Counter badge */}
                          <div className="absolute bottom-3 end-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
                            <Images className="w-3 h-3 opacity-70" />
                            {currentImageIdx + 1} / {images.length}
                          </div>

                          {/* Dot indicators */}
                          {images.length <= 10 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => goToImage(i)}
                                  aria-label={`Image ${i + 1}`}
                                  className="rounded-full transition-all duration-200"
                                  style={{
                                    width: i === currentImageIdx ? '20px' : '6px',
                                    height: '6px',
                                    backgroundColor: i === currentImageIdx ? accentColor : 'rgba(255,255,255,0.5)',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)' }}>
                      <MapPin className="w-14 h-14 text-slate-700" />
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className="relative shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200"
                        style={{
                          border: `2px solid ${idx === currentImageIdx ? accentColor : 'rgba(255,255,255,0.1)'}`,
                          opacity: idx === currentImageIdx ? 1 : 0.55,
                        }}
                      >
                        <Image src={img} alt={`thumb ${idx + 1}`} fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main content area */}
                <div className="p-5 space-y-6">

                  {/* Stat cards */}
                  {statItems.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {statItems.map((s, i) => (
                        <div key={i} className="rounded-xl p-4 flex flex-col gap-2.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                            {s.icon}
                          </div>
                          <div>
                            <p className="text-gray-500 text-[11px] mb-0.5">{s.label}</p>
                            <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {property.body && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{L.description}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{property.body}</p>
                    </div>
                  )}

                  {/* Map */}
                  {mapEmbedUrl && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <iframe title={L.viewMap} src={mapEmbedUrl} className="w-full h-52" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                    </div>
                  )}

                  {/* Location row */}
                  {(property.location || property.location_url) && (
                    <div className="rounded-xl p-4 flex items-start gap-3"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {property.location && <p className="text-white font-medium text-sm">{property.location}</p>}
                        {property.location_url && (
                          <a href={property.location_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium" style={{ color: accentColor }}>
                            <ExternalLink className="w-3 h-3" />
                            {L.viewMap}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right Sidebar ── */}
              <div className="lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4 p-5"
                style={{ borderInlineStart: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Price card */}
                {property.price != null && (
                <div className="rounded-2xl p-5" style={{
                  background: `linear-gradient(135deg, ${accentColor}1c 0%, ${accentColor}09 100%)`,
                  border: `1px solid ${accentColor}35`,
                }}>
                  <p className="text-gray-500 text-[11px] uppercase tracking-widest mb-2">{L.price}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm font-medium">{property.currency ?? 'SAR'}</span>
                    <span className="text-white font-black text-3xl tabular-nums leading-none">
                      {property.price.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div className="rounded-2xl p-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest mb-3">{L.features}</p>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feat, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: `${accentColor}18`, color: '#e2e8f0', border: `1px solid ${accentColor}30` }}>
                          <CheckCircle className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share section */}
                <div className="rounded-2xl p-4 mt-auto"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-gray-500 text-[11px] uppercase tracking-widest mb-3">{L.share}</p>
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleWhatsApp}
                      className="w-full justify-center gap-2 font-semibold rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', height: '44px', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
                      <MessageCircle className="w-4 h-4" />
                      {L.shareWhatsApp}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleNativeShare}
                        className="flex-1 gap-1.5 rounded-xl h-10 text-xs border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20">
                        <Share2 className="w-3.5 h-3.5" />
                        {L.shareNative}
                      </Button>
                      <Button variant="outline" onClick={handleCopyLink}
                        className="flex-1 gap-1.5 rounded-xl h-10 text-xs border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                        style={copied ? { borderColor: `${accentColor}50`, color: accentColor } : {}}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? L.shareCopied : L.shareCopy}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
