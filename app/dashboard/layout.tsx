'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from './LanguageContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const isPublicBuilderEntry = pathname === '/dashboard/page-builder';

  const activateDemoSession = useCallback(() => {
    sessionStorage.setItem('demo_auth', 'true');
    document.cookie = 'demo_session=1; path=/; max-age=86400; SameSite=Lax';
    setIsDemo(true);
    setAuthed(true);
  }, []);

  useEffect(() => {
    let publicEntryFallbackTimer: ReturnType<typeof setTimeout> | undefined;

    if (isPublicBuilderEntry) {
      setAuthed(true);
    }

    if (isPublicBuilderEntry) {
      publicEntryFallbackTimer = setTimeout(() => {
        setAuthed((prev) => {
          if (prev !== null) return prev;
          activateDemoSession();
          return true;
        });
      }, 1800);
    }

    const demoAuth = sessionStorage.getItem('demo_auth');
    if (demoAuth === 'true') {
      if (publicEntryFallbackTimer) clearTimeout(publicEntryFallbackTimer);
      setIsDemo(true);
      setAuthed(true);
      return;
    }

    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        unsub = onAuthStateChanged(auth, (user) => {
          if (publicEntryFallbackTimer) clearTimeout(publicEntryFallbackTimer);
          if (!user) {
            if (isPublicBuilderEntry) {
              activateDemoSession();
              return;
            }
            router.push('/login');
          } else {
            sessionStorage.removeItem('demo_auth');
            document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
            setIsDemo(false);
            setAuthed(true);
          }
        });
      } catch {
        if (publicEntryFallbackTimer) clearTimeout(publicEntryFallbackTimer);
        if (isPublicBuilderEntry) {
          activateDemoSession();
          return;
        }
        router.push('/login');
      }
    })();
    return () => {
      if (publicEntryFallbackTimer) clearTimeout(publicEntryFallbackTimer);
      unsub?.();
    };
  }, [activateDemoSession, isPublicBuilderEntry, router]);

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

  useEffect(() => {
    const onAuthExpired = () => {
      if (isDemo) return;
      sessionStorage.removeItem('demo_auth');
      document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
      setAuthed(false);
      router.push('/login');
    };

    window.addEventListener('wa9l:auth-expired', onAuthExpired as EventListener);
    return () => {
      window.removeEventListener('wa9l:auth-expired', onAuthExpired as EventListener);
    };
  }, [isDemo, router]);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
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
