'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Bed, Bath, Maximize, MapPin, CircleCheck as CheckCircle, Copy, Check, Twitter, MessageCircle } from 'lucide-react';
import { InquiryForm } from './InquiryForm';
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
    share: 'مشاركة العقار',
    shareWhatsApp: 'واتساب',
    shareX: 'X',
    shareCopy: 'نسخ',
    shareCopied: 'تم النسخ',
    inquiry: 'إرسال استفسار',
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
    shareX: 'X',
    shareCopy: 'Copy',
    shareCopied: 'Copied!',
    inquiry: 'Send Inquiry',
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
}

export function PropertyDetailModal({
  property,
  onClose,
  slug,
  tenantId,
  accentColor = '#2563eb',
  bgColor = '#0f0f0f',
  lang = 'ar',
}: PropertyDetailModalProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const L = MODAL_LABELS[lang];

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
    const text = encodeURIComponent(`${property.title} - ${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(property.title);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 z-40" style={{ backgroundColor: bgColor }}>
          <h2 className="text-2xl font-bold text-white">{property.title}</h2>
          <button
            onClick={onClose}
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
                  <img
                    src={images[currentImageIdx]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
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
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentImageIdx ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Bed className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.bedrooms}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Bath className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">{L.bathrooms}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bathrooms}</p>
                </div>
              )}
              {property.area_sqm !== undefined && property.area_sqm > 0 && (
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
              <p className="text-4xl font-bold">{property.price ? property.price.toLocaleString('en-US') : L.priceUnset}</p>
              <p className="text-gray-300 text-sm mt-2">⃁</p>
            </div>

            {/* Inquiry Form or Button */}
            {!showInquiryForm ? (
              <Button
                onClick={() => setShowInquiryForm(true)}
                className="w-full text-white font-semibold py-3 rounded-lg"
                style={{ backgroundColor: accentColor }}
              >
                {L.inquiry}
              </Button>
            ) : (
              <div className="border border-gray-700 rounded-lg p-4">
                <InquiryForm
                  slug={slug}
                  propertyId={property.id}
                  propertyTitle={property.title}
                  accentColor={accentColor}
                  onSuccess={() => setTimeout(() => setShowInquiryForm(false), 2000)}
                />
              </div>
            )}

            {/* Features */}
            {(property.features && property.features.length > 0) && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2">
              <p className="font-semibold text-white text-sm mb-3">{L.features}</p>
              <div className="space-y-2">
                {property.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                    <span className="text-gray-300 text-sm">{feat}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTwitter}
                  className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:text-white hover:bg-sky-500/10 hover:border-sky-500/40"
                >
                  <Twitter className="h-4 w-4 mr-1.5 text-sky-400" />
                  {L.shareX}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}