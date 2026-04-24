'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Bed, Bath, Maximize, MapPin, CircleCheck as CheckCircle } from 'lucide-react';
import { InquiryForm } from './InquiryForm';
import type { Post } from '@/lib/types';

interface PropertyDetailModalProps {
  property: Post;
  onClose: () => void;
  slug: string;
  accentColor?: string;
  bgColor?: string;
}

export function PropertyDetailModal({
  property,
  onClose,
  slug,
  accentColor = '#2563eb',
  bgColor = '#0f0f0f',
}: PropertyDetailModalProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

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

  const statusColor: Record<string, string> = {
    available: 'bg-emerald-500',
    sold: 'bg-red-500',
    rented: 'bg-amber-500',
  };

  const statusLabel: Record<string, string> = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
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
                    <span className="text-gray-400 text-sm">غرف النوم</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Bath className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">الحمامات</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.bathrooms}</p>
                </div>
              )}
              {property.area_sqm !== undefined && property.area_sqm > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Maximize className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 text-sm">المساحة</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{property.area_sqm}م²</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">الوصف</h3>
              <p className="text-gray-300 leading-relaxed">
                {property.body ||
                  'هذا عقار مميز يتميز بموقع استراتيجي وتصميم حديث يلبي جميع احتياجاتك'}
              </p>
            </div>

            {/* Location */}
            {property.location && (
              <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm mb-1">الموقع</p>
                    <p className="text-white font-semibold">{property.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Price */}
            <div className="bg-gradient-to-br rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`, borderColor: accentColor, borderWidth: '1px' }}>
              <p className="text-gray-300 text-sm mb-2">السعر</p>
              <p className="text-4xl font-bold">{property.price ? property.price.toLocaleString() : 'غير محدد'}</p>
              <p className="text-gray-300 text-sm mt-2">ر.س</p>
            </div>

            {/* Inquiry Form or Button */}
            {!showInquiryForm ? (
              <Button
                onClick={() => setShowInquiryForm(true)}
                className="w-full text-white font-semibold py-3 rounded-lg"
                style={{ backgroundColor: accentColor }}
              >
                إرسال استفسار
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
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2">
              <p className="font-semibold text-white text-sm mb-3">المميزات</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-gray-300 text-sm">موقع استراتيجي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-gray-300 text-sm">تصميم عصري</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-gray-300 text-sm">مرافق متكاملة</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-gray-300 text-sm">أمان 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
