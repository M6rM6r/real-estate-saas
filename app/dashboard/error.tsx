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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <p className="text-5xl">⚠️</p>
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.heading}</h2>
        <p className="text-slate-500">{t.sub}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>{t.retry}</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          {t.home}
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono">{t.code} {error.digest}</p>
      )}
    </div>
  );
}
