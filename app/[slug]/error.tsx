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
  const [isRetrying, setIsRetrying] = useState(true);

  useEffect(() => {
    // Retry immediately on mount
    reset();
    // Show spinner for 300ms then show error UI only if retry failed
    const timer = setTimeout(() => {
      setIsRetrying(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [reset]);

  if (isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
