'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, Users, ScrollText, LogOut, Shield, Menu, X, Building2, Terminal, Sparkles } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/demo-catalog', label: 'Demo Catalog', icon: Sparkles },
  { href: '/admin/tenants', label: 'Tenants', icon: Users },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminAccent = '#8fd1aa';
  const adminAccentSoft = '#b8f0ca';
  const adminAccentMuted = 'rgba(143, 209, 170, 0.12)';

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div dir="ltr" lang="en" className="min-h-screen w-full flex font-mono text-slate-100" style={{ backgroundColor: '#08110d' }}>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col border-r transition-transform duration-200 backdrop-blur-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ backgroundColor: 'rgba(8, 17, 13, 0.94)', borderColor: 'rgba(143, 209, 170, 0.18)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b" style={{ borderColor: 'rgba(143, 209, 170, 0.16)' }}>
          <div className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ backgroundColor: adminAccentMuted, borderColor: 'rgba(143, 209, 170, 0.28)' }}>
            <Terminal className="h-4 w-4" style={{ color: adminAccent }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: adminAccentSoft }}>Admin Terminal</p>
            <p className="text-xs text-slate-500">{process.env.NEXT_PUBLIC_APP_NAME ?? 'لوحة التحكم'}</p>
          </div>
          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="ml-auto md:hidden rounded focus-visible:outline-none focus-visible:ring-2"
            style={{ color: 'rgba(184, 240, 202, 0.65)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                pathname === item.href
                  ? 'text-slate-50'
                  : 'text-slate-400 hover:text-slate-100'
              )}
              style={pathname === item.href
                ? { backgroundColor: 'rgba(143, 209, 170, 0.14)', borderColor: 'rgba(143, 209, 170, 0.28)', boxShadow: '0 10px 30px -20px rgba(143,209,170,0.45)' }
                : { backgroundColor: 'transparent', borderColor: 'transparent' }}
            >
              <span style={{ color: pathname === item.href ? adminAccentSoft : 'rgba(143, 209, 170, 0.45)' }}>&gt;</span>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(143, 209, 170, 0.16)' }}>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="تسجيل الخروج"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300/80 hover:text-rose-100 hover:bg-rose-500/10 border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 border-b px-4 md:px-6 shrink-0 backdrop-blur-xl" style={{ backgroundColor: 'rgba(8, 17, 13, 0.86)', borderColor: 'rgba(143, 209, 170, 0.16)' }}>
          <button
            type="button"
            aria-label="فتح القائمة الجانبية"
            className="md:hidden rounded focus-visible:outline-none focus-visible:ring-2"
            style={{ color: 'rgba(184, 240, 202, 0.7)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">~/admin/</span>
            <span className="text-sm font-medium" style={{ color: adminAccentSoft }}>
              {navItems.find(n => n.href === pathname)?.label ?? 'terminal'}
            </span>
            <span className="animate-pulse" style={{ color: adminAccent }}>█</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8" style={{ background: 'radial-gradient(circle at top, rgba(143,209,170,0.06), transparent 30%), #08110d' }}>{children}</main>
      </div>
    </div>
  );
}
