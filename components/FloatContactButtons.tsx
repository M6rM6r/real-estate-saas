'use client';

import { MessageCircle } from 'lucide-react';

interface FloatContactButtonsProps {
  whatsapp?: string;
  accentColor?: string;
}

export function FloatContactButtons({
  whatsapp,
  accentColor = '#2563eb',
}: FloatContactButtonsProps) {
  if (!whatsapp) return null;

  return (
    <div className="fixed bottom-6 left-6 flex gap-3 z-40" dir="rtl">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 text-white"
          style={{ backgroundColor: accentColor }}
          title="واتساب"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
}
