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
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Silently retry without showing anything
    reset();
    // Only show error UI if we're still here after 1 second (retry failed)
    const timer = setTimeout(() => {
      setShowError(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reset]);

  // Return null (completely invisible) while retrying
  if (!showError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Invisible placeholder to prevent layout shift */}
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
