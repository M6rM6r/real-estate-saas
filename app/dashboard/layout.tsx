'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, LayoutTemplate, Settings, LogOut, Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/page-builder', label: 'Page Builder', icon: LayoutTemplate },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0e0e18] border-r border-gray-800 flex flex-col transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Dashboard</span>
          {isDemo && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              Demo
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-2">
          {userInfo && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {(userInfo.displayName || userInfo.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">{userInfo.displayName || userInfo.email.split('@')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
