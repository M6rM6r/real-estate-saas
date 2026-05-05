'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SlugError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    // Auto-retry once after 500ms
    if (!attempted) {
      const timer = setTimeout(() => {
        setAttempted(true);
        reset();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [attempted, reset]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center bg-white"
      dir="rtl"
    >
      <p className="text-5xl">🏠</p>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">تعذّر تحميل الصفحة</h2>
        <p className="text-slate-500">
          حدث خطأ أثناء تحميل صفحة الوكالة. يرجى المحاولة مجدداً.
        </p>
      </div>
      <Button onClick={reset}>حاول مجدداً</Button>
    </div>
  );
}
