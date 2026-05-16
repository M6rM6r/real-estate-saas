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
      className="min-h-screen flex items-center justify-center bg-[#060912] px-4 py-10"
      dir="rtl"
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_40px_120px_-60px_rgba(59,130,246,0.45)] backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-3xl">
          ⚠️
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-100">حدث خطأ غير متوقع</h1>
        <p className="mb-6 text-sm leading-6 text-slate-400">
          نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} variant="default" className="bg-blue-600 text-white hover:bg-blue-500">
            حاول مجدداً
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline" className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
            الصفحة الرئيسية
          </Button>
        </div>
        {error.digest && (
          <p className="mt-5 text-xs text-slate-500 font-mono">رمز الخطأ: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
