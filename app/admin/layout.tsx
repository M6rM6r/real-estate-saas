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

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff41] flex font-mono">
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
          'fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0d0d0d] border-r border-[#00ff41]/20 flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#00ff41]/20">
          <div className="w-8 h-8 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center">
            <Terminal className="h-4 w-4 text-[#00ff41]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#00ff41]">Admin Terminal</p>
            <p className="text-xs text-[#00ff41]/40">{process.env.NEXT_PUBLIC_APP_NAME ?? 'لوحة التحكم'}</p>
          </div>
          <button
            type="button"
            aria-label="إغلاق القائمة الجانبية"
            className="ml-auto md:hidden text-[#00ff41]/50 hover:text-[#00ff41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41]/50 rounded"
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/40'
                  : 'text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/5 border border-transparent'
              )}
            >
              <span className="text-[#00ff41]/60">&gt;</span>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#00ff41]/20">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="تسجيل الخروج"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ff4141]/60 hover:text-[#ff4141] hover:bg-[#ff4141]/10 border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4141]/50"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[#0d0d0d] border-b border-[#00ff41]/20 flex items-center px-4 md:px-6 gap-4 shrink-0">
          <button
            type="button"
            aria-label="فتح القائمة الجانبية"
            className="md:hidden text-[#00ff41]/50 hover:text-[#00ff41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41]/50 rounded"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-[#00ff41]/60">
            <span className="text-[#00ff41]/40">~/admin/</span>
            <span className="text-sm text-[#00ff41]">
              {navItems.find(n => n.href === pathname)?.label ?? 'terminal'}
            </span>
            <span className="animate-pulse text-[#00ff41]">&block;</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#0a0a0a]">{children}</main>
      </div>
    </div>
  );
}
