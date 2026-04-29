'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[dashboard error]', error.digest);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
      <p className="text-5xl">⚠️</p>
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">حدث خطأ في لوحة التحكم</h2>
        <p className="text-slate-500">
          تعذّر تحميل هذه الصفحة. يمكنك المحاولة مجدداً أو العودة للرئيسية.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>حاول مجدداً</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          الرئيسية
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono">رمز الخطأ: {error.digest}</p>
      )}
    </div>
  );
}
