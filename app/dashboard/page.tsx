'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/page-builder');
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-10 text-center shadow-[0_24px_80px_-40px_rgba(59,130,246,0.45)] backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
          <div className="h-7 w-7 rounded-full border-2 border-blue-400/70 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-blue-100">Preparing your workspace</p>
        <p className="mt-2 text-sm text-slate-400">Redirecting to the page builder with your latest saved setup.</p>
      </div>
    </div>
  );
}
