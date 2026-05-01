'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/page-builder');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
