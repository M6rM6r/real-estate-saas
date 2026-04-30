'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; displayName: string | null } | null>(null);

  useEffect(() => {
    const demoAuth = sessionStorage.getItem('demo_auth');
    if (demoAuth === 'true') {
      setIsDemo(true);
      setAuthed(true);
      setUserInfo({ email: 'demo@example.com', displayName: 'Demo User' });
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
          setAuthed(true);
          setUserInfo({ email: user.email ?? '', displayName: user.displayName });
        }
      });
    })();
    return () => unsub?.();
  }, [router]);

  const handleLogout = useCallback(async () => {
    sessionStorage.removeItem('demo_auth');
    // Clear the demo session cookie
    document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
    if (!isDemo) {
      const { auth } = await import('@/lib/firebase');
      await fetch('/api/auth/session', { method: 'DELETE' });
      await auth.signOut();
    }
    router.push('/login');
  }, [router, isDemo]);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-30 border-b border-gray-800/80 bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="h-14 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-200">منشئ الصفحة</span>
            {isDemo && (
              <span className="text-[10px] font-bold tracking-wider bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                تجريبي
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userInfo && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/70">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {([...(userInfo.displayName || userInfo.email || '?')][0] || '?').toUpperCase()}
                </div>
                <span className="text-xs text-slate-300 max-w-40 truncate">{userInfo.displayName || userInfo.email}</span>
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-slate-300 hover:text-red-400 hover:bg-red-400/10"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
    </div>
  );
}
