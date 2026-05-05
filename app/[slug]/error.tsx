'use client';

import { useEffect } from 'react';

export default function SlugError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Always retry immediately, never show error UI
    reset();
  }, [reset]);

  // Return empty placeholder - never show error UI
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Loading placeholder */}
    </div>
  );
}
