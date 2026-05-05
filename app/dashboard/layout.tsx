'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from './LanguageContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demoAuth = sessionStorage.getItem('demo_auth');
    if (demoAuth === 'true') {
      setIsDemo(true);
      setAuthed(true);
      return;
    }

    let unsub: (() => void) | undefined;
    (async () => {
      const { auth } = await import('@/lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/login');
        } else {
          sessionStorage.removeItem('demo_auth');
          document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
          setAuthed(true);
        }
      });
    })();
    return () => unsub?.();
  }, [router]);

  // expose logout for page-builder to call
  const handleLogout = useCallback(async () => {
    sessionStorage.removeItem('demo_auth');
    document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
    if (!isDemo) {
      const { auth } = await import('@/lib/firebase');
      await fetch('/api/auth/session', { method: 'DELETE' });
      await auth.signOut();
    }
    router.push('/login');
  }, [router, isDemo]);

  // make logout accessible to child pages via window for simplicity
  useEffect(() => {
    (window as any).__dashboardLogout = handleLogout;
    return () => { delete (window as any).__dashboardLogout; };
  }, [handleLogout]);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LanguageProvider>
  );
}
