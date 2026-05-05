'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Building2, Globe, Menu, Bell, LayoutDashboard, Home, Users, BarChart3, Newspaper, Megaphone, Image as ImageIcon, Settings, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from './LanguageContext';

const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    demo: 'تجريبي',
    logout: 'تسجيل الخروج',
    language: 'English',
    notifications: 'الإشعارات',
  },
  en: {
    dashboard: 'Dashboard',
    demo: 'Demo',
    logout: 'Logout',
    language: 'العربية',
    notifications: 'Notifications',
  },
};

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, toggleLang, isRTL } = useLanguage();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; displayName: string | null } | null>(null);

  const t = translations[lang];

  const navItems = [
    { href: '/dashboard', labelAr: 'الرئيسية', labelEn: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/page-builder', labelAr: 'منشئ الصفحة', labelEn: 'Page Builder', icon: Home },
    { href: '/dashboard/listings', labelAr: 'العروض', labelEn: 'Listings', icon: FileText },
    { href: '/dashboard/leads', labelAr: 'العملاء المحتملون', labelEn: 'Leads', icon: Users },
    { href: '/dashboard/analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/news', labelAr: 'الأخبار', labelEn: 'News', icon: Newspaper },
    { href: '/dashboard/announcements', labelAr: 'الإعلانات', labelEn: 'Announcements', icon: Megaphone },
    { href: '/dashboard/gallery', labelAr: 'المعرض', labelEn: 'Gallery', icon: ImageIcon },
    { href: '/dashboard/logs', labelAr: 'السجلات', labelEn: 'Logs', icon: FileText },
    { href: '/dashboard/settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  ] as const;

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
          // Ensure any leftover demo flag is cleared for real users
          sessionStorage.removeItem('demo_auth');
          document.cookie = 'demo_session=; path=/; max-age=0; SameSite=Lax';
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 lg:hidden border-b border-gray-800/80 bg-[#0a0a0f]/90 backdrop-blur-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-200"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-200">{t.dashboard}</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 text-slate-200"
            aria-label={t.notifications}
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Desktop top bar */}
      <header className="hidden lg:block sticky top-0 z-30 border-b border-gray-800/80 bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="h-14 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-200">{t.dashboard}</span>
            {isDemo && (
              <span className="text-[10px] font-bold tracking-wider bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                {t.demo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {t.language}
            </button>
            {userInfo && (
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/70">
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
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-72 border-l border-slate-800/80 bg-[#0d111b]">
          <nav className="w-full p-4 space-y-1">
            {navItems.map(({ href, icon: Icon, labelAr, labelEn }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 border-r-2'
                      : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{lang === 'ar' ? labelAr : labelEn}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <aside
          className={`fixed top-0 bottom-0 z-50 w-72 bg-[#0d111b] border-slate-800/80 transform transition-transform duration-200 lg:hidden ${
            isRTL
              ? `right-0 border-l ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`
              : `left-0 border-r ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-200">{t.dashboard}</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-300 hover:bg-slate-800"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map(({ href, icon: Icon, labelAr, labelEn }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 border-r-2'
                      : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{lang === 'ar' ? labelAr : labelEn}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={toggleLang}
              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {t.language}
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="w-full gap-2 text-slate-300 hover:text-red-400 hover:bg-red-400/10"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
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
