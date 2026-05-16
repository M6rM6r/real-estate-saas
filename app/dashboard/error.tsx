'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_lang');
      if (saved === 'en' || saved === 'ar') setLang(saved);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[dashboard error]', error.digest);
    }
  }, [error]);

  const t = lang === 'en'
    ? { heading: 'Something went wrong', sub: 'This page could not be loaded. Please try again or return to the home page.', retry: 'Try again', home: 'Home', code: 'Error code:' }
    : { heading: 'حدث خطأ في لوحة التحكم', sub: 'تعذّر تحميل هذه الصفحة. يمكنك المحاولة مجدداً أو العودة للرئيسية.', retry: 'حاول مجدداً', home: 'الرئيسية', code: 'رمز الخطأ:' };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10 text-center">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_90px_-50px_rgba(59,130,246,0.35)] backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-3xl">⚠️</div>
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-100">{t.heading}</h2>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-400">{t.sub}</p>
        </div>
        {error.digest && (
          <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-mono text-slate-400">
            {t.code} {error.digest}
          </div>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="min-w-36 bg-blue-600 text-white hover:bg-blue-500">
            {t.retry}
          </Button>
          <Button variant="outline" className="min-w-36 border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white" onClick={() => router.push('/dashboard')}>
            {t.home}
          </Button>
        </div>
      </div>
    </div>
  );
}
