'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry or equivalent monitoring
    if (typeof window !== 'undefined' && (window as typeof window & { Sentry?: { captureException: (e: unknown) => void } }).Sentry) {
      (window as typeof window & { Sentry: { captureException: (e: unknown) => void } }).Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-8"
      dir="rtl"
    >
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-slate-500 mb-6">
          نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            حاول مجدداً
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            الصفحة الرئيسية
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-400 font-mono">رمز الخطأ: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
