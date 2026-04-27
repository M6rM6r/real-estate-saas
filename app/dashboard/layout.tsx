'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, LayoutTemplate, Settings, LogOut, Building2, Menu, X, Megaphone, Home, Users, BarChart2, Images, Newspaper, ClipboardList, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';
import type { Lead } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'نظرة عامة', icon: BarChart3 },
  { href: '/dashboard/page-builder', label: 'منشئ الصفحة', icon: LayoutTemplate },
  { href: '/dashboard/listings', label: 'العقارات', icon: Home },
  { href: '/dashboard/leads', label: 'العملاء المحتملون', icon: Users },
  { href: '/dashboard/analytics', label: 'الإحصائيات', icon: BarChart2 },
  { href: '/dashboard/gallery', label: 'المعرض', icon: Images },
  { href: '/dashboard/news', label: 'الأخبار', icon: Newspaper },
  { href: '/dashboard/announcements', label: 'الإعلانات', icon: Megaphone },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
  { href: '/dashboard/logs', label: 'السجلات', icon: ClipboardList },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; displayName: string | null } | null>(null);
  const [notifBanner, setNotifBanner] = useState(false);
  const lastLeadTime = useRef<number>(Date.now());

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

  // Show notification permission banner if not yet decided
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') setNotifBanner(true);
  }, []);

  // Poll for new leads every 60 seconds and fire browser notifications
  useEffect(() => {
    if (isDemo) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const poll = async () => {
      try {
        const since = new Date(lastLeadTime.current).toISOString();
        const leads = await authFetch<Lead[]>(`/api/dashboard/leads?since=${encodeURIComponent(since)}`);
        if (leads.length > 0) {
          lastLeadTime.current = Date.now();
          leads.forEach(lead => {
            new Notification('عميل جديد 🔔', { body: lead.name, icon: '/favicon.ico' });
          });
        }
      } catch { /* ignore */ }
    };
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, [isDemo, authed]);

  const requestNotifPermission = async () => {
    setNotifBanner(false);
    await Notification.requestPermission();
  };

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
          <span className="font-semibold text-lg">لوحة التحكم</span>
          {isDemo && (
            <span className="ml-auto text-[10px] font-bold tracking-wider bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              تجريبي
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="إغلاق القائمة الجانبية"
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
                type="button"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
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
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 flex items-center px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white mr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {notifBanner && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-blue-600/15 border border-blue-500/30 rounded-lg px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-blue-300">
                <Bell className="h-4 w-4 shrink-0" />
                فعِّل الإشعارات لتلقي تنبيهات فورية عند وصول عملاء جدد
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={requestNotifPermission}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
                >
                  تفعيل
                </button>
                <button
                  onClick={() => setNotifBanner(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
